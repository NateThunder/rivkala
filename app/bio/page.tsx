import type { Metadata } from "next";
import Image from "next/image";
import { Courier_Prime } from "next/font/google";
import SectionPage from "../section-page";
import { epk } from "../epk/epk-data";
import BioDepth from "./bio-depth";
import styles from "./bio-page.module.css";

import portrait from "../../public/IMAGES OF ME/DSC02103.jpg";
import seated from "../../public/IMAGES OF ME/DSC02478 (1).jpg";
import performance from "../../public/IMAGES OF ME/DTD02673.jpg";
import chessStill from "../../public/IMAGES OF ME/Martini 1.jpg";
import aboutCollage from "../../public/About Page/about collage 2.png";
import faceCollage from "../../public/collage/Untitled_Artwork 7.png";

const typewriter = Courier_Prime({
  variable: "--font-bio-typewriter",
  subsets: ["latin"],
  weight: ["400", "700"],
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
      <div className={`${styles.page} ${typewriter.variable}`}>
        <BioDepth>
          <header className={styles.intro}>
            <Image
              className={styles.aboutTitle}
              src={aboutCollage}
              alt="About me"
              priority
            />
            <h2 className="sr-only">About me</h2>
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

          <Image
            className={styles.faceCollage}
            src={faceCollage}
            alt=""
            aria-hidden="true"
          />
        </BioDepth>
      </div>
    </SectionPage>
  );
}
