import type { NextRequest } from "next/server";
import { adminRoute, data, ensureFeaturedVideo, parseBody, setFeaturedVideo } from "../_lib";
import { fetchRows, insertRow } from "@/lib/admin/store";
import type { VideoRow } from "@/lib/admin/types";
import {
  extractYouTubeId,
  requireOrder,
  requireString,
  requireUrl,
  youtubeWatchUrl,
} from "@/lib/admin/validation";

function videoPayload(body: Record<string, unknown>, orderFallback: number) {
  const youtubeUrl = requireUrl(body.youtube_url, "youtube_url");
  const youtubeId = extractYouTubeId(youtubeUrl);
  if (!youtubeId) throw new Error("youtube_url must be a valid YouTube video URL");
  return {
    title: requireString(body.title, "title", { max: 180 }),
    youtube_url: youtubeWatchUrl(youtubeId),
    youtube_id: youtubeId,
    is_featured: Boolean(body.is_featured),
    order_index: requireOrder(body.order_index, orderFallback),
  };
}

export async function GET() {
  return adminRoute(async () => data(await fetchRows<VideoRow>("videos", { orderBy: "order_index" })));
}

export async function POST(req: NextRequest) {
  return adminRoute(async () => {
    const rows = await fetchRows<VideoRow>("videos", { orderBy: "order_index" });
    const body = await parseBody<Record<string, unknown>>(req);
    const payload = videoPayload(body, rows.length);
    const created = await insertRow<VideoRow>("videos", {
      ...payload,
      id: payload.youtube_id,
    });
    if (created.is_featured) await setFeaturedVideo(created.id);
    else await ensureFeaturedVideo();
    return data(created);
  });
}
