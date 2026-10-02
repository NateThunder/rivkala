ALTER TABLE music_links ADD COLUMN sale_enabled INTEGER NOT NULL DEFAULT 0
  CHECK (sale_enabled IN (0, 1));
ALTER TABLE music_links ADD COLUMN price_gbp INTEGER NOT NULL DEFAULT 0
  CHECK (price_gbp >= 0);
ALTER TABLE music_links ADD COLUMN download_mp3_key TEXT NOT NULL DEFAULT '';
ALTER TABLE music_links ADD COLUMN download_wav_key TEXT NOT NULL DEFAULT '';

ALTER TABLE music_tracks ADD COLUMN sale_enabled INTEGER NOT NULL DEFAULT 0
  CHECK (sale_enabled IN (0, 1));
ALTER TABLE music_tracks ADD COLUMN price_gbp INTEGER NOT NULL DEFAULT 0
  CHECK (price_gbp >= 0);
ALTER TABLE music_tracks ADD COLUMN download_mp3_key TEXT NOT NULL DEFAULT '';
ALTER TABLE music_tracks ADD COLUMN download_wav_key TEXT NOT NULL DEFAULT '';
