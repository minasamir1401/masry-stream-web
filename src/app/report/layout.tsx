import type { Metadata } from "next";
import { SITE_BRAND, pageSocialMetadata } from "@/lib/seo";

const PAGE_TITLE = `الشكاوى وطلبات الأنمي | ${SITE_BRAND}`;
const PAGE_DESC = `مركز الشكاوى والبلاغات وطلبات إضافة الأنمي والحلقات في موقع ${SITE_BRAND}.`;

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESC,
  alternates: {
    canonical: "/report",
  },
  ...pageSocialMetadata(PAGE_TITLE, PAGE_DESC, "/report"),
};

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
