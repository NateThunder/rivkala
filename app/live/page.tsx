import Image from "next/image";
import Link from "next/link";
import { Courier_Prime } from "next/font/google";
import SectionPage from "../section-page";
import bookingsBanner from "../../public/Live Page/rivkala_live_page_assets/bookings_enquiries_banner_transparent.png";
import headingArt from "../../public/Live Page/rivkala_live_page_assets/live_gigs_heading_transparent.png";
import portraitCollage from "../../public/Live Page/rivkala_live_page_assets/portrait_mic_collage_transparent.png";
import styles from "./live-page.module.css";

const liveType = Courier_Prime({
  variable: "--font-live-typewriter",
  subsets: ["latin"],
  weight: ["400", "700"],
});

type LiveEvent = {
  id: string;
  day: string;
  month: string;
  title: string;
  location: string;
  lineup: "SOLO" | "TRIO" | "DUO";
  time: string;
  ticketUrl?: string;
};

const contactHref = "/contact";

const liveEvents: LiveEvent[] = [
  {
    id: "aberdeen-jazz-festival",
    day: "15",
    month: "MAR",
    title: "ABERDEEN JAZZ FESTIVAL",
    location: "Aberdeen, Scotland",
    lineup: "SOLO",
    time: "DAY SHOW",
  },
  {
    id: "the-jazz-bar",
    day: "22",
    month: "MAR",
    title: "THE JAZZ BAR",
    location: "Edinburgh, Scotland",
    lineup: "TRIO",
    time: "7:30PM",
  },
  {
    id: "kelburn-garden-party",
    day: "05",
    month: "APR",
    title: "KELBURN GARDEN PARTY",
    location: "Argyll, Scotland",
    lineup: "TRIO",
    time: "2:00PM",
  },
  {
    id: "st-lukes",
    day: "18",
    month: "APR",
    title: "ST LUKES",
    location: "Glasgow, Scotland",
    lineup: "DUO",
    time: "8:00PM",
  },
];

const lineupClassNames: Record<LiveEvent["lineup"], string> = {
  SOLO: styles.lineupSolo,
  TRIO: styles.lineupTrio,
  DUO: styles.lineupDuo,
};

function isExternalUrl(href: string) {
  return /^https?:\/\//.test(href);
}

function EventRow({ event }: { event: LiveEvent }) {
  const href = event.ticketUrl ?? contactHref;
  const isExternal = isExternalUrl(href);
  const ariaLabel = `${event.title}, ${event.location}, ${event.day} ${event.month}, ${event.lineup}, ${event.time}. ${
    event.ticketUrl ? "Open tickets" : "Contact for tickets"
  }`;
  const rowContent = (
    <>
      <span className={styles.eventSticker} aria-hidden="true" />
      <span className={styles.eventDate} aria-hidden="true">
        <span className={styles.eventDay}>{event.day}</span>
        <span className={styles.eventMonth}>{event.month}</span>
      </span>
      <span className={styles.eventDetails}>
        <span className={styles.eventTitle}>{event.title}</span>
        <span className={styles.eventLocation}>{event.location}</span>
      </span>
      <span
        className={`${styles.lineupTag} ${lineupClassNames[event.lineup]}`}
      >
        {event.lineup}
      </span>
      <span className={styles.eventTime}>{event.time}</span>
      <span className={styles.ticketHitArea} aria-hidden="true">
        TICKETS ▶
      </span>
    </>
  );

  if (isExternal) {
    return (
      <a
        className={styles.eventLink}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
      >
        {rowContent}
      </a>
    );
  }

  return (
    <Link className={styles.eventLink} href={href} aria-label={ariaLabel}>
      {rowContent}
    </Link>
  );
}

export default function LivePage() {
  return (
    <SectionPage title="Live gigs" variant="live">
      <div className={`${styles.page} ${liveType.variable}`}>
        <div className={styles.poster}>
          <section className={styles.gigPanel} aria-label="Live dates">
            <div className={styles.headingCluster} aria-hidden="true">
              <Image
                className={styles.headingArt}
                src={headingArt}
                alt=""
                fetchPriority="high"
                sizes="(max-width: 900px) calc(100vw - 1.5rem), (max-width: 1300px) 47.6vw, 37.4rem"
              />
            </div>

            <ul className={styles.eventList}>
              {liveEvents.map((event) => (
                <li className={styles.eventItem} key={event.id}>
                  <EventRow event={event} />
                </li>
              ))}
            </ul>
          </section>

          <div className={styles.collage} aria-hidden="true">
            <Image
              className={styles.collageImage}
              src={portraitCollage}
              alt=""
              sizes="(max-width: 900px) min(92vw, 28rem), (max-width: 1300px) 36vw, 34rem"
            />
          </div>

          <Link
            className={styles.bookingLink}
            href="/contact"
            aria-label="Bookings and enquiries"
          >
            <Image
              src={bookingsBanner}
              alt=""
              sizes="(max-width: 900px) 86vw, 28rem"
            />
          </Link>
        </div>
      </div>
    </SectionPage>
  );
}
