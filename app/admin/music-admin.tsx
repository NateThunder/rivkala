"use client";

import Image from "next/image";
import { useState } from "react";
import type { MediaAsset, MusicLink, MusicTrack } from "@/lib/admin/types";
import styles from "./admin.module.css";

type ApiEnvelope<T> = { data?: T; error?: string };
type SaleForm = { sale_enabled: boolean; price: string; download_mp3_key: string; download_wav_key: string };
type ReleaseForm = Pick<MusicLink, "title" | "is_featured" | "release_type" | "release_year" | "description" | "spotify_url" | "apple_music_url" | "bandcamp_url" | "youtube_url" | "thumbnail_src" | "thumbnail_alt"> & SaleForm;
type TrackForm = Pick<MusicTrack, "release_id" | "title" | "audio_src" | "spotify_url" | "apple_music_url" | "bandcamp_url" | "youtube_url"> & SaleForm;
type Editor = { kind: "release"; id?: string } | { kind: "track"; releaseId: string; id?: string };

const emptySale: SaleForm = { sale_enabled: false, price: "", download_mp3_key: "", download_wav_key: "" };
const emptyRelease: ReleaseForm = { title: "", is_featured: false, release_type: "SINGLE", release_year: new Date().getFullYear(), description: "", spotify_url: "", apple_music_url: "", bandcamp_url: "", youtube_url: "", thumbnail_src: "", thumbnail_alt: "", ...emptySale };
const emptyTrack = (releaseId: string): TrackForm => ({ release_id: releaseId, title: "", audio_src: "", spotify_url: "", apple_music_url: "", bandcamp_url: "", youtube_url: "", ...emptySale });

async function api<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const payload = await response.json().catch(() => null) as ApiEnvelope<T> | null;
  if (!response.ok) throw new Error(payload?.error || "Request failed");
  return payload?.data as T;
}

function releaseToForm(release: MusicLink): ReleaseForm {
  return { title: release.title, is_featured: release.is_featured, release_type: release.release_type, release_year: release.release_year, description: release.description, spotify_url: release.spotify_url, apple_music_url: release.apple_music_url, bandcamp_url: release.bandcamp_url || release.url, youtube_url: release.youtube_url, thumbnail_src: release.thumbnail_src, thumbnail_alt: release.thumbnail_alt, sale_enabled: Boolean(release.sale_enabled), price: release.price_gbp ? (release.price_gbp / 100).toFixed(2) : "", download_mp3_key: release.download_mp3_key || "", download_wav_key: release.download_wav_key || "" };
}

function trackToForm(track: MusicTrack): TrackForm {
  return { release_id: track.release_id, title: track.title, audio_src: track.audio_src, spotify_url: track.spotify_url, apple_music_url: track.apple_music_url, bandcamp_url: track.bandcamp_url, youtube_url: track.youtube_url, sale_enabled: Boolean(track.sale_enabled), price: track.price_gbp ? (track.price_gbp / 100).toFixed(2) : "", download_mp3_key: track.download_mp3_key || "", download_wav_key: track.download_wav_key || "" };
}

function salePayload<T extends SaleForm>(form: T) {
  const { price, ...fields } = form;
  return { ...fields, price_gbp: Math.round(Number(price || 0) * 100), shop_variant_id: "" };
}

