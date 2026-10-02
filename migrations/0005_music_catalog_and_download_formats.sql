ALTER TABLE music_links ADD COLUMN release_type TEXT NOT NULL DEFAULT 'SINGLE'
  CHECK (release_type IN ('ALBUM', 'EP', 'SINGLE'));
ALTER TABLE music_links ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE music_links ADD COLUMN spotify_url TEXT NOT NULL DEFAULT '';
ALTER TABLE music_links ADD COLUMN apple_music_url TEXT NOT NULL DEFAULT '';
ALTER TABLE music_links ADD COLUMN bandcamp_url TEXT NOT NULL DEFAULT '';
ALTER TABLE music_links ADD COLUMN youtube_url TEXT NOT NULL DEFAULT '';
ALTER TABLE music_links ADD COLUMN shop_variant_id TEXT NOT NULL DEFAULT '';

UPDATE music_links SET
  release_type = CASE WHEN id = 'crushed-velvet' THEN 'ALBUM' ELSE 'SINGLE' END,
  bandcamp_url = url,
  spotify_url = 'https://open.spotify.com/artist/3w2AbU8fkyaeDHlBLgCq0x',
  apple_music_url = CASE id
    WHEN 'crushed-velvet' THEN 'https://music.apple.com/gb/album/crushed-velvet/1814113241'
    WHEN 'chess' THEN 'https://music.apple.com/gb/album/chess-single/1770338131'
    WHEN 'zip-lock-teeth' THEN 'https://music.apple.com/gb/album/zip-lock-teeth-single/1790238863'
    ELSE '' END,
  youtube_url = CASE WHEN id = 'chess' THEN 'https://www.youtube.com/watch?v=LK7PeIOZiVY' ELSE '' END,
  description = CASE id
    WHEN 'crushed-velvet' THEN 'Late nights, soft lights, and the things we pretend not to feel.'
    WHEN 'chess' THEN 'A game of strategy, ego, and endings we saw coming.'
    WHEN 'zip-lock-teeth' THEN 'Bittersweet and a little unhinged: love, insecurity, and the snap when it seals shut.'
    ELSE '' END;

CREATE TABLE IF NOT EXISTS music_tracks (
  id TEXT PRIMARY KEY,
  release_id TEXT NOT NULL REFERENCES music_links(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  audio_src TEXT NOT NULL DEFAULT '',
  spotify_url TEXT NOT NULL DEFAULT '',
  apple_music_url TEXT NOT NULL DEFAULT '',
  bandcamp_url TEXT NOT NULL DEFAULT '',
  youtube_url TEXT NOT NULL DEFAULT '',
  shop_variant_id TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_music_tracks_release_order
  ON music_tracks(release_id, order_index);

INSERT OR IGNORE INTO music_tracks
  (id, release_id, title, order_index, created_at, updated_at)
SELECT 'track-chess', 'chess', 'Chess', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM music_links WHERE id = 'chess');

INSERT OR IGNORE INTO music_tracks
  (id, release_id, title, order_index, created_at, updated_at)
SELECT 'track-zip-lock-teeth', 'zip-lock-teeth', 'Zip Lock Teeth', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM music_links WHERE id = 'zip-lock-teeth');

ALTER TABLE shop_products ADD COLUMN download_mp3_key TEXT;
ALTER TABLE shop_products ADD COLUMN download_wav_key TEXT;
ALTER TABLE shop_products ADD COLUMN download_zip_key TEXT;
ALTER TABLE shop_orders ADD COLUMN delivery_email_sent_at TEXT;

UPDATE shop_products SET download_zip_key = download_key
WHERE download_key IS NOT NULL AND download_zip_key IS NULL;

CREATE TABLE IF NOT EXISTS shop_download_files (
  token TEXT PRIMARY KEY,
  order_item_id TEXT NOT NULL REFERENCES shop_order_items(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('mp3', 'wav', 'zip')),
  expires_at TEXT NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  max_downloads INTEGER NOT NULL DEFAULT 5,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(order_item_id, format)
);

CREATE INDEX IF NOT EXISTS idx_shop_download_files_expiry
  ON shop_download_files(expires_at);
