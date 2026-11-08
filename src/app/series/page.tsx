import { mediaHref } from "@/lib/media-links";
import { jsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import { fetchCatalog, CatalogQuery } from "@/lib/api";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { SITE_URL, SITE_BRAND, buildBreadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const PAGE_TITLE = "مكتبة الأنمي - مسلسلات أنمي مترجمة اون لاين | انمي كلوفر AnimeClover";
const PAGE_DESC =
  "تصفح مكتبة مسلسلات الأنمي الكاملة على موقع انمي كلوفر الرسمي (AnimeClover). شاهد وحمّل أحدث وأقوى مسلسلات الأنمي المترجمة اون لاين بجودة عالية Full HD وسيرفرات سريعة.";

const baseMetadata: Metadata = {
  title: {
    absolute: PAGE_TITLE,
  },
  description: PAGE_DESC,
  keywords: [
    "انمي كلوفر",
    "أنمي كلوفر",
    "مكتبة انمي كلوفر",
    "قائمة الأنمي",
    "مسلسلات أنمي مترجمة",
    "أنمي مترجم اون لاين",
    "مشاهدة انمي",
    "تحميل انمي",
    "AnimeClover",
    "animeclover",
  ],
  alternates: {
    canonical: "/series",
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESC,
    url: "/series",
    siteName: SITE_BRAND,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "مكتبة مسلسلات الأنمي - انمي كلوفر AnimeClover",
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

export function generateMetadata({ searchParams }: { searchParams: CatalogQuery }): Metadata {
  const page = /^[1-9]\d*$/.test(searchParams.page || "") ? Number(searchParams.page) : 1;
  const filtered = Object.entries(searchParams).some(([key, value]) => value && key !== "page");
  const canonical = "/series" + (page > 1 ? `?page=${page}` : "");
  return { ...baseMetadata, alternates: { canonical },
    openGraph: { ...baseMetadata.openGraph, url: canonical },
    robots: { index: !filtered, follow: true, googleBot: { index: !filtered, follow: true } } };
}

export default async function Page({ searchParams }: { searchParams: CatalogQuery }) {
  const data = await fetchCatalog(searchParams).catch(() => null);
  const items = data?.items || [];

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "انمي كلوفر الرئيسية", path: "/" },
    { name: "مكتبة مسلسلات الأنمي", path: "/series" },
  ]);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": PAGE_TITLE,
    "description": PAGE_DESC,
    "url": `${SITE_URL}/series`,
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
        title="مكتبة مسلسلات الأنمي"
        filters={searchParams}
        data={data || { items: [], total: 0, page: 1, page_size: 24, total_pages: 1 }}
        failed={!data}
      />
    </>
  );
}
