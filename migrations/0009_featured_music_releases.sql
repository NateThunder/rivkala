ALTER TABLE music_links ADD COLUMN is_featured INTEGER NOT NULL DEFAULT 0
  CHECK (is_featured IN (0, 1));
