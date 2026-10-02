import "server-only";

import { deleteMediaFile } from "./store";

export type MusicSaleFields = {
  sale_enabled: boolean;
  price_gbp: number;
  download_mp3_key: string;
  download_wav_key: string;
};

function privateKey(value: unknown, format: "mp3" | "wav", packaged: boolean) {
  const key = typeof value === "string" ? value.trim() : "";
  if (!key) return "";
  if (!key.startsWith("music-downloads/")) throw new Error("Purchase files must use private music storage");
  const expectedExtension = packaged ? ".zip" : `.${format}`;
  if (!key.toLowerCase().endsWith(expectedExtension)) {
    throw new Error(packaged ? `${format.toUpperCase()} release download must be a ZIP` : `Purchase ${format.toUpperCase()} must be a ${format.toUpperCase()} file`);
  }
  return key;
}

export function musicSalePayload(body: Record<string, unknown>, packaged: boolean): MusicSaleFields {
  const saleEnabled = body.sale_enabled === true;
  const price = Number(body.price_gbp ?? 0);
  if (!Number.isInteger(price) || price < 0) throw new Error("Direct-sale price must be a valid GBP amount");
  const downloadMp3Key = privateKey(body.download_mp3_key, "mp3", packaged);
  const downloadWavKey = privateKey(body.download_wav_key, "wav", packaged);
  if (saleEnabled && (!price || !downloadMp3Key || !downloadWavKey)) {
    throw new Error("Enable direct sales only after setting a price and uploading both MP3 and WAV formats");
  }
  return {
    sale_enabled: saleEnabled,
    price_gbp: price,
    download_mp3_key: downloadMp3Key,
    download_wav_key: downloadWavKey,
  };
}

export async function deleteReplacedSaleFiles(
  previous: Pick<MusicSaleFields, "download_mp3_key" | "download_wav_key"> | undefined,
  next: Pick<MusicSaleFields, "download_mp3_key" | "download_wav_key">
) {
  if (!previous) return;
  const retained = new Set([next.download_mp3_key, next.download_wav_key]);
  await Promise.all(
    [previous.download_mp3_key, previous.download_wav_key]
      .filter((key) => key && !retained.has(key))
      .map((key) => deleteMediaFile(key))
  );
}

export async function deleteSaleFiles(row: Pick<MusicSaleFields, "download_mp3_key" | "download_wav_key">) {
  await Promise.all(Array.from(new Set([row.download_mp3_key, row.download_wav_key])).filter(Boolean).map(deleteMediaFile));
}
