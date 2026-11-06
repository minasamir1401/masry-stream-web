import type { Metadata } from "next";
import { fetchCatalog, CatalogQuery } from "@/lib/api";
import { CatalogBrowser } from "@/components/CatalogBrowser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "بحث عن أنمي | انمي كلوفر AnimeClover",
  },
  description:
    "ابحث عن أي مسلسل أو فيلم أنمي باللغة العربية أو الإنجليزية وتصفح الحلقات والمواسم على انمي كلوفر (انمي لكوفر - AnimeClover).",
  keywords: [
    "انمي",
    "أنمي",
    "بحث انمي",
    "search anime",
    "animeclover search",
    "انمي كلوفر",
    "أنمي كلوفر",
    "انمي لكوفر",
    "أنمي لكوفر",
    "AnimeClover",
    "animeclover",
    "animeclover.click",
  ],
  alternates: {
    canonical: "/search",
  },
  openGraph: {
    title: "بحث عن أنمي | انمي كلوفر AnimeClover",
    description: "ابحث عن أي مسلسل أو فيلم أنمي باللغة العربية أو الإنجليزية على انمي كلوفر (انمي لكوفر - AnimeClover).",
    url: "/search",
    siteName: "انمي كلوفر AnimeClover",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "بحث عن أنمي - انمي كلوفر AnimeClover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "بحث عن أنمي | انمي كلوفر AnimeClover",
    description: "ابحث عن أي مسلسل أو فيلم أنمي باللغة العربية أو الإنجليزية على انمي كلوفر AnimeClover.",
    images: ["/og-image.png"],
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
