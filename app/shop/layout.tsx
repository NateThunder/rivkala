import type { Metadata } from "next";
import SiteNav from "../site-nav";
import { getShopCatalog } from "@/lib/shop/catalog";
import { ShopCartDrawer } from "./cart-drawer";
import { ShopStoreProvider } from "./store-provider";
import styles from "./shop.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop | Rivkala",
  description: "Rivkala merchandise, music and digital editions.",
};

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const { products } = await getShopCatalog();
  return (
    <div className={styles.shopShell}>
      <header className={styles.shopHeader}><SiteNav /></header>
      <ShopStoreProvider>
        <main>{children}</main>
        <ShopCartDrawer products={products} />
      </ShopStoreProvider>
    </div>
  );
}
