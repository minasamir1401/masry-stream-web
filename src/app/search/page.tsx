import type { Metadata } from "next";
import { fetchCatalog, CatalogQuery } from "@/lib/api";
import { CatalogBrowser } from "@/components/CatalogBrowser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "البحث عن الأنمي والحلقات | Search Anime - Anime Clover",
  },
  description:
    "ابحث عن أي مسلسل أو فيلم أنمي باللغة العربية أو الإنجليزية وتصفح الحلقات والمواسم على أنمي كلوفر Anime Clover.",
  keywords: [
    "بحث انمي",
    "search anime",
    "Anime Clover search",
    "أنمي كلوفر",
    "Anime Clover",
  ],
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
