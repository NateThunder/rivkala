import Image from "next/image";
import Link from "next/link";
import { Courier_Prime } from "next/font/google";
import SectionPage from "../section-page";
import bookingsBanner from "../../public/Live Page/rivkala_live_page_assets/bookings_enquiries_banner_transparent.png";
import headingArt from "../../public/Live Page/rivkala_live_page_assets/live_gigs_heading_transparent.png";
import livePoster from "../../public/Live Page/live poster.png";
import { getUpcomingPublicGigs } from "@/lib/admin/content";
import type { LineupPreset, PublicGig } from "@/lib/admin/types";
import styles from "./live-page.module.css";

export const dynamic = "force-dynamic";

const liveType = Courier_Prime({
  variable: "--font-live-typewriter",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const lineupClassNames: Record<LineupPreset, string> = {
  SOLO: styles.lineupSolo,
  TRIO: styles.lineupTrio,
  DUO: styles.lineupDuo,
  "FULL BAND": styles.lineupFullBand,
  OTHER: styles.lineupOther,
};

function isExternalUrl(href: string) {
  return /^https?:\/\//.test(href);
}

function EventRow({ event }: { event: PublicGig }) {
  const href = event.ticketUrl;
  const isExternal = isExternalUrl(href);
  const ariaLabel = `${event.title}, ${event.location}, ${event.day} ${event.month}, ${event.lineup}, ${event.time}. ${
    event.ticketUrl ? "Open tickets" : "Free gig"
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
      <span className={`${styles.lineupTag} ${lineupClassNames[event.lineupPreset]}`}>
        {event.lineup}
      </span>
      <span className={styles.eventTime}>{event.time}</span>
      <span className={styles.ticketHitArea} aria-hidden="true">
        {event.ticketUrl ? "TICKETS >" : "FREE GIG"}
      </span>
    </>
  );

  if (!href) {
    return (
      <div className={`${styles.eventLink} ${styles.eventLinkFree}`} aria-label={ariaLabel}>
        {rowContent}
      </div>
    );
  }

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

export default async function LivePage() {
  const liveEvents = await getUpcomingPublicGigs();

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

            {liveEvents.length ? (
              <ul className={styles.eventList}>
                {liveEvents.map((event) => (
                  <li className={styles.eventItem} key={event.id}>
                    <EventRow event={event} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>
                <p>More dates soon</p>
                <Link href="/contact">Bookings and enquiries</Link>
              </div>
            )}
          </section>

          <div className={styles.collage} aria-hidden="true">
            <Image
              className={styles.collageImage}
              src={livePoster}
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
