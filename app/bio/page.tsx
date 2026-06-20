import type { Metadata } from "next";
import Image from "next/image";
import { Courier_Prime, Playfair_Display } from "next/font/google";
import SectionPage from "../section-page";
import { epk } from "../epk/epk-data";
import BioDepth from "./bio-depth";
import styles from "./bio-page.module.css";

import portrait from "../../public/IMAGES OF ME/Rivkala-creditMarianaPires-3.jpg";
import seated from "../../public/IMAGES OF ME/Rivkala-creditMarianaPires-2.jpg";
import performance from "../../public/IMAGES OF ME/MOBO 5.jpg";
import chessStill from "../../public/IMAGES OF ME/Chess still.jpg";
import lamp from "../../public/rivkala_featured_releases_assets/decor/vintage-fringe-lamp-web.png";
import flower from "../../public/video_section_separated_assets/flower.png";

const typewriter = Courier_Prime({
  variable: "--font-bio-typewriter",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const display = Playfair_Display({
  variable: "--font-bio-display",
  subsets: ["latin"],
  weight: ["700", "900"],
});

export const metadata: Metadata = {
  title: "Bio | Rivkala",
  description:
    "Meet Rivkala, a singer and storyteller weaving vintage soul with bold theatrical flair.",
};

function Photo({
  className,
  image,
  alt,
  priority = false,
}: {
  className: string;
  image: typeof portrait;
  alt: string;
  priority?: boolean;
}) {
  return (
    <figure className={`${styles.photo} ${className}`}>
      <span className={styles.tape} aria-hidden="true" />
      <div className={styles.photoInner}>
        <Image src={image} alt={alt} fill priority={priority} sizes="(max-width: 760px) 88vw, 30vw" />
      </div>
    </figure>
  );
}

export default function BioPage() {
  return (
    <SectionPage title="About Rivkala" variant="contact">
      <div className={`${styles.page} ${typewriter.variable} ${display.variable}`}>
        <BioDepth>
          <header className={styles.intro}>
            <div className={styles.ransomTitle} aria-hidden="true">
              <span>A</span><span>B</span><span className={styles.red}>O</span><span>U</span><span>T</span>
              <em>me</em>
            </div>
            <h2 className="sr-only">About me</h2>
            <p className={styles.tagline}>
              A LITTLE BIT DRAMATIC.<br />
              <strong>A LOT BIT TRUE.</strong>
            </p>
          </header>

          <article className={styles.bioPaper}>
            <p>{epk.shortBio}</p>
            {epk.longBio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <h3>Selected credits</h3>
            <p>{epk.achievements.slice(0, 5).join(" · ")}</p>
          </article>

          <Photo className={styles.heroPhoto} image={portrait} alt="Rivkala in a pinstripe suit looking to the side" priority />
          <Photo className={styles.seatedPhoto} image={seated} alt="Rivkala seated in a black-and-white studio portrait" />
          <Photo className={styles.livePhoto} image={performance} alt="Rivkala singing live beneath stage lights" />
          <Photo className={styles.chessPhoto} image={chessStill} alt="Rivkala in a cinematic scene beside a fringed lamp" />

          <blockquote className={styles.quote}>
            I don&apos;t just sing songs—<br />I <strong>live</strong> in them.
          </blockquote>

          <div className={styles.surreal} aria-hidden="true">
            <Image className={styles.lamp} src={lamp} alt="" />
            <div className={styles.faceCrop}>
              <Image src={portrait} alt="" fill sizes="22rem" />
            </div>
          </div>

          <Image className={styles.flower} src={flower} alt="" aria-hidden="true" />
          <div className={styles.tornBottom} aria-hidden="true" />
        </BioDepth>
      </div>
    </SectionPage>
  );
}
