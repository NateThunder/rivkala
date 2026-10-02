import "server-only";

import { getShopVariant } from "./catalog";
import { getShopDatabase } from "./cloudflare";
import type { ShopCheckoutLine, ShopProduct, ShopProductVariant } from "./types";

export type CheckoutItem = {
  product: Pick<ShopProduct, "id" | "name" | "kind" | "downloads">;
  variant: Pick<ShopProductVariant, "id" | "name" | "priceGBP" | "stock">;
};

type MusicSaleRow = {
  id: string;
  title: string;
  release_title?: string;
  sale_enabled: number;
  price_gbp: number;
  download_mp3_key: string;
  download_wav_key: string;
};

async function getMusicSale(kind: "release" | "track", id: string, includeInactive: boolean): Promise<CheckoutItem | null> {
  const db = await getShopDatabase();
  if (!db) return null;
  const row = kind === "release"
    ? await db.prepare(`SELECT id, title, sale_enabled, price_gbp, download_mp3_key, download_wav_key
        FROM music_links WHERE id = ?`).bind(id).first<MusicSaleRow>()
    : await db.prepare(`SELECT t.id, t.title, r.title AS release_title, t.sale_enabled, t.price_gbp,
        t.download_mp3_key, t.download_wav_key FROM music_tracks t
        JOIN music_links r ON r.id = t.release_id WHERE t.id = ? AND r.release_type != 'SINGLE'`).bind(id).first<MusicSaleRow>();
  if (!row || (!includeInactive && !row.sale_enabled) || row.price_gbp <= 0 || !row.download_mp3_key || !row.download_wav_key) {
    return null;
  }
  const saleId = `music-${kind}:${row.id}`;
  return {
    product: {
      id: saleId,
      name: kind === "track" && row.release_title ? `${row.title} — ${row.release_title}` : row.title,
      kind: "digital",
      downloads: { mp3: row.download_mp3_key, wav: row.download_wav_key, zip: null },
    },
    variant: {
      id: saleId,
      name: kind === "release" ? "Complete release — MP3 + WAV" : "Track — MP3 + WAV",
      priceGBP: row.price_gbp,
      stock: null,
    },
  };
}

export function validCheckoutLine(line: ShopCheckoutLine) {
  const validQuantity = Number.isInteger(line.quantity) && line.quantity >= 1 && line.quantity <= 20;
  const shopLine = Boolean(line.variantId) && !line.musicKind && !line.musicId;
  const musicLine = !line.variantId && (line.musicKind === "release" || line.musicKind === "track") && Boolean(line.musicId);
  return validQuantity && (shopLine || musicLine);
}

export async function resolveCheckoutLine(line: ShopCheckoutLine, includeInactive = false): Promise<CheckoutItem | null> {
  if (line.variantId) return getShopVariant(line.variantId, includeInactive);
  if (line.musicKind && line.musicId) return getMusicSale(line.musicKind, line.musicId, includeInactive);
  return null;
}

export function encodeCheckoutLine(line: ShopCheckoutLine) {
  const reference = line.variantId
    ? `shop:${line.variantId}`
    : `music:${line.musicKind}:${line.musicId}`;
  return `${reference}|${line.quantity}`;
}

export function decodeCheckoutLine(value: string): ShopCheckoutLine | null {
  const [reference, quantityText] = value.split("|");
  const quantity = Number(quantityText);
  if (reference.startsWith("shop:")) return { variantId: reference.slice(5), quantity };
  if (reference.startsWith("music:release:")) return { musicKind: "release", musicId: reference.slice(14), quantity };
  if (reference.startsWith("music:track:")) return { musicKind: "track", musicId: reference.slice(12), quantity };
  // Backwards compatibility for sessions created before typed checkout references.
  if (reference) return { variantId: reference, quantity };
  return null;
}
