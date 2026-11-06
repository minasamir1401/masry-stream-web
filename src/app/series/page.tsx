import type { Metadata } from "next";
import { fetchCatalog, CatalogQuery } from "@/lib/api";
import { CatalogBrowser } from "@/components/CatalogBrowser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "أنميات - مسلسلات الأنمي المترجمة اون لاين - AnimeClover",
  },
  description:
    "قسم الأنمي على أنمي كلوفر AnimeClover يمكنك من خلاله متابعة وتحميل أفضل وآخر مسلسلات الأنمي المترجمة اون لاين بجودات متعددة وسيرفرات سريعة.",
  keywords: [
    "أنميات",
    "انميات",
    "مسلسلات أنمي",
    "أنمي مترجم",
    "مشاهدة انمي",
    "تحميل انمي",
    "مكتبة الأنمي",
    "anime series online",
    "watch anime series",
    "AnimeClover",
    "animeclover",
    "أنمي كلوفر",
    "انمي كلوفر",
  ],
  alternates: {
    canonical: "/series",
  },
  openGraph: {
    title: "أنميات - مسلسلات الأنمي المترجمة اون لاين - AnimeClover",
    description:
      "قسم الأنمي على أنمي كلوفر AnimeClover يمكنك من خلاله متابعة وتحميل أفضل وآخر مسلسلات الأنمي المترجمة اون لاين بجودات متعددة وسيرفرات سريعة.",
    url: "/series",
    siteName: "AnimeClover",
  },
  twitter: {
    card: "summary_large_image",
    title: "أنميات - مسلسلات الأنمي المترجمة اون لاين - AnimeClover",
    description:
      "قسم الأنمي على أنمي كلوفر AnimeClover يمكنك من خلاله متابعة وتحميل أفضل وآخر مسلسلات الأنمي المترجمة اون لاين بجودات متعددة وسيرفرات سريعة.",
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
      title="قائمة الأنمي"
      filters={searchParams}
      data={data || { items: [], total: 0, page: 1, page_size: 24, total_pages: 1 }}
      failed={!data}
    />
  );
}
