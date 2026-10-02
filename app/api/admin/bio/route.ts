import type { NextRequest } from "next/server";
import { adminRoute, data, parseBody } from "../_lib";
import { getBioCore } from "@/lib/admin/content";
import { upsertSiteContent } from "@/lib/admin/store";
import { requireString } from "@/lib/admin/validation";
import type { BioCoreContent } from "@/lib/admin/types";

function bioPayload(body: Record<string, unknown>): BioCoreContent {
  const rawLongBio = body.longBio;
  if (!Array.isArray(rawLongBio)) throw new Error("longBio must be an array");
  return {
    pronunciation: requireString(body.pronunciation, "pronunciation", { max: 80 }),
    pronouns: requireString(body.pronouns, "pronouns", { max: 80 }),
    strapline: requireString(body.strapline, "strapline", { max: 180 }),
    shortBio: requireString(body.shortBio, "shortBio", { max: 1800 }),
    longBio: rawLongBio.map((value, index) =>
      requireString(value, `longBio[${index}]`, { max: 2200 })
    ),
  };
}

export async function GET() {
  return adminRoute(async () => data(await getBioCore()));
}

export async function PATCH(req: NextRequest) {
  return adminRoute(async () => {
    const body = await parseBody<Record<string, unknown>>(req);
    const value = bioPayload(body);
    await upsertSiteContent("bio_core", value);
    return data(value);
  });
}
