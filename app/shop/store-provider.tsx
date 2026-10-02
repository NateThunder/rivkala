"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ShopCartLine } from "@/lib/shop/types";

type StoreContextValue = {
  lines: ShopCartLine[];
  count: number;
  add: (variantId: string, quantity?: number) => void;
  update: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const STORAGE_KEY = "rivkala-shop-cart-v1";

export function ShopStoreProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<ShopCartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hydrate = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as ShopCartLine[];
        if (Array.isArray(saved)) setLines(saved);
      } catch {
        // Ignore invalid browser data and start with an empty cart.
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(hydrate);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const value = useMemo<StoreContextValue>(
    () => ({
      lines,
      count: lines.reduce((total, line) => total + line.quantity, 0),
      add: (variantId, quantity = 1) =>
        setLines((current) => {
          const existing = current.find((line) => line.variantId === variantId);
          return existing
            ? current.map((line) =>
                line.variantId === variantId
                  ? { ...line, quantity: Math.min(20, line.quantity + quantity) }
                  : line
              )
            : [...current, { variantId, quantity }];
        }),
      update: (variantId, quantity) =>
        setLines((current) =>
          quantity <= 0
            ? current.filter((line) => line.variantId !== variantId)
            : current.map((line) =>
                line.variantId === variantId ? { ...line, quantity: Math.min(20, quantity) } : line
              )
        ),
      remove: (variantId) => setLines((current) => current.filter((line) => line.variantId !== variantId)),
      clear: () => setLines([]),
    }),
    [lines]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useShopStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useShopStore must be used inside ShopStoreProvider");
  return value;
}
