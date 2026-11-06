import type { Metadata } from "next";
import { fetchCatalog, CatalogQuery } from "@/lib/api";
import { CatalogBrowser } from "@/components/CatalogBrowser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "أنميات - مسلسلات الأنمي المترجمة اون لاين | انمي كلوفر AnimeClover",
  },
  description:
    "قسم الأنمي على انمي كلوفر (انمي لكوفر - AnimeClover) يمكنك من خلاله متابعة وتحميل أفضل وآخر مسلسلات الأنمي المترجمة اون لاين بجودات متعددة وسيرفرات سريعة.",
  keywords: [
    "انمي",
    "أنمي",
    "أنميات",
    "انميات",
    "مسلسلات أنمي",
    "أنمي مترجم",
    "مشاهدة انمي",
    "تحميل انمي",
    "مكتبة الأنمي",
    "انمي كلوفر",
    "أنمي كلوفر",
    "انمي لكوفر",
    "أنمي لكوفر",
    "AnimeClover",
    "animeclover",
    "anime series online",
    "watch anime series",
  ],
  alternates: {
    canonical: "/series",
  },
  openGraph: {
    title: "أنميات - مسلسلات الأنمي المترجمة اون لاين | انمي كلوفر AnimeClover",
    description:
      "قسم الأنمي على انمي كلوفر (انمي لكوفر - AnimeClover) يمكنك من خلاله متابعة وتحميل أفضل وآخر مسلسلات الأنمي المترجمة اون لاين بجودات متعددة وسيرفرات سريعة.",
    url: "/series",
    siteName: "انمي كلوفر AnimeClover",
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
    title: "أنميات - مسلسلات الأنمي المترجمة اون لاين | انمي كلوفر AnimeClover",
    description:
      "قسم الأنمي على انمي كلوفر (انمي لكوفر - AnimeClover) يمكنك من خلاله متابعة وتحميل أفضل وآخر مسلسلات الأنمي المترجمة اون لاين بجودات متعددة وسيرفرات سريعة.",
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
      title="قائمة الأنمي"
      filters={searchParams}
      data={data || { items: [], total: 0, page: 1, page_size: 24, total_pages: 1 }}
      failed={!data}
    />
  );
}
