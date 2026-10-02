import { getShopCatalog } from "@/lib/shop/catalog";
import { ShopCartClient } from "./cart-client";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const { products } = await getShopCatalog();
  return <ShopCartClient products={products} />;
}
