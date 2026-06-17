import Image from "next/image";
import Link from "next/link";
import styles from "./featured-video.module.css";
import poster from "../public/Bex photos/Rivkala-creditMarianaPires-3.jpg";
import crt from "../public/video_section_separated_assets/CRT.png";
import flower from "../public/video_section_separated_assets/flower.png";
import fluffyBall from "../public/video_section_separated_assets/fluffy-ball.png";
import gramps from "../public/video_section_separated_assets/Gramps.png";
import greenFabric from "../public/video_section_separated_assets/Green-Fabric.png";
import orangeTiles from "../public/video_section_separated_assets/orange-tiles.png";
import rag from "../public/video_section_separated_assets/rag.png";
import redTexture from "../public/video_section_separated_assets/red-texture.png";
import creamStrip from "../public/rivkala_featured_releases_assets/decor/torn-paper-strip-cream-long.png";
import pinkStrip from "../public/rivkala_featured_releases_assets/decor/torn-paper-strip-dusty-pink.png";

const featuredVideoEmbedUrl = "https://www.youtube.com/embed/LK7PeIOZiVY?rel=0&modestbranding=1";

export default function FeaturedVideo() {
  return (
    <section className={styles.featuredVideo} aria-labelledby="featured-video-title">
      <div className={styles.collage} aria-hidden="true">
        <Image
          className={styles.redScrap}
          src={redTexture}
          alt=""
          sizes="(max-width: 700px) 20rem, (max-width: 1100px) 48vw, 45rem"
        />
        <Image
          className={styles.ragScrap}
          src={rag}
          alt=""
          sizes="(max-width: 700px) 9rem, (max-width: 1100px) 16vw, 14rem"
        />
        <Image
          className={styles.fluffyBall}
          src={fluffyBall}
          alt=""
          sizes="(max-width: 700px) 5.5rem, (max-width: 1100px) 9vw, 8.8rem"
        />
        <Image
          className={styles.gramps}
          src={gramps}
          alt=""
          sizes="(max-width: 700px) 5rem, (max-width: 1100px) 8vw, 7.6rem"
        />
        <Image
          className={styles.bottomFabric}
          src={greenFabric}
          alt=""
          sizes="(max-width: 700px) 14rem, (max-width: 1100px) 28vw, 26rem"
        />
        <Image
          className={styles.flower}
          src={flower}
          alt=""
          sizes="(max-width: 700px) 4.8rem, (max-width: 1100px) 7vw, 6.4rem"
        />
      </div>

      <div className={styles.inner}>
        <Image
          className={styles.tilePatch}
          src={orangeTiles}
          alt=""
          aria-hidden="true"
          sizes="(max-width: 700px) 8.5rem, (max-width: 1100px) 16vw, 14rem"
        />
        <h2 id="featured-video-title" className={styles.title}>
          <span className={`${styles.titleLine} ${styles.titleLineCream}`}>
            <Image
              className={styles.titlePaper}
              src={creamStrip}
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
              src={pinkStrip}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 700px) 14rem, (max-width: 1100px) 24vw, 22rem"
            />
            <span className={styles.titleText}>Video</span>
          </span>
        </h2>

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
