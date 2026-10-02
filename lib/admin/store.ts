import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import path from "path";
import type {
  EpkPhotoSlot,
  Gig,
  MediaAsset,
  MusicLink,
  MusicTrack,
  SiteContentRow,
  VideoRow,
} from "./types";

export type TableName = "gigs" | "videos" | "music_links" | "music_tracks";

type D1DatabaseLike = {
  prepare(query: string): D1PreparedStatementLike;
};

type D1PreparedStatementLike = {
  bind(...values: unknown[]): D1PreparedStatementLike;
  all<T = Record<string, unknown>>(): Promise<{ results?: T[] }>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
};

type R2ObjectLike = {
  body?: ReadableStream;
  arrayBuffer?(): Promise<ArrayBuffer>;
  size?: number;
  range?: { offset?: number; length?: number; suffix?: number };
  httpMetadata?: { contentType?: string };
  customMetadata?: Record<string, string>;
};

type R2BucketLike = {
  put(
    key: string,
    body: ArrayBuffer | ReadableStream | Uint8Array,
    options?: { httpMetadata?: { contentType?: string }; customMetadata?: Record<string, string> }
  ): Promise<unknown>;
  get(key: string, options?: { range?: { offset?: number; length?: number; suffix?: number } }): Promise<R2ObjectLike | null>;
  head?(key: string): Promise<R2ObjectLike | null>;
  delete?(key: string): Promise<unknown>;
};

type CloudflareEnvLike = {
  DB?: D1DatabaseLike;
  MEDIA?: R2BucketLike;
};

type DataStore = {
  gigs: Gig[];
  videos: VideoRow[];
  music_links: MusicLink[];
  music_tracks: MusicTrack[];
  site_content: SiteContentRow[];
  epk_photo_slots: EpkPhotoSlot[];
  media_assets: MediaAsset[];
};

type QueryOptions = {
  orderBy?: string;
  ascending?: boolean;
  filters?: Record<string, string | number | boolean>;
  limit?: number;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "admin-data.json");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const tableColumns: Record<TableName, string[]> = {
  gigs: [
    "id",
    "event_date",
    "title",
    "location",
    "lineup_preset",
    "lineup_custom_label",
    "time_label",
    "ticket_url",
    "order_index",
    "created_at",
    "updated_at",
  ],
  videos: [
    "id",
    "title",
    "youtube_url",
    "youtube_id",
    "is_featured",
    "order_index",
    "created_at",
    "updated_at",
  ],
  music_links: [
    "id",
    "title",
    "is_featured",
    "release_type",
    "release_year",
    "description",
    "url",
    "spotify_url",
    "apple_music_url",
    "bandcamp_url",
    "youtube_url",
    "shop_variant_id",
    "sale_enabled",
    "price_gbp",
    "download_mp3_key",
    "download_wav_key",
    "thumbnail_src",
    "thumbnail_alt",
    "order_index",
    "created_at",
    "updated_at",
  ],
  music_tracks: [
    "id",
    "release_id",
    "title",
    "audio_src",
    "spotify_url",
    "apple_music_url",
    "bandcamp_url",
    "youtube_url",
    "shop_variant_id",
    "sale_enabled",
    "price_gbp",
    "download_mp3_key",
    "download_wav_key",
    "order_index",
    "created_at",
    "updated_at",
  ],
};

const singletonColumns = {
  site_content: ["key", "value", "updated_at"],
  epk_photo_slots: ["slot", "src", "alt", "label", "credit", "download_name", "updated_at"],
  media_assets: [
    "key",
    "original_name",
    "content_type",
    "size",
    "bucket",
    "public_path",
    "created_at",
  ],
};

const emptyStore = (): DataStore => ({
  gigs: [],
  videos: [],
  music_links: [],
  music_tracks: [],
  site_content: [],
  epk_photo_slots: [],
  media_assets: [],
});

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function dbValue(value: unknown) {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (value == null) return "";
  return value;
}

function normalizeRow<T>(table: TableName | keyof typeof singletonColumns, row: Record<string, unknown>) {
  if (table === "site_content") {
    return {
      ...row,
      value: typeof row.value === "string" ? JSON.parse(row.value) : row.value,
    } as T;
  }
  if (table === "videos") {
    return { ...row, is_featured: Boolean(row.is_featured) } as T;
  }
  if (table === "music_links" || table === "music_tracks") {
    return {
      ...row,
      ...(table === "music_links" ? { is_featured: Boolean(row.is_featured) } : {}),
      sale_enabled: Boolean(row.sale_enabled),
      price_gbp: Number(row.price_gbp ?? 0),
    } as T;
  }
  if (table === "epk_photo_slots") {
    return { ...row, slot: Number(row.slot) } as T;
  }
  if (table === "media_assets") {
    return { ...row, size: Number(row.size) } as T;
  }
  return row as T;
}

