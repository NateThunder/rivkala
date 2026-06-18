import type { ReactNode } from "react";
import styles from "./video-room.module.css";

type TornPaperLabelProps = {
  as?: "h1" | "h2" | "p" | "span";
  children: ReactNode;
  className?: string;
  id?: string;
  tone: "cream" | "pink" | "burgundy";
};

export default function TornPaperLabel({
  as: Component = "span",
  children,
  className = "",
  id,
  tone,
}: TornPaperLabelProps) {
  return (
    <Component
      id={id}
      className={`${styles.tornPaperLabel} ${styles[`tornPaperLabel${tone[0].toUpperCase()}${tone.slice(1)}`]} ${className}`}
    >
      {children}
    </Component>
  );
}
