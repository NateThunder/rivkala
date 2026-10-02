import type { LineupPreset } from "./types";

const lineupPresets = new Set<LineupPreset>([
  "SOLO",
  "DUO",
  "TRIO",
  "FULL BAND",
  "OTHER",
]);

export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function requireString(
  value: unknown,
  field: string,
  opts: { min?: number; max?: number } = {}
) {
  if (typeof value !== "string") {
    throw new Error(`${field} must be a string`);
  }
  const normalized = value.trim();
  const min = opts.min ?? 1;
  const max = opts.max ?? 5000;
  if (normalized.length < min) {
    throw new Error(`${field} is required`);
  }
  if (normalized.length > max) {
    throw new Error(`${field} is too long`);
  }
  return normalized;
}

export function optionalString(value: unknown, max = 5000) {
  if (value == null || value === "") return "";
  return requireString(value, "value", { min: 0, max });
}

export function requireDateIso(value: unknown, field: string) {
  const date = requireString(value, field, { max: 10 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`${field} must be in YYYY-MM-DD format`);
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${field} must be a valid date`);
  }
  return date;
}

export function optionalUrl(value: unknown, field: string) {
  const normalized = optionalString(value, 2000);
  if (!normalized) return "";
  if (!isValidUrl(normalized)) {
    throw new Error(`${field} must be a valid URL`);
  }
  return normalized;
}

export function requireUrl(value: unknown, field: string) {
  const normalized = requireString(value, field, { max: 2000 });
  if (!isValidUrl(normalized)) {
    throw new Error(`${field} must be a valid URL`);
  }
  return normalized;
}

export function requireLineupPreset(value: unknown) {
  const preset = requireString(value, "lineup_preset", { max: 16 }) as LineupPreset;
  if (!lineupPresets.has(preset)) {
    throw new Error("lineup_preset is invalid");
  }
  return preset;
}

export function requireOrder(value: unknown, fallback: number) {
  if (value == null || value === "") return fallback;
  const order = Number(value);
  if (!Number.isFinite(order) || order < 0) {
    throw new Error("order_index must be a positive number");
  }
  return Math.floor(order);
}

export function extractYouTubeId(input: string): string | null {
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }
    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      const v = url.searchParams.get("v");
      if (v) return v;
      const parts = url.pathname.split("/").filter(Boolean);
      const markerIndex = parts.findIndex((part) =>
        ["shorts", "live", "embed", "v"].includes(part)
      );
      if (markerIndex >= 0 && parts[markerIndex + 1]) {
        return parts[markerIndex + 1];
      }
    }
    return null;
  } catch {
    const normalized = input.trim();
    return /^[a-zA-Z0-9_-]{11}$/.test(normalized) ? normalized : null;
  }
}

export function youtubeThumbnailUrl(id: string) {
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}

export function youtubeWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}
