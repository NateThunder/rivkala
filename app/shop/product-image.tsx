import Image from "next/image";
import type { ShopProductImage } from "@/lib/shop/types";
import styles from "./shop.module.css";

export function ShopProductImageView({
  image,
  sizes,
  priority = false,
}: {
  image?: ShopProductImage;
  sizes: string;
  priority?: boolean;
}) {
  if (!image) return <span className={styles.imagePlaceholder}>Awaiting artwork</span>;
  return (
    <Image
      alt={image.alt}
      fill
      priority={priority}
      sizes={sizes}
      src={image.url}
      unoptimized
    />
  );
}
