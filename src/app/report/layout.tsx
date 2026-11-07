import type { Metadata } from "next";
import { SITE_BRAND } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: "الشكاوى وطلبات الأنمي | انمي كلوفر AnimeClover",
  },
  description:
    "مركز الشكاوى والبلاغات وطلبات إضافة الأنمي والحلقات في موقع انمي كلوفر الرسمي (AnimeClover).",
  alternates: {
    canonical: "/report",
  },
  openGraph: {
    title: "الشكاوى وطلبات الأنمي | انمي كلوفر AnimeClover",
    description: "أرسل شكوى فنية أو اطلب إضافة أنمي جديد على منصة انمي كلوفر AnimeClover.",
    url: "/report",
    siteName: SITE_BRAND,
  },
};

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
