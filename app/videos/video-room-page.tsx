"use client";

import Image from "next/image";
import { useState } from "react";
import flower from "../../public/video_section_separated_assets/flower.png";
import fluffyBall from "../../public/video_section_separated_assets/fluffy-ball.png";
import gramps from "../../public/video_section_separated_assets/Gramps.png";
import orangeTiles from "../../public/video_section_separated_assets/orange-tiles.png";
import rag from "../../public/video_section_separated_assets/rag.png";
import SiteNav from "../site-nav";
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

        <div className={styles.heroDecor} aria-hidden="true">
          <Image className={styles.heroFlower} src={flower} alt="" sizes="10rem" />
          <Image className={styles.heroGramps} src={gramps} alt="" sizes="9rem" />
        </div>
      </section>

      <section className={styles.videoSection} aria-label="Rivkala videos">
        <div className={styles.videoCollage} aria-hidden="true">
          <Image className={styles.collageTiles} src={orangeTiles} alt="" sizes="18rem" />
          <Image className={styles.collageRag} src={rag} alt="" sizes="17rem" />
          <Image className={styles.collageBall} src={fluffyBall} alt="" sizes="9rem" />
          <Image className={styles.collageGramps} src={gramps} alt="" sizes="11rem" />
        </div>

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
    </main>
  );
}
