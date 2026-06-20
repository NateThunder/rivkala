"use client";

import { useEffect, useRef } from "react";
import styles from "./bio-page.module.css";

export default function BioDepth({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const paint = () => {
      frame = 0;
      if (reduced.matches) {
        element.style.setProperty("--bio-depth", "0");
        return;
      }

      const bounds = element.getBoundingClientRect();
      const depth = Math.max(
        -1,
        Math.min(1, (window.innerHeight / 2 - (bounds.top + bounds.height / 2)) / window.innerHeight),
      );
      element.style.setProperty("--bio-depth", depth.toFixed(3));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    schedule();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <div className={styles.poster} ref={ref}>
      {children}
    </div>
  );
}
