import Image from "next/image";
import crt from "../../public/video_section_separated_assets/CRT.png";
import type { VideoItem } from "./video-data";
import TornPaperLabel from "./torn-paper-label";
import styles from "./video-room.module.css";

type CRTVideoCardProps = {
  index: number;
  isPlaying: boolean;
  onPlay: (video: VideoItem) => void;
  video: VideoItem;
};

export default function CRTVideoCard({
  index,
  isPlaying,
  onPlay,
  video,
}: CRTVideoCardProps) {
  const titleId = `video-title-${video.id}`;
  return (
    <article
      className={styles.videoCard}
      style={{ "--card-index": index } as React.CSSProperties}
      aria-labelledby={titleId}
    >
      {index === 1 ? (
        <Image
          className={styles.cardFlower}
          src="/TV Room/flower 2.PNG"
          width={165}
          height={269}
          alt=""
          aria-hidden="true"
          sizes="7rem"
        />
      ) : null}

      {index === 2 ? (
        <Image
          className={styles.cardLeaf}
          src="/TV Room/leaf.PNG"
          width={165}
          height={269}
          alt=""
          aria-hidden="true"
          sizes="6rem"
        />
      ) : null}

      <h2 id={titleId} className={styles.srOnly}>
        {video.title}
      </h2>

      <div className={styles.videoPrimaryAction}>
        <button
          type="button"
          className={styles.videoTitleAction}
          aria-label={`Play ${video.title} inside the television`}
          onClick={() => onPlay(video)}
        >
          <TornPaperLabel as="span" tone="cream" className={styles.videoTitleLabel}>
            {video.title}
          </TornPaperLabel>
        </button>

        <span className={styles.tvFrame}>
          <span className={styles.tvScreen}>
            {isPlaying ? (
              <iframe
                className={styles.inlineVideo}
                src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <>
                <Image
                  className={styles.videoThumbnail}
                  src={video.thumbnailUrl}
                  alt=""
                  fill
                  sizes="(max-width: 700px) 78vw, (max-width: 1100px) 38vw, 30rem"
                />
                <span className={styles.screenWarmth} aria-hidden="true" />
                <span className={styles.playButton} aria-hidden="true">
                  <span className={styles.playTriangle} />
                </span>
              </>
            )}
            <span className={styles.scanlines} aria-hidden="true" />
            <span className={styles.screenReflection} aria-hidden="true" />
          </span>

          <Image
            className={styles.crtImage}
            src={crt}
            alt=""
            aria-hidden="true"
            priority={index < 2}
            sizes="(max-width: 700px) 96vw, (max-width: 1100px) 48vw, 37rem"
          />

          {!isPlaying ? (
            <button
              type="button"
              className={styles.tvActivateButton}
              aria-label={`Play ${video.title} inside the television`}
              onClick={() => onPlay(video)}
            />
          ) : null}
        </span>
      </div>

      <button
        type="button"
        className={styles.watchButton}
        aria-label={`Watch ${video.title} now`}
        onClick={() => onPlay(video)}
      >
        <span>Watch now</span>
        <span className={styles.watchArrow} aria-hidden="true" />
      </button>
    </article>
  );
}
