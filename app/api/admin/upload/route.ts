import type { NextRequest } from "next/server";
import { adminRoute, data } from "../_lib";
import { uploadMediaFile } from "@/lib/admin/store";

const acceptedBuckets = new Set(["music", "music-audio", "music-downloads", "epk-photos", "epk-pdf"]);
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const maxImageSize = 10 * 1024 * 1024;
const maxPdfSize = 45 * 1024 * 1024;
const maxAudioSize = 50 * 1024 * 1024;
const maxDownloadSize = 250 * 1024 * 1024;

export async function POST(req: NextRequest) {
  return adminRoute(async () => {
    const bucket = req.nextUrl.searchParams.get("bucket");
    if (!bucket || !acceptedBuckets.has(bucket)) throw new Error("Invalid upload bucket");

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new Error("file is required");

    if (bucket === "music-audio") {
      if (file.type !== "audio/mpeg" && !file.name.toLowerCase().endsWith(".mp3")) {
        throw new Error("Track audio must be an MP3");
      }
      if (file.size > maxAudioSize) throw new Error("MP3 is too large (50 MB maximum)");
    } else if (bucket === "music-downloads") {
      const saleKind = req.nextUrl.searchParams.get("saleKind");
      const format = req.nextUrl.searchParams.get("format");
      const packaged = req.nextUrl.searchParams.get("packaged") === "true";
      if ((saleKind !== "release" && saleKind !== "track") || (format !== "mp3" && format !== "wav")) {
        throw new Error("Invalid music download upload");
      }
      const extension = file.name.toLowerCase().split(".").pop();
      const expected = packaged ? "zip" : format;
      if (extension !== expected) {
        throw new Error(packaged ? `Upload a ZIP containing the ${format.toUpperCase()} release` : `Upload a ${format.toUpperCase()} file`);
      }
      if (file.size > maxDownloadSize) throw new Error("Music download is too large (250 MB maximum)");
    } else if (bucket === "epk-pdf") {
      if (file.type !== "application/pdf") throw new Error("EPK upload must be a PDF");
      if (file.size > maxPdfSize) throw new Error("PDF is too large");
    } else {
      if (!imageTypes.has(file.type)) throw new Error("Unsupported image type");
      if (file.size > maxImageSize) throw new Error("Image is too large");
    }

    const asset = await uploadMediaFile(bucket as "music" | "music-audio" | "music-downloads" | "epk-photos" | "epk-pdf", file);
    return data(asset);
  });
}
