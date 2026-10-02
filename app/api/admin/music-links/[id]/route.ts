import type { NextRequest } from "next/server";
import { adminRoute, data, parseBody } from "../../_lib";
import { deleteRow, fetchRows, updateRow } from "@/lib/admin/store";
import type { MusicLink, MusicTrack } from "@/lib/admin/types";
import { optionalString, optionalUrl, requireString } from "@/lib/admin/validation";
import { deleteReplacedSaleFiles, deleteSaleFiles, musicSalePayload } from "@/lib/admin/music-sales";

type RouteCtx = { params: Promise<{ id: string }> };

function releaseYear(value: unknown) {
  const year = Number(value);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new Error("release_year must be a four-digit year");
  }
  return year;
}

function patchPayload(body: Record<string, unknown>) {
  const releaseType = body.release_type;
  if (releaseType !== "ALBUM" && releaseType !== "EP" && releaseType !== "SINGLE") {
    throw new Error("release_type must be ALBUM, EP or SINGLE");
  }
  return {
    title: requireString(body.title, "title", { max: 160 }),
    is_featured: Boolean(body.is_featured),
    release_type: releaseType,
    release_year: releaseYear(body.release_year),
    description: optionalString(body.description, 1200),
    spotify_url: optionalUrl(body.spotify_url, "spotify_url"),
    apple_music_url: optionalUrl(body.apple_music_url, "apple_music_url"),
    bandcamp_url: optionalUrl(body.bandcamp_url, "bandcamp_url"),
    youtube_url: optionalUrl(body.youtube_url, "youtube_url"),
    shop_variant_id: optionalString(body.shop_variant_id, 200),
    ...musicSalePayload(body, releaseType !== "SINGLE"),
    url: optionalUrl(body.bandcamp_url, "bandcamp_url"),
    thumbnail_src: requireString(body.thumbnail_src, "thumbnail_src", { max: 2000 }),
    thumbnail_alt: requireString(body.thumbnail_alt, "thumbnail_alt", { max: 180 }),
  };
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  return adminRoute(async () => {
    const { id } = await ctx.params;
    const body = await parseBody<Record<string, unknown>>(req);
    const previous = (await fetchRows<MusicLink>("music_links", { filters: { id }, limit: 1 }))[0];
    const patch = patchPayload(body);
    const current = await updateRow<MusicLink>("music_links", id, patch);
    await deleteReplacedSaleFiles(previous, patch);
    return data({ ...current, tracks: body.tracks ?? [] });
  });
}

export async function DELETE(_req: NextRequest, ctx: RouteCtx) {
  return adminRoute(async () => {
    const { id } = await ctx.params;
    const tracks = await fetchRows<MusicTrack>("music_tracks", { filters: { release_id: id } });
    const release = (await fetchRows<MusicLink>("music_links", { filters: { id }, limit: 1 }))[0];
    await Promise.all([release ? deleteSaleFiles(release) : Promise.resolve(), ...tracks.map(deleteSaleFiles)]);
    await Promise.all(tracks.map((track) => deleteRow("music_tracks", track.id)));
    await deleteRow("music_links", id);
    return data({ ok: true });
  });
}
