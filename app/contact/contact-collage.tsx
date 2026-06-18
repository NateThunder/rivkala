"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import multiArmFigure from "../../public/collage/Untitled_Artwork 3.png";
import lampFace from "../../public/collage/Untitled_Artwork 4.png";
import eyelashCutouts from "../../public/collage/Untitled_Artwork 5.png";
import eyeLipsCluster from "../../public/collage/Untitled_Artwork 6.png";
import styles from "./contact-page.module.css";

export default function ContactCollage() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
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
        stage.style.setProperty("--contact-scroll", "0");
        stage.style.setProperty("--contact-pointer-x", "0");
        stage.style.setProperty("--contact-pointer-y", "0");
        return;
      }

      const bounds = stage.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const midpoint = bounds.top + bounds.height / 2;
      const scrollDepth = Math.max(
        -1,
        Math.min(1, (viewportHeight / 2 - midpoint) / viewportHeight),
      );

      stage.style.setProperty("--contact-scroll", scrollDepth.toFixed(3));
      stage.style.setProperty("--contact-pointer-x", pointerX.toFixed(3));
      stage.style.setProperty("--contact-pointer-y", pointerY.toFixed(3));
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
    <div className={styles.artStage} ref={stageRef} aria-hidden="true">
      <div className={`${styles.artLayer} ${styles.lampArtwork}`}>
        <Image
          src={lampFace}
          alt=""
          sizes="(max-width: 760px) 94vw, 49rem"
        />
      </div>

      <div className={`${styles.artLayer} ${styles.lashArtwork}`}>
        <Image
          src={eyelashCutouts}
          alt=""
          sizes="(max-width: 760px) 42vw, 18rem"
        />
      </div>

      <div className={`${styles.artLayer} ${styles.figureArtwork}`}>
        <Image
          src={multiArmFigure}
          alt=""
          sizes="(max-width: 760px) 0px, (max-width: 980px) 39vw, 27rem"
        />
      </div>

      <div className={`${styles.artLayer} ${styles.eyeArtwork}`}>
        <Image
          src={eyeLipsCluster}
          alt=""
          sizes="(max-width: 760px) 88vw, 36rem"
        />
      </div>
    </div>
  );
}