function assertColumn(table: TableName | keyof typeof singletonColumns, column: string) {
  const columns =
    table in tableColumns
      ? tableColumns[table as TableName]
      : singletonColumns[table as keyof typeof singletonColumns];
  if (!columns.includes(column)) {
    throw new Error(`Unsupported column: ${column}`);
  }
}

function tableColumnList(table: TableName | keyof typeof singletonColumns) {
  return table in tableColumns
    ? tableColumns[table as TableName]
    : singletonColumns[table as keyof typeof singletonColumns];
}

async function getEnv(): Promise<CloudflareEnvLike> {
  try {
    const context = await getCloudflareContext({ async: true });
    return context.env as CloudflareEnvLike;
  } catch {
    return {};
  }
}

async function getDb() {
  return (await getEnv()).DB;
}

async function getR2() {
  return (await getEnv()).MEDIA;
}

async function readStore(): Promise<DataStore> {
  try {
    const { readFile } = await import("fs/promises");
    const raw = await readFile(DATA_FILE, "utf8");
    return { ...emptyStore(), ...JSON.parse(raw) };
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: DataStore) {
  const { mkdir, writeFile } = await import("fs/promises");
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function matchesFilters(row: Record<string, unknown>, filters?: QueryOptions["filters"]) {
  if (!filters) return true;
  return Object.entries(filters).every(([key, value]) => row[key] === value);
}

function sortRows<T extends Record<string, unknown>>(rows: T[], opts: QueryOptions = {}) {
  if (!opts.orderBy) return rows;
  return [...rows].sort((a, b) => {
    const left = a[opts.orderBy as keyof T];
    const right = b[opts.orderBy as keyof T];
    if (left === right) return 0;
    const result = String(left ?? "").localeCompare(String(right ?? ""), undefined, {
      numeric: true,
    });
    return opts.ascending === false ? -result : result;
  });
}

export async function fetchRows<T>(
  table: TableName | keyof typeof singletonColumns,
  opts: QueryOptions = {}
) {
  const db = await getDb();
  if (db) {
    const where: string[] = [];
    const values: unknown[] = [];
    if (opts.filters) {
      Object.entries(opts.filters).forEach(([key, value]) => {
        assertColumn(table, key);
        where.push(`${key} = ?`);
        values.push(dbValue(value));
      });
    }

    let sql = `SELECT * FROM ${table}`;
    if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
    if (opts.orderBy) {
      assertColumn(table, opts.orderBy);
      sql += ` ORDER BY ${opts.orderBy} ${opts.ascending === false ? "DESC" : "ASC"}`;
    }
    if (typeof opts.limit === "number") {
      sql += " LIMIT ?";
      values.push(opts.limit);
    }
    const result = await db.prepare(sql).bind(...values).all<Record<string, unknown>>();
    return (result.results ?? []).map((row) => normalizeRow<T>(table, row));
  }

  const store = await readStore();
  const rows = store[table].filter((row) => matchesFilters(row as Record<string, unknown>, opts.filters));
  const sorted = sortRows(rows as Record<string, unknown>[], opts);
  const limited = typeof opts.limit === "number" ? sorted.slice(0, opts.limit) : sorted;
  return limited as T[];
}

export async function insertRow<T>(table: TableName, payload: Record<string, unknown>) {
  const row: Record<string, unknown> = {
    id: String(payload.id ?? newId()),
    ...payload,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  const db = await getDb();
  if (db) {
    const columns = Object.keys(row).filter((key) => tableColumns[table].includes(key));
    const placeholders = columns.map(() => "?").join(", ");
    await db
      .prepare(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`)
      .bind(...columns.map((key) => dbValue(row[key])))
      .run();
    const saved = await db
      .prepare(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`)
      .bind(row.id)
      .first<Record<string, unknown>>();
    if (!saved) throw new Error("Inserted row not found");
    return normalizeRow<T>(table, saved);
  }

  const store = await readStore();
  const rows = store[table] as Record<string, unknown>[];
  rows.push(row);
  await writeStore(store);
  return row as T;
}

export async function updateRow<T>(table: TableName, id: string, payload: Record<string, unknown>) {
  const row: Record<string, unknown> = { ...payload, updated_at: nowIso() };
  const db = await getDb();
  if (db) {
    const columns = Object.keys(row).filter((key) => tableColumns[table].includes(key));
    if (!columns.length) throw new Error("No valid columns to update");
    await db
      .prepare(`UPDATE ${table} SET ${columns.map((key) => `${key} = ?`).join(", ")} WHERE id = ?`)
      .bind(...columns.map((key) => dbValue(row[key])), id)
      .run();
    const saved = await db
      .prepare(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`)
      .bind(id)
      .first<Record<string, unknown>>();
    if (!saved) throw new Error("Row not found");
    return normalizeRow<T>(table, saved);
  }

  const store = await readStore();
  const rows = store[table] as Record<string, unknown>[];
  const index = rows.findIndex((item) => item.id === id);
  if (index === -1) throw new Error("Row not found");
  rows[index] = { ...rows[index], ...row };
  await writeStore(store);
  return rows[index] as T;
}

export async function deleteRow(table: TableName, id: string) {
  const db = await getDb();
  if (db) {
    await db.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
    return;
  }
  const store = await readStore();
  const next = (store[table] as Record<string, unknown>[]).filter((row) => row.id !== id);
  (store as Record<TableName, Record<string, unknown>[]>)[table] = next;
  await writeStore(store);
}

export async function reorderRows(table: TableName, ids: string[]) {
  await Promise.all(ids.map((id, index) => updateRow(table, id, { order_index: index })));
}

export async function upsertSiteContent(key: string, value: unknown) {
  const row = { key, value, updated_at: nowIso() };
  const db = await getDb();
  if (db) {
    await db
      .prepare(
        `INSERT INTO site_content (key, value, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      )
      .bind(key, JSON.stringify(value), row.updated_at)
      .run();
    return row;
  }
  const store = await readStore();
  const index = store.site_content.findIndex((item) => item.key === key);
  if (index === -1) store.site_content.push(row);
  else store.site_content[index] = row;
  await writeStore(store);
  return row;
}

export async function updateEpkPhotoSlot(slot: 1 | 2 | 3 | 4, payload: Omit<EpkPhotoSlot, "slot">) {
  const row: EpkPhotoSlot = { slot, ...payload, updated_at: nowIso() };
  const db = await getDb();
  if (db) {
    const columns = tableColumnList("epk_photo_slots");
    await db
      .prepare(
        `INSERT INTO epk_photo_slots (${columns.join(", ")})
         VALUES (${columns.map(() => "?").join(", ")})
         ON CONFLICT(slot) DO UPDATE SET
           src = excluded.src,
           alt = excluded.alt,
           label = excluded.label,
           credit = excluded.credit,
           download_name = excluded.download_name,
           updated_at = excluded.updated_at`
      )
      .bind(...columns.map((key) => dbValue(row[key as keyof EpkPhotoSlot])))
      .run();
    return row;
  }
  const store = await readStore();
  const index = store.epk_photo_slots.findIndex((item) => item.slot === slot);
  if (index === -1) store.epk_photo_slots.push(row);
  else store.epk_photo_slots[index] = row;
  await writeStore(store);
  return row;
}

export async function getSiteContentValue<T>(key: string, fallback: T): Promise<T> {
  try {
    const rows = await fetchRows<SiteContentRow>("site_content", {
      filters: { key },
      limit: 1,
    });
    return (rows[0]?.value as T | undefined) ?? fallback;
  } catch {
    return fallback;
  }
}

function sanitizeFileName(name: string) {
  const base = name.replace(/\\/g, "/").split("/").pop() || "upload";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function contentTypeForPath(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".avif") return "image/avif";
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".mp3") return "audio/mpeg";
  if (ext === ".wav") return "audio/wav";
  if (ext === ".zip") return "application/zip";
  return "application/octet-stream";
}

async function saveMediaAsset(asset: MediaAsset) {
  const db = await getDb();
  if (db) {
    const columns = tableColumnList("media_assets");
    await db
      .prepare(`INSERT INTO media_assets (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`)
      .bind(...columns.map((key) => dbValue(asset[key as keyof MediaAsset])))
      .run();
    return asset;
  }
  const store = await readStore();
  store.media_assets.push(asset);
  await writeStore(store);
  return asset;
}

export function mediaPublicPath(key: string) {
  return `/api/media/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export async function uploadMediaFile(bucket: "music" | "music-audio" | "music-downloads" | "epk-photos" | "epk-pdf", file: File) {
  const safeName = sanitizeFileName(file.name);
  const key = `${bucket}/${Date.now()}-${safeName}`;
  const body = await file.arrayBuffer();
  const contentType = file.type || contentTypeForPath(safeName);
  const r2 = await getR2();

  if (r2) {
    await r2.put(key, body, {
      httpMetadata: { contentType },
      customMetadata: { originalName: safeName },
    });
  } else {
    const { mkdir, writeFile } = await import("fs/promises");
    const filePath = path.join(UPLOAD_DIR, ...key.split("/"));
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, Buffer.from(body));
  }

  const asset = await saveMediaAsset({
    key,
    original_name: safeName,
    content_type: contentType,
    size: file.size,
    bucket,
    public_path: bucket === "music-downloads" ? "" : mediaPublicPath(key),
    created_at: nowIso(),
  });

  return asset;
}

export async function deleteMediaFile(key: string) {
  if (!key) return;
  const r2 = await getR2();
  if (r2?.delete) {
    await r2.delete(key);
    return;
  }
  try {
    const { unlink } = await import("fs/promises");
    await unlink(path.join(UPLOAD_DIR, ...key.split("/")));
  } catch {
    // A missing file is already deleted.
  }
}

function parseByteRange(value: string | null, size: number) {
  if (!value?.startsWith("bytes=") || value.includes(",")) return null;
  const [startText, endText] = value.slice(6).split("-");
  if (!startText) {
    const suffix = Number(endText);
    if (!Number.isInteger(suffix) || suffix <= 0) return null;
    const length = Math.min(suffix, size);
    return { start: size - length, end: size - 1, length };
  }
  const start = Number(startText);
  const requestedEnd = endText ? Number(endText) : size - 1;
  if (!Number.isInteger(start) || !Number.isInteger(requestedEnd) || start < 0 || start >= size || requestedEnd < start) {
    return null;
  }
  const end = Math.min(requestedEnd, size - 1);
  return { start, end, length: end - start + 1 };
}

export async function getMediaFile(key: string, rangeHeader: string | null = null) {
  const safeKey = key
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replace(/[^a-zA-Z0-9._-]/g, "_"))
    .join("/");
  const r2 = await getR2();
  if (r2) {
    const metadata = r2.head ? await r2.head(safeKey) : null;
    const size = metadata?.size ?? 0;
    const range = size ? parseByteRange(rangeHeader, size) : null;
    const object = await r2.get(
      safeKey,
      range ? { range: { offset: range.start, length: range.length } } : undefined
    );
    if (object) {
      const contentType = object.httpMetadata?.contentType ?? contentTypeForPath(safeKey);
      const resolvedSize = size || object.size || 0;
      const resolvedRange = range ?? (resolvedSize ? { start: 0, end: resolvedSize - 1, length: resolvedSize } : null);
      const details = { contentType, size: resolvedSize, range: resolvedRange, partial: Boolean(range) };
      if (object.body) return { body: object.body, ...details };
      if (object.arrayBuffer) return { body: await object.arrayBuffer(), ...details };
      return null;
    }
    if (process.env.NODE_ENV === "production") return null;
  }
  try {
    const { readFile } = await import("fs/promises");
    let buffer: Buffer;
    try {
      buffer = await readFile(path.join(UPLOAD_DIR, ...safeKey.split("/")));
    } catch (error) {
      if (safeKey !== "epk-pdf/RIVKALA_EPK_OFFICIAL.pdf") throw error;
      buffer = await readFile(path.join(process.cwd(), "private-media", "RIVKALA_EPK_OFFICIAL.pdf"));
    }
    const requestedRange = parseByteRange(rangeHeader, buffer.byteLength);
    const selected = requestedRange ? buffer.subarray(requestedRange.start, requestedRange.end + 1) : buffer;
    const body = selected.buffer.slice(
      selected.byteOffset,
      selected.byteOffset + selected.byteLength
    ) as ArrayBuffer;
    return {
      body,
      contentType: contentTypeForPath(safeKey),
      size: buffer.byteLength,
      range: requestedRange ?? { start: 0, end: buffer.byteLength - 1, length: buffer.byteLength },
      partial: Boolean(requestedRange),
    };
  } catch {
    return null;
  }
}
