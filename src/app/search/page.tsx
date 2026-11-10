import type { Metadata } from "next";
import { fetchCatalog, CatalogQuery } from "@/lib/api";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { SITE_BRAND, pageSocialMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const PAGE_TITLE = `البحث في مكتبة الأنمي | ${SITE_BRAND}`;
const PAGE_DESC = `ابحث عن أي مسلسل أو فيلم أنمي باللغة العربية أو الإنجليزية وتصفح الحلقات والمواسم على موقع ${SITE_BRAND}.`;

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESC,
  alternates: {
    canonical: "/search",
  },
  ...pageSocialMetadata(PAGE_TITLE, PAGE_DESC, "/search"),
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
