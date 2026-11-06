import type { Metadata } from "next";
import { fetchCatalog, CatalogQuery } from "@/lib/api";
import { CatalogBrowser } from "@/components/CatalogBrowser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "أفلام أنمي - تحميل ومشاهدة أفلام الأنمي مترجمة اون لاين - AnimeClover",
  },
  description:
    "قسم أفلام الأنمي على أنمي كلوفر AnimeClover يمكنك من خلاله مشاهدة وتحميل أحدث وأقوى أفلام الأنمي المترجمة اون لاين بجودة عالية FHD وسيرفرات مباشرة سريعة.",
  keywords: [
    "أفلام أنمي",
    "افلام انمي",
    "فلم انمي",
    "افلام انمي مترجمة",
    "مشاهدة افلام انمي",
    "تحميل افلام انمي",
    "anime movies hd",
    "watch anime movies",
    "AnimeClover",
    "animeclover",
    "أنمي كلوفر",
    "انمي كلوفر",
  ],
  alternates: {
    canonical: "/movies",
  },
  openGraph: {
    title: "أفلام أنمي - تحميل ومشاهدة أفلام الأنمي مترجمة اون لاين - AnimeClover",
    description:
      "قسم أفلام الأنمي على أنمي كلوفر AnimeClover يمكنك من خلاله مشاهدة وتحميل أحدث وأقوى أفلام الأنمي المترجمة اون لاين بجودة عالية FHD وسيرفرات مباشرة سريعة.",
    url: "/movies",
    siteName: "AnimeClover",
  },
  twitter: {
    card: "summary_large_image",
    title: "أفلام أنمي - تحميل ومشاهدة أفلام الأنمي مترجمة اون لاين - AnimeClover",
    description:
      "قسم أفلام الأنمي على أنمي كلوفر AnimeClover يمكنك من خلاله مشاهدة وتحميل أحدث وأقوى أفلام الأنمي المترجمة اون لاين بجودة عالية FHD وسيرفرات مباشرة سريعة.",
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
  const filters = { ...searchParams, format: searchParams.format || "MOVIE" };
  const data = await fetchCatalog(filters).catch(() => null);
  return (
    <CatalogBrowser
      title="أفلام الأنمي"
      filters={filters}
      data={data || { items: [], total: 0, page: 1, page_size: 24, total_pages: 1 }}
      failed={!data}
    />
  );
}
