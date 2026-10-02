ALTER TABLE music_links ADD COLUMN release_year INTEGER NOT NULL DEFAULT 2024
  CHECK (release_year BETWEEN 1900 AND 2100);

UPDATE music_links
SET release_year = CASE id
  WHEN 'crushed-velvet' THEN 2025
  WHEN 'chess' THEN 2024
  WHEN 'zip-lock-teeth' THEN 2024
  ELSE release_year
END;
