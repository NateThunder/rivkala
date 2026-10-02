"use client";

import { useEffect, useRef } from "react";
import styles from "./epk-page.module.css";

const kitFormUrl = "https://rivkala.kit.com/e3719e3a68";
const kitScriptUrl = `${kitFormUrl}/index.js`;

export default function KitSignupForm() {
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const embed = embedRef.current;
    if (!embed) return;

    const script = document.createElement("script");
    script.async = true;
    script.dataset.uid = "e3719e3a68";
    script.src = kitScriptUrl;
    embed.appendChild(script);

    return () => {
      embed.replaceChildren();
    };
  }, []);

  return (
    <div className={styles.kitSignup} aria-label="Join Rivkala's mailing list">
      <div ref={embedRef} className={styles.kitEmbed} />
      <noscript>
        <a href={kitFormUrl}>Join Rivkala&apos;s mailing list</a>
      </noscript>
    </div>
  );
}
