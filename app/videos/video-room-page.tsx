"use client";

import Image from "next/image";
import { useState } from "react";
import SiteNav from "../site-nav";
import crt from "../../public/video_section_separated_assets/CRT.png";
import CRTVideoCard from "./crt-video-card";
import TornPaperLabel from "./torn-paper-label";
import { videos } from "./video-data";
import styles from "./video-room.module.css";

type VideoRoomPageProps = {
  className?: string;
};

export default function VideoRoomPage({ className = "" }: VideoRoomPageProps) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  return (
    <main className={`${styles.page} ${className}`}>
      <div className={styles.wallTexture} aria-hidden="true" />

      <header className={styles.siteHeader}>
        <SiteNav />
      </header>

      <section className={styles.hero} aria-labelledby="tv-room-title">
        <div className={styles.heroCopy}>
          <TornPaperLabel
            as="h1"
            id="tv-room-title"
            tone="cream"
            className={styles.mainTitle}
          >
            TV Room
          </TornPaperLabel>

          <TornPaperLabel as="p" tone="pink" className={styles.subTitle}>
            All Videos
          </TornPaperLabel>
        </div>

      </section>

      <section className={styles.videoSection} aria-label="Rivkala videos">
        <div className={styles.videoGrid}>
          {videos.map((video, index) => (
            <CRTVideoCard
              key={video.id}
              index={index}
              isPlaying={activeVideoId === video.id}
              video={video}
              onPlay={(selectedVideo) => setActiveVideoId(selectedVideo.id)}
            />
          ))}
        </div>
      </section>

      <aside className={styles.comingSoon} aria-label="More videos coming soon">
        <div className={styles.comingSoonTv} aria-hidden="true">
          <span />
          <Image src={crt} alt="" sizes="6rem" />
        </div>
        <p>
          <strong>More transmissions coming soon...</strong>
          <span>Stay tuned.</span>
        </p>
      </aside>
    </main>
  );
}
