import type { NextRequest } from "next/server";
import { adminRoute, data, parseBody } from "../_lib";
import { fetchRows, insertRow } from "@/lib/admin/store";
import type { Gig } from "@/lib/admin/types";
import {
  optionalString,
  optionalUrl,
  requireDateIso,
  requireLineupPreset,
  requireOrder,
  requireString,
} from "@/lib/admin/validation";

function gigPayload(body: Record<string, unknown>, orderFallback: number) {
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
    order_index: requireOrder(body.order_index, orderFallback),
  };
}

export async function GET() {
  return adminRoute(async () => data(await fetchRows<Gig>("gigs", { orderBy: "order_index" })));
}

export async function POST(req: NextRequest) {
  return adminRoute(async () => {
    const rows = await fetchRows<Gig>("gigs", { orderBy: "order_index" });
    const body = await parseBody<Record<string, unknown>>(req);
    const created = await insertRow<Gig>("gigs", gigPayload(body, rows.length));
    return data(created);
  });
}
