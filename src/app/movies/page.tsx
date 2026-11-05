import type { Metadata } from "next";
import { fetchCatalog, CatalogQuery } from "@/lib/api";
import { CatalogBrowser } from "@/components/CatalogBrowser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "أفلام الأنمي المترجمة والمدبلجة بجودة عالية HD | Anime Movies - Anime Clover",
  },
  description:
    "شاهد وحمل أحدث وأقوى أفلام الأنمي الياباني المترجمة بدقة عالية Full HD وسيرفرات مباشرة بدون إعلانات على أنمي كلوفر Anime Clover.",
  keywords: [
    "أفلام أنمي",
    "فلم انمي",
    "افلام انمي مترجمة",
    "anime movies hd",
    "watch anime movies",
    "Anime Clover",
    "أنمي كلوفر",
  ],
  openGraph: {
    title: "أفلام الأنمي المترجمة | Anime Clover",
    description: "مكتبة أفلام الأنمي المترجمة والمدبلجة بأعلى جودة على Anime Clover.",
    url: "/movies",
    siteName: "Anime Clover | أنمي كلوفر",
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
