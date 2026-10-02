import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchRows, updateRow } from "@/lib/admin/store";
import type { VideoRow } from "@/lib/admin/types";
import { requireAdmin } from "@/lib/admin/auth";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseBody<T>(req: NextRequest): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new Error("Invalid JSON body");
  }
}

export async function adminRoute(handler: () => Promise<Response>) {
  try {
    await requireAdmin();
    return await handler();
  } catch (error) {
    const message = (error as Error).message;
    return jsonError(message, message === "Unauthorized" ? 401 : 400);
  }
}

export function data<T>(value: T) {
  return NextResponse.json({ data: value });
}

export async function ensureFeaturedVideo() {
  const videos = await fetchRows<VideoRow>("videos", { orderBy: "order_index" });
  if (!videos.length || videos.some((video) => video.is_featured)) return;
  await updateRow<VideoRow>("videos", videos[0].id, { is_featured: true });
}

export async function setFeaturedVideo(id: string) {
  const videos = await fetchRows<VideoRow>("videos", { orderBy: "order_index" });
  await Promise.all(
    videos.map((video) => updateRow<VideoRow>("videos", video.id, { is_featured: video.id === id }))
  );
}