export default function MusicAdmin({ releases, onChange }: { releases: MusicLink[]; onChange: (releases: MusicLink[]) => void }) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [releaseForm, setReleaseForm] = useState<ReleaseForm>(emptyRelease);
  const [trackForm, setTrackForm] = useState<TrackForm>(emptyTrack(""));
  const [expanded, setExpanded] = useState<string | null>(releases[0]?.id ?? null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function reload() {
    onChange(await api<MusicLink[]>("/api/admin/music-links"));
  }

  function openRelease(release?: MusicLink) {
    setReleaseForm(release ? releaseToForm(release) : emptyRelease);
    setEditor({ kind: "release", id: release?.id });
    setError("");
  }

  function openTrack(releaseId: string, track?: MusicTrack) {
    setTrackForm(track ? trackToForm(track) : emptyTrack(releaseId));
    setEditor({ kind: "track", releaseId, id: track?.id });
    setError("");
  }

  async function upload(file: File, bucket: "music" | "music-audio" | "music-downloads", query = "") {
    const body = new FormData();
    body.append("file", file);
    return api<MediaAsset>(`/api/admin/upload?bucket=${bucket}${query}`, { method: "POST", body });
  }

  async function uploadArtwork(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPending(true); setError("");
    try {
      const asset = await upload(file, "music");
      setReleaseForm((form) => ({ ...form, thumbnail_src: asset.public_path, thumbnail_alt: form.thumbnail_alt || `${form.title} cover artwork` }));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Artwork upload failed"); }
    finally { setPending(false); event.target.value = ""; }
  }

  async function uploadAudio(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPending(true); setError("");
    try {
      const asset = await upload(file, "music-audio");
      setTrackForm((form) => ({ ...form, audio_src: asset.public_path }));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "MP3 upload failed"); }
    finally { setPending(false); event.target.value = ""; }
  }

  async function uploadPurchase(event: React.ChangeEvent<HTMLInputElement>, kind: "release" | "track", format: "mp3" | "wav") {
    const file = event.target.files?.[0];
    if (!file) return;
    const packaged = kind === "release" && releaseForm.release_type !== "SINGLE";
    setPending(true); setError("");
    try {
      const query = `&saleKind=${kind}&format=${format}&packaged=${packaged}`;
      const asset = await upload(file, "music-downloads", query);
      const field = format === "mp3" ? "download_mp3_key" : "download_wav_key";
      if (kind === "release") setReleaseForm((form) => ({ ...form, [field]: asset.key }));
      else setTrackForm((form) => ({ ...form, [field]: asset.key }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Purchase file upload failed");
    } finally { setPending(false); event.target.value = ""; }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!editor) return;
    setPending(true); setError("");
    try {
      if (editor.kind === "release") {
        await api(editor.id ? `/api/admin/music-links/${editor.id}` : "/api/admin/music-links", { method: editor.id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(salePayload(releaseForm)) });
        setStatus(editor.id ? "Release updated." : "Release created.");
      } else {
        await api(editor.id ? `/api/admin/music-tracks/${editor.id}` : "/api/admin/music-tracks", { method: editor.id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(salePayload(trackForm)) });
        setExpanded(editor.releaseId);
        setStatus(editor.id ? "Track updated." : "Track added.");
      }
      setEditor(null);
      await reload();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save music"); }
    finally { setPending(false); }
  }

  async function remove(kind: "release" | "track", id: string) {
    if (!window.confirm(`Delete this ${kind}?${kind === "release" ? " Its tracks will also be deleted." : ""}`)) return;
    setPending(true); setError("");
    try {
      await api(`/api/admin/${kind === "release" ? "music-links" : "music-tracks"}/${id}`, { method: "DELETE" });
      setStatus(`${kind === "release" ? "Release" : "Track"} deleted.`);
      await reload();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Delete failed"); }
    finally { setPending(false); }
  }

  async function reorder(kind: "release" | "track", items: Array<{ id: string }>, index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setPending(true); setError("");
    try {
      await api(`/api/admin/${kind === "release" ? "music-links" : "music-tracks"}/reorder`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: next.map((row) => row.id) }) });
      await reload();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Reorder failed"); }
    finally { setPending(false); }
  }

  const trackRelease = editor?.kind === "track" ? releases.find((release) => release.id === editor.releaseId) : undefined;

  return <section className={styles.contentSection}>
    <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>R2 audio · D1 catalogue</p><h2>Music catalogue</h2><p className={styles.sectionIntro}>Manage albums, EPs, singles, track audio, streaming links and Stripe purchases.</p></div><button className={styles.primaryButton} type="button" onClick={() => openRelease()}>New release</button></div>
    {status ? <p className={styles.status}>{status}</p> : null}
    {error && !editor ? <p className={styles.error}>{error}</p> : null}
    <div className={styles.musicAdminList}>{releases.map((release, releaseIndex) => {
      const tracks = release.tracks ?? [];
      const isExpanded = expanded === release.id;
      return <article className={styles.musicAdminRelease} key={release.id}>
        <div className={styles.musicAdminReleaseHead}>
          <button className={styles.musicAdminExpand} type="button" aria-expanded={isExpanded} onClick={() => setExpanded(isExpanded ? null : release.id)}>{release.thumbnail_src ? <Image src={release.thumbnail_src} alt="" width={64} height={64} unoptimized={release.thumbnail_src.startsWith("/api/media/")} /> : null}<span><strong>{release.title}</strong><small>{release.release_type} · {release.release_year} · {tracks.length} track{tracks.length === 1 ? "" : "s"}{release.is_featured ? " · Featured on homepage" : ""}{release.sale_enabled ? ` · On sale £${(release.price_gbp / 100).toFixed(2)}` : ""}</small></span></button>
          <div className={styles.shopRowActions}><button disabled={pending || releaseIndex === 0} type="button" onClick={() => void reorder("release", releases, releaseIndex, -1)}>Up</button><button disabled={pending || releaseIndex === releases.length - 1} type="button" onClick={() => void reorder("release", releases, releaseIndex, 1)}>Down</button><button type="button" onClick={() => openRelease(release)}>Edit</button><button className={styles.shopDeleteAction} type="button" onClick={() => void remove("release", release.id)}>Delete</button></div>
        </div>
        {isExpanded ? <div className={styles.musicAdminTracks}><div className={styles.musicAdminTrackHeader}><strong>Track listing</strong><button className={styles.secondaryButton} type="button" onClick={() => openTrack(release.id)}>Add track</button></div>{tracks.length ? tracks.map((track, trackIndex) => <div className={styles.musicAdminTrack} key={track.id}><span>{trackIndex + 1}</span><div><strong>{track.title}</strong><small>{track.audio_src ? "Streaming MP3 ready" : "No streaming audio"}{track.sale_enabled ? ` · On sale £${(track.price_gbp / 100).toFixed(2)}` : ""}</small></div><div className={styles.shopRowActions}><button disabled={pending || trackIndex === 0} type="button" onClick={() => void reorder("track", tracks, trackIndex, -1)}>Up</button><button disabled={pending || trackIndex === tracks.length - 1} type="button" onClick={() => void reorder("track", tracks, trackIndex, 1)}>Down</button><button type="button" onClick={() => openTrack(release.id, track)}>Edit</button><button className={styles.shopDeleteAction} type="button" onClick={() => void remove("track", track.id)}>Delete</button></div></div>) : <p className={styles.formNote}>No tracks yet. Add the track listing and upload one streaming MP3 per track.</p>}</div> : null}
      </article>;
    })}</div>

    {editor ? <div className={styles.modalLayer}><button className={styles.modalScrim} type="button" aria-label="Close editor" onClick={() => setEditor(null)} /><div className={`${styles.editorModal} ${styles.musicEditorModal}`} role="dialog" aria-modal="true"><div className={styles.modalHeader}><div><p className={styles.eyebrow}>{editor.kind}</p><h3>{editor.id ? "Edit" : "Add"} {editor.kind}</h3></div><button className={styles.closeButton} type="button" aria-label="Close" onClick={() => setEditor(null)}>×</button></div><form className={styles.editPanel} onSubmit={save}>
      {error ? <p className={styles.error}>{error}</p> : null}
      {editor.kind === "release" ? <>
        <div className={styles.inlineFields}><label>Release title<input required autoFocus value={releaseForm.title} onChange={(event) => setReleaseForm((form) => ({ ...form, title: event.target.value }))} /></label><label>Category<select value={releaseForm.release_type} onChange={(event) => setReleaseForm((form) => ({ ...form, release_type: event.target.value as MusicLink["release_type"] }))}><option value="ALBUM">Album</option><option value="EP">EP</option><option value="SINGLE">Single</option></select></label><label>Release year<input required type="number" min="1900" max="2100" value={releaseForm.release_year} onChange={(event) => setReleaseForm((form) => ({ ...form, release_year: Number(event.target.value) }))} /></label></div>
        <label className={styles.checkboxLabel}><input checked={releaseForm.is_featured} type="checkbox" onChange={(event) => setReleaseForm((form) => ({ ...form, is_featured: event.target.checked }))} />Featured on homepage</label>
        <label>Description<textarea rows={3} value={releaseForm.description} onChange={(event) => setReleaseForm((form) => ({ ...form, description: event.target.value }))} /></label>
        <fieldset className={styles.shopFieldset}><legend>Cover artwork</legend>{releaseForm.thumbnail_src ? <div className={styles.previewImage}><Image src={releaseForm.thumbnail_src} alt="" fill sizes="18rem" unoptimized={releaseForm.thumbnail_src.startsWith("/api/media/")} /></div> : null}<label className={styles.uploadButton}>{pending ? "Uploading…" : "Upload artwork"}<input accept="image/png,image/jpeg,image/webp,image/avif" disabled={pending} type="file" onChange={(event) => void uploadArtwork(event)} /></label><label>Alt text<input required value={releaseForm.thumbnail_alt} onChange={(event) => setReleaseForm((form) => ({ ...form, thumbnail_alt: event.target.value }))} /></label></fieldset>
        <LinkFields value={releaseForm} onChange={(field, value) => setReleaseForm((form) => ({ ...form, [field]: value }))} />
        <DirectSaleFields kind="release" packaged={releaseForm.release_type !== "SINGLE"} pending={pending} value={releaseForm} onChange={(patch) => setReleaseForm((form) => ({ ...form, ...patch }))} onUpload={uploadPurchase} />
      </> : <>
        <label>Track title<input required autoFocus value={trackForm.title} onChange={(event) => setTrackForm((form) => ({ ...form, title: event.target.value }))} /></label>
        <fieldset className={styles.shopFieldset}><legend>Full streaming MP3</legend><label className={styles.uploadButton}>{pending ? "Uploading…" : trackForm.audio_src ? "Replace MP3" : "Upload MP3"}<input accept=".mp3,audio/mpeg" disabled={pending} type="file" onChange={(event) => void uploadAudio(event)} /></label>{trackForm.audio_src ? <p className={styles.shopFileName}>{trackForm.audio_src.split("/").pop()}</p> : <p className={styles.formNote}>MP3 only, up to 50 MB.</p>}</fieldset>
        <LinkFields value={trackForm} onChange={(field, value) => setTrackForm((form) => ({ ...form, [field]: value }))} />
        {trackRelease?.release_type === "SINGLE" ? <p className={styles.formNote}>Single purchases are managed on the release itself, so this track does not need a second Buy button.</p> : <DirectSaleFields kind="track" packaged={false} pending={pending} value={trackForm} onChange={(patch) => setTrackForm((form) => ({ ...form, ...patch }))} onUpload={uploadPurchase} />}
      </>}
      <div className={styles.modalActions}><button className={styles.secondaryButton} type="button" onClick={() => setEditor(null)}>Cancel</button><button className={styles.primaryButton} disabled={pending} type="submit">{pending ? "Saving…" : "Save"}</button></div>
    </form></div></div> : null}
  </section>;
}

function LinkFields({ value, onChange }: { value: Pick<ReleaseForm, "spotify_url" | "apple_music_url" | "bandcamp_url" | "youtube_url">; onChange: (field: "spotify_url" | "apple_music_url" | "bandcamp_url" | "youtube_url", value: string) => void }) {
  return <fieldset className={styles.shopFieldset}><legend>Streaming links</legend><div className={styles.shopFormGrid}><label>Spotify URL<input type="url" value={value.spotify_url} onChange={(event) => onChange("spotify_url", event.target.value)} /></label><label>Apple Music URL<input type="url" value={value.apple_music_url} onChange={(event) => onChange("apple_music_url", event.target.value)} /></label><label>Bandcamp URL<input type="url" value={value.bandcamp_url} onChange={(event) => onChange("bandcamp_url", event.target.value)} /></label><label>YouTube URL<input type="url" value={value.youtube_url} onChange={(event) => onChange("youtube_url", event.target.value)} /></label></div></fieldset>;
}

function DirectSaleFields({ kind, packaged, pending, value, onChange, onUpload }: { kind: "release" | "track"; packaged: boolean; pending: boolean; value: SaleForm; onChange: (patch: Partial<SaleForm>) => void; onUpload: (event: React.ChangeEvent<HTMLInputElement>, kind: "release" | "track", format: "mp3" | "wav") => Promise<void> }) {
  const ready = Number(value.price) > 0 && Boolean(value.download_mp3_key) && Boolean(value.download_wav_key);
  const noun = kind === "release" ? (packaged ? "complete release" : "single") : "track";
  return <fieldset className={styles.shopFieldset}>
    <legend>Sell this {noun} directly</legend>
    <p className={styles.formNote}>{packaged ? "Upload one ZIP containing all MP3 tracks and one ZIP containing all WAV tracks." : "Paid files stay private and separate from the public streaming MP3."} One purchase includes both formats.</p>
    <label>Price £<input min="0.01" required={value.sale_enabled} step="0.01" type="number" value={value.price} onChange={(event) => onChange({ price: event.target.value })} /></label>
    <div className={styles.musicSaleUploads}>
      <div><label className={styles.uploadButton}>{pending ? "Uploading…" : value.download_mp3_key ? `Replace MP3${packaged ? " ZIP" : ""}` : `Upload MP3${packaged ? " ZIP" : ""}`}<input accept={packaged ? ".zip,application/zip" : ".mp3,audio/mpeg"} disabled={pending} type="file" onChange={(event) => void onUpload(event, kind, "mp3")} /></label>{value.download_mp3_key ? <p className={styles.shopFileName}>{value.download_mp3_key.split("/").pop()}</p> : null}</div>
      <div><label className={styles.uploadButton}>{pending ? "Uploading…" : value.download_wav_key ? `Replace WAV${packaged ? " ZIP" : ""}` : `Upload WAV${packaged ? " ZIP" : ""}`}<input accept={packaged ? ".zip,application/zip" : ".wav,audio/wav,audio/x-wav"} disabled={pending} type="file" onChange={(event) => void onUpload(event, kind, "wav")} /></label>{value.download_wav_key ? <p className={styles.shopFileName}>{value.download_wav_key.split("/").pop()}</p> : null}</div>
    </div>
    <label className={styles.checkboxLabel}><input checked={value.sale_enabled} disabled={!ready && !value.sale_enabled} type="checkbox" onChange={(event) => onChange({ sale_enabled: event.target.checked })} />Sell directly on the Music page</label>
    {!ready ? <p className={styles.formNote}>Set a price and upload both formats to enable direct sales.</p> : null}
  </fieldset>;
}
