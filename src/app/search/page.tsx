import type { Metadata } from "next";
import { fetchCatalog, CatalogQuery } from "@/lib/api";
import { CatalogBrowser } from "@/components/CatalogBrowser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "بحث عن أنمي - AnimeClover",
  },
  description:
    "ابحث عن أي مسلسل أو فيلم أنمي باللغة العربية أو الإنجليزية وتصفح الحلقات والمواسم على أنمي كلوفر AnimeClover.",
  keywords: [
    "بحث انمي",
    "search anime",
    "animeclover search",
    "AnimeClover",
    "animeclover",
    "animeclover.click",
    "أنمي كلوفر",
    "انمي كلوفر",
  ],
  alternates: {
    canonical: "/search",
  },
  openGraph: {
    title: "بحث عن أنمي - AnimeClover",
    description: "ابحث عن أي مسلسل أو فيلم أنمي باللغة العربية أو الإنجليزية على أنمي كلوفر AnimeClover.",
    url: "/search",
    siteName: "AnimeClover",
  },
  twitter: {
    card: "summary_large_image",
    title: "بحث عن أنمي - AnimeClover",
    description: "ابحث عن أي مسلسل أو فيلم أنمي باللغة العربية أو الإنجليزية على أنمي كلوفر AnimeClover.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
