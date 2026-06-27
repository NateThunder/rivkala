import type { Metadata } from "next";
import Image from "next/image";
import { Bodoni_Moda } from "next/font/google";
import SectionPage from "../section-page";
import { epk } from "../epk/epk-data";
import BioPosterParallax from "./bio-poster-parallax";
import styles from "./bio-page.module.css";

import edgeFigure from "../../public/collage/Untitled_Artwork 3.png";
import edgeLamp from "../../public/collage/Untitled_Artwork 4.png";
import edgeEyelashes from "../../public/collage/Untitled_Artwork 5.png";
import edgeEyeLips from "../../public/collage/Untitled_Artwork 6.png";
import edgeFace from "../../public/collage/Untitled_Artwork 7.png";
import autograph from "../../public/collage/autograph.png";

const serif = Bodoni_Moda({
  variable: "--font-bio-serif",
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  title: "Bio | Rivkala",
  description:
    "Meet Rivkala, a singer and storyteller weaving vintage soul with bold theatrical flair.",
};

export default function BioPage() {
  return (
    <SectionPage title="Rivkala" variant="contact">
      <div className={`${styles.page} ${serif.variable}`}>
        <BioPosterParallax className={styles.poster}>
          <div
            className={`${styles.lampFrame} ${styles.lampLeft}`}
            aria-hidden="true"
          >
            <Image
              src={edgeFigure}
              alt=""
              fill
              sizes="(max-width: 900px) 22vw, 14rem"
              priority
            />
          </div>

          <div
            className={`${styles.edgeCollage} ${styles.edgeLamp}`}
            aria-hidden="true"
          >
            <Image
              src={edgeLamp}
              alt=""
              sizes="(max-width: 820px) 34vw, (max-width: 1100px) 24vw, 19rem"
            />
          </div>

          <div
            className={`${styles.edgeCollage} ${styles.edgeFace}`}
            aria-hidden="true"
          >
            <Image
              src={edgeFace}
              alt=""
              sizes="(max-width: 820px) 52vw, (max-width: 1100px) 28vw, 23rem"
            />
          </div>

          <div
            className={`${styles.edgeCollage} ${styles.mobileBottomCollage} ${styles.bottomEyelashes}`}
            aria-hidden="true"
          >
            <Image
              src={edgeEyelashes}
              alt=""
              sizes="(max-width: 820px) 34vw, 1px"
            />
          </div>

          <div
            className={`${styles.edgeCollage} ${styles.mobileBottomCollage} ${styles.bottomEyeLips}`}
            aria-hidden="true"
          >
            <Image
              src={edgeEyeLips}
              alt=""
              sizes="(max-width: 820px) 38vw, 1px"
            />
          </div>

          <section className={styles.titleBlock} aria-labelledby="bio-title">
            <h2 id="bio-title" className="sr-only">
              Rivkala biography
            </h2>
            <Image
              className={styles.signature}
              src={autograph}
              alt=""
              priority
              sizes="(max-width: 820px) calc(100vw - 3rem), 43rem"
            />

            <p className={styles.pronunciation}>
              <span>{epk.pronunciation}</span>
              <span className={styles.pronouns}>she/her</span>
            </p>
          </section>

          <section className={styles.copyBlock} aria-label="Biography">
            <p>
              <strong>Showgirl, singer and storyteller,</strong> Rivkala is an
              award-winning multidisciplinary jazz/soul artist, vocalist, writer
              and bandleader, gaining growing regional attention through TV
              features on <strong>BBC Look North</strong> and{" "}
              <strong>ITV Tyne Tees</strong>, and national radio coverage on{" "}
              <strong>BBC Radio 3</strong>, <strong>JazzFM</strong>,{" "}
              <strong>Selector Radio</strong> and{" "}
              <strong>BBC Introducing Manchester/NE</strong>.
            </p>

            <p>
              Within the campy vessel of her{" "}
              <strong>larger than life cabaret bar,</strong>{" "}
              <strong>Crushed Velvet</strong>, Rivkala and her esteemed 6 piece
              band blend{" "}
              <strong>influences of jazz, soul, funk, and klezmer</strong> to
              orchestrate provocatively playful social commentaries on{" "}
              <strong>gender, wealth inequality and mental health</strong>.
              Under the warm glow of her beloved lamp Lucille, they balance
              serious grooves with comedic theatricality.
            </p>
          </section>
        </BioPosterParallax>
      </div>
    </SectionPage>
  );
}
