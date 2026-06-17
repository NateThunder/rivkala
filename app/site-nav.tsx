"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import logo from "../public/Gemini_Generated_Image_4mr1b44mr1b44mr1-removebg-preview.png";

const navItems = [
  { href: "/music", label: "Music", graphic: true },
  { href: "/videos", label: "Videos" },
  { href: "/epk", label: "EPK" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tappedHref, setTappedHref] = useState<string | null>(null);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    return () => {
      if (tapTimerRef.current !== null) {
        clearTimeout(tapTimerRef.current);
      }
    };
  }, []);

  const triggerTap = (href: string) => {
    if (tapTimerRef.current !== null) {
      clearTimeout(tapTimerRef.current);
    }

    setTappedHref(href);
    tapTimerRef.current = setTimeout(() => {
      setTappedHref((currentHref) => (currentHref === href ? null : currentHref));
      tapTimerRef.current = null;
    }, 180);
  };

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
      />

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
        {navItems.map(({ href, label, graphic }) => {
          const isActive = pathname === href;

          return (
            <li
              key={href}
              className={`site-nav__item${graphic ? " site-nav__item--graphic" : ""}`}
            >
              <Link
                href={href}
                className={`site-nav__link${
                  isActive ? " site-nav__link--active" : ""
                }${graphic ? " site-nav__link--graphic" : ""}${
                  tappedHref === href ? " site-nav__link--tapped" : ""
                }`}
                aria-current={isActive ? "page" : undefined}
                aria-label={label}
                onPointerDown={() => triggerTap(href)}
                onClick={() => {
                  triggerTap(href);
                  setIsMenuOpen(false);
                }}
              >
                <span className="site-nav__label">{label}</span>
                <span className="site-nav__indicator" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
