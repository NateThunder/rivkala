"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import logo from "../public/Gemini_Generated_Image_4mr1b44mr1b44mr1-removebg-preview.png";

const navItems = [
  { href: "/music", label: "Music" },
  { href: "/videos", label: "Videos" },
  { href: "/epk", label: "EPK" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.body.classList.add("site-nav-drawer-open");
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("site-nav-drawer-open");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <nav
      className={`site-nav${isMenuOpen ? " site-nav--drawer-open" : ""}`}
      aria-label="Primary"
    >
      <Link
        href="/"
        className="site-nav__brand"
        aria-label="Rivkala home"
        onClick={() => setIsMenuOpen(false)}
      >
        <Image
          className="site-nav__logo"
          src={logo}
          alt=""
          priority
        />
      </Link>

      <button
        type="button"
        className="site-nav__menu-button"
        aria-controls="primary-navigation-menu"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? "Close primary navigation" : "Open primary navigation"}
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
      >
        <span className="site-nav__menu-bar" aria-hidden="true" />
        <span className="site-nav__menu-bar" aria-hidden="true" />
        <span className="site-nav__menu-bar" aria-hidden="true" />
      </button>

      <button
        type="button"
        className="site-nav__drawer-backdrop"
        aria-label="Close primary navigation"
        aria-hidden={!isMenuOpen}
        disabled={!isMenuOpen}
        tabIndex={isMenuOpen ? 0 : -1}
        onClick={() => setIsMenuOpen(false)}
      />

      <ul
        id="primary-navigation-menu"
        className={`site-nav__list${isMenuOpen ? " site-nav__list--open" : ""}`}
      >
        {navItems.map(({ href, label }) => {
          const isActive = pathname === href;

          return (
            <li key={href} className="site-nav__item">
              <Link
                href={href}
                className={`site-nav__link${isActive ? " site-nav__link--active" : ""}`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                <span>{label}</span>
                <span className="site-nav__indicator" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
