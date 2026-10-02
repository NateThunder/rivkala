PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS shop_categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shop_products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES shop_categories(id),
  summary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL CHECK (kind IN ('physical', 'digital')),
  download_key TEXT,
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shop_product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  object_key TEXT,
  remote_url TEXT,
  alt_text TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  CHECK (object_key IS NOT NULL OR remote_url IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS shop_product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  price_gbp INTEGER NOT NULL CHECK (price_gbp >= 0),
  stock INTEGER CHECK (stock IS NULL OR stock >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shop_orders (
  id TEXT PRIMARY KEY,
  stripe_session_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT NOT NULL,
  email TEXT NOT NULL,
  amount_total INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  presentment_amount INTEGER,
  presentment_currency TEXT,
  payment_status TEXT NOT NULL,
  fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shop_order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_amount INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('physical', 'digital'))
);

CREATE TABLE IF NOT EXISTS shop_download_tokens (
  token TEXT PRIMARY KEY,
  order_item_id TEXT NOT NULL UNIQUE REFERENCES shop_order_items(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  max_downloads INTEGER NOT NULL DEFAULT 5,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shop_products_category ON shop_products(category_id, active, sort_order);
CREATE INDEX IF NOT EXISTS idx_shop_variants_product ON shop_product_variants(product_id, active, sort_order);
CREATE INDEX IF NOT EXISTS idx_shop_orders_created ON shop_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shop_download_expiry ON shop_download_tokens(expires_at);
