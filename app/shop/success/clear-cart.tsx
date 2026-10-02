"use client";

import { useEffect, useRef } from "react";
import { useShopStore } from "../store-provider";

export function ClearShopCart() {
  const { clear } = useShopStore();
  const cleared = useRef(false);
  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    clear();
  }, [clear]);
  return null;
}
