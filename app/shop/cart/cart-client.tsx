"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatGBP } from "@/lib/shop/money";
import type { ShopProduct } from "@/lib/shop/types";
import { ShopProductImageView } from "../product-image";
import { useShopStore } from "../store-provider";
import styles from "../shop.module.css";

export function ShopCartClient({ products }: { products: ShopProduct[] }) {
  const { lines, update, remove } = useShopStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const resolved = useMemo(
    () => lines.flatMap((line) => products.flatMap((product) => {
      const variant = product.variants.find((item) => item.id === line.variantId);
      return variant ? [{ ...line, product, variant }] : [];
    })),
    [lines, products]
  );
  const subtotal = resolved.reduce((sum, line) => sum + line.variant.priceGBP * line.quantity, 0);

  async function checkout() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error || "Checkout could not be opened.");
      window.location.assign(payload.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Checkout could not be opened.");
      setBusy(false);
    }
  }

  if (!resolved.length) {
    return <section className={styles.fullEmpty}><p className={styles.kicker}>Your cart</p><h1>Nothing in the bag.</h1><p>The good news: the collection is just over there.</p><Link className={styles.primaryButton} href="/shop">Browse the shop</Link></section>;
  }
  return (
    <section className={styles.cartPage}>
      <header className={styles.pageTitle}><p className={styles.kicker}>Your selection</p><h1>Shopping bag</h1></header>
      <div className={styles.cartLayout}>
        <div className={styles.cartLines}>
          {resolved.map(({ product, variant, quantity }) => (
            <article className={styles.cartLine} key={variant.id}>
              <Link className={styles.cartLineImage} href={`/shop/products/${product.slug}`}><ShopProductImageView image={product.images[0]} sizes="140px" /></Link>
              <div className={styles.cartLineBody}>
                <div><p className={styles.kicker}>{product.kind}</p><h2>{product.name}</h2><p>{variant.name}</p></div>
                <div className={styles.cartLineActions}>
                  <label>Quantity <input min="1" max={variant.stock ?? 20} type="number" value={quantity} onChange={(event) => update(variant.id, Number(event.target.value))} /></label>
                  <button type="button" onClick={() => remove(variant.id)}>Remove</button>
                </div>
              </div>
              <strong>{formatGBP(variant.priceGBP * quantity)}</strong>
            </article>
          ))}
        </div>
        <aside className={styles.cartSummary}>
          <p className={styles.kicker}>Summary</p>
          <div><span>Subtotal</span><strong>{formatGBP(subtotal)}</strong></div>
          <p>{subtotal >= 5000 ? "Your UK delivery is free." : `${formatGBP(5000 - subtotal)} away from free UK delivery.`}</p>
          <p>Tax and local-currency conversion are handled securely by Stripe.</p>
          {error ? <p className={styles.formError} role="alert">{error}</p> : null}
          <button className={styles.primaryButton} disabled={busy} type="button" onClick={checkout}>{busy ? "Opening checkout…" : "Secure checkout"}</button>
          <Link href="/shop">Continue shopping</Link>
        </aside>
      </div>
    </section>
  );
}
