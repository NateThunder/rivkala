"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import faceCollage from "../public/rivkala_featured_releases_assets/decor/surreal-eyes-lips-collage-web.png";
import styles from "./featured-releases.module.css";

export default function FeaturedReleasesCollage() {
  const collageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const collage = collageRef.current;

    if (!collage) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    let frameId = 0;
    let pointerX = 0;
    let pointerY = 0;

    const paint = () => {
      frameId = 0;

      if (reduceMotion.matches) {
        collage.style.setProperty("--featured-scroll", "0");
        collage.style.setProperty("--featured-pointer-x", "0");
        collage.style.setProperty("--featured-pointer-y", "0");
        return;
      }

      const bounds = collage.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const midpoint = bounds.top + bounds.height / 2;
      const scrollDepth = Math.max(
        -1,
        Math.min(1, (viewportHeight / 2 - midpoint) / viewportHeight),
      );

      collage.style.setProperty("--featured-scroll", scrollDepth.toFixed(3));
      collage.style.setProperty(
        "--featured-pointer-x",
        finePointer.matches ? pointerX.toFixed(3) : "0",
      );
      collage.style.setProperty(
        "--featured-pointer-y",
        finePointer.matches ? pointerY.toFixed(3) : "0",
      );
    };

    const schedulePaint = () => {
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(paint);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || reduceMotion.matches) {
        return;
      }

      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
      schedulePaint();
    };

    const handlePointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
      schedulePaint();
    };

    window.addEventListener("scroll", schedulePaint, { passive: true });
    window.addEventListener("resize", schedulePaint);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);
    reduceMotion.addEventListener("change", schedulePaint);
    finePointer.addEventListener("change", schedulePaint);
    schedulePaint();

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", schedulePaint);
      window.removeEventListener("resize", schedulePaint);
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
      reduceMotion.removeEventListener("change", schedulePaint);
      finePointer.removeEventListener("change", schedulePaint);
    };
  }, []);

  return (
    <div
      className={`${styles.faceCollage} ${styles.faceCollageMotion}`}
      ref={collageRef}
      aria-hidden="true"
    >
      <Image
        className={styles.faceCollageImage}
        src={faceCollage}
        alt=""
        sizes="(max-width: 700px) 190px, (max-width: 1100px) 25vw, 330px"
      />
    </div>
  );
}
