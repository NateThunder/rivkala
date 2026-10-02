"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  BioCoreContent,
  EpkPdfContent,
  EpkPhotoSlot,
  Gig,
  LineupPreset,
  MediaAsset,
  MusicLink,
  VideoRow,
} from "@/lib/admin/types";
import { youtubeThumbnailUrl } from "@/lib/admin/validation";
import ShopAdmin from "./shop-admin";
import MusicAdmin from "./music-admin";
import styles from "./admin.module.css";

type EpkAssets = {
  pdf: EpkPdfContent;
  photos: EpkPhotoSlot[];
};

type ApiEnvelope<T> = {
  data: T;
  error?: string;
};

const tabs = ["Dashboard", "Gigs", "Videos", "Music Links", "Bio", "EPK Assets", "Shop"] as const;
type Tab = (typeof tabs)[number];
type EditorKind = "gig" | "video" | "music";
type IconName = "arrowDown" | "arrowUp" | "close" | "delete" | "edit" | "menu" | "plus";

type GigForm = Pick<
  Gig,
  | "event_date"
  | "id"
  | "lineup_custom_label"
  | "lineup_preset"
  | "location"
  | "ticket_url"
  | "time_label"
  | "title"
>;

type VideoForm = Pick<VideoRow, "id" | "is_featured" | "title" | "youtube_id" | "youtube_url">;

type MusicForm = Pick<
  MusicLink,
  "id" | "thumbnail_alt" | "thumbnail_src" | "title" | "url"
>;

const emptyGig: GigForm = {
  id: "",
  event_date: "",
  title: "",
  location: "",
  lineup_preset: "SOLO",
  lineup_custom_label: "",
  time_label: "",
  ticket_url: "",
};

const emptyVideo: VideoForm = {
  id: "",
  title: "",
  youtube_url: "",
  youtube_id: "",
  is_featured: false,
};

const emptyMusicLink: MusicForm = {
  id: "",
  title: "",
  url: "",
  thumbnail_src: "",
  thumbnail_alt: "",
};

function api<T>(url: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  }).then(async (response) => {
    const json = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
    if (!response.ok) throw new Error(json?.error || "Request failed");
    return json?.data as T;
  });
}

function move<T>(rows: T[], index: number, direction: -1 | 1) {
  const next = [...rows];
  const target = index + direction;
  if (target < 0 || target >= next.length) return rows;
  const [row] = next.splice(index, 1);
  next.splice(target, 0, row);
  return next;
}

function sortByOrder<T extends { order_index: number }>(rows: T[]) {
  return [...rows].sort((a, b) => a.order_index - b.order_index);
}

function snapshotForm(value: unknown) {
  return JSON.stringify(value);
}

function gigToForm(gig: Gig): GigForm {
  return {
    id: gig.id,
    event_date: gig.event_date,
    title: gig.title,
    location: gig.location,
    lineup_preset: gig.lineup_preset,
    lineup_custom_label: gig.lineup_custom_label,
    time_label: gig.time_label,
    ticket_url: gig.ticket_url,
  };
}

function videoToForm(video: VideoRow): VideoForm {
  return {
    id: video.id,
    title: video.title,
    youtube_url: video.youtube_url,
    youtube_id: video.youtube_id,
    is_featured: video.is_featured,
  };
}

function Icon({ name }: { name: IconName }) {
  if (name === "menu") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    );
  }

  if (name === "close") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }

  if (name === "edit") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 20h9" />
        <path d="m16.5 3.5 4 4L8 20H4v-4L16.5 3.5Z" />
      </svg>
    );
  }

  if (name === "delete") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {name === "arrowUp" ? <path d="m12 5-6 6M12 5l6 6M12 5v14" /> : null}
      {name === "arrowDown" ? <path d="m12 19 6-6M12 19l-6-6M12 19V5" /> : null}
    </svg>
  );
}

function IconButton({
  disabled,
  icon,
  label,
  onClick,
  tone = "neutral",
}: {
  disabled?: boolean;
  icon: IconName;
  label: string;
  onClick: () => void;
  tone?: "danger" | "neutral";
}) {
  return (
    <button
      aria-label={label}
      className={`${styles.iconButton} ${tone === "danger" ? styles.iconButtonDanger : ""}`}
      data-tooltip={label}
      disabled={disabled}
      title={label}
      type="button"
      onClick={onClick}
    >
      <Icon name={icon} />
    </button>
  );
}

