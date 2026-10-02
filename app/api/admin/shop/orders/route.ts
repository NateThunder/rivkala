import type { NextRequest } from "next/server";
import { adminRoute, data, parseBody } from "../../_lib";
import { getShopDatabase } from "@/lib/shop/cloudflare";
import { getShopStripe } from "@/lib/shop/stripe";
import type { ShopOrderSummary } from "@/lib/shop/types";

type OrderRow = {
  id: string;
  email: string;
  amount_total: number;
  currency: string;
  presentment_amount: number | null;
  presentment_currency: string | null;
  payment_status: string;
  fulfillment_status: string;
  item_count: number;
  created_at: string;
};

export async function GET() {
  return adminRoute(async () => {
    const db = await getShopDatabase();
    if (!db) throw new Error("The shop database is not configured");
    const result = await db
      .prepare(`SELECT o.id, o.email, o.amount_total, o.currency, o.presentment_amount,
        o.presentment_currency, o.payment_status, o.fulfillment_status, o.created_at,
        COALESCE(SUM(oi.quantity), 0) AS item_count
        FROM shop_orders o LEFT JOIN shop_order_items oi ON oi.order_id = o.id
        GROUP BY o.id ORDER BY o.created_at DESC LIMIT 100`)
      .all<OrderRow>();
    const orders: ShopOrderSummary[] = (result.results ?? []).map((row) => ({
      id: row.id,
      email: row.email,
      amountTotal: row.amount_total,
      currency: row.currency,
      presentmentAmount: row.presentment_amount,
      presentmentCurrency: row.presentment_currency,
      paymentStatus: row.payment_status,
      fulfillmentStatus: row.fulfillment_status,
      itemCount: row.item_count,
      createdAt: row.created_at,
    }));
    return data(orders);
  });
}

export async function PATCH(req: NextRequest) {
  return adminRoute(async () => {
    const body = await parseBody<{ id?: string; fulfillmentStatus?: string }>(req);
    if (!body.id || !["unfulfilled", "fulfilled", "cancelled"].includes(body.fulfillmentStatus || "")) {
      throw new Error("Order and status are required");
    }
    const db = await getShopDatabase();
    if (!db) throw new Error("The shop database is not configured");
    await db
      .prepare("UPDATE shop_orders SET fulfillment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(body.fulfillmentStatus, body.id)
      .run();
    return data({ ok: true });
  });
}

export async function POST(req: NextRequest) {
  return adminRoute(async () => {
    const body = await parseBody<{ id?: string; action?: "refund" | "regenerate-downloads" }>(req);
    const db = await getShopDatabase();
    if (!db) throw new Error("The shop database is not configured");
    if (!body.id) throw new Error("Order ID is required");
    if (body.action === "regenerate-downloads") {
      await db
        .prepare(`UPDATE shop_download_files SET expires_at = datetime('now', '+24 hours'), download_count = 0
          WHERE order_item_id IN (SELECT id FROM shop_order_items WHERE order_id = ?)`)
        .bind(body.id)
        .run();
      return data({ ok: true });
    }
    if (body.action !== "refund") throw new Error("Unknown order action");
    const stripe = await getShopStripe();
    if (!stripe) throw new Error("Stripe is not configured");
    const order = await db
      .prepare("SELECT stripe_payment_intent_id FROM shop_orders WHERE id = ?")
      .bind(body.id)
      .first<{ stripe_payment_intent_id: string }>();
    if (!order) throw new Error("Order not found");
    await stripe.refunds.create({ payment_intent: order.stripe_payment_intent_id });
    await db
      .prepare("UPDATE shop_orders SET payment_status = 'refunded', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(body.id)
      .run();
    return data({ ok: true });
  });
}
