import type { NextRequest } from "next/server";
import { adminRoute, data, parseBody } from "../_lib";
import { fetchRows, insertRow } from "@/lib/admin/store";
import type { MusicLink, MusicTrack } from "@/lib/admin/types";
import { optionalString, optionalUrl, requireOrder, requireString } from "@/lib/admin/validation";
import { musicSalePayload } from "@/lib/admin/music-sales";

function trackPayload(body: Record<string, unknown>, orderFallback: number, allowSale: boolean) {
  return {
    release_id: requireString(body.release_id, "release_id", { max: 200 }),
    title: requireString(body.title, "title", { max: 160 }),
    audio_src: optionalString(body.audio_src, 2000),
    spotify_url: optionalUrl(body.spotify_url, "spotify_url"),
    apple_music_url: optionalUrl(body.apple_music_url, "apple_music_url"),
    bandcamp_url: optionalUrl(body.bandcamp_url, "bandcamp_url"),
    youtube_url: optionalUrl(body.youtube_url, "youtube_url"),
    shop_variant_id: optionalString(body.shop_variant_id, 200),
    ...musicSalePayload({ ...body, sale_enabled: allowSale && body.sale_enabled === true }, false),
    order_index: requireOrder(body.order_index, orderFallback),
  };
}

export async function POST(req: NextRequest) {
  return adminRoute(async () => {
    const body = await parseBody<Record<string, unknown>>(req);
    const releaseId = requireString(body.release_id, "release_id", { max: 200 });
    const release = (await fetchRows<MusicLink>("music_links", { filters: { id: releaseId }, limit: 1 }))[0];
    if (!release) throw new Error("Release not found");
    const rows = await fetchRows<MusicTrack>("music_tracks", { filters: { release_id: releaseId } });
    return data(await insertRow<MusicTrack>("music_tracks", trackPayload(body, rows.length, release.release_type !== "SINGLE")));
  });
}
