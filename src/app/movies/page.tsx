import { mediaHref } from "@/lib/media-links";
import { mediaNames } from "@/lib/media-names";
import type { Metadata } from "next";
import { fetchCatalog, CatalogQuery } from "@/lib/api";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { SITE_URL, SITE_BRAND, buildBreadcrumbJsonLd, jsonLd, pageSocialMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const PAGE_TITLE = `أفلام أنمي - مشاهدة وتحميل أفلام الأنمي المترجمة | ${SITE_BRAND}`;
const PAGE_DESC =
  `قسم أفلام الأنمي على موقع ${SITE_BRAND}. شاهد وحمّل أحدث وأشهر أفلام الأنمي المترجمة والمدبلجة اون لاين بجودة عالية Full HD وسيرفرات مباشرة.`;

const baseMetadata: Metadata = {
  title: {
    absolute: PAGE_TITLE,
  },
  description: PAGE_DESC,
  keywords: [
    SITE_BRAND,
    "أفلام أنمي",
    "افلام انمي مترجمة",
    "مشاهدة افلام انمي",
    "تحميل افلام انمي",
    `افلام ${SITE_BRAND}`,
  ],
  alternates: {
    canonical: "/movies",
  },
  ...pageSocialMetadata(PAGE_TITLE, PAGE_DESC, "/movies"),
};

export function generateMetadata({ searchParams }: { searchParams: CatalogQuery }): Metadata {
  const page = /^[1-9]\d*$/.test(searchParams.page || "") ? Number(searchParams.page) : 1;
  const filtered = Object.entries(searchParams).some(([key, value]) => value && key !== "page");
  const canonical = "/movies" + (page > 1 ? `?page=${page}` : "");
  return { ...baseMetadata, alternates: { canonical },
    openGraph: { ...baseMetadata.openGraph, url: canonical },
    robots: { index: !filtered, follow: true, googleBot: { index: !filtered, follow: true } } };
}

export default async function Page({ searchParams }: { searchParams: CatalogQuery }) {
  const filters = { ...searchParams, format: searchParams.format || "MOVIE" };
  const data = await fetchCatalog(filters).catch(() => null);
  const items = data?.items || [];

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: `${SITE_BRAND} الرئيسية`, path: "/" },
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
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(collectionJsonLd) }}
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
