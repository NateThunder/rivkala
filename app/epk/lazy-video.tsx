"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./epk-page.module.css";

type LazyVideoProps = {
  id: string;
  title: string;
  thumbnail: string;
  youtubeUrl: string;
};

export default function LazyVideo({
  id,
  title,
  thumbnail,
  youtubeUrl,
}: LazyVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className={styles.videoFrame}>
      {isPlaying ? (
        <iframe
          className={styles.videoEmbed}
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <>
          <Image
            className={styles.videoPoster}
            src={thumbnail}
            alt=""
            fill
            sizes="(max-width: 760px) calc(100vw - 3rem), 38rem"
          />
          <span className={styles.videoWash} aria-hidden="true" />
          <button
            className={styles.playButton}
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label={`Play ${title}`}
          >
            <span className={styles.playIcon} aria-hidden="true" />
            <span>Play film</span>
          </button>
        </>
      )}
      <a
        className={styles.youtubeFallback}
        href={youtubeUrl}
        target="_blank"
        rel="noreferrer"
      >
        Open on YouTube
      </a>
    </div>
  );
}
