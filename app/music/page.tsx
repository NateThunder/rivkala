import { getMusicLinks } from "@/lib/admin/content";
import SectionPage from "../section-page";
import MusicPageClient from "./music-page-client";

export const dynamic = "force-dynamic";

export default async function MusicPage() {
  const musicLinks = await getMusicLinks();

  return (
    <SectionPage title="Music">
      <MusicPageClient musicLinks={musicLinks} />
    </SectionPage>
  );
}
