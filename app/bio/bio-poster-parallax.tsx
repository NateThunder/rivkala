"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
} from "react";

type BioPosterParallaxProps = {
  children: ReactNode;
  className: string;
};

type ParallaxStyle = CSSProperties & {
  "--parallax-x"?: string;
  "--parallax-y"?: string;
  "--parallax-scroll"?: string;
};

export default function BioPosterParallax({
  children,
  className,
}: BioPosterParallaxProps) {
  const posterRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const poster = posterRef.current;

    if (!poster || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const update = () => {
      frame = 0;

      const rect = poster.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const scrollTravel = viewportHeight + rect.height;
      const scrollProgress =
        ((viewportHeight - rect.top) / scrollTravel - 0.5) * 2;
      const clampedScroll = Math.max(-1, Math.min(1, scrollProgress));

      poster.style.setProperty("--parallax-x", pointerX.toFixed(3));
      poster.style.setProperty("--parallax-y", pointerY.toFixed(3));
      poster.style.setProperty(
        "--parallax-scroll",
        clampedScroll.toFixed(3),
      );
    };

    const requestUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(update);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = poster.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      pointerX = Math.max(-1, Math.min(1, pointerX));
      pointerY = Math.max(-1, Math.min(1, pointerY));
      requestUpdate();
    };

    const handlePointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
      requestUpdate();
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    poster.addEventListener("pointermove", handlePointerMove);
    poster.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      poster.removeEventListener("pointermove", handlePointerMove);
      poster.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <article
      ref={posterRef}
      className={className}
      aria-labelledby="bio-title"
      style={
        {
          "--parallax-x": "0",
          "--parallax-y": "0",
          "--parallax-scroll": "0",
        } as ParallaxStyle
      }
    >
      {children}
    </article>
  );
}
