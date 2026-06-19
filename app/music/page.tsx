import FeaturedReleases from "../featured-releases";
import SectionPage from "../section-page";

export default function MusicPage() {
  return (
    <SectionPage title="Music">
      <FeaturedReleases enableCollageParallax />
    </SectionPage>
  );
}
