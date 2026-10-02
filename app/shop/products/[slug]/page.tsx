import Link from "next/link";
import { notFound } from "next/navigation";
import { getShopProduct } from "@/lib/shop/catalog";
import { ShopProductGallery } from "../../product-gallery";
import { ShopProductPurchase } from "../../product-purchase";
import styles from "../../shop.module.css";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getShopProduct(slug);
  if (!product) notFound();
  return (
    <section className={styles.productPage}>
      <Link className={styles.backLink} href="/shop">← Back to the collection</Link>
      <div className={styles.productLayout}>
        <ShopProductGallery images={product.images} />
        <ShopProductPurchase product={product} />
      </div>
    </section>
  );
}
