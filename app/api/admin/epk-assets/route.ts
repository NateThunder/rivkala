import type { NextRequest } from "next/server";
import { adminRoute, data, parseBody } from "../_lib";
import { getEpkPdf, getEpkPhotoSlots } from "@/lib/admin/content";
import { updateEpkPhotoSlot, upsertSiteContent } from "@/lib/admin/store";
import { requireString } from "@/lib/admin/validation";
import type { EpkPdfContent, EpkPhotoSlot } from "@/lib/admin/types";

function pdfPayload(value: unknown): EpkPdfContent {
  const body = value as Record<string, unknown>;
  return {
    href: requireString(body.href, "pdf.href", { max: 2000 }),
    downloadName: requireString(body.downloadName, "pdf.downloadName", { max: 180 }),
  };
}

function photoPayload(slot: 1 | 2 | 3 | 4, value: unknown): EpkPhotoSlot {
  const body = value as Record<string, unknown>;
  return {
    slot,
    src: requireString(body.src, `photo ${slot} src`, { max: 2000 }),
    alt: requireString(body.alt, `photo ${slot} alt`, { max: 240 }),
    label: requireString(body.label, `photo ${slot} label`, { max: 120 }),
    credit: requireString(body.credit, `photo ${slot} credit`, { max: 120 }),
    download_name: requireString(body.download_name, `photo ${slot} download_name`, {
      max: 180,
    }),
  };
}

export async function GET() {
  return adminRoute(async () =>
    data({
      pdf: await getEpkPdf(),
      photos: await getEpkPhotoSlots(),
    })
  );
}

export async function PATCH(req: NextRequest) {
  return adminRoute(async () => {
    const body = await parseBody<{ pdf?: unknown; photos?: unknown[] }>(req);
    let pdf = await getEpkPdf();
    if (body.pdf) {
      pdf = pdfPayload(body.pdf);
      await upsertSiteContent("epk_pdf", pdf);
    }

    if (body.photos) {
      if (!Array.isArray(body.photos)) throw new Error("photos must be an array");
      await Promise.all(
        body.photos.map((photo, index) =>
          updateEpkPhotoSlot((index + 1) as 1 | 2 | 3 | 4, photoPayload((index + 1) as 1 | 2 | 3 | 4, photo))
        )
      );
    }

    return data({
      pdf,
      photos: await getEpkPhotoSlots(),
    });
  });
}
