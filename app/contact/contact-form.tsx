"use client";

import type { StaticImageData } from "next/image";
import Image from "next/image";
import { type FormEvent, useRef, useState } from "react";
import styles from "./contact-page.module.css";

const contactLinks = [
  { label: "Email", href: "mailto:rivkala.music@gmail.com", icon: "email", external: false },
  { label: "Instagram", href: "https://www.instagram.com/rivkalalala/", icon: "instagram", external: true },
  { label: "YouTube", href: "https://www.youtube.com/channel/UCxH-RkJQ2DIAv_eFiP-pn8Q", icon: "youtube", external: true },
  { label: "TikTok", href: "https://www.tiktok.com/@rivkalalala", icon: "tiktok", external: true },
] as const;

type ContactIconName = (typeof contactLinks)[number]["icon"];
type Status = { tone: "idle" | "success" | "error"; message: string };

function ContactIcon({ name }: { name: ContactIconName }) {
  if (name === "email") return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3.75 5.75h16.5v12.5H3.75z" /><path d="m4.5 6.5 7.5 6 7.5-6" /></svg>;
  if (name === "instagram") return <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="4" /><circle className={styles.iconDot} cx="17.4" cy="6.7" r="1" /></svg>;
  if (name === "youtube") return <svg aria-hidden="true" viewBox="0 0 24 24"><path className={styles.iconFill} d="M21.2 7.15a2.75 2.75 0 0 0-1.94-1.94C17.55 4.75 12 4.75 12 4.75s-5.55 0-7.26.46A2.75 2.75 0 0 0 2.8 7.15 28.5 28.5 0 0 0 2.35 12c0 1.63.15 3.26.45 4.85a2.75 2.75 0 0 0 1.94 1.94c1.71.46 7.26.46 7.26.46s5.55 0 7.26-.46a2.75 2.75 0 0 0 1.94-1.94c.3-1.59.45-3.22.45-4.85s-.15-3.26-.45-4.85Z" /><path className={styles.iconCutout} d="m10 15.2 5-3.2-5-3.2Z" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path className={styles.iconFill} d="M13.2 2.5h3.35a5.8 5.8 0 0 0 4.95 4.95v3.35a9.1 9.1 0 0 1-4.9-1.43v6.03a6.9 6.9 0 1 1-6.9-6.9c.4 0 .8.04 1.18.1v3.43a3.55 3.55 0 1 0 2.32 3.33Z" /></svg>;
}

export default function ContactForm({ paperTexture }: { paperTexture: StaticImageData }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<Status>({ tone: "idle", message: "We usually reply as soon as the velvet curtain permits." });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setStatus({ tone: "idle", message: "Sending your message…" });

    try {
      const response = await fetch("/api/contact", { method: "POST", body: new FormData(event.currentTarget) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Your message could not be sent.");
      formRef.current?.reset();
      setStatus({ tone: "success", message: "Message sent. Thank you — Rivkala will be in touch." });
    } catch (error) {
      setStatus({ tone: "error", message: error instanceof Error ? error.message : "Your message could not be sent." });
    } finally {
      setPending(false);
    }
  }

  return (
      <div className={styles.formPaper}>
        <Image className={styles.paperTexture} src={paperTexture} alt="" fill loading="eager" sizes="(max-width: 760px) calc(100vw - 2rem), 34rem" />
        <form ref={formRef} className={styles.form} aria-describedby="contact-form-status" onSubmit={submit}>
          <div className={styles.honeypot} aria-hidden="true"><label htmlFor="contact-company">Company website</label><input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" /></div>
          <div className={styles.field}><label htmlFor="contact-name">Name</label><input id="contact-name" name="name" type="text" autoComplete="name" maxLength={100} required /></div>
          <div className={styles.field}><label htmlFor="contact-email">Email</label><input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} required /></div>
          <div className={styles.field}><label htmlFor="contact-subject">Subject</label><input id="contact-subject" name="subject" type="text" maxLength={160} /></div>
          <div className={`${styles.field} ${styles.messageField}`}><label htmlFor="contact-message">Message</label><textarea id="contact-message" name="message" minLength={10} maxLength={5000} required /></div>
          <label className={styles.mailingListOptOut}>
            <input name="mailingListOptOut" type="checkbox" />
            <span>Don&apos;t add me to the mailing list.</span>
          </label>
          <button className={styles.sendButton} type="submit" disabled={pending}>{pending ? "Sending…" : "Send"}</button>
          <p className={`${styles.formStatus} ${status.tone === "error" ? styles.formStatusError : ""} ${status.tone === "success" ? styles.formStatusSuccess : ""}`} id="contact-form-status" role="status" aria-live="polite">{status.message}</p>
          <nav className={styles.socialNav} aria-label="Contact Rivkala directly"><ul className={styles.socialList}>{contactLinks.map(({ external, href, icon, label }) => <li key={label}><a className={styles.socialLink} href={href} aria-label={label} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}><ContactIcon name={icon} /></a></li>)}</ul></nav>
        </form>
      </div>
  );
}
