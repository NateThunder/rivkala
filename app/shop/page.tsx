import Link from "next/link";
import { getShopCatalog } from "@/lib/shop/catalog";
import { ShopProductCard } from "./product-card";
import styles from "./shop.module.css";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { category } = await searchParams;
  const selected = typeof category === "string" ? category : "";
  const { categories, products } = await getShopCatalog();
  const visible = selected
    ? products.filter((product) => categories.find((item) => item.slug === selected)?.id === product.categoryId)
    : products;

  return (
    <section className={styles.collection} id="collection">
        <header className={styles.collectionHeader}>
          <div><p className={styles.kicker}>Take your pick</p><h2>The collection</h2></div>
          <p>{visible.length} {visible.length === 1 ? "piece" : "pieces"}</p>
        </header>
        {categories.length ? (
          <nav className={styles.filters} aria-label="Product categories">
            <Link className={!selected ? styles.filterActive : ""} href="/shop#collection">Everything</Link>
            {categories.map((item) => (
              <Link
                className={selected === item.slug ? styles.filterActive : ""}
                href={`/shop?category=${item.slug}#collection`}
                key={item.id}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        ) : null}
        {visible.length ? (
          <div className={styles.productGrid}>
            {visible.map((product, index) => <ShopProductCard index={index} key={product.id} product={product} />)}
          </div>
        ) : (
          <div className={styles.emptyCollection}>
            <p className={styles.kicker}>Backstage</p>
            <h3>The collection is getting dressed.</h3>
            <p>New pieces will appear here soon.</p>
          </div>
        )}
    </section>
  );
}
