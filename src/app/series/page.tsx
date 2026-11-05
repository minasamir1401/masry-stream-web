import type { Metadata } from "next";
import { fetchCatalog, CatalogQuery } from "@/lib/api";
import { CatalogBrowser } from "@/components/CatalogBrowser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "مكتبة مسلسلات الأنمي المترجمة اون لاين HD | Watch Anime Series - Anime Clover",
  },
  description:
    "تصفح وشاهد أحدث وأشهر مسلسلات الأنمي الياباني المترجمة بالعربية بجودة Full HD. فلاتر متقدمة للتصنيف والحالة وسنة الإنتاج على أنمي كلوفر Anime Clover.",
  keywords: [
    "مسلسلات أنمي",
    "أنمي مترجم",
    "مكتبة الأنمي",
    "انمي اكشن",
    "انمي مغامرات",
    "انمي رومانسي",
    "anime series online",
    "watch anime series",
    "Anime Clover",
    "أنمي كلوفر",
  ],
  openGraph: {
    title: "مكتبة مسلسلات الأنمي المترجمة | Anime Clover",
    description: "اكتشف مسلسلات الأنمي المترجمة بتصنيفات متعددة وجودة عالية على Anime Clover.",
    url: "/series",
    siteName: "Anime Clover | أنمي كلوفر",
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