function RowActions({
  disableDown,
  disableUp,
  onDelete,
  onEdit,
  onMoveDown,
  onMoveUp,
}: {
  disableDown: boolean;
  disableUp: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
}) {
  return (
    <div className={styles.rowActions}>
      <IconButton disabled={disableUp} icon="arrowUp" label="Move up" onClick={onMoveUp} />
      <IconButton disabled={disableDown} icon="arrowDown" label="Move down" onClick={onMoveDown} />
      <IconButton icon="edit" label="Edit" onClick={onEdit} />
      <IconButton icon="delete" label="Delete" tone="danger" onClick={onDelete} />
    </div>
  );
}

function UploadButton({
  bucket,
  label,
  onUploaded,
}: {
  bucket: "music" | "epk-photos" | "epk-pdf";
  label: string;
  onUploaded: (asset: MediaAsset) => void;
}) {
  const [pending, setPending] = useState(false);
  const accept = bucket === "epk-pdf" ? "application/pdf" : "image/png,image/jpeg,image/webp,image/avif";

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPending(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch(`/api/admin/upload?bucket=${bucket}`, {
        method: "POST",
        body,
      });
      const json = (await response.json().catch(() => null)) as ApiEnvelope<MediaAsset> | null;
      if (!response.ok) throw new Error(json?.error || "Upload failed");
      onUploaded(json?.data as MediaAsset);
    } finally {
      setPending(false);
      event.currentTarget.value = "";
    }
  }

  return (
    <label className={styles.uploadButton}>
      {pending ? "Uploading..." : label}
      <input accept={accept} disabled={pending} type="file" onChange={onChange} />
    </label>
  );
}

