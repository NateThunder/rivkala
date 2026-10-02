import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

export type ShopD1Statement = {
  bind(...values: unknown[]): ShopD1Statement;
  all<T = Record<string, unknown>>(): Promise<{ results?: T[] }>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<{ meta?: { changes?: number } }>;
};

export type ShopD1Database = {
  prepare(query: string): ShopD1Statement;
  batch<T = unknown>(statements: ShopD1Statement[]): Promise<T[]>;
};

type ShopR2Object = {
  body: ReadableStream;
  httpEtag: string;
  writeHttpMetadata(headers: Headers): void;
};

export type ShopR2Bucket = {
  get(key: string): Promise<ShopR2Object | null>;
  put(
    key: string,
    body: ArrayBuffer | ReadableStream,
    options?: { httpMetadata?: { contentType?: string }; customMetadata?: Record<string, string> }
  ): Promise<unknown>;
  delete(key: string): Promise<unknown>;
};

type ShopEnv = {
  DB?: ShopD1Database;
  MEDIA?: ShopR2Bucket;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  DOWNLOAD_TOKEN_TTL_HOURS?: string;
  EMAIL?: SendEmail;
};

async function getEnv(): Promise<ShopEnv> {
  try {
    const context = await getCloudflareContext({ async: true });
    return context.env as unknown as ShopEnv;
  } catch {
    return {};
  }
}

export async function getShopDatabase() {
  return (await getEnv()).DB ?? null;
}

export async function getShopBucket() {
  return (await getEnv()).MEDIA ?? null;
}

export async function getShopEmail() {
  return (await getEnv()).EMAIL ?? null;
}

export async function getShopSecret(name: keyof ShopEnv) {
  const value = (await getEnv())[name];
  if (typeof value === "string" && value) return value;
  return process.env[name] || null;
}
