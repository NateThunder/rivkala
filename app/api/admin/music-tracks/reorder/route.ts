import type { NextRequest } from "next/server";
import { adminRoute, data, parseBody } from "../../_lib";
import { reorderRows } from "@/lib/admin/store";

export async function PATCH(req: NextRequest) {
  return adminRoute(async () => {
    const body = await parseBody<{ ids?: string[] }>(req);
    if (!Array.isArray(body.ids) || body.ids.some((id) => typeof id !== "string")) {
      throw new Error("ids must be an array of track IDs");
    }
    await reorderRows("music_tracks", body.ids);
    return data({ ok: true });
  });
}
