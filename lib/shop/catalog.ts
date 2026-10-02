import "server-only";

import { getShopDatabase } from "./cloudflare";
import type {
  ShopCategory,
  ShopProduct,
  ShopProductImage,
  ShopProductVariant,
} from "./types";

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  active: number;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  category_name: string;
  summary: string;
  description: string;
  kind: ShopProduct["kind"];
  download_key: string | null;
  download_mp3_key: string | null;
  download_wav_key: string | null;
  download_zip_key: string | null;
  featured: number;
  active: number;
  sort_order: number;
};

type ImageRow = {
  id: string;
  product_id: string;
  object_key: string | null;
  remote_url: string | null;
  alt_text: string;
};

type VariantRow = {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price_gbp: number;
  stock: number | null;
  active: number;
};

function mediaUrl(key: string) {
  return `/api/media/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export async function getShopCatalog(options: { includeInactive?: boolean } = {}): Promise<{
  categories: ShopCategory[];
  products: ShopProduct[];
}> {
  const db = await getShopDatabase();
  if (!db) return { categories: [], products: [] };

  try {
    const categoryWhere = options.includeInactive ? "" : "WHERE active = 1";
    const productWhere = options.includeInactive ? "" : "WHERE p.active = 1 AND c.active = 1";
    const variantWhere = options.includeInactive ? "" : "WHERE active = 1";
    const [categoryResult, productResult, imageResult, variantResult] = await db.batch<{
      results?: unknown[];
    }>([
      db.prepare(`SELECT id, slug, name, sort_order, active FROM shop_categories ${categoryWhere} ORDER BY sort_order, name`),
      db.prepare(`SELECT p.id, p.slug, p.name, p.category_id, c.name AS category_name,
        p.summary, p.description, p.kind, p.download_key, p.download_mp3_key,
        p.download_wav_key, p.download_zip_key, p.featured, p.active, p.sort_order
        FROM shop_products p JOIN shop_categories c ON c.id = p.category_id ${productWhere}
        ORDER BY p.featured DESC, p.sort_order, p.name`),
      db.prepare("SELECT id, product_id, object_key, remote_url, alt_text FROM shop_product_images ORDER BY sort_order"),
      db.prepare(`SELECT id, product_id, name, sku, price_gbp, stock, active FROM shop_product_variants ${variantWhere} ORDER BY sort_order`),
    ]);

    const categories = ((categoryResult?.results ?? []) as CategoryRow[]).map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      sortOrder: row.sort_order,
      active: row.active === 1,
    }));
    const imagesByProduct = new Map<string, ShopProductImage[]>();
    for (const row of (imageResult?.results ?? []) as ImageRow[]) {
      const images = imagesByProduct.get(row.product_id) ?? [];
      images.push({
        id: row.id,
        objectKey: row.object_key,
        url: row.object_key ? mediaUrl(row.object_key) : row.remote_url ?? "",
        alt: row.alt_text,
      });
      imagesByProduct.set(row.product_id, images);
    }
    const variantsByProduct = new Map<string, ShopProductVariant[]>();
    for (const row of (variantResult?.results ?? []) as VariantRow[]) {
      const variants = variantsByProduct.get(row.product_id) ?? [];
      variants.push({
        id: row.id,
        name: row.name,
        sku: row.sku,
        priceGBP: row.price_gbp,
        stock: row.stock,
        active: row.active === 1,
      });
      variantsByProduct.set(row.product_id, variants);
    }
    const products = ((productResult?.results ?? []) as ProductRow[]).map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      categoryId: row.category_id,
      categoryName: row.category_name,
      summary: row.summary,
      description: row.description,
      kind: row.kind,
      downloadKey: row.download_zip_key ?? row.download_key,
      downloads: {
        mp3: row.download_mp3_key,
        wav: row.download_wav_key,
        zip: row.download_zip_key ?? row.download_key,
      },
      featured: row.featured === 1,
      active: row.active === 1,
      sortOrder: row.sort_order,
      images: imagesByProduct.get(row.id) ?? [],
      variants: variantsByProduct.get(row.id) ?? [],
    }));
    return { categories, products };
  } catch {
    return { categories: [], products: [] };
  }
}

export async function getShopProduct(slug: string) {
  const { products } = await getShopCatalog();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getShopVariant(variantId: string, includeInactive = false) {
  const { products } = await getShopCatalog({ includeInactive });
  for (const product of products) {
    const variant = product.variants.find((item) => item.id === variantId);
    if (variant) return { product, variant };
  }
  return null;
}
