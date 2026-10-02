import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { getMusicLinks } from "@/lib/admin/content";
import type { MusicLink } from "@/lib/admin/types";
import styles from "./featured-releases.module.css";
import FeaturedReleasesCollage from "./featured-releases-collage";
import pinkTitleTape from "../public/TV Room/pink-tape.png";
import whiteTitleTape from "../public/TV Room/white tape.png";
import beigeTape from "../public/rivkala_featured_releases_assets/decor/beige-tape.png";
import blackTape from "../public/rivkala_featured_releases_assets/decor/black-tape.png";
import faceCollage from "../public/rivkala_featured_releases_assets/decor/surreal-eyes-lips-collage-web.png";
import lamp from "../public/rivkala_featured_releases_assets/decor/vintage-fringe-lamp-web.png";

type Release = {
  title: string;
  href: string;
  cover: string;
  coverAlt: string;
  tape: StaticImageData;
  tilt: string;
  tapeTilt: string;
};

const musicPath = "/music";
const tilts = ["-2.2deg", "1.4deg", "-1.2deg", "1.8deg", "-1.6deg"];
const tapeTilts = ["3deg", "-2.5deg", "5deg", "-4deg", "2deg"];

function toRelease(link: MusicLink, index: number): Release {
  return {
    title: link.title,
    href: `${musicPath}#release-${link.id}`,
    cover: link.thumbnail_src,
    coverAlt: link.thumbnail_alt || `${link.title} cover artwork`,
    tape: index % 2 === 0 ? beigeTape : blackTape,
    tilt: tilts[index % tilts.length],
    tapeTilt: tapeTilts[index % tapeTilts.length],
  };
}

type FeaturedReleasesProps = {
  enableCollageParallax?: boolean;
};

export default async function FeaturedReleases({
  enableCollageParallax = false,
}: FeaturedReleasesProps) {
  const releases = (await getMusicLinks())
    .filter((release) => release.is_featured)
    .map(toRelease);

  if (!releases.length) return null;

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
          <span className={`${styles.titleLine} ${styles.titleCream}`}>
            <Image
              className={styles.titleTape}
              src={whiteTitleTape}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 640px) 14rem, 29rem"
            />
            <span className={styles.titleText}>Featured</span>
          </span>
          <span className={`${styles.titleLine} ${styles.titlePink}`}>
            <Image
              className={styles.titleTape}
              src={pinkTitleTape}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 640px) 12rem, 24rem"
            />
            <span className={styles.titleText}>Releases</span>
          </span>
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
              <Link
                className={styles.coverLink}
                href={release.href}
                aria-label={`View ${release.title} on the Music page`}
              >
                <Image
                  className={styles.releaseCover}
                  src={release.cover}
                  alt={release.coverAlt}
                  width={800}
                  height={800}
                  unoptimized={release.cover.startsWith("/api/media/")}
                  sizes="(max-width: 760px) 76vw, (max-width: 1100px) 27vw, 320px"
                />
                <Image
                  className={styles.releaseTape}
                  src={release.tape}
                  alt=""
                  aria-hidden="true"
                  sizes="120px"
                />
              </Link>

              <h3 className={styles.releaseName}>{release.title}</h3>
              <Link
                className={styles.releaseButton}
                href={release.href}
                aria-label={`Listen to ${release.title} on the Music page`}
              >
                <span>Listen</span>
              </Link>
            </article>
          ))}
        </div>

        <Link
          className={styles.allReleasesLink}
          href={musicPath}
        >
          <span>View all releases</span>
        </Link>
      </div>
    </section>
  );
}
