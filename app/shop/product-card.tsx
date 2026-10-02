"use client";

import Link from "next/link";
import { useState } from "react";
import { formatGBP } from "@/lib/shop/money";
import type { ShopProduct } from "@/lib/shop/types";
import { ShopProductImageView } from "./product-image";
import { useShopStore } from "./store-provider";
import styles from "./shop.module.css";

export function ShopProductCard({ product, index }: { product: ShopProduct; index: number }) {
  const { add } = useShopStore();
  const [added, setAdded] = useState(false);
  const available = product.variants.filter((variant) => variant.active && variant.stock !== 0);
  const quickVariant = available.length === 1 ? available[0] : null;
  const lowest = available.length ? Math.min(...available.map((variant) => variant.priceGBP)) : null;

  function quickAdd() {
    if (!quickVariant) return;
    add(quickVariant.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1100);
  }

  return (
    <article className={styles.productCard} style={{ "--card-index": index } as React.CSSProperties}>
      <Link className={styles.productImage} href={`/shop/products/${product.slug}`}>
        <ShopProductImageView
          image={product.images[0]}
          sizes="(max-width: 760px) 100vw, 33vw"
          priority={index === 0}
        />
        {product.featured ? <span className={styles.featuredTag}>Rivkala’s pick</span> : null}
      </Link>
      <div className={styles.productMeta}>
        <div>
          <p className={styles.kicker}>{product.categoryName}</p>
          <h3><Link href={`/shop/products/${product.slug}`}>{product.name}</Link></h3>
          <p className={styles.productSummary}>{product.summary}</p>
        </div>
        <div className={styles.productBuyRow}>
          <strong>{lowest === null ? "Unavailable" : `${available.length > 1 ? "From " : ""}${formatGBP(lowest)}`}</strong>
          {quickVariant ? (
            <button className={styles.inkButton} type="button" onClick={quickAdd}>
              {added ? "Added!" : "Add to cart"}
            </button>
          ) : (
            <Link className={styles.inkButton} href={`/shop/products/${product.slug}`}>
              Choose option
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
