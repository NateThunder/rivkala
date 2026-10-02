"use client";

import { useState } from "react";
import { formatGBP } from "@/lib/shop/money";
import type { ShopProduct } from "@/lib/shop/types";
import { useShopStore } from "./store-provider";
import styles from "./shop.module.css";

export function ShopProductPurchase({ product }: { product: ShopProduct }) {
  const available = product.variants.filter((variant) => variant.active);
  const { add } = useShopStore();
  const [variantId, setVariantId] = useState(available[0]?.id ?? "");
  const [added, setAdded] = useState(false);
  const variant = available.find((item) => item.id === variantId);
  const soldOut = variant?.stock === 0;

  return (
    <div className={styles.purchasePanel}>
      <p className={styles.kicker}>{product.categoryName} · {product.kind}</p>
      <h1>{product.name}</h1>
      <p className={styles.purchaseSummary}>{product.summary}</p>
      {variant ? <p className={styles.purchasePrice}>{formatGBP(variant.priceGBP)}</p> : null}
      <label className={styles.fieldLabel} htmlFor="shop-variant">Option</label>
      <select
        id="shop-variant"
        value={variantId}
        onChange={(event) => {
          setVariantId(event.target.value);
          setAdded(false);
        }}
      >
        {available.map((item) => (
          <option disabled={item.stock === 0} key={item.id} value={item.id}>
            {item.name}{item.stock === 0 ? " — sold out" : ""}
          </option>
        ))}
      </select>
      <button
        className={styles.primaryButton}
        disabled={!variant || soldOut}
        type="button"
        onClick={() => {
          if (!variant) return;
          add(variant.id);
          setAdded(true);
        }}
      >
        {soldOut ? "Sold out" : added ? "Added to cart" : "Add to cart"}
      </button>
      <p className={styles.productDescription}>{product.description}</p>
      <dl className={styles.productFacts}>
        <div><dt>Delivery</dt><dd>{product.kind === "digital" ? "Private download after payment" : "UK only · £4 or free over £50"}</dd></div>
        <div><dt>SKU</dt><dd>{variant?.sku || "—"}</dd></div>
      </dl>
    </div>
  );
}