export default function AdminShell({ username }: { username: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [editor, setEditor] = useState<EditorKind | null>(null);
  const [editorInitialSnapshot, setEditorInitialSnapshot] = useState("");
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [musicLinks, setMusicLinks] = useState<MusicLink[]>([]);
  const [bio, setBio] = useState<BioCoreContent>({
    pronunciation: "",
    pronouns: "",
    strapline: "",
    shortBio: "",
    longBio: [],
  });
  const [bioText, setBioText] = useState("");
  const [epk, setEpk] = useState<EpkAssets>({
    pdf: { href: "", downloadName: "" },
    photos: [],
  });
  const [gigForm, setGigForm] = useState<GigForm>(emptyGig);
  const [videoForm, setVideoForm] = useState<VideoForm>(emptyVideo);
  const [musicForm, setMusicForm] = useState<MusicForm>(emptyMusicLink);
  const [editingGigId, setEditingGigId] = useState<string | null>(null);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editingMusicId, setEditingMusicId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const featuredVideo = useMemo(
    () => videos.find((video) => video.is_featured) ?? videos[0] ?? null,
    [videos]
  );

  const nextGig = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return (
      [...gigs]
        .filter((gig) => gig.event_date >= today)
        .sort((a, b) => a.event_date.localeCompare(b.event_date) || a.order_index - b.order_index)[0] ??
      gigs[0] ??
      null
    );
  }, [gigs]);

  const epkReadyCount = useMemo(
    () => epk.photos.filter((photo) => photo.src && photo.alt && photo.download_name).length,
    [epk.photos]
  );

  const editorDirty = useMemo(() => {
    if (!editor) return false;
    if (editor === "gig") return snapshotForm(gigForm) !== editorInitialSnapshot;
    if (editor === "video") return snapshotForm(videoForm) !== editorInitialSnapshot;
    return snapshotForm(musicForm) !== editorInitialSnapshot;
  }, [editor, editorInitialSnapshot, gigForm, musicForm, videoForm]);

  async function loadAll() {
    setError("");
    try {
      const [gigRows, videoRows, musicRows, bioValue, epkValue] = await Promise.all([
        api<Gig[]>("/api/admin/gigs"),
        api<VideoRow[]>("/api/admin/videos"),
        api<MusicLink[]>("/api/admin/music-links"),
        api<BioCoreContent>("/api/admin/bio"),
        api<EpkAssets>("/api/admin/epk-assets"),
      ]);
      setGigs(sortByOrder(gigRows));
      setVideos(sortByOrder(videoRows));
      setMusicLinks(sortByOrder(musicRows));
      setBio(bioValue);
      setBioText(bioValue.longBio.join("\n\n"));
      setEpk(epkValue);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAll();
  }, []);

  useEffect(() => {
    if (!isNavOpen && !editor) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [editor, isNavOpen]);

  function selectTab(tab: Tab) {
    setActiveTab(tab);
    setIsNavOpen(false);
  }

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    window.location.reload();
  }

  const finishEditor = useCallback((kind: EditorKind) => {
    setEditor(null);
    setShowDiscardConfirm(false);
    setEditorInitialSnapshot("");
    if (kind === "gig") {
      setGigForm(emptyGig);
      setEditingGigId(null);
    }
    if (kind === "video") {
      setVideoForm(emptyVideo);
      setEditingVideoId(null);
    }
    if (kind === "music") {
      setMusicForm(emptyMusicLink);
      setEditingMusicId(null);
    }
  }, []);

  const requestEditorClose = useCallback(() => {
    if (!editor) return;
    if (editorDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    finishEditor(editor);
  }, [editor, editorDirty, finishEditor]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (showDiscardConfirm) {
        setShowDiscardConfirm(false);
        return;
      }
      if (editor) {
        requestEditorClose();
        return;
      }
      if (isNavOpen) setIsNavOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editor, isNavOpen, requestEditorClose, showDiscardConfirm]);

  function openGigEditor(gig?: Gig) {
    const form = gig ? gigToForm(gig) : { ...emptyGig };
    setGigForm(form);
    setEditingGigId(gig?.id ?? null);
    setEditorInitialSnapshot(snapshotForm(form));
    setShowDiscardConfirm(false);
    setEditor("gig");
  }

  function openVideoEditor(video?: VideoRow) {
    const form = video ? videoToForm(video) : { ...emptyVideo };
    setVideoForm(form);
    setEditingVideoId(video?.id ?? null);
    setEditorInitialSnapshot(snapshotForm(form));
    setShowDiscardConfirm(false);
    setEditor("video");
  }

  async function saveGig(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const payload = {
        ...gigForm,
        lineup_custom_label:
          gigForm.lineup_preset === "OTHER" ? gigForm.lineup_custom_label : "",
      };
      if (editingGigId) {
        const updated = await api<Gig>(`/api/admin/gigs/${editingGigId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setGigs((rows) => rows.map((row) => (row.id === editingGigId ? updated : row)));
        setStatus("Gig updated.");
      } else {
        const created = await api<Gig>("/api/admin/gigs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setGigs((rows) => [...rows, created]);
        setStatus("Gig added.");
      }
      finishEditor("gig");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function saveVideo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      if (editingVideoId) {
        const updated = await api<VideoRow>(`/api/admin/videos/${editingVideoId}`, {
          method: "PATCH",
          body: JSON.stringify(videoForm),
        });
        setVideos((rows) =>
          rows.map((row) =>
            row.id === editingVideoId
              ? updated
              : videoForm.is_featured
                ? { ...row, is_featured: false }
                : row
          )
        );
        setStatus("Video updated.");
      } else {
        const created = await api<VideoRow>("/api/admin/videos", {
          method: "POST",
          body: JSON.stringify(videoForm),
        });
        setVideos((rows) =>
          videoForm.is_featured
            ? [...rows.map((row) => ({ ...row, is_featured: false })), created]
            : [...rows, created]
        );
        setStatus("Video added.");
      }
      await loadAll();
      finishEditor("video");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function saveMusic(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      if (editingMusicId) {
        const updated = await api<MusicLink>(`/api/admin/music-links/${editingMusicId}`, {
          method: "PATCH",
          body: JSON.stringify(musicForm),
        });
        setMusicLinks((rows) => rows.map((row) => (row.id === editingMusicId ? updated : row)));
        setStatus("Music link updated.");
      } else {
        const created = await api<MusicLink>("/api/admin/music-links", {
          method: "POST",
          body: JSON.stringify(musicForm),
        });
        setMusicLinks((rows) => [...rows, created]);
        setStatus("Music link added.");
      }
      finishEditor("music");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function saveBio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const payload = {
        ...bio,
        longBio: bioText
          .split(/\n{2,}/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean),
      };
      const updated = await api<BioCoreContent>("/api/admin/bio", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setBio(updated);
      setBioText(updated.longBio.join("\n\n"));
      setStatus("Bio saved.");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function saveEpk(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const updated = await api<EpkAssets>("/api/admin/epk-assets", {
        method: "PATCH",
        body: JSON.stringify(epk),
      });
      setEpk(updated);
      setStatus("EPK assets saved.");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function deleteResource(resource: "gigs" | "videos" | "music-links", id: string) {
    if (!window.confirm("Delete this item?")) return;
    setError("");
    try {
      await api(`/api/admin/${resource}/${id}`, { method: "DELETE" });
      if (resource === "gigs") setGigs((rows) => rows.filter((row) => row.id !== id));
      if (resource === "videos") await loadAll();
      if (resource === "music-links") setMusicLinks((rows) => rows.filter((row) => row.id !== id));
      setStatus("Item deleted.");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function reorder<T extends { id: string }>(
    resource: "gigs" | "videos" | "music-links",
    rows: T[],
    setRows: React.Dispatch<React.SetStateAction<T[]>>,
    index: number,
    direction: -1 | 1
  ) {
    const next = move(rows, index, direction);
    if (next === rows) return;
    setRows(next);
    await api(`/api/admin/${resource}/reorder`, {
      method: "POST",
      body: JSON.stringify({ ids: next.map((row) => row.id) }),
    });
  }

  const editorTitle =
    editor === "gig"
      ? editingGigId
        ? "Edit gig"
        : "Add gig"
      : editor === "video"
        ? editingVideoId
          ? "Edit video"
          : "Add video"
        : editor === "music"
          ? editingMusicId
            ? "Edit music link"
            : "Add music link"
          : "";

  return (
    <main className={styles.adminPage}>
      <button
        aria-hidden={!isNavOpen}
        aria-label="Close navigation"
        className={`${styles.drawerBackdrop} ${isNavOpen ? styles.drawerBackdropOpen : ""}`}
        disabled={!isNavOpen}
        tabIndex={isNavOpen ? 0 : -1}
        type="button"
        onClick={() => setIsNavOpen(false)}
      />

      <aside className={`${styles.sidebar} ${isNavOpen ? styles.sidebarOpen : ""}`} id="admin-navigation">
        <div className={styles.sidebarBrand}>
          <div>
            <p className={styles.eyebrow}>Rivkala</p>
            <h1>Admin</h1>
            <p className={styles.signedIn}>Signed in as {username}</p>
          </div>
          <button
            aria-label="Close navigation"
            className={styles.sidebarClose}
            type="button"
            onClick={() => setIsNavOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>

        <nav className={styles.tabs} aria-label="Admin sections">
          {tabs.map((tab) => (
            <button
              aria-current={activeTab === tab ? "page" : undefined}
              className={activeTab === tab ? styles.activeTab : ""}
              key={tab}
              type="button"
              onClick={() => selectTab(tab)}
            >
              <span>{tab}</span>
            </button>
          ))}
        </nav>

        <button className={styles.secondaryButton} type="button" onClick={logout}>
          Sign out
        </button>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.mobileHeader}>
          <button
            aria-controls="admin-navigation"
            aria-expanded={isNavOpen}
            aria-label="Open navigation"
            className={styles.menuButton}
            type="button"
            onClick={() => setIsNavOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <div>
            <p className={styles.eyebrow}>Rivkala admin</p>
            <strong>{activeTab}</strong>
          </div>
        </header>

        {status ? <p className={styles.status}>{status}</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}

        {activeTab === "Dashboard" ? (
          <section className={styles.dashboard}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>Overview</p>
                <h2>Content status</h2>
                <p className={styles.sectionIntro}>Manage the public site content from one focused workspace.</p>
              </div>
            </div>

            <div className={styles.metricGrid}>
              <button type="button" onClick={() => selectTab("Gigs")}>
                <span>Gigs</span>
                <strong>{gigs.length}</strong>
                <small>{nextGig ? `Next: ${nextGig.event_date}` : "No dates listed"}</small>
              </button>
              <button type="button" onClick={() => selectTab("Videos")}>
                <span>Videos</span>
                <strong>{videos.length}</strong>
                <small>{featuredVideo ? "Featured video set" : "No featured video"}</small>
              </button>
              <button type="button" onClick={() => selectTab("Music Links")}>
                <span>Music links</span>
                <strong>{musicLinks.length}</strong>
                <small>Shown on Music and home</small>
              </button>
              <button type="button" onClick={() => selectTab("EPK Assets")}>
                <span>EPK photos</span>
                <strong>{epkReadyCount}/{epk.photos.length || 4}</strong>
                <small>{epk.pdf.href ? "PDF attached" : "PDF missing"}</small>
              </button>
            </div>

            <div className={styles.insightGrid}>
              <article className={styles.insightPanel}>
                <span>Next gig</span>
                <strong>{nextGig?.title ?? "No gigs yet"}</strong>
                <p>{nextGig ? `${nextGig.event_date} - ${nextGig.location}` : "Add a date for the Live page."}</p>
              </article>
              <article className={styles.insightPanel}>
                <span>Featured video</span>
                <strong>{featuredVideo?.title ?? "None selected"}</strong>
                <p>{featuredVideo?.youtube_id ? `YouTube ID ${featuredVideo.youtube_id}` : "Set a video as featured."}</p>
              </article>
              <article className={styles.quickActions}>
                <span>Quick actions</span>
                <div>
                  <button type="button" onClick={() => openGigEditor()}>
                    <Icon name="plus" />
                    New gig
                  </button>
                  <button type="button" onClick={() => openVideoEditor()}>
                    <Icon name="plus" />
                    New video
                  </button>
                  <button type="button" onClick={() => selectTab("Music Links")}>
                    <Icon name="plus" />
                    Music catalogue
                  </button>
                </div>
              </article>
            </div>
          </section>
        ) : null}

        {activeTab === "Gigs" ? (
          <section className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>Public /live</p>
                <h2>Gigs</h2>
                <p className={styles.sectionIntro}>Add dates, adjust order, and update ticket details.</p>
              </div>
              <button
                className={`${styles.secondaryButton} ${styles.buttonWithIcon}`}
                type="button"
                onClick={() => openGigEditor()}
              >
                <Icon name="plus" />
                New gig
              </button>
            </div>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Lineup</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gigs.length ? (
                    gigs.map((gig, index) => (
                      <tr key={gig.id}>
                        <td data-label="Date">{gig.event_date}</td>
                        <td data-label="Title">
                          <strong>{gig.title}</strong>
                          <span>{gig.location}</span>
                        </td>
                        <td data-label="Lineup">
                          {gig.lineup_preset === "OTHER" ? gig.lineup_custom_label : gig.lineup_preset}
                        </td>
                        <td data-label="Time">{gig.time_label}</td>
                        <td data-label="Actions">
                          <RowActions
                            disableDown={index === gigs.length - 1}
                            disableUp={index === 0}
                            onDelete={() => void deleteResource("gigs", gig.id)}
                            onEdit={() => openGigEditor(gig)}
                            onMoveDown={() => void reorder("gigs", gigs, setGigs, index, 1)}
                            onMoveUp={() => void reorder("gigs", gigs, setGigs, index, -1)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className={styles.emptyTableCell} colSpan={5}>
                        No gigs have been added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeTab === "Videos" ? (
          <section className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>TV Room</p>
                <h2>Videos</h2>
                <p className={styles.sectionIntro}>Control video order and the featured embed.</p>
              </div>
              <button
                className={`${styles.secondaryButton} ${styles.buttonWithIcon}`}
                type="button"
                onClick={() => openVideoEditor()}
              >
                <Icon name="plus" />
                New video
              </button>
            </div>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Video</th>
                    <th>Feature</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.length ? (
                    videos.map((video, index) => (
                      <tr key={video.id}>
                        <td data-label="Video">
                          <strong>{video.title}</strong>
                          <span>{video.youtube_id}</span>
                        </td>
                        <td data-label="Feature">
                          {video.is_featured ? <span className={styles.badge}>Featured</span> : "-"}
                        </td>
                        <td data-label="Actions">
                          <RowActions
                            disableDown={index === videos.length - 1}
                            disableUp={index === 0}
                            onDelete={() => void deleteResource("videos", video.id)}
                            onEdit={() => openVideoEditor(video)}
                            onMoveDown={() => void reorder("videos", videos, setVideos, index, 1)}
                            onMoveUp={() => void reorder("videos", videos, setVideos, index, -1)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className={styles.emptyTableCell} colSpan={3}>
                        No videos have been added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeTab === "Music Links" ? <MusicAdmin releases={musicLinks} onChange={setMusicLinks} /> : null}

        {activeTab === "Bio" ? (
          <form className={styles.longForm} onSubmit={saveBio}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>Bio and EPK</p>
                <h2>Shared bio</h2>
                <p className={styles.sectionIntro}>This copy appears across the public bio and EPK areas.</p>
              </div>
              <button className={styles.primaryButton} type="submit">
                Save bio
              </button>
            </div>
            <div className={styles.inlineFields}>
              <label>
                Pronunciation
                <input
                  value={bio.pronunciation}
                  onChange={(event) => setBio((value) => ({ ...value, pronunciation: event.target.value }))}
                />
              </label>
              <label>
                Pronouns
                <input
                  value={bio.pronouns}
                  onChange={(event) => setBio((value) => ({ ...value, pronouns: event.target.value }))}
                />
              </label>
            </div>
            <label>
              Strapline
              <input
                value={bio.strapline}
                onChange={(event) => setBio((value) => ({ ...value, strapline: event.target.value }))}
              />
            </label>
            <label>
              Short bio
              <textarea
                rows={6}
                value={bio.shortBio}
                onChange={(event) => setBio((value) => ({ ...value, shortBio: event.target.value }))}
              />
            </label>
            <label>
              Long bio paragraphs
              <textarea rows={10} value={bioText} onChange={(event) => setBioText(event.target.value)} />
            </label>
          </form>
        ) : null}

        {activeTab === "EPK Assets" ? (
          <form className={styles.longForm} onSubmit={saveEpk}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>Downloads</p>
                <h2>EPK assets</h2>
                <p className={styles.sectionIntro}>Update the downloadable PDF and press photo set.</p>
              </div>
              <button className={styles.primaryButton} type="submit">
                Save EPK assets
              </button>
            </div>
            <div className={styles.inlineFields}>
              <label>
                EPK PDF path
                <input
                  value={epk.pdf.href}
                  onChange={(event) =>
                    setEpk((value) => ({
                      ...value,
                      pdf: { ...value.pdf, href: event.target.value },
                    }))
                  }
                />
              </label>
              <label>
                Download filename
                <input
                  value={epk.pdf.downloadName}
                  onChange={(event) =>
                    setEpk((value) => ({
                      ...value,
                      pdf: { ...value.pdf, downloadName: event.target.value },
                    }))
                  }
                />
              </label>
            </div>
            <UploadButton
              bucket="epk-pdf"
              label="Upload EPK PDF"
              onUploaded={(asset) =>
                setEpk((value) => ({
                  ...value,
                  pdf: { href: asset.public_path, downloadName: asset.original_name },
                }))
              }
            />

            <div className={styles.photoSlotGrid}>
              {epk.photos.map((photo, index) => (
                <fieldset className={styles.photoSlot} key={photo.slot}>
                  <legend>Photo {photo.slot}</legend>
                  <div className={styles.previewImage}>
                    <Image alt="" fill src={photo.src} sizes="18rem" unoptimized />
                  </div>
                  <UploadButton
                    bucket="epk-photos"
                    label="Upload photo"
                    onUploaded={(asset) =>
                      setEpk((value) => ({
                        ...value,
                        photos: value.photos.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                src: asset.public_path,
                                download_name: asset.original_name,
                              }
                            : item
                        ),
                      }))
                    }
                  />
                  <label>
                    Image path
                    <input
                      value={photo.src}
                      onChange={(event) =>
                        setEpk((value) => ({
                          ...value,
                          photos: value.photos.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, src: event.target.value } : item
                          ),
                        }))
                      }
                    />
                  </label>
                  <label>
                    Alt text
                    <input
                      value={photo.alt}
                      onChange={(event) =>
                        setEpk((value) => ({
                          ...value,
                          photos: value.photos.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, alt: event.target.value } : item
                          ),
                        }))
                      }
                    />
                  </label>
                  <label>
                    Label
                    <input
                      value={photo.label}
                      onChange={(event) =>
                        setEpk((value) => ({
                          ...value,
                          photos: value.photos.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, label: event.target.value } : item
                          ),
                        }))
                      }
                    />
                  </label>
                  <label>
                    Credit
                    <input
                      value={photo.credit}
                      onChange={(event) =>
                        setEpk((value) => ({
                          ...value,
                          photos: value.photos.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, credit: event.target.value } : item
                          ),
                        }))
                      }
                    />
                  </label>
                  <label>
                    Download filename
                    <input
                      value={photo.download_name}
                      onChange={(event) =>
                        setEpk((value) => ({
                          ...value,
                          photos: value.photos.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, download_name: event.target.value }
                              : item
                          ),
                        }))
                      }
                    />
                  </label>
                </fieldset>
              ))}
            </div>
          </form>
        ) : null}

        {activeTab === "Shop" ? <ShopAdmin /> : null}
      </section>

      {editor ? (
        <div className={styles.modalLayer}>
          <button
            aria-label="Close editor"
            className={styles.modalScrim}
            type="button"
            onClick={requestEditorClose}
          />
          <section
            aria-labelledby="admin-editor-title"
            aria-modal="true"
            className={styles.editorModal}
            role="dialog"
          >
            <header className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>Content editor</p>
                <h3 id="admin-editor-title">{editorTitle}</h3>
              </div>
              <button
                aria-label="Close editor"
                className={styles.closeButton}
                type="button"
                onClick={requestEditorClose}
              >
                <Icon name="close" />
              </button>
            </header>

            {editor === "gig" ? (
              <form className={styles.editPanel} onSubmit={saveGig}>
                <label>
                  Date
                  <input
                    required
                    autoFocus
                    type="date"
                    value={gigForm.event_date}
                    onChange={(event) => setGigForm((form) => ({ ...form, event_date: event.target.value }))}
                  />
                </label>
                <label>
                  Title / venue
                  <input
                    required
                    value={gigForm.title}
                    onChange={(event) => setGigForm((form) => ({ ...form, title: event.target.value }))}
                  />
                </label>
                <label>
                  Location
                  <input
                    required
                    value={gigForm.location}
                    onChange={(event) => setGigForm((form) => ({ ...form, location: event.target.value }))}
                  />
                </label>
                <label>
                  Lineup
                  <select
                    value={gigForm.lineup_preset}
                    onChange={(event) =>
                      setGigForm((form) => ({
                        ...form,
                        lineup_preset: event.target.value as LineupPreset,
                      }))
                    }
                  >
                    <option>SOLO</option>
                    <option>DUO</option>
                    <option>TRIO</option>
                    <option>FULL BAND</option>
                    <option>OTHER</option>
                  </select>
                </label>
                {gigForm.lineup_preset === "OTHER" ? (
                  <label>
                    Custom lineup label
                    <input
                      required
                      value={gigForm.lineup_custom_label}
                      onChange={(event) =>
                        setGigForm((form) => ({
                          ...form,
                          lineup_custom_label: event.target.value,
                        }))
                      }
                    />
                  </label>
                ) : null}
                <label>
                  Time label
                  <input
                    required
                    value={gigForm.time_label}
                    onChange={(event) => setGigForm((form) => ({ ...form, time_label: event.target.value }))}
                  />
                </label>
                <label>
                  Ticket URL
                  <input
                    placeholder="Blank shows FREE GIG"
                    value={gigForm.ticket_url}
                    onChange={(event) => setGigForm((form) => ({ ...form, ticket_url: event.target.value }))}
                  />
                </label>
                <div className={styles.modalActions}>
                  <button className={styles.secondaryButton} type="button" onClick={requestEditorClose}>
                    Cancel
                  </button>
                  <button className={styles.primaryButton} type="submit">
                    Save gig
                  </button>
                </div>
              </form>
            ) : null}

            {editor === "video" ? (
              <form className={styles.editPanel} onSubmit={saveVideo}>
                <label>
                  Title
                  <input
                    required
                    autoFocus
                    value={videoForm.title}
                    onChange={(event) => setVideoForm((form) => ({ ...form, title: event.target.value }))}
                  />
                </label>
                <label>
                  YouTube URL
                  <input
                    required
                    value={videoForm.youtube_url}
                    onChange={(event) => setVideoForm((form) => ({ ...form, youtube_url: event.target.value }))}
                  />
                </label>
                {videoForm.youtube_id ? (
                  <div className={styles.previewImage}>
                    <Image
                      alt=""
                      fill
                      src={youtubeThumbnailUrl(videoForm.youtube_id)}
                      sizes="18rem"
                      unoptimized
                    />
                  </div>
                ) : null}
                <label className={styles.checkboxLabel}>
                  <input
                    checked={videoForm.is_featured}
                    type="checkbox"
                    onChange={(event) =>
                      setVideoForm((form) => ({ ...form, is_featured: event.target.checked }))
                    }
                  />
                  Featured video
                </label>
                <div className={styles.modalActions}>
                  <button className={styles.secondaryButton} type="button" onClick={requestEditorClose}>
                    Cancel
                  </button>
                  <button className={styles.primaryButton} type="submit">
                    Save video
                  </button>
                </div>
              </form>
            ) : null}

            {editor === "music" ? (
              <form className={styles.editPanel} onSubmit={saveMusic}>
                <label>
                  Title
                  <input
                    required
                    autoFocus
                    value={musicForm.title}
                    onChange={(event) => setMusicForm((form) => ({ ...form, title: event.target.value }))}
                  />
                </label>
                <label>
                  Link URL
                  <input
                    required
                    value={musicForm.url}
                    onChange={(event) => setMusicForm((form) => ({ ...form, url: event.target.value }))}
                  />
                </label>
                <label>
                  Thumbnail path
                  <input
                    required
                    value={musicForm.thumbnail_src}
                    onChange={(event) =>
                      setMusicForm((form) => ({ ...form, thumbnail_src: event.target.value }))
                    }
                  />
                </label>
                <UploadButton
                  bucket="music"
                  label="Upload thumbnail"
                  onUploaded={(asset) =>
                    setMusicForm((form) => ({
                      ...form,
                      thumbnail_src: asset.public_path,
                      thumbnail_alt: form.thumbnail_alt || form.title,
                    }))
                  }
                />
                <label>
                  Thumbnail alt text
                  <input
                    required
                    value={musicForm.thumbnail_alt}
                    onChange={(event) =>
                      setMusicForm((form) => ({ ...form, thumbnail_alt: event.target.value }))
                    }
                  />
                </label>
                <div className={styles.modalActions}>
                  <button className={styles.secondaryButton} type="button" onClick={requestEditorClose}>
                    Cancel
                  </button>
                  <button className={styles.primaryButton} type="submit">
                    Save music link
                  </button>
                </div>
              </form>
            ) : null}
          </section>

          {showDiscardConfirm ? (
            <section
              aria-labelledby="discard-title"
              aria-modal="true"
              className={styles.confirmDialog}
              role="alertdialog"
            >
              <p className={styles.eyebrow}>Unsaved changes</p>
              <h3 id="discard-title">Discard changes?</h3>
              <p>Closing this editor will lose the changes you have not saved.</p>
              <div className={styles.modalActions}>
                <button className={styles.secondaryButton} type="button" onClick={() => setShowDiscardConfirm(false)}>
                  Keep editing
                </button>
                <button
                  className={styles.dangerActionButton}
                  type="button"
                  onClick={() => {
                    if (editor) finishEditor(editor);
                  }}
                >
                  Discard
                </button>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
