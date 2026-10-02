"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatGBP } from "@/lib/shop/money";
import type { ShopProduct } from "@/lib/shop/types";
import { ShopProductImageView } from "./product-image";
import { useShopStore } from "./store-provider";
import styles from "./shop.module.css";

export function ShopCartDrawer({ products }: { products: ShopProduct[] }) {
  const { lines, update, remove, clear } = useShopStore();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const resolved = useMemo(
    () =>
      lines.flatMap((line) =>
        products.flatMap((product) => {
          const variant = product.variants.find((item) => item.id === line.variantId);
          return variant ? [{ ...line, product, variant }] : [];
        })
      ),
    [lines, products]
  );
  const count = resolved.reduce((total, line) => total + line.quantity, 0);
  const subtotal = resolved.reduce((sum, line) => sum + line.variant.priceGBP * line.quantity, 0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setOpen(false));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

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

  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Open cart with ${count} ${count === 1 ? "item" : "items"}`}
        className={styles.cartTrigger}
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
      >
        <span>Cart</span><strong>{count}</strong>
      </button>
      <button
        aria-hidden={!open}
        aria-label="Close cart"
        className={`${styles.cartScrim} ${open ? styles.cartScrimOpen : ""}`}
        disabled={!open}
        tabIndex={open ? 0 : -1}
        type="button"
        onClick={() => setOpen(false)}
      />
      <aside
        aria-hidden={!open}
        aria-modal="true"
        className={`${styles.cartDrawer} ${open ? styles.cartDrawerOpen : ""}`}
        role="dialog"
      >
        <header className={styles.cartDrawerHeader}>
          <div><p className={styles.kicker}>Your selection</p><h2>Cart</h2></div>
          <button aria-label="Close cart" ref={closeRef} type="button" onClick={() => setOpen(false)}>×</button>
        </header>
        <div className={styles.cartDrawerBody}>
          {resolved.length ? (
            <ul className={styles.drawerList}>
              {resolved.map(({ product, variant, quantity }) => (
                <li key={variant.id}>
                  <Link className={styles.drawerImage} href={`/shop/products/${product.slug}`}>
                    <ShopProductImageView image={product.images[0]} sizes="80px" />
                  </Link>
                  <div className={styles.drawerItemMeta}>
                    <Link href={`/shop/products/${product.slug}`}>{product.name}</Link>
                    <span>{variant.name}</span>
                    <strong>{formatGBP(variant.priceGBP * quantity)}</strong>
                  </div>
                  <div className={styles.drawerControls}>
                    <button aria-label={`Decrease ${product.name}`} type="button" onClick={() => update(variant.id, quantity - 1)}>−</button>
                    <span>{quantity}</span>
                    <button aria-label={`Increase ${product.name}`} type="button" onClick={() => update(variant.id, Math.min(quantity + 1, variant.stock ?? 20))}>+</button>
                    <button type="button" onClick={() => remove(variant.id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className={styles.drawerEmpty}>Your cart is waiting for something fabulous.</p>}
        </div>
        <footer className={styles.cartDrawerFooter}>
          <div><span>Subtotal</span><strong>{formatGBP(subtotal)}</strong></div>
          <p>UK delivery is £4 and free from £50. Tax is calculated by Stripe.</p>
          {error ? <p className={styles.formError} role="alert">{error}</p> : null}
          <button className={styles.primaryButton} disabled={!resolved.length || busy} type="button" onClick={checkout}>
            {busy ? "Opening checkout…" : "Secure checkout"}
          </button>
          <div className={styles.drawerLinks}>
            <Link href="/shop/cart">View full cart</Link>
            <button disabled={!resolved.length} type="button" onClick={clear}>Clear</button>
          </div>
        </footer>
      </aside>
    </>
  );
}
