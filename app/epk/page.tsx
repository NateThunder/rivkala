import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Bodoni_Moda, Courier_Prime } from "next/font/google";
import epkHeader from "../../public/About Page/EPK.png";
import pressPhotosHeader from "../../public/About Page/Press Photos.png";
import greenRippedPaper from "../../public/Backgrounds/green ripped paper.png";
import pinkRippedPaper from "../../public/Backgrounds/pink ripped paper.png";
import pinnedPaper from "../../public/Backgrounds/paper with pin.png";
import pinnedStoryPaper from "../../public/Backgrounds/paper with pin 2.png";
import redRippedPaper from "../../public/Backgrounds/red ripped papers.png";
import socialImage from "../../public/IMAGES OF ME/Rivkala-creditMarianaPires-4.jpg";
import yellowRippedPaper from "../../public/Backgrounds/yellow ripped paper.png";
import SiteNav from "../site-nav";
import { epk, pressPhotos } from "./epk-data";
import styles from "./epk-page.module.css";

const bodoniModa = Bodoni_Moda({
  variable: "--font-epk-serif",
  subsets: ["latin"],
  weight: "variable",
});

const courierPrime = Courier_Prime({
  variable: "--font-epk-typewriter",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Electronic Press Kit | Rivkala",
  description:
    "Rivkala's official electronic press kit: biography, selected credits, music, video, press photography and booking contact.",
  openGraph: {
    title: "Rivkala — Electronic Press Kit",
    description:
      "Biography, selected credits, music, video, press photography and booking contact for Rivkala.",
    type: "website",
    images: [
      {
        url: socialImage.src,
        width: socialImage.width,
        height: socialImage.height,
        alt: "Rivkala press portrait by Mariana Pires",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rivkala — Electronic Press Kit",
    description:
      "Biography, selected credits, music, video, press photography and booking contact.",
    images: [socialImage.src],
  },
};

function ActionLink({
  children,
  className = "",
  ...props
}: React.ComponentProps<"a">) {
  return (
    <a className={`${styles.action} ${className}`} {...props}>
      {children}
    </a>
  );
}

export default function EpkPage() {
  return (
    <main className={`${styles.page} ${bodoniModa.variable} ${courierPrime.variable}`}>
      <video
        className={styles.videoBackground}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source
          src="/Stop%20Motion/My_Stop_Motion_Movie.mp4"
          type="video/mp4"
        />
      </video>
      <div className={styles.wall} aria-hidden="true" />

      <header className={styles.siteHeader}>
        <SiteNav />
      </header>

      <div className={styles.epkHeader}>
        <Image
          src={epkHeader}
          alt="EPK"
          priority
          sizes="(max-width: 760px) 94vw, 54rem"
        />
      </div>

      <section className={styles.hero} aria-labelledby="epk-title">
        <div className={styles.heroCopy}>
          <Image
            className={styles.heroPaperTexture}
            src={pinnedPaper}
            alt=""
            fill
            priority
            sizes="(max-width: 760px) calc(100vw - 1.5rem), 44vw"
          />
          <div className={styles.heroContent}>
          <p className={styles.kicker}>Official electronic press kit</p>
          <h1 id="epk-title">Rivkala</h1>
          <p className={styles.pronunciation}>
            {epk.pronunciation} <span>·</span> {epk.pronouns}
          </p>
          <p className={styles.strapline}>{epk.strapline}</p>
          <p className={styles.heroIntro}>{epk.shortBio}</p>

          <nav className={styles.heroActions} aria-label="EPK actions">
            <ActionLink
              className={styles.actionDark}
              href={epk.pdfHref}
              download="RIVKALA EPK OFFICIAL.pdf"
            >
              Download PDF
            </ActionLink>
            <ActionLink href={`mailto:${epk.contactEmail}`}>Book / press</ActionLink>
          </nav>
          </div>
        </div>
      </section>

      <section className={styles.story} aria-labelledby="story-title">
        <div className={styles.storyPaper}>
          <Image
            className={styles.storyPaperTexture}
            src={pinnedStoryPaper}
            alt=""
            fill
            sizes="(max-width: 760px) calc(100vw - 2rem), 46rem"
          />
          <p className={styles.sectionKicker}>The story so far</p>
          <h2 id="story-title">Cabaret with teeth.</h2>
          <p>{epk.shortBio}</p>
          <details className={styles.bioDisclosure}>
            <summary>Read full bio</summary>
            <div className={styles.longBio}>
              {epk.longBio.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </details>
        </div>

        <div className={styles.proof} aria-labelledby="proof-title">
          <Image
            className={styles.proofPaperTexture}
            src={greenRippedPaper}
            alt=""
            fill
            sizes="(max-width: 760px) calc(100vw - 2rem), 32rem"
          />
          <h2 id="proof-title">Selected credits</h2>
          <ul>
            {epk.achievements.map((achievement) => (
              <li key={achievement}>{achievement}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.quotes} aria-label="Selected press quotes">
        {epk.quotes.map((quote, index) => (
          <figure
            className={styles.quote}
            style={{ "--quote-index": index } as React.CSSProperties}
            key={quote.text}
          >
            {index === 0 && (
              <Image
                className={styles.quotePaperTexture}
                src={pinkRippedPaper}
                alt=""
                fill
                sizes="(max-width: 760px) calc(100vw - 2rem), 28rem"
              />
            )}
            {index === 1 && (
              <Image
                className={styles.quotePaperTexture}
                src={redRippedPaper}
                alt=""
                fill
                sizes="(max-width: 760px) calc(100vw - 2rem), 28rem"
              />
            )}
            {index === 2 && (
              <Image
                className={styles.quotePaperTexture}
                src={yellowRippedPaper}
                alt=""
                fill
                sizes="(max-width: 760px) calc(100vw - 2rem), 28rem"
              />
            )}
            <blockquote>“{quote.text}”</blockquote>
            <figcaption>— {quote.source}</figcaption>
          </figure>
        ))}
      </section>

      <section className={styles.photos} aria-labelledby="photos-title">
        <div className={styles.photosHeading}>
          <h2 className="sr-only" id="photos-title">
            Press photos
          </h2>
          <Image
            className={styles.photosTitle}
            src={pressPhotosHeader}
            alt=""
            aria-hidden="true"
            sizes="(max-width: 760px) 72vw, 34rem"
          />
        </div>

        <div className={styles.photoGrid} id="press-photo-grid">
          {pressPhotos.map((photo, index) => (
            <figure
              className={styles.photoCard}
              style={{ "--photo-index": index } as React.CSSProperties}
              key={photo.label}
            >
              <div className={styles.photoImage}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 620px) calc(100vw - 4rem), (max-width: 1000px) 42vw, 24rem"
                />
              </div>
              <figcaption>
                <span>
                  <strong>{photo.label}</strong>
                  {photo.credit}
                </span>
                <a href={photo.src.src} download={photo.downloadName}>
                  Download
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={styles.contact} aria-labelledby="contact-title">
        <div>
          <p className={styles.sectionKicker}>Bookings · press · collaborations</p>
          <h2 id="contact-title">Bring Rivkala into the room.</h2>
          <a className={styles.email} href={`mailto:${epk.contactEmail}`}>
            {epk.contactEmail}
          </a>
        </div>
        <nav className={styles.contactActions} aria-label="Professional contact options">
          <ActionLink className={styles.actionCream} href={`mailto:${epk.contactEmail}`}>
            Email directly
          </ActionLink>
          <Link className={`${styles.action} ${styles.actionCream}`} href="/contact">
            Contact page
          </Link>
          <ActionLink
            className={styles.actionOutline}
            href={epk.pdfHref}
            download="RIVKALA EPK OFFICIAL.pdf"
          >
            Download PDF
          </ActionLink>
        </nav>
      </section>
    </main>
  );
}
