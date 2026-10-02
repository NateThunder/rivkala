import type { NextRequest } from "next/server";
import { getMediaFile } from "@/lib/admin/store";

type RouteCtx = { params: Promise<{ key: string[] }> };

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const { key } = await ctx.params;
  if (key[0] === "shop-downloads" || key[0] === "music-downloads") return new Response("Not found", { status: 404 });
  const rangeHeader = req.headers.get("range");
  const file = await getMediaFile(key.join("/"), rangeHeader);
  if (!file) return new Response("Not found", { status: 404 });
  const headers: Record<string, string> = {
    "Content-Type": file.contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
  };
  if (file.range) headers["Content-Length"] = String(file.range.length);
  if (file.partial && file.range) {
    headers["Content-Range"] = `bytes ${file.range.start}-${file.range.end}/${file.size}`;
  }
  return new Response(file.body, {
    status: file.partial ? 206 : 200,
    headers,
  });
}

export async function HEAD(_req: NextRequest, ctx: RouteCtx) {
  const { key } = await ctx.params;
  if (key[0] === "shop-downloads" || key[0] === "music-downloads") return new Response(null, { status: 404 });
  const file = await getMediaFile(key.join("/"));
  if (!file) return new Response(null, { status: 404 });
  return new Response(null, {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Accept-Ranges": "bytes",
      ...(file.size ? { "Content-Length": String(file.size) } : {}),
    },
  });
}
