import type { Metadata } from "next";
import { fetchCatalog, CatalogQuery } from "@/lib/api";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { SITE_URL, SITE_BRAND, buildBreadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const PAGE_TITLE = "أفلام أنمي - مشاهدة وتحميل أفلام الأنمي المترجمة | انمي كلوفر AnimeClover";
const PAGE_DESC =
  "قسم أفلام الأنمي على موقع انمي كلوفر الرسمي (AnimeClover). شاهد وحمّل أحدث وأشهر أفلام الأنمي المترجمة والمدبلجة اون لاين بجودة عالية Full HD وسيرفرات مباشرة.";

export const metadata: Metadata = {
  title: {
    absolute: PAGE_TITLE,
  },
  description: PAGE_DESC,
  keywords: [
    "انمي كلوفر",
    "أنمي كلوفر",
    "أفلام أنمي",
    "افلام انمي مترجمة",
    "مشاهدة افلام انمي",
    "تحميل افلام انمي",
    "افلام انمي كلوفر",
    "AnimeClover",
    "animeclover",
    "انمي لكوفر",
  ],
  alternates: {
    canonical: "/movies",
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESC,
    url: "/movies",
    siteName: SITE_BRAND,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "أفلام الأنمي المترجمة - انمي كلوفر AnimeClover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESC,
    images: ["/og-image.png"],
  },
};

export default async function Page({ searchParams }: { searchParams: CatalogQuery }) {
  const filters = { ...searchParams, format: searchParams.format || "MOVIE" };
  const data = await fetchCatalog(filters).catch(() => null);
  const items = data?.items || [];

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "انمي كلوفر الرئيسية", path: "/" },
    { name: "أفلام الأنمي", path: "/movies" },
  ]);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": PAGE_TITLE,
    "description": PAGE_DESC,
    "url": `${SITE_URL}/movies`,
    "isPartOf": { "@id": `${SITE_URL}/#website` },
    "inLanguage": "ar",
    ...(items.length > 0
      ? {
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": items.length,
            "itemListElement": items.slice(0, 16).map((item, idx) => ({
              "@type": "ListItem",
              "position": idx + 1,
              "name": item.title,
              "url": `${SITE_URL}/movie/${item.id}`,
            })),
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <CatalogBrowser
        title="أفلام الأنمي"
        filters={filters}
        data={data || { items: [], total: 0, page: 1, page_size: 24, total_pages: 1 }}
        failed={!data}
      />
    </>
  );
}
