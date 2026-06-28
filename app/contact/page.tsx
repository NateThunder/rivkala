import type { Metadata } from "next";
import Image from "next/image";
import { Bodoni_Moda, Courier_Prime } from "next/font/google";
import SectionPage from "../section-page";
import contactPaper from "../../public/Backgrounds/contact paper.png";
import contactHeader from "../../public/collage/contact header-no -bg.png";
import ContactCollage from "./contact-collage";
import styles from "./contact-page.module.css";

const bodoniModa = Bodoni_Moda({
  variable: "--font-contact-serif",
  subsets: ["latin"],
  weight: "variable",
});

const courierPrime = Courier_Prime({
  variable: "--font-contact-typewriter",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Contact | Rivkala",
  description:
    "Contact Rivkala for bookings, press, collaborations, and beautifully absurd ideas.",
};

const contactLinks = [
  {
    label: "Email",
    href: "mailto:rivkala.music@gmail.com",
    icon: "email",
    external: false,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/rivkalalala/",
    icon: "instagram",
    external: true,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCxH-RkJQ2DIAv_eFiP-pn8Q",
    icon: "youtube",
    external: true,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@rivkalalala",
    icon: "tiktok",
    external: true,
  },
] as const;

type ContactIconName = (typeof contactLinks)[number]["icon"];

function ContactIcon({ name }: { name: ContactIconName }) {
  if (name === "email") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M3.75 5.75h16.5v12.5H3.75z" />
        <path d="m4.5 6.5 7.5 6 7.5-6" />
      </svg>
    );
  }

  if (name === "instagram") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
        <circle cx="12" cy="12" r="4" />
        <circle className={styles.iconDot} cx="17.4" cy="6.7" r="1" />
      </svg>
    );
  }

  if (name === "youtube") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path
          className={styles.iconFill}
          d="M21.2 7.15a2.75 2.75 0 0 0-1.94-1.94C17.55 4.75 12 4.75 12 4.75s-5.55 0-7.26.46A2.75 2.75 0 0 0 2.8 7.15 28.5 28.5 0 0 0 2.35 12c0 1.63.15 3.26.45 4.85a2.75 2.75 0 0 0 1.94 1.94c1.71.46 7.26.46 7.26.46s5.55 0 7.26-.46a2.75 2.75 0 0 0 1.94-1.94c.3-1.59.45-3.22.45-4.85s-.15-3.26-.45-4.85Z"
        />
        <path className={styles.iconCutout} d="m10 15.2 5-3.2-5-3.2Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        className={styles.iconFill}
        d="M13.2 2.5h3.35a5.8 5.8 0 0 0 4.95 4.95v3.35a9.1 9.1 0 0 1-4.9-1.43v6.03a6.9 6.9 0 1 1-6.9-6.9c.4 0 .8.04 1.18.1v3.43a3.55 3.55 0 1 0 2.32 3.33Z"
      />
    </svg>
  );
}

function ContactTitle() {
  return (
    <div className={styles.titleBlock} aria-hidden="true">
      <Image
        className={styles.titleImage}
        src={contactHeader}
        alt=""
        priority
        sizes="(max-width: 760px) calc(80vw - 1.2rem), 40rem"
      />
    </div>
  );
}

function ContactForm() {
  return (
    <div className={styles.formPaper}>
      <Image
        className={styles.paperTexture}
        src={contactPaper}
        alt=""
        fill
        loading="eager"
        sizes="(max-width: 760px) calc(100vw - 2rem), 34rem"
      />

      <form className={styles.form} aria-describedby="contact-form-status">
        <div className={styles.field}>
          <label htmlFor="contact-name">Name</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-subject">Subject</label>
          <input id="contact-subject" name="subject" type="text" />
        </div>

        <div className={`${styles.field} ${styles.messageField}`}>
          <label htmlFor="contact-message">Message</label>
          <textarea id="contact-message" name="message" required />
        </div>

        <button className={styles.sendButton} type="submit" disabled>
          Send
        </button>

        <p className={styles.formStatus} id="contact-form-status">
          Online sending is coming soon. For now, email{" "}
          <a href="mailto:rivkala.music@gmail.com">
            rivkala.music@gmail.com
          </a>
          .
        </p>

        <nav
          className={styles.socialNav}
          aria-label="Contact Rivkala directly"
        >
          <ul className={styles.socialList}>
            {contactLinks.map(({ external, href, icon, label }) => (
              <li key={label}>
                <a
                  className={styles.socialLink}
                  href={href}
                  aria-label={label}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                >
                  <ContactIcon name={icon} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </form>
    </div>
  );
}

export default function ContactPage() {
  return (
    <SectionPage title="Contact" variant="contact">
      <div
        className={`${styles.page} ${bodoniModa.variable} ${courierPrime.variable}`}
      >
        <div className={styles.poster}>
          <ContactTitle />

          <div className={styles.formPosition}>
            <ContactForm />
          </div>

          <ContactCollage />
        </div>
      </div>
    </SectionPage>
  );
}
