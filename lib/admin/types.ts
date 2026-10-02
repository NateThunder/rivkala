export type LineupPreset = "SOLO" | "DUO" | "TRIO" | "FULL BAND" | "OTHER";

export type Gig = {
  id: string;
  event_date: string;
  title: string;
  location: string;
  lineup_preset: LineupPreset;
  lineup_custom_label: string;
  time_label: string;
  ticket_url: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
};

export type VideoRow = {
  id: string;
  title: string;
  youtube_url: string;
  youtube_id: string;
  is_featured: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
};

export type MusicLink = {
  id: string;
  title: string;
  is_featured: boolean;
  release_type: "ALBUM" | "EP" | "SINGLE";
  release_year: number;
  description: string;
  url: string;
  spotify_url: string;
  apple_music_url: string;
  bandcamp_url: string;
  youtube_url: string;
  shop_variant_id: string;
  sale_enabled: boolean;
  price_gbp: number;
  download_mp3_key: string;
  download_wav_key: string;
  thumbnail_src: string;
  thumbnail_alt: string;
  order_index: number;
  tracks?: MusicTrack[];
  created_at?: string;
  updated_at?: string;
};

export type MusicTrack = {
  id: string;
  release_id: string;
  title: string;
  audio_src: string;
  spotify_url: string;
  apple_music_url: string;
  bandcamp_url: string;
  youtube_url: string;
  shop_variant_id: string;
  sale_enabled: boolean;
  price_gbp: number;
  download_mp3_key: string;
  download_wav_key: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
};

export type BioCoreContent = {
  pronunciation: string;
  pronouns: string;
  strapline: string;
  shortBio: string;
  longBio: string[];
};

export type EpkPdfContent = {
  href: string;
  downloadName: string;
};

export type EpkPhotoSlot = {
  slot: 1 | 2 | 3 | 4;
  src: string;
  alt: string;
  label: string;
  credit: string;
  download_name: string;
  updated_at?: string;
};

export type SiteContentRow = {
  key: string;
  value: unknown;
  updated_at?: string;
};

export type MediaAsset = {
  key: string;
  original_name: string;
  content_type: string;
  size: number;
  bucket: string;
  public_path: string;
  created_at: string;
};

export type VideoItem = {
  id: string;
  title: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  scrapVariant: "orange-paper" | "burgundy-velvet" | "newspaper-olive";
};

export type PublicGig = {
  id: string;
  day: string;
  month: string;
  title: string;
  location: string;
  lineup: string;
  lineupPreset: LineupPreset;
  time: string;
  ticketUrl: string;
};
