import "server-only";

import {
  defaultBioCore,
  defaultEpkPdf,
  defaultEpkPhotoSlots,
  defaultGigs,
  defaultMusicLinks,
  defaultVideos,
} from "./defaults";
import type {
  BioCoreContent,
  EpkPdfContent,
  EpkPhotoSlot,
  Gig,
  MusicLink,
  MusicTrack,
  PublicGig,
  VideoItem,
  VideoRow,
} from "./types";
import { fetchRows, getSiteContentValue } from "./store";
import { youtubeThumbnailUrl } from "./validation";

function withFallback<T>(rows: T[], fallback: T[]) {
  return rows.length ? rows : fallback;
}

function sortByOrder<T extends { order_index: number }>(rows: T[]) {
  return [...rows].sort((a, b) => a.order_index - b.order_index);
}

function londonTodayIso() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  month: "short",
});

const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  day: "2-digit",
});

function parseDate(date: string) {
  return new Date(`${date}T12:00:00.000Z`);
}

function toPublicGig(gig: Gig): PublicGig {
  const date = parseDate(gig.event_date);
  const preset = gig.lineup_preset;
  const lineup = preset === "OTHER" ? gig.lineup_custom_label : preset;
  return {
    id: gig.id,
    day: dayFormatter.format(date),
    month: monthFormatter.format(date).toUpperCase(),
    title: gig.title,
    location: gig.location,
    lineup: lineup || "LIVE",
    lineupPreset: preset,
    time: gig.time_label,
    ticketUrl: gig.ticket_url,
  };
}

const scrapVariants: VideoItem["scrapVariant"][] = [
  "orange-paper",
  "burgundy-velvet",
  "newspaper-olive",
];

function toVideoItem(video: VideoRow, index: number): VideoItem {
  return {
    id: video.youtube_id,
    title: video.title,
    youtubeUrl: video.youtube_url,
    thumbnailUrl: youtubeThumbnailUrl(video.youtube_id),
    scrapVariant: scrapVariants[index % scrapVariants.length],
  };
}

export async function getAllGigs() {
  try {
    return sortByOrder(withFallback(await fetchRows<Gig>("gigs", { orderBy: "order_index" }), defaultGigs));
  } catch {
    return defaultGigs;
  }
}

export async function getUpcomingPublicGigs() {
  const today = londonTodayIso();
  return (await getAllGigs())
    .filter((gig) => gig.event_date >= today)
    .sort((a, b) => {
      const byDate = a.event_date.localeCompare(b.event_date);
      return byDate === 0 ? a.order_index - b.order_index : byDate;
    })
    .map(toPublicGig);
}

export async function getAllVideos() {
  try {
    return sortByOrder(withFallback(await fetchRows<VideoRow>("videos", { orderBy: "order_index" }), defaultVideos));
  } catch {
    return defaultVideos;
  }
}

export async function getPublicVideos() {
  return (await getAllVideos()).map(toVideoItem);
}

export async function getFeaturedVideo() {
  const videos = await getAllVideos();
  return videos.find((video) => video.is_featured) ?? videos[0] ?? defaultVideos[0];
}

export async function getMusicLinks() {
  try {
    const releases = sortByOrder(
      withFallback(await fetchRows<MusicLink>("music_links", { orderBy: "order_index" }), defaultMusicLinks)
    ).sort((a, b) => b.release_year - a.release_year || a.order_index - b.order_index);
    const tracks = await fetchRows<MusicTrack>("music_tracks", { orderBy: "order_index" });
    return releases.map((release) => ({
      ...release,
      bandcamp_url: release.bandcamp_url || release.url,
      tracks: tracks.filter((track) => track.release_id === release.id),
    }));
  } catch {
    return defaultMusicLinks.map((release) => ({ ...release, tracks: [] }));
  }
}

export async function getBioCore(): Promise<BioCoreContent> {
  return getSiteContentValue<BioCoreContent>("bio_core", defaultBioCore);
}

export async function getEpkPdf(): Promise<EpkPdfContent> {
  return getSiteContentValue<EpkPdfContent>("epk_pdf", defaultEpkPdf);
}

export async function getEpkPhotoSlots(): Promise<EpkPhotoSlot[]> {
  try {
    const rows = await fetchRows<EpkPhotoSlot>("epk_photo_slots", { orderBy: "slot" });
    const bySlot = new Map(rows.map((row) => [row.slot, row]));
    return defaultEpkPhotoSlots.map((fallback) => bySlot.get(fallback.slot) ?? fallback);
  } catch {
    return defaultEpkPhotoSlots;
  }
}
