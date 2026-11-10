import { mediaHref } from "@/lib/media-links";
import { mediaNames } from "@/lib/media-names";
import type { Metadata } from "next";
import { fetchHomepage, fetchAiringWeek, fetchPopularSeries } from "@/lib/api";
import { HomeExperience } from "@/components/HomeExperience";
import {
  SITE_URL,
  SITE_BRAND,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  CORE_KEYWORDS,
  homeAlternates,
  jsonLd,
  pageSocialMetadata,
} from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    absolute: DEFAULT_TITLE,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: CORE_KEYWORDS,
  alternates: homeAlternates("ar"),
  ...pageSocialMetadata(DEFAULT_TITLE, DEFAULT_DESCRIPTION, "/"),
};

export default async function HomePage() {
  const [home, schedule, popular] = await Promise.allSettled([
    fetchHomepage(),
    fetchAiringWeek(),
    fetchPopularSeries(1, 12),
  ]);
  const data =
    home.status === "fulfilled"
      ? home.value
      : { featured: [], spotlight: [], popular: [], recommended: [] };

  const popularItems =
    popular.status === "fulfilled" && popular.value.items.length
      ? popular.value.items
      : data.popular;

  const listCandidates = [
    ...popularItems,
    ...data.featured,
    ...data.spotlight,
  ].slice(0, 12);

  const homeCollectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/#webpage`,
    "url": SITE_URL,
    "name": DEFAULT_TITLE,
    "description": DEFAULT_DESCRIPTION,
    "isPartOf": { "@id": `${SITE_URL}/#website` },
    "about": { "@id": `${SITE_URL}/#organization` },
    "inLanguage": "ar",
    ...(listCandidates.length > 0
      ? {
          "mainEntity": {
            "@type": "ItemList",
            "name": `أحدث وأشهر مسلسلات الأنمي على ${SITE_BRAND}`,
            "itemListOrder": "https://schema.org/ItemListOrderDescending",
            "numberOfItems": listCandidates.length,
            "itemListElement": listCandidates.map((item, idx) => ({
              "@type": "ListItem",
              "position": idx + 1,
              "name": mediaNames(item).label,
              "url": `${SITE_URL}${mediaHref(item)}`,
            })),
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(homeCollectionJsonLd) }}
      />
      <HomeExperience
        data={{
          ...data,
          popular: popularItems,
        }}
        week={schedule.status === "fulfilled" ? schedule.value : null}
        failed={home.status === "rejected"}
      />
    </>
  );
}
