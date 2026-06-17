import type { ReactNode } from "react";
import SiteNav from "./site-nav";

type SectionPageProps = {
  title: string;
  children?: ReactNode;
};

export default function SectionPage({ children, title }: SectionPageProps) {
  return (
    <main className="section-page">
      <div className="section-page__bg section-page__bg--hero" aria-hidden="true" />
      <div className="section-page__bg section-page__bg--paper" aria-hidden="true" />

      <header className="section-page__header">
        <SiteNav />
      </header>

      <section className="section-page__content">
        <h1 className="sr-only">{title}</h1>
        {children}
      </section>
    </main>
  );
}
