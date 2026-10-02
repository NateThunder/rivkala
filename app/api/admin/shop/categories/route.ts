import type { NextRequest } from "next/server";
import { adminRoute, data, parseBody } from "../../_lib";
import { getShopDatabase } from "@/lib/shop/cloudflare";

type CategoryPayload = { id?: string; name?: string; slug?: string; active?: boolean };

function validate(body: CategoryPayload) {
  if (!body.name?.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug || "")) {
    throw new Error("A category name and lowercase URL slug are required");
  }
}

export async function POST(req: NextRequest) {
  return adminRoute(async () => {
    const body = await parseBody<CategoryPayload>(req);
    validate(body);
    const db = await getShopDatabase();
    if (!db) throw new Error("The shop database is not configured");
    const id = crypto.randomUUID();
    await db
      .prepare(`INSERT INTO shop_categories (id, slug, name, sort_order, active)
        VALUES (?, ?, ?, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM shop_categories), ?)`)
      .bind(id, body.slug, body.name!.trim(), body.active === false ? 0 : 1)
      .run();
    return data({ id });
  });
}

export async function PATCH(req: NextRequest) {
  return adminRoute(async () => {
    const body = await parseBody<CategoryPayload>(req);
    validate(body);
    if (!body.id) throw new Error("Category ID is required");
    const db = await getShopDatabase();
    if (!db) throw new Error("The shop database is not configured");
    await db
      .prepare("UPDATE shop_categories SET name = ?, slug = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(body.name!.trim(), body.slug, body.active === false ? 0 : 1, body.id)
      .run();
    return data({ ok: true });
  });
}

export async function DELETE(req: NextRequest) {
  return adminRoute(async () => {
    const { id } = await parseBody<{ id?: string }>(req);
    if (!id) throw new Error("Category ID is required");
    const db = await getShopDatabase();
    if (!db) throw new Error("The shop database is not configured");
    const use = await db
      .prepare("SELECT COUNT(*) AS count FROM shop_products WHERE category_id = ?")
      .bind(id)
      .first<{ count: number }>();
    if ((use?.count ?? 0) > 0) throw new Error("Move or delete this category's products first");
    await db.prepare("DELETE FROM shop_categories WHERE id = ?").bind(id).run();
    return data({ ok: true });
  });
}
