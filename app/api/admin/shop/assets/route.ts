import type { NextRequest } from "next/server";
import { adminRoute, data } from "../../_lib";
import { getShopBucket } from "@/lib/shop/cloudflare";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const downloadTypes = new Set([
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "video/mp4",
  "application/octet-stream",
]);

export async function POST(req: NextRequest) {
  return adminRoute(async () => {
    const purpose = req.nextUrl.searchParams.get("purpose") === "download" ? "download" : "image";
    const bucket = await getShopBucket();
    if (!bucket) throw new Error("The media bucket is not configured");
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new Error("A file is required");
    if (purpose === "image" && (!imageTypes.has(file.type) || file.size > 10 * 1024 * 1024)) {
      throw new Error("Use a JPG, PNG, WebP or AVIF image under 10 MB");
    }
    if (purpose === "download" && (!downloadTypes.has(file.type) || file.size > 100 * 1024 * 1024)) {
      throw new Error("Use a PDF, ZIP, audio or MP4 file under 100 MB");
    }
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
    const key = `${purpose === "image" ? "shop-images" : "shop-downloads"}/${crypto.randomUUID()}-${safeName}`;
    await bucket.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
      customMetadata: { originalName: file.name },
    });
    return data({
      key,
      url: purpose === "image" ? `/api/media/${key.split("/").map(encodeURIComponent).join("/")}` : null,
      name: file.name,
    });
  });
}
