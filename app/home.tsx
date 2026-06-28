import Image from "next/image";
import Link from "next/link";
import "./home.css";
import bannerText from "../public/banner text.png";
import headshot from "../public/Bex photos/headshot transparent background.png";
import FeaturedVideo from "./featured-video";
import FeaturedReleases from "./featured-releases";
import SiteNav from "./site-nav";

export default function HomeView() {
  return (
    <main className="home">
      <div className="home__bg home__bg--paper" aria-hidden="true" />
      <div className="home__bg home__bg--hero" aria-hidden="true" />

      <div className="home__masthead">
        <div className="home__masthead-inner">
          <SiteNav />
        </div>
      </div>

      <section className="home__hero">
        <div className="home__inner">
          <h1 className="home__sr-only">Rivkala</h1>

          <div className="home__hero-copy">
            <Image
              className="home__headline-image"
              src={bannerText}
              alt="Showgirl, singer and storyteller"
              loading="eager"
              sizes="(max-width: 640px) 92vw, (max-width: 900px) 78vw, 36rem"
            />
            <nav className="home__actions" aria-label="Featured actions">
              <Link className="home__cta home__cta--red home__cta--play" href="/music">
                <span>Listen</span>
              </Link>
              <Link className="home__cta home__cta--dark home__cta--play" href="/videos">
                <span>Watch</span>
              </Link>
              <a
                className="home__cta home__cta--paper home__cta--download"
                href="/RIVKALA%20EPK%20OFFICIAL.pdf"
                download="RIVKALA EPK OFFICIAL.pdf"
              >
                <span>Download EPK</span>
              </a>
            </nav>
          </div>

          <div className="home__portrait" aria-hidden="true">
            <Image
              className="home__portrait-image"
              src={headshot}
              alt=""
              preload
              sizes="(max-width: 360px) 14rem, (max-width: 640px) 17rem, (max-width: 900px) 45vw, 26rem"
            />
          </div>
        </div>
      </section>

      <section className="home__paper">
        <FeaturedReleases enableCollageParallax />
        <FeaturedVideo />
      </section>
    </main>
  );
}
