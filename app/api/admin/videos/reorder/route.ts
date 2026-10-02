import type { NextRequest } from "next/server";
import { adminRoute, data, parseBody } from "../../_lib";
import { reorderRows } from "@/lib/admin/store";

export async function POST(req: NextRequest) {
  return adminRoute(async () => {
    const body = await parseBody<{ ids?: string[] }>(req);
    if (!Array.isArray(body.ids)) throw new Error("ids must be an array");
    await reorderRows("videos", body.ids);
    return data({ ok: true });
  });
}
