import type { Metadata } from "next";
import { fetchCatalog, CatalogQuery } from "@/lib/api";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { SITE_BRAND } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "البحث في مكتبة الأنمي | انمي كلوفر AnimeClover",
  },
  description:
    "ابحث عن أي مسلسل أو فيلم أنمي باللغة العربية أو الإنجليزية وتصفح الحلقات والمواسم على موقع انمي كلوفر الرسمي (AnimeClover).",
  alternates: {
    canonical: "/search",
  },
  openGraph: {
    title: "البحث في مكتبة الأنمي | انمي كلوفر AnimeClover",
    description: "ابحث عن أي مسلسل أو فيلم أنمي باللغة العربية أو الإنجليزية على موقع انمي كلوفر AnimeClover.",
    url: "/search",
    siteName: SITE_BRAND,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "بحث عن أنمي - انمي كلوفر AnimeClover",
      },
    ],
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default async function Page({ searchParams }: { searchParams: CatalogQuery }) {
  const data = await fetchCatalog(searchParams).catch(() => null);
  return (
    <CatalogBrowser
      title="البحث واكتشاف الأنمي"
      filters={searchParams}
      data={data || { items: [], total: 0, page: 1, page_size: 24, total_pages: 1 }}
      failed={!data}
    />
  );
}
