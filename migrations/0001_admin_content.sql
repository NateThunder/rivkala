CREATE TABLE IF NOT EXISTS gigs (
  id TEXT PRIMARY KEY,
  event_date TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  lineup_preset TEXT NOT NULL DEFAULT 'SOLO',
  lineup_custom_label TEXT NOT NULL DEFAULT '',
  time_label TEXT NOT NULL DEFAULT '',
  ticket_url TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  is_featured INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS music_links (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_src TEXT NOT NULL,
  thumbnail_alt TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS epk_photo_slots (
  slot INTEGER PRIMARY KEY,
  src TEXT NOT NULL,
  alt TEXT NOT NULL,
  label TEXT NOT NULL,
  credit TEXT NOT NULL,
  download_name TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media_assets (
  key TEXT PRIMARY KEY,
  original_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  bucket TEXT NOT NULL,
  public_path TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gigs_date_order ON gigs(event_date, order_index);
CREATE INDEX IF NOT EXISTS idx_gigs_order ON gigs(order_index);
CREATE INDEX IF NOT EXISTS idx_videos_order ON videos(order_index);
CREATE INDEX IF NOT EXISTS idx_music_links_order ON music_links(order_index);

INSERT OR IGNORE INTO gigs (
  id, event_date, title, location, lineup_preset, lineup_custom_label, time_label, ticket_url, order_index, created_at, updated_at
) VALUES
  ('aberdeen-jazz-festival', '2026-03-15', 'ABERDEEN JAZZ FESTIVAL', 'Aberdeen, Scotland', 'SOLO', '', 'DAY SHOW', '', 0, '2026-07-02T00:00:00.000Z', '2026-07-02T00:00:00.000Z'),
  ('the-jazz-bar', '2026-03-22', 'THE JAZZ BAR', 'Edinburgh, Scotland', 'TRIO', '', '7:30PM', '', 1, '2026-07-02T00:00:00.000Z', '2026-07-02T00:00:00.000Z'),
  ('kelburn-garden-party', '2026-04-05', 'KELBURN GARDEN PARTY', 'Argyll, Scotland', 'TRIO', '', '2:00PM', '', 2, '2026-07-02T00:00:00.000Z', '2026-07-02T00:00:00.000Z'),
  ('st-lukes', '2026-04-18', 'ST LUKES', 'Glasgow, Scotland', 'DUO', '', '8:00PM', '', 3, '2026-07-02T00:00:00.000Z', '2026-07-02T00:00:00.000Z');

INSERT OR IGNORE INTO videos (
  id, title, youtube_url, youtube_id, is_featured, order_index, created_at, updated_at
) VALUES
  ('cVnYnMeSUhw', 'Rivkala - All I Should Expect (Official Video)', 'https://www.youtube.com/watch?v=cVnYnMeSUhw', 'cVnYnMeSUhw', 0, 0, '2026-07-02T00:00:00.000Z', '2026-07-02T00:00:00.000Z'),
  ('LK7PeIOZiVY', 'Rivkala - Chess (Official Video)', 'https://www.youtube.com/watch?v=LK7PeIOZiVY', 'LK7PeIOZiVY', 1, 1, '2026-07-02T00:00:00.000Z', '2026-07-02T00:00:00.000Z'),
  ('TnpmmD1SJCY', 'Rivkala - Vultures (Official Video)', 'https://www.youtube.com/watch?v=TnpmmD1SJCY', 'TnpmmD1SJCY', 0, 2, '2026-07-02T00:00:00.000Z', '2026-07-02T00:00:00.000Z');

INSERT OR IGNORE INTO music_links (
  id, title, url, thumbnail_src, thumbnail_alt, order_index, created_at, updated_at
) VALUES
  ('crushed-velvet', 'Crushed Velvet', 'https://rivkala.bandcamp.com/album/crushed-velvet', '/Album%20covers/Crushed%20Velvet.png', 'Crushed Velvet cover artwork', 0, '2026-07-02T00:00:00.000Z', '2026-07-02T00:00:00.000Z'),
  ('chess', 'Chess', 'https://rivkala.bandcamp.com/track/chess', '/Album%20covers/Chess.png', 'Chess cover artwork', 1, '2026-07-02T00:00:00.000Z', '2026-07-02T00:00:00.000Z'),
  ('zip-lock-teeth', 'Zip Lock Teeth', 'https://rivkala.bandcamp.com/track/zip-lock-teeth', '/Album%20covers/Zip%20Lock%20Teeth.png', 'Zip Lock Teeth cover artwork', 2, '2026-07-02T00:00:00.000Z', '2026-07-02T00:00:00.000Z');

INSERT OR IGNORE INTO site_content (key, value, updated_at) VALUES
  ('bio_core', '{"pronunciation":"RIV-kuh-luh","pronouns":"she / her","strapline":"Showgirl, singer and storyteller","shortBio":"Rivkala is an award-winning multidisciplinary jazz and soul artist, vocalist, writer and bandleader. From the campy cabaret world of Crushed Velvet, she and her six-piece band blend jazz, soul, funk and klezmer into provocatively playful songs about gender, wealth inequality and mental health. Serious grooves meet theatrical wit beneath the warm glow of her beloved lamp, Lucille.","longBio":["Born in Manchester and based in Newcastle, Rivkala builds vivid, theatrical worlds around soulful melodies, sharp observational writing and a larger-than-life cabaret presence. Her work turns everyday frustrations into playful social commentary without losing sight of the groove.","Alongside her six-piece band, she has appeared at BBC Proms performances, Manchester Jazz Festival, the MOBO fringe festival and the SXSW Roadshow, and has supported Postmodern Jukebox at The Glasshouse International Centre for Music. Her music has received coverage from BBC Radio 3, Jazz FM, Selector Radio and BBC Introducing."]}', '2026-07-02T00:00:00.000Z'),
  ('epk_pdf', '{"href":"/api/media/epk-pdf/RIVKALA_EPK_OFFICIAL.pdf","downloadName":"RIVKALA EPK OFFICIAL.pdf"}', '2026-07-02T00:00:00.000Z');

INSERT OR IGNORE INTO epk_photo_slots (
  slot, src, alt, label, credit, download_name, updated_at
) VALUES
  (1, '/IMAGES%20OF%20ME/Rivkala-creditMarianaPires-2.jpg', 'Rivkala seated in a tailored black suit against a pale studio background', 'Press portrait 01', 'Photo: Mariana Pires', 'rivkala-press-photo-01-mariana-pires.jpg', '2026-07-02T00:00:00.000Z'),
  (2, '/IMAGES%20OF%20ME/Rivkala-creditMarianaPires-3.jpg', 'Close portrait of Rivkala wearing a black suit and patterned tie', 'Press portrait 02', 'Photo: Mariana Pires', 'rivkala-press-photo-02-mariana-pires.jpg', '2026-07-02T00:00:00.000Z'),
  (3, '/IMAGES%20OF%20ME/Rivkala-creditMarianaPires-4.jpg', 'Rivkala applying lipstick in a wide editorial portrait', 'Editorial landscape', 'Photo: Mariana Pires', 'rivkala-editorial-landscape-mariana-pires.jpg', '2026-07-02T00:00:00.000Z'),
  (4, '/IMAGES%20OF%20ME/Rivkala-creditMarianaPires-5.jpg', 'Rivkala looking down while adjusting a patterned tie', 'Editorial portrait', 'Photo: Mariana Pires', 'rivkala-editorial-portrait-mariana-pires.jpg', '2026-07-02T00:00:00.000Z');
