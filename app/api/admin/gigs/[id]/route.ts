import type { NextRequest } from "next/server";
import { adminRoute, data, parseBody } from "../../_lib";
import { deleteRow, updateRow } from "@/lib/admin/store";
import type { Gig } from "@/lib/admin/types";
import {
  optionalString,
  optionalUrl,
  requireDateIso,
  requireLineupPreset,
  requireString,
} from "@/lib/admin/validation";

type RouteCtx = { params: Promise<{ id: string }> };

function patchPayload(body: Record<string, unknown>) {
  const lineupPreset = requireLineupPreset(body.lineup_preset);
  const custom = optionalString(body.lineup_custom_label, 40);
  if (lineupPreset === "OTHER" && !custom) {
    throw new Error("lineup_custom_label is required when lineup_preset is OTHER");
  }
  return {
    event_date: requireDateIso(body.event_date, "event_date"),
    title: requireString(body.title, "title", { max: 160 }),
    location: requireString(body.location, "location", { max: 180 }),
    lineup_preset: lineupPreset,
    lineup_custom_label: custom,
    time_label: requireString(body.time_label, "time_label", { max: 80 }),
    ticket_url: optionalUrl(body.ticket_url, "ticket_url"),
  };
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  return adminRoute(async () => {
    const { id } = await ctx.params;
    const body = await parseBody<Record<string, unknown>>(req);
    return data(await updateRow<Gig>("gigs", id, patchPayload(body)));
  });
}

export async function DELETE(_req: NextRequest, ctx: RouteCtx) {
  return adminRoute(async () => {
    const { id } = await ctx.params;
    await deleteRow("gigs", id);
    return data({ ok: true });
  });
}
