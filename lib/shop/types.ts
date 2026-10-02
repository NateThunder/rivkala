export type ShopCategory = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
  active: boolean;
};

export type ShopProductImage = {
  id: string;
  objectKey: string | null;
  url: string;
  alt: string;
};

export type ShopProductVariant = {
  id: string;
  name: string;
  sku: string;
  priceGBP: number;
  stock: number | null;
  active: boolean;
};

export type ShopProduct = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  categoryName: string;
  summary: string;
  description: string;
  kind: "physical" | "digital";
  downloadKey: string | null;
  downloads: {
    mp3: string | null;
    wav: string | null;
    zip: string | null;
  };
  featured: boolean;
  active: boolean;
  sortOrder: number;
  images: ShopProductImage[];
  variants: ShopProductVariant[];
};

export type ShopCartLine = { variantId: string; quantity: number };

export type ShopCheckoutLine = {
  variantId?: string;
  musicKind?: "release" | "track";
  musicId?: string;
  quantity: number;
};

export type ShopOrderSummary = {
  id: string;
  email: string;
  amountTotal: number;
  currency: string;
  presentmentAmount: number | null;
  presentmentCurrency: string | null;
  paymentStatus: string;
  fulfillmentStatus: string;
  itemCount: number;
  createdAt: string;
};

export type ShopProductPayload = {
  id?: string;
  name: string;
  slug: string;
  categoryId: string;
  kind: "physical" | "digital";
  summary: string;
  description: string;
  downloadKey: string | null;
  downloads: {
    mp3: string | null;
    wav: string | null;
    zip: string | null;
  };
  featured: boolean;
  active: boolean;
  images: Array<{ id?: string; objectKey?: string | null; url?: string; alt: string }>;
  variants: Array<{
    id?: string;
    name: string;
    sku: string;
    priceGBP: number;
    stock: number | null;
    active?: boolean;
  }>;
};
