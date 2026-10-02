import type { NextRequest } from "next/server";
import { adminRoute, data, parseBody } from "../../_lib";
import { getShopCatalog } from "@/lib/shop/catalog";
import { getShopBucket, getShopDatabase } from "@/lib/shop/cloudflare";
import type { ShopProductPayload } from "@/lib/shop/types";

function validateProduct(body: ShopProductPayload) {
  if (!body.name?.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug || "")) {
    return "A product name and lowercase URL slug are required.";
  }
  if (!body.categoryId || !["physical", "digital"].includes(body.kind)) {
    return "Choose a category and product type.";
  }
  if (!body.variants?.length) return "Add at least one product option.";
  if (
    body.variants.some(
      (variant) =>
        !variant.name?.trim() ||
        !variant.sku?.trim() ||
        !Number.isInteger(variant.priceGBP) ||
        variant.priceGBP < 0 ||
        (body.kind === "physical" &&
          (!Number.isInteger(variant.stock) || (variant.stock ?? -1) < 0))
    )
  ) {
    return "Every option needs a name, SKU, valid GBP price, and physical stock level.";
  }
  if (body.kind === "digital" && !body.downloads?.zip) return "Upload a ZIP for a digital product.";
  if (body.images.some((image) => !image.objectKey && !image.url)) return "Every image needs an uploaded file.";
  return null;
}

async function saveProduct(body: ShopProductPayload, create: boolean) {
  const db = await getShopDatabase();
  if (!db) throw new Error("The shop database is not configured");
  const validation = validateProduct(body);
  if (validation) throw new Error(validation);
  const id = create ? crypto.randomUUID() : body.id;
  if (!id) throw new Error("Product ID is required");

  const statements = create
    ? [
        db
          .prepare(`INSERT INTO shop_products
            (id, slug, name, category_id, summary, description, kind, download_key,
             download_mp3_key, download_wav_key, download_zip_key, featured, active, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM shop_products))`)
          .bind(
            id,
            body.slug,
            body.name.trim(),
            body.categoryId,
            body.summary?.trim() || "",
            body.description?.trim() || "",
            body.kind,
            body.kind === "digital" ? body.downloads.zip : null,
            body.kind === "digital" ? body.downloads.mp3 : null,
            body.kind === "digital" ? body.downloads.wav : null,
            body.kind === "digital" ? body.downloads.zip : null,
            body.featured ? 1 : 0,
            body.active ? 1 : 0
          ),
      ]
    : [
        db
          .prepare(`UPDATE shop_products SET slug = ?, name = ?, category_id = ?, summary = ?, description = ?,
            kind = ?, download_key = ?, download_mp3_key = ?, download_wav_key = ?, download_zip_key = ?,
            featured = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
          .bind(
            body.slug,
            body.name.trim(),
            body.categoryId,
            body.summary?.trim() || "",
            body.description?.trim() || "",
            body.kind,
            body.kind === "digital" ? body.downloads.zip : null,
            body.kind === "digital" ? body.downloads.mp3 : null,
            body.kind === "digital" ? body.downloads.wav : null,
            body.kind === "digital" ? body.downloads.zip : null,
            body.featured ? 1 : 0,
            body.active ? 1 : 0,
            id
          ),
        db.prepare("DELETE FROM shop_product_images WHERE product_id = ?").bind(id),
        db.prepare("DELETE FROM shop_product_variants WHERE product_id = ?").bind(id),
      ];

  body.images.forEach((image, index) => {
    statements.push(
      db
        .prepare(`INSERT INTO shop_product_images
          (id, product_id, object_key, remote_url, alt_text, sort_order) VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(
          image.id || crypto.randomUUID(),
          id,
          image.objectKey || null,
          image.objectKey ? null : image.url || null,
          image.alt?.trim() || body.name.trim(),
          index
        )
    );
  });
  body.variants.forEach((variant, index) => {
    statements.push(
      db
        .prepare(`INSERT INTO shop_product_variants
          (id, product_id, name, sku, price_gbp, stock, sort_order, active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(
          variant.id || crypto.randomUUID(),
          id,
          variant.name.trim(),
          variant.sku.trim(),
          variant.priceGBP,
          body.kind === "digital" ? null : variant.stock,
          index,
          variant.active === false ? 0 : 1
        )
    );
  });
  await db.batch(statements);
  return id;
}

export async function GET() {
  return adminRoute(async () => data(await getShopCatalog({ includeInactive: true })));
}

export async function POST(req: NextRequest) {
  return adminRoute(async () => data({ id: await saveProduct(await parseBody<ShopProductPayload>(req), true) }));
}

export async function PATCH(req: NextRequest) {
  return adminRoute(async () => data({ id: await saveProduct(await parseBody<ShopProductPayload>(req), false) }));
}

export async function DELETE(req: NextRequest) {
  return adminRoute(async () => {
    const { id } = await parseBody<{ id?: string }>(req);
    if (!id) throw new Error("Product ID is required");
    const db = await getShopDatabase();
    if (!db) throw new Error("The shop database is not configured");
    const product = await db
      .prepare("SELECT download_key, download_mp3_key, download_wav_key, download_zip_key FROM shop_products WHERE id = ?")
      .bind(id)
      .first<{ download_key: string | null; download_mp3_key: string | null; download_wav_key: string | null; download_zip_key: string | null }>();
    const images = await db
      .prepare("SELECT object_key FROM shop_product_images WHERE product_id = ? AND object_key IS NOT NULL")
      .bind(id)
      .all<{ object_key: string }>();
    await db.prepare("DELETE FROM shop_products WHERE id = ?").bind(id).run();
    const bucket = await getShopBucket();
    if (bucket) {
      await Promise.all([
        ...(images.results ?? []).map((image) => bucket.delete(image.object_key)),
        ...Array.from(new Set([
          product?.download_key,
          product?.download_mp3_key,
          product?.download_wav_key,
          product?.download_zip_key,
        ].filter((key): key is string => Boolean(key)))).map((key) => bucket.delete(key)),
      ]);
    }
    return data({ ok: true });
  });
}
