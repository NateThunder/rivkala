import { getShopBucket, getShopDatabase } from "@/lib/shop/cloudflare";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db = await getShopDatabase();
  const bucket = await getShopBucket();
  if (!db || !bucket) {
    return Response.json({ error: "Downloads are not configured." }, { status: 503 });
  }
  const record = await db
    .prepare(`SELECT object_key FROM shop_download_files
      WHERE token = ? AND expires_at > CURRENT_TIMESTAMP AND download_count < max_downloads`)
    .bind(token)
    .first<{ object_key: string }>();
  if (!record) {
    return Response.json({ error: "This download link has expired or reached its limit." }, { status: 410 });
  }
  const object = await bucket.get(record.object_key);
  if (!object) return Response.json({ error: "File not found." }, { status: 404 });

  await db
    .prepare("UPDATE shop_download_files SET download_count = download_count + 1 WHERE token = ?")
    .bind(token)
    .run();
  const filename = record.object_key.split("/").pop()?.replace(/[\"\\]/g, "_") || "download";
  const headers = new Headers({
    "content-disposition": `attachment; filename="${filename}"`,
    "cache-control": "private, no-store",
  });
  object.writeHttpMetadata(headers);
  return new Response(object.body, { headers });
}
