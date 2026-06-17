"use client";

import { useState } from "react";
import "./rivkala-dada-menu.css";

const navItems = ["Music", "Videos", "EPK", "Shop", "Contact"];

export default function RivkalaDadaMenuPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className={`rivkala-page ${menuOpen ? "is-menu-open" : ""}`}>
      <section className="rivkala-hero" aria-label="Rivkala home hero">
        <header className="rivkala-topbar">
          <a className="rivkala-logo" href="#top" aria-label="Rivkala home">
            RIVKALA
          </a>

          <button
            className="rivkala-menu-button"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        <div className="hero-collage" id="top">
          <img
            className="hero-rust-scrap"
            src="/rivkala-assets/images/fabric-rust-scrap.png"
            alt=""
            aria-hidden="true"
          />
          <div className="hero-title" aria-label="Showgirl, singer and storyteller">
            <span className="title-paper title-paper-cream title-show">Showgirl,</span>
            <span className="title-paper title-paper-pink title-singer">singer</span>
            <span className="title-paper title-paper-cream title-story">storyteller</span>
          </div>
        </div>

        <div className="hero-rule" aria-hidden="true">
          <span />
        </div>

        <div className="hero-actions" aria-label="Main actions">
          <a className="hero-action hero-action-red" href="#music">
            Listen <span aria-hidden="true">▶</span>
          </a>
          <a className="hero-action hero-action-dark" href="#videos">
            Watch <span aria-hidden="true">▶</span>
          </a>
          <a className="hero-action hero-action-light" href="#epk">
            Download EPK <span aria-hidden="true">◆</span>
          </a>
        </div>
      </section>

      <div
        className="menu-scrim"
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
      />

      <aside className="dada-slide-menu" aria-hidden={!menuOpen}>
        <button
          className="menu-close"
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        >
          ×
        </button>

        <div className="menu-art-stack" aria-hidden="true">
          <img className="menu-polaroid" src="/rivkala-assets/images/abstract-polaroid.png" alt="" />
          <img className="menu-tape" src="/rivkala-assets/images/tape-beige.png" alt="" />
          <img className="menu-heart" src="/rivkala-assets/images/heart-eye.png" alt="" />
          <img className="menu-pink-strip" src="/rivkala-assets/images/nav-paper-pink.png" alt="" />
        </div>

        <nav className="menu-links" aria-label="Main menu">
          {navItems.map((item, index) => (
            <a
              key={item}
              className={`menu-link menu-link-${index + 1}`}
              href={`#${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
            >
              <span>{item}</span>
            </a>
          ))}
        </nav>

        <img className="menu-grid" src="/rivkala-assets/images/grid-paper-scrap.png" alt="" aria-hidden="true" />
        <img className="menu-news" src="/rivkala-assets/images/newspaper-scrap.png" alt="" aria-hidden="true" />
        <img className="menu-arc" src="/rivkala-assets/images/olive-arc-cutout.png" alt="" aria-hidden="true" />
      </aside>
    </main>
  );
}
