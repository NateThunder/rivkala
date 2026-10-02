import type { NextRequest } from "next/server";
import { adminRoute, data, ensureFeaturedVideo, parseBody, setFeaturedVideo } from "../../_lib";
import { deleteRow, updateRow } from "@/lib/admin/store";
import type { VideoRow } from "@/lib/admin/types";
import {
  extractYouTubeId,
  requireString,
  requireUrl,
  youtubeWatchUrl,
} from "@/lib/admin/validation";

type RouteCtx = { params: Promise<{ id: string }> };

function patchPayload(body: Record<string, unknown>) {
  const youtubeUrl = requireUrl(body.youtube_url, "youtube_url");
  const youtubeId = extractYouTubeId(youtubeUrl);
  if (!youtubeId) throw new Error("youtube_url must be a valid YouTube video URL");
  return {
    title: requireString(body.title, "title", { max: 180 }),
    youtube_url: youtubeWatchUrl(youtubeId),
    youtube_id: youtubeId,
    is_featured: Boolean(body.is_featured),
  };
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  return adminRoute(async () => {
    const { id } = await ctx.params;
    const body = await parseBody<Record<string, unknown>>(req);
    const payload = patchPayload(body);
    const updated = await updateRow<VideoRow>("videos", id, payload);
    if (payload.is_featured) await setFeaturedVideo(id);
    else await ensureFeaturedVideo();
    return data(updated);
  });
}

export async function DELETE(_req: NextRequest, ctx: RouteCtx) {
  return adminRoute(async () => {
    const { id } = await ctx.params;
    await deleteRow("videos", id);
    await ensureFeaturedVideo();
    return data({ ok: true });
  });
}
