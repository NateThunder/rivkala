import Image from "next/image";
import Link from "next/link";
import styles from "./featured-video.module.css";
import poster from "../public/Bex photos/Rivkala-creditMarianaPires-3.jpg";
import pinkTitleTape from "../public/TV Room/pink-tape.png";
import whiteTitleTape from "../public/TV Room/white tape.png";
import backdrop from "../public/video_section_separated_assets/backdrop.png";
import crt from "../public/video_section_separated_assets/CRT.png";

const featuredVideoEmbedUrl = "https://www.youtube.com/embed/LK7PeIOZiVY?rel=0&modestbranding=1";

export default function FeaturedVideo() {
  return (
    <section className={styles.featuredVideo} aria-labelledby="featured-video-title">
      <div className={styles.artboard}>
        <h2 id="featured-video-title" className={styles.title}>
          <span className={`${styles.titleLine} ${styles.titleLineCream}`}>
            <Image
              className={styles.titlePaper}
              src={whiteTitleTape}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 700px) 17rem, (max-width: 1100px) 30vw, 29rem"
            />
            <span className={styles.titleText}>Featured</span>
          </span>
          <span className={`${styles.titleLine} ${styles.titleLinePink}`}>
            <Image
              className={styles.titlePaper}
              src={pinkTitleTape}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 700px) 14rem, (max-width: 1100px) 24vw, 22rem"
            />
            <span className={styles.titleText}>Video</span>
          </span>
        </h2>

        <div className={styles.visualCluster}>
          <Image
            className={styles.backdrop}
            src={backdrop}
            alt=""
            aria-hidden="true"
            sizes="(max-width: 700px) 133vw, (max-width: 1100px) 127vw, 88rem"
          />

          <div className={styles.mediaBlock}>
            <div className={styles.tvFrame}>
              <span className={styles.screen}>
                <Image
                  className={styles.poster}
                  src={poster}
                  alt=""
                  fill
                  sizes="(max-width: 700px) 64vw, (max-width: 1100px) 38vw, 32rem"
                />
                <iframe
                  className={styles.embed}
                  src={featuredVideoEmbedUrl}
                  title="Rivkala featured video on YouTube"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
                <span className={styles.scanlines} aria-hidden="true" />
              </span>
              <Image
                className={styles.crt}
                src={crt}
                alt=""
                aria-hidden="true"
                sizes="(max-width: 700px) 94vw, (max-width: 1100px) 58vw, 49rem"
              />
            </div>
          </div>
        </div>

        <div className={styles.copyBlock}>
          <div className={styles.actions} aria-label="Featured video actions">
            <Link className={`${styles.videoButton} ${styles.videoButtonPrimary}`} href="/videos">
              <span>Watch</span>
            </Link>
            <Link className={`${styles.videoButton} ${styles.videoButtonSecondary}`} href="/videos">
              <span>View all videos</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
