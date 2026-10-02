import type { Metadata } from "next";
import Image from "next/image";
import { Bodoni_Moda, Courier_Prime } from "next/font/google";
import SectionPage from "../section-page";
import contactPaper from "../../public/Backgrounds/contact paper.png";
import contactHeader from "../../public/collage/contact header-no -bg.png";
import ContactCollage from "./contact-collage";
import ContactForm from "./contact-form";
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

export default function ContactPage() {
  return (
    <SectionPage title="Contact" variant="contact">
      <div
        className={`${styles.page} ${bodoniModa.variable} ${courierPrime.variable}`}
      >
        <div className={styles.poster}>
          <ContactTitle />

          <div className={styles.formPosition}>
            <ContactForm paperTexture={contactPaper} />
          </div>

          <ContactCollage />
        </div>
      </div>
    </SectionPage>
  );
}
