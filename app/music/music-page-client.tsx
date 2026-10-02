"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import type { MusicLink, MusicTrack } from "@/lib/admin/types";
import { formatGBP } from "@/lib/shop/money";
import beigeTape from "../../public/rivkala_featured_releases_assets/decor/beige-tape.png";
import blackTape from "../../public/rivkala_featured_releases_assets/decor/black-tape.png";
import faceCollage from "../../public/rivkala_featured_releases_assets/decor/surreal-eyes-lips-collage-web.png";
import lamp from "../../public/rivkala_featured_releases_assets/decor/vintage-fringe-lamp-web.png";
import musicHeader from "../../public/collage/music header.png";
import newspaper from "../../public/rivkala_featured_releases_assets/decor/newspaper-scrap.png";
import pinkTape from "../../public/rivkala_featured_releases_assets/decor/pink-tape.png";
import coverPlayButton from "../../public/collage/playb button.png";
import styles from "./music-page.module.css";

type Platform = "spotify" | "apple" | "bandcamp" | "youtube";
type Filter = "ALL" | MusicLink["release_type"];
type ActiveTrack = { release: MusicLink; track: MusicTrack };

const tapeByIndex: StaticImageData[] = [beigeTape, blackTape, pinkTape];
const filters: Array<{ id: Filter; label: string }> = [
  { id: "ALL", label: "All" },
  { id: "ALBUM", label: "Albums" },
  { id: "EP", label: "EPs" },
  { id: "SINGLE", label: "Singles" },
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

function PlatformIcon({ platform }: { platform: Platform }) {
  if (platform === "spotify") return <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="currentColor" /><path d="M9 12.4c5.2-1.4 10.9-.8 15.2 1.6M10 16.5c4.6-1.1 9.7-.5 13.4 1.5M11 20.4c3.8-.8 7.8-.3 10.9 1.2" /></svg>;
  if (platform === "apple") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.2 6.9c-1 0-2.5-1.1-4-1-2 .1-3.9 1.2-5 3-2.1 3.7-.5 9.1 1.6 12.1 1 1.5 2.2 3.1 3.8 3 1.5-.1 2.1-1 3.9-1s2.4 1 4 .9c1.7 0 2.7-1.5 3.7-2.9 1.2-1.7 1.6-3.3 1.7-3.4-.1 0-3.2-1.2-3.3-4.9 0-3 2.5-4.5 2.6-4.5-1.4-2.1-3.6-2.3-4.4-2.4-2-.1-3.7 1.1-4.6 1.1Zm3.3-3.1c.9-1 1.4-2.4 1.3-3.8-1.2.1-2.7.8-3.6 1.8-.8.9-1.4 2.3-1.2 3.7 1.3.1 2.7-.7 3.5-1.7Z" fill="currentColor" /></svg>;
  if (platform === "youtube") return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M29 10.1a4 4 0 0 0-2.8-2.8C23.7 6.6 16 6.6 16 6.6s-7.7 0-10.2.7A4 4 0 0 0 3 10.1 41 41 0 0 0 2.3 16 41 41 0 0 0 3 21.9a4 4 0 0 0 2.8 2.8c2.5.7 10.2.7 10.2.7s7.7 0 10.2-.7a4 4 0 0 0 2.8-2.8 41 41 0 0 0 .7-5.9 41 41 0 0 0-.7-5.9Z" fill="currentColor" /><path d="m13.3 20.1 7-4.1-7-4.1v8.2Z" fill="#17130f" /></svg>;
  return <svg viewBox="0 0 36 32" aria-hidden="true"><path d="M5 9h20l-5.5 14H0L5 9Z" fill="currentColor" /><text x="21" y="22" fontSize="12" fontWeight="800" fill="currentColor">bc</text></svg>;
}

function PlatformLinks({ links, label, compact = false }: { links: Record<Platform, string>; label: string; compact?: boolean }) {
  const names: Record<Platform, string> = { spotify: "Spotify", apple: "Apple Music", bandcamp: "Bandcamp", youtube: "YouTube" };
  return <div className={compact ? styles.trackPlatforms : styles.releasePlatforms} aria-label={label}>
    {(Object.keys(names) as Platform[]).map((platform) => links[platform] ? <a key={platform} className={compact ? styles.trackPlatformLink : styles.releasePlatformLink} href={links[platform]} target="_blank" rel="noopener noreferrer" aria-label={`${label} on ${names[platform]}`} title={names[platform]}><PlatformIcon platform={platform} /></a> : null)}
  </div>;
}

function releaseLinks(release: MusicLink): Record<Platform, string> {
  return { spotify: release.spotify_url, apple: release.apple_music_url, bandcamp: release.bandcamp_url || release.url, youtube: release.youtube_url };
}

function trackLinks(track: MusicTrack, release: MusicLink): Record<Platform, string> {
  const parent = releaseLinks(release);
  return { spotify: track.spotify_url || parent.spotify, apple: track.apple_music_url || parent.apple, bandcamp: track.bandcamp_url || parent.bandcamp, youtube: track.youtube_url || parent.youtube };
}

function PlayerIcon({ name }: { name: "previous" | "next" | "play" | "pause" | "volume" }) {
  if (name === "previous" || name === "next") return <span className={name === "next" ? styles.nextIcon : styles.previousIcon} aria-hidden="true"><i /><i /></span>;
  if (name === "play") return <span className={styles.footerPlayIcon} aria-hidden="true" />;
  if (name === "pause") return <span className={styles.footerPauseIcon} aria-hidden="true" />;
  return <svg className={styles.volumeIcon} viewBox="0 0 28 28" aria-hidden="true"><path d="M4 11h5l6-5v16l-6-5H4v-6Zm15-1c1.2 1 1.8 2.3 1.8 4s-.6 3-1.8 4m3-11c2 1.8 3 4.1 3 7s-1 5.2-3 7" /></svg>;
}

export default function MusicPageClient({ musicLinks }: { musicLinks: MusicLink[] }) {
  const releases = useMemo(() => musicLinks.map((release) => ({ ...release, tracks: release.tracks ?? [] })), [musicLinks]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [openReleaseId, setOpenReleaseId] = useState<string | null>(null);
  const [active, setActive] = useState<ActiveTrack | null>(() => {
    const release = releases.find((item) => item.tracks?.length);
    return release?.tracks?.[0] ? { release, track: release.tracks[0] } : null;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const [playerMinimized, setPlayerMinimized] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.72);
  const [error, setError] = useState("");
  const [buyingSale, setBuyingSale] = useState("");
  const visibleReleases = releases.filter((release) => filter === "ALL" || release.release_type === filter);

  const buy = async (musicKind: "release" | "track", musicId: string) => {
    const saleKey = `${musicKind}:${musicId}`;
    setBuyingSale(saleKey);
    setError("");
    try {
      const response = await fetch("/api/shop/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lines: [{ musicKind, musicId, quantity: 1 }] }) });
      const payload = await response.json() as { url?: string; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error || "Checkout could not be started.");
      window.location.assign(payload.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Checkout could not be started.");
      setBuyingSale("");
    }
  };

  const loadTrack = useCallback(async (release: MusicLink, track: MusicTrack, shouldPlay: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setActive({ release, track });
    setOpenReleaseId(release.id);
    setCurrentTime(0);
    setDuration(0);
    setError("");
    if (!track.audio_src) {
      audio.removeAttribute("src");
      audio.load();
      setError("Audio has not been uploaded for this track yet.");
      return;
    }
    audio.src = track.audio_src;
    audio.load();
    if (shouldPlay) {
      try { await audio.play(); } catch { setError("Playback was blocked. Press play to try again."); }
    }
  }, []);

  const moveTrack = useCallback((offset: number, autoplay: boolean) => {
    if (!active) return;
    const queue = active.release.tracks ?? [];
    const index = queue.findIndex((track) => track.id === active.track.id);
    const next = queue[index + offset];
    if (next) void loadTrack(active.release, next, autoplay);
  }, [active, loadTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    const time = () => setCurrentTime(audio.currentTime);
    const metadata = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const play = () => { setIsPlaying(true); setHasStartedPlayback(true); };
    const pause = () => setIsPlaying(false);
    const ended = () => moveTrack(1, true);
    const failed = () => { setError("This track could not be loaded."); setIsPlaying(false); };
    audio.addEventListener("timeupdate", time); audio.addEventListener("loadedmetadata", metadata); audio.addEventListener("durationchange", metadata); audio.addEventListener("play", play); audio.addEventListener("pause", pause); audio.addEventListener("ended", ended); audio.addEventListener("error", failed);
    return () => { audio.removeEventListener("timeupdate", time); audio.removeEventListener("loadedmetadata", metadata); audio.removeEventListener("durationchange", metadata); audio.removeEventListener("play", play); audio.removeEventListener("pause", pause); audio.removeEventListener("ended", ended); audio.removeEventListener("error", failed); };
  }, [moveTrack, volume]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || !active?.track.audio_src) return;
    setError("");
    if (audio.src !== new URL(active.track.audio_src, window.location.href).href) return void loadTrack(active.release, active.track, true);
    if (audio.paused) await audio.play().catch(() => setError("Playback was blocked. Press play to try again.")); else audio.pause();
  };

  const heroLinks = releases.reduce<Record<Platform, string>>((result, release) => {
    const links = releaseLinks(release);
    (Object.keys(result) as Platform[]).forEach((platform) => { if (!result[platform] && links[platform]) result[platform] = links[platform]; });
    return result;
  }, { spotify: "", apple: "", bandcamp: "", youtube: "" });

  return <section className={styles.musicPage} aria-labelledby="featured-releases-title">
    <audio ref={audioRef} preload="metadata" />
    <Image className={styles.lamp} src={lamp} alt="" aria-hidden="true" priority />
    <Image className={styles.faceCollage} src={faceCollage} alt="" aria-hidden="true" priority />
    <div className={styles.lowerLeftCollage} aria-hidden="true"><Image src={newspaper} alt="" /><span className={styles.lipstickMark} /></div>
    <div className={styles.inner}>
      <header className={styles.hero}>
        <h2 id="featured-releases-title" className="sr-only">Rivkala music</h2>
        <Image className={styles.musicHeader} src={musicHeader} alt="Music" priority sizes="(max-width: 760px) 96vw, min(88vw, 1050px)" />
        <PlatformLinks links={heroLinks} label="Listen to Rivkala" />
        <nav className={styles.releaseFilters} aria-label="Filter releases">{filters.map((item) => <button key={item.id} type="button" className={filter === item.id ? styles.releaseFilterActive : ""} aria-pressed={filter === item.id} onClick={() => { setFilter(item.id); setOpenReleaseId(null); }}>{item.label}</button>)}</nav>
      </header>

      <div className={styles.releaseList}>
        {visibleReleases.map((release, index) => {
          const isOpen = openReleaseId === release.id;
          const tracks = release.tracks ?? [];
          return <article id={`release-${release.id}`} key={release.id} className={`${styles.releaseRow}${index % 2 ? ` ${styles.releaseRowReverse}` : ""}${isOpen ? ` ${styles.releaseRowActive}` : ""}`} style={{ "--art-tilt": `${index % 2 ? 0.8 : -0.8}deg` } as CSSProperties}>
            <div className={styles.artworkColumn}><div className={styles.artworkWrap}><button className={styles.artworkCoverButton} type="button" aria-expanded={isOpen} aria-label={`${isOpen ? "Close" : "Open"} ${release.title} track list`} onClick={() => setOpenReleaseId(isOpen ? null : release.id)}><span className={styles.artworkFrame}><Image className={styles.artwork} src={release.thumbnail_src} alt={release.thumbnail_alt || `${release.title} cover artwork`} width={800} height={800} unoptimized={release.thumbnail_src.startsWith("/api/media/")} sizes="(max-width: 640px) 78vw, (max-width: 1000px) 38vw, 370px" /></span><Image className={styles.artworkTape} src={tapeByIndex[index % tapeByIndex.length]} alt="" aria-hidden="true" /></button><button className={`${styles.tornPlayButton}${active?.release.id === release.id && isPlaying ? ` ${styles.tornPlayButtonActive}` : ""}`} type="button" aria-label={`Play ${release.title}`} onClick={() => { const firstPlayable = tracks.find((track) => track.audio_src); if (firstPlayable) void loadTrack(release, firstPlayable, true); else { setOpenReleaseId(release.id); setError("Audio has not been uploaded for this release yet."); } }}><Image src={coverPlayButton} alt="" aria-hidden="true" sizes="(max-width: 640px) 4.5rem, 5.5rem" /></button></div></div>
            <div className={styles.releaseCopy}>
              <span className={styles.releaseType}>{release.release_type === "ALBUM" ? "Album" : release.release_type === "SINGLE" ? "Single" : "EP"} · {release.release_year}</span>
              <h3>{release.title}</h3>
              <svg className={styles.wavyDivider} viewBox="0 0 360 18" preserveAspectRatio="none" aria-hidden="true"><path d="M1 9 C10 1 20 1 30 9 S50 17 60 9 S80 1 90 9 S110 17 120 9 S140 1 150 9 S170 17 180 9 S200 1 210 9 S230 17 240 9 S260 1 270 9 S290 17 300 9 S320 1 330 9 S350 17 359 9" /></svg>
              <p>{release.description || "A Rivkala release made for full-volume listening."}</p>
              <PlatformLinks links={releaseLinks(release)} label={`Listen to ${release.title}`} />
              <div className={styles.releaseActions}><button type="button" className={styles.trackListToggle} aria-expanded={isOpen} onClick={() => setOpenReleaseId(isOpen ? null : release.id)}>{isOpen ? "Close tracks" : `View ${tracks.length || ""} track${tracks.length === 1 ? "" : "s"}`}</button>{release.sale_enabled ? <button type="button" className={styles.buyButton} disabled={buyingSale === `release:${release.id}`} onClick={() => void buy("release", release.id)}>{buyingSale === `release:${release.id}` ? "Opening checkout…" : `Buy ${release.release_type === "SINGLE" ? "single" : "release"} · ${formatGBP(release.price_gbp)}`}</button> : null}</div>
              {isOpen ? <ol className={styles.trackList}>{tracks.length ? tracks.map((track, trackIndex) => {
                const selected = active?.track.id === track.id;
                return <li key={track.id} className={selected ? styles.trackActive : ""}><span className={styles.trackNumber}>{String(trackIndex + 1).padStart(2, "0")}</span><button type="button" className={styles.trackPlay} disabled={!track.audio_src} onClick={() => void loadTrack(release, track, true)} aria-label={`Play ${track.title}`}><span aria-hidden="true">{selected && isPlaying ? "Ⅱ" : "▶"}</span><strong>{track.title}</strong></button><PlatformLinks compact links={trackLinks(track, release)} label={`Listen to ${track.title}`} />{release.release_type !== "SINGLE" && track.sale_enabled ? <button type="button" className={styles.trackBuy} disabled={buyingSale === `track:${track.id}`} onClick={() => void buy("track", track.id)}>{buyingSale === `track:${track.id}` ? "Opening…" : `Buy · ${formatGBP(track.price_gbp)}`}</button> : null}</li>;
              }) : <li className={styles.noTracks}>Track listing coming soon.</li>}</ol> : null}
            </div>
          </article>;
        })}
      </div>
    </div>

    {hasStartedPlayback ? <aside className={`${styles.player}${playerMinimized ? ` ${styles.playerMinimized}` : ""}`} aria-label="Music player">
      <button className={styles.playerToggle} type="button" aria-expanded={!playerMinimized} aria-label={playerMinimized ? "Expand music player" : "Minimize music player"} onClick={() => setPlayerMinimized((value) => !value)}><span aria-hidden="true">{playerMinimized ? "⌃" : "⌄"}</span></button>
      <div className={styles.nowPlaying}>{active ? <><Image className={styles.playerArtwork} src={active.release.thumbnail_src} alt="" width={160} height={160} unoptimized={active.release.thumbnail_src.startsWith("/api/media/")} sizes="84px" /><div className={styles.trackIdentity}><strong>{active.track.title}</strong><span>{active.release.title} · RIVKALA</span></div></> : <div className={styles.trackIdentity}><strong>Select a track</strong><span>RIVKALA</span></div>}</div>
      <div className={styles.playerCenter}><div className={styles.transportControls}><button type="button" onClick={() => moveTrack(-1, isPlaying)} aria-label="Previous track" disabled={!active}><PlayerIcon name="previous" /></button><button type="button" className={styles.mainPlayButton} onClick={() => void toggle()} aria-label={isPlaying ? "Pause" : "Play"} disabled={!active?.track.audio_src}><PlayerIcon name={isPlaying ? "pause" : "play"} /></button><button type="button" onClick={() => moveTrack(1, isPlaying)} aria-label="Next track" disabled={!active}><PlayerIcon name="next" /></button></div><div className={styles.progressGroup}><span>{formatTime(currentTime)}</span><div className={styles.waveform} style={{ "--player-progress": `${duration ? currentTime / duration * 100 : 0}%` } as CSSProperties}><input type="range" min="0" max={duration || 0} step="0.1" value={Math.min(currentTime, duration || 0)} disabled={!duration} aria-label="Track position" onChange={(event: ChangeEvent<HTMLInputElement>) => { const value = Number(event.target.value); if (audioRef.current) audioRef.current.currentTime = value; setCurrentTime(value); }} /></div><span>{formatTime(duration)}</span></div><span className={styles.playerStatus} role="status" aria-live="polite">{error}</span></div>
      <div className={styles.playerVolume}><PlayerIcon name="volume" /><input type="range" min="0" max="1" step="0.01" value={volume} aria-label="Volume" onChange={(event) => { const value = Number(event.target.value); setVolume(value); if (audioRef.current) audioRef.current.volume = value; }} /></div>
    </aside> : null}
  </section>;
}
