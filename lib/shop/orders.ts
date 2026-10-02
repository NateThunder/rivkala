import "server-only";

import type Stripe from "stripe";
import { decodeCheckoutLine, resolveCheckoutLine } from "./checkout-items";
import { getShopDatabase, getShopEmail, getShopSecret } from "./cloudflare";
import type { ShopCheckoutLine } from "./types";

function sessionLines(session: Stripe.Checkout.Session): ShopCheckoutLine[] {
  return Object.entries(session.metadata ?? {})
    .filter(([key]) => key.startsWith("line_"))
    .sort(([a], [b]) => Number(a.slice(5)) - Number(b.slice(5)))
    .flatMap(([, value]) => {
      const line = decodeCheckoutLine(value);
      return line && Number.isInteger(line.quantity) && line.quantity > 0 ? [line] : [];
    });
}

export async function recordPaidShopOrder(session: Stripe.Checkout.Session) {
  const db = await getShopDatabase();
  const lines = sessionLines(session);
  if (!db || !lines.length) return;

  const items = await Promise.all(lines.map(async (line) => ({ line, item: await resolveCheckoutLine(line, true) })));
  const resolved = items.filter((entry): entry is typeof entry & { item: NonNullable<typeof entry.item> } => Boolean(entry.item));
  if (!resolved.length) return;

  const ttl = Math.max(1, Number((await getShopSecret("DOWNLOAD_TOKEN_TTL_HOURS")) || 24));
  const presentment = (session as Stripe.Checkout.Session & {
    presentment_details?: { presentment_amount?: number; presentment_currency?: string };
  }).presentment_details;
  const statements = [
    db
      .prepare(`INSERT OR IGNORE INTO shop_orders
        (id, stripe_session_id, stripe_payment_intent_id, email, amount_total, currency,
         presentment_amount, presentment_currency, payment_status, fulfillment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        session.id,
        session.id,
        String(session.payment_intent || ""),
        session.customer_details?.email || session.customer_email || "",
        session.amount_total || 0,
        (session.currency || "gbp").toUpperCase(),
        presentment?.presentment_amount ?? null,
        presentment?.presentment_currency?.toUpperCase() ?? null,
        session.payment_status,
        "unfulfilled"
      ),
  ];

  for (const { line, item } of resolved) {
    const orderItemId = `${session.id}:${item.variant.id}`;
    if (item.variant.stock !== null) {
      statements.push(
        db
          .prepare(`UPDATE shop_product_variants SET stock = MAX(0, stock - ?), updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND NOT EXISTS (SELECT 1 FROM shop_order_items WHERE id = ?)`)
          .bind(line.quantity, item.variant.id, orderItemId)
      );
    }
    statements.push(
      db
        .prepare(`INSERT OR IGNORE INTO shop_order_items
          (id, order_id, product_id, variant_id, product_name, variant_name, quantity, unit_amount, kind)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(
          orderItemId,
          session.id,
          item.product.id,
          item.variant.id,
          item.product.name,
          item.variant.name,
          line.quantity,
          item.variant.priceGBP,
          item.product.kind
        )
    );
    if (item.product.kind === "digital") {
      for (const [format, objectKey] of Object.entries(item.product.downloads)) {
        if (!objectKey) continue;
        statements.push(
          db
            .prepare(`INSERT OR IGNORE INTO shop_download_files
              (token, order_item_id, object_key, format, expires_at, max_downloads)
              VALUES (?, ?, ?, ?, datetime('now', ?), 5)`)
            .bind(crypto.randomUUID(), orderItemId, objectKey, format, `+${ttl} hours`)
        );
      }
    }
  }
  await db.batch(statements);
  await sendDeliveryEmail(session.id);
}

type DeliveryDownload = {
  token: string;
  product_name: string;
  format: "mp3" | "wav" | "zip";
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] || character);
}

async function sendDeliveryEmail(orderId: string) {
  const db = await getShopDatabase();
  const email = await getShopEmail();
  if (!db || !email) return;
  const order = await db
    .prepare("SELECT email FROM shop_orders WHERE id = ?")
    .bind(orderId)
    .first<{ email: string }>();
  if (!order?.email) return;

  const claimed = await db
    .prepare("UPDATE shop_orders SET delivery_email_sent_at = 'sending' WHERE id = ? AND delivery_email_sent_at IS NULL")
    .bind(orderId)
    .run();
  if (!claimed.meta?.changes) return;

  try {
    const result = await db
      .prepare(`SELECT df.token, oi.product_name, df.format
        FROM shop_download_files df
        JOIN shop_order_items oi ON oi.id = df.order_item_id
        WHERE oi.order_id = ? AND df.expires_at > CURRENT_TIMESTAMP
        ORDER BY oi.product_name, CASE df.format WHEN 'mp3' THEN 1 WHEN 'wav' THEN 2 ELSE 3 END`)
      .bind(orderId)
      .all<DeliveryDownload>();
    const downloads = result.results ?? [];
    if (!downloads.length) {
      await db.prepare("UPDATE shop_orders SET delivery_email_sent_at = CURRENT_TIMESTAMP WHERE id = ?").bind(orderId).run();
      return;
    }
    const origin = (await getShopSecret("NEXT_PUBLIC_SITE_URL")) || "https://rivkala.com";
    const links = downloads.map((download) => ({
      ...download,
      url: `${origin.replace(/\/$/, "")}/api/shop/downloads/${download.token}`,
    }));
    const text = [
      "Thank you for supporting Rivkala.",
      "",
      "Choose your download format:",
      ...links.map((link) => `${link.product_name} (${link.format.toUpperCase()}): ${link.url}`),
      "",
      "These private links expire after 24 hours and allow five downloads each.",
    ].join("\n");
    const html = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#211b17"><h1>Your Rivkala downloads</h1><p>Thank you for supporting Rivkala.</p><p>Choose your download format:</p><ul>${links.map((link) => `<li style="margin:12px 0"><a href="${escapeHtml(link.url)}">${escapeHtml(link.product_name)} — ${link.format.toUpperCase()}</a></li>`).join("")}</ul><p>These private links expire after 24 hours and allow five downloads each.</p></div>`;
    await email.send({
      to: order.email,
      from: { email: "downloads@rivkala.com", name: "Rivkala" },
      replyTo: "rivkala.music@gmail.com",
      subject: "Your Rivkala downloads",
      text,
      html,
    });
    await db.prepare("UPDATE shop_orders SET delivery_email_sent_at = CURRENT_TIMESTAMP WHERE id = ?").bind(orderId).run();
  } catch (error) {
    await db.prepare("UPDATE shop_orders SET delivery_email_sent_at = NULL WHERE id = ?").bind(orderId).run();
    throw error;
  }
}

export async function getShopOrderDownloads(sessionId: string) {
  const db = await getShopDatabase();
  if (!db) return [];
  const result = await db
    .prepare(`SELECT dt.token, oi.product_name, dt.expires_at, dt.format
      FROM shop_download_files dt
      JOIN shop_order_items oi ON oi.id = dt.order_item_id
      JOIN shop_orders o ON o.id = oi.order_id
      WHERE o.stripe_session_id = ? AND dt.expires_at > CURRENT_TIMESTAMP
        AND dt.download_count < dt.max_downloads
      ORDER BY oi.product_name, CASE dt.format WHEN 'mp3' THEN 1 WHEN 'wav' THEN 2 ELSE 3 END`)
    .bind(sessionId)
    .all<{ token: string; product_name: string; expires_at: string; format: "mp3" | "wav" | "zip" }>();
  return result.results ?? [];
}
