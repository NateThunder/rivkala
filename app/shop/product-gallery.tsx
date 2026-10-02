"use client";

import { useState } from "react";
import type { ShopProductImage } from "@/lib/shop/types";
import { ShopProductImageView } from "./product-image";
import styles from "./shop.module.css";

export function ShopProductGallery({ images }: { images: ShopProductImage[] }) {
  const [active, setActive] = useState(0);
  return (
    <div className={styles.gallery}>
      <div className={styles.galleryMain}>
        <ShopProductImageView image={images[active]} sizes="(max-width: 820px) 100vw, 60vw" priority />
      </div>
      {images.length > 1 ? (
        <div className={styles.galleryThumbs} aria-label="Product images">
          {images.map((image, index) => (
            <button
              aria-label={`View image ${index + 1}`}
              className={active === index ? styles.galleryThumbActive : ""}
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
            >
              <ShopProductImageView image={image} sizes="80px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
