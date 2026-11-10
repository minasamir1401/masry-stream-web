import { SITE_BRAND, pageSocialMetadata } from "@/lib/seo";
import type { Metadata } from "next";

const PAGE_TITLE = `المفضلة | ${SITE_BRAND}`;
const PAGE_DESC = `قائمة أعمال الأنمي المفضلة المحفوظة على متصفحك في موقع ${SITE_BRAND}.`;

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESC,
  alternates: {
    canonical: "/favorites",
  },
  ...pageSocialMetadata(PAGE_TITLE, PAGE_DESC, "/favorites"),
  robots: {
    index: false,
    follow: true,
  },
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
