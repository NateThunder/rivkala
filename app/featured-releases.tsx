import Image, { type StaticImageData } from "next/image";
import type { CSSProperties } from "react";
import styles from "./featured-releases.module.css";
import FeaturedReleasesCollage from "./featured-releases-collage";
import chessCover from "../public/Album covers/Chess.png";
import crushedVelvetCover from "../public/Album covers/Crushed Velvet.png";
import zipLockTeethCover from "../public/Album covers/Zip Lock Teeth.png";
import beigeTape from "../public/rivkala_featured_releases_assets/decor/beige-tape.png";
import blackTape from "../public/rivkala_featured_releases_assets/decor/black-tape.png";
import faceCollage from "../public/rivkala_featured_releases_assets/decor/surreal-eyes-lips-collage-web.png";
import lamp from "../public/rivkala_featured_releases_assets/decor/vintage-fringe-lamp-web.png";

type Release = {
  title: string;
  href: string;
  cover: StaticImageData;
  tape: StaticImageData;
  tilt: string;
  tapeTilt: string;
};

const releases: Release[] = [
  {
    title: "Crushed Velvet",
    href: "https://rivkala.bandcamp.com/album/crushed-velvet",
    cover: crushedVelvetCover,
    tape: beigeTape,
    tilt: "-2.2deg",
    tapeTilt: "3deg",
  },
  {
    title: "Chess",
    href: "https://rivkala.bandcamp.com/track/chess",
    cover: chessCover,
    tape: blackTape,
    tilt: "1.4deg",
    tapeTilt: "-2.5deg",
  },
  {
    title: "Zip Lock Teeth",
    href: "https://rivkala.bandcamp.com/track/zip-lock-teeth",
    cover: zipLockTeethCover,
    tape: beigeTape,
    tilt: "-1.2deg",
    tapeTilt: "5deg",
  },
];

const bandcampRoot = "https://rivkala.bandcamp.com/";

type FeaturedReleasesProps = {
  enableCollageParallax?: boolean;
};

export default function FeaturedReleases({
  enableCollageParallax = false,
}: FeaturedReleasesProps) {
  return (
    <section
      className={styles.featuredReleases}
      aria-labelledby="featured-releases-title"
    >
      <Image
        className={styles.lamp}
        src={lamp}
        alt=""
        aria-hidden="true"
        sizes="(max-width: 700px) 86px, (max-width: 1100px) 11vw, 138px"
      />
      {enableCollageParallax ? (
        <FeaturedReleasesCollage />
      ) : (
        <Image
          className={styles.faceCollage}
          src={faceCollage}
          alt=""
          aria-hidden="true"
          sizes="(max-width: 700px) 190px, (max-width: 1100px) 25vw, 330px"
        />
      )}

      <div className={styles.inner}>
        <h2 id="featured-releases-title" className={styles.title}>
          <span className={styles.titleCream}>Featured</span>
          <span className={styles.titlePink}>Releases</span>
        </h2>
        <p className={styles.kicker} aria-hidden="true">
          &nbsp;
        </p>

        <div className={styles.releaseGrid}>
          {releases.map((release) => (
            <article
              className={styles.releaseCard}
              key={release.title}
              style={
                {
                  "--tilt": release.tilt,
                  "--tape-tilt": release.tapeTilt,
                } as CSSProperties
              }
            >
              <a
                className={styles.coverLink}
                href={release.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Listen to ${release.title} on Bandcamp`}
              >
                <Image
                  className={styles.releaseCover}
                  src={release.cover}
                  alt={`${release.title} cover artwork`}
                  sizes="(max-width: 760px) 76vw, (max-width: 1100px) 27vw, 320px"
                />
                <Image
                  className={styles.releaseTape}
                  src={release.tape}
                  alt=""
                  aria-hidden="true"
                  sizes="120px"
                />
              </a>

              <h3 className={styles.releaseName}>{release.title}</h3>
              <a
                className={styles.releaseButton}
                href={release.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Listen to ${release.title} on Bandcamp`}
              >
                <span>Listen</span>
              </a>
            </article>
          ))}
        </div>

        <a
          className={styles.allReleasesLink}
          href={bandcampRoot}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>View all releases</span>
        </a>
      </div>
    </section>
  );
}
