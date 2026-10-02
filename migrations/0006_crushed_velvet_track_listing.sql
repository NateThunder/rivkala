UPDATE music_links
SET release_type = 'EP', updated_at = CURRENT_TIMESTAMP
WHERE id = 'crushed-velvet';

INSERT OR IGNORE INTO music_tracks
  (id, release_id, title, bandcamp_url, order_index, created_at, updated_at)
VALUES
  ('track-crushed-velvet-01-introlude', 'crushed-velvet', 'Rivkala''s Introlude', 'https://rivkala.bandcamp.com/track/rivkalas-introlude', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('track-crushed-velvet-02-chess', 'crushed-velvet', 'Chess', 'https://rivkala.bandcamp.com/track/chess-2', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('track-crushed-velvet-03-vultures', 'crushed-velvet', 'Vultures', 'https://rivkala.bandcamp.com/track/vultures', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('track-crushed-velvet-04-bitter-and-twisted', 'crushed-velvet', 'Bitter and Twisted (Bartender''s Lament)', 'https://rivkala.bandcamp.com/track/bitter-and-twisted-bartenders-lament', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('track-crushed-velvet-05-all-i-should-expect', 'crushed-velvet', 'All I Should Expect', 'https://rivkala.bandcamp.com/track/all-i-should-expect', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('track-crushed-velvet-06-last-orders', 'crushed-velvet', 'Last Orders (skit)', 'https://rivkala.bandcamp.com/track/last-orders-skit', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('track-crushed-velvet-07-lonely-shade-of-blue', 'crushed-velvet', 'Lonely Shade of Blue', 'https://rivkala.bandcamp.com/track/lonely-shade-of-blue', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
