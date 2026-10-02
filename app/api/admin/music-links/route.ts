import type { NextRequest } from "next/server";
import { adminRoute, data, parseBody } from "../_lib";
import { fetchRows, insertRow } from "@/lib/admin/store";
import { getMusicLinks } from "@/lib/admin/content";
import type { MusicLink } from "@/lib/admin/types";
import { optionalString, optionalUrl, requireOrder, requireString } from "@/lib/admin/validation";
import { musicSalePayload } from "@/lib/admin/music-sales";

function releaseType(value: unknown): MusicLink["release_type"] {
  if (value === "ALBUM" || value === "EP" || value === "SINGLE") return value;
  throw new Error("release_type must be ALBUM, EP or SINGLE");
}

function releaseYear(value: unknown) {
  const year = Number(value);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new Error("release_year must be a four-digit year");
  }
  return year;
}

function musicPayload(body: Record<string, unknown>, orderFallback: number) {
  const type = releaseType(body.release_type);
  return {
    title: requireString(body.title, "title", { max: 160 }),
    is_featured: Boolean(body.is_featured),
    release_type: type,
    release_year: releaseYear(body.release_year),
    description: optionalString(body.description, 1200),
    spotify_url: optionalUrl(body.spotify_url, "spotify_url"),
    apple_music_url: optionalUrl(body.apple_music_url, "apple_music_url"),
    bandcamp_url: optionalUrl(body.bandcamp_url, "bandcamp_url"),
    youtube_url: optionalUrl(body.youtube_url, "youtube_url"),
    shop_variant_id: optionalString(body.shop_variant_id, 200),
    ...musicSalePayload(body, type !== "SINGLE"),
    url: optionalUrl(body.bandcamp_url, "bandcamp_url"),
    thumbnail_src: requireString(body.thumbnail_src, "thumbnail_src", { max: 2000 }),
    thumbnail_alt: requireString(body.thumbnail_alt, "thumbnail_alt", { max: 180 }),
    order_index: requireOrder(body.order_index, orderFallback),
  };
}

export async function GET() {
  return adminRoute(async () => data(await getMusicLinks()));
}

export async function POST(req: NextRequest) {
  return adminRoute(async () => {
    const rows = await fetchRows<MusicLink>("music_links", { orderBy: "order_index" });
    const body = await parseBody<Record<string, unknown>>(req);
    const release = await insertRow<MusicLink>("music_links", musicPayload(body, rows.length));
    return data({ ...release, tracks: [] });
  });
}
