import Image from "next/image";
import Link from "next/link";
import "./home.css";
import bannerText from "../public/banner text.png";
import headshot from "../public/Bex photos/headshot transparent background.png";
import SiteNav from "./site-nav";

export default function HomeView() {
  return (
    <main className="home">
      <div className="home__bg home__bg--paper" aria-hidden="true" />
      <div className="home__bg home__bg--hero" aria-hidden="true" />

      <section className="home__hero">
        <div className="home__masthead">
          <div className="home__masthead-inner">
            <SiteNav />
          </div>
        </div>

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
              <Link className="home__cta home__cta--paper home__cta--download" href="/epk">
                <span>Download EPK</span>
              </Link>
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
        <div className="home__inner home__paper-content">
          <div className="home__intro">
            <span className="home__intro-mark" aria-hidden="true" />
            <h2 className="home__intro-title">Rivkala</h2>
            <p className="home__intro-copy">
              A vintage soul with a modern voice. Rivkala weaves jazz,
              cabaret, and chamber-pop into stories that linger.
            </p>
            <Link className="home__intro-link" href="/epk">
              <span>More about Rivkala</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
