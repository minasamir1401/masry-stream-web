import { jsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import { fetchAiringWeek } from "@/lib/api";
import { AiringSchedule } from "@/components/AiringSchedule";
import { SITE_BRAND, buildBreadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const PAGE_TITLE = "جدول مواعيد عرض الأنمي الأسبوعي | انمي كلوفر AnimeClover";
const PAGE_DESC =
  "جدول مواعيد نزول حلقات مسلسلات الأنمي الأسبوعية المترجمة اون لاين ومواعيد البث المحدثة بتوقيت القاهرة والمنطقة العربية على موقع انمي كلوفر الرسمي (AnimeClover).";

export const metadata: Metadata = {
  title: {
    absolute: PAGE_TITLE,
  },
  description: PAGE_DESC,
  keywords: [
    "انمي كلوفر",
    "أنمي كلوفر",
    "جدول الأنمي",
    "جدول نزول الحلقات",
    "مواعيد عرض الأنمي",
    "انمي اليوم",
    "جدول انمي كلوفر",
    "AnimeClover",
    "animeclover",
  ],
  alternates: {
    canonical: "/schedule",
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESC,
    url: "/schedule",
    siteName: SITE_BRAND,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "جدول مواعيد عرض الأنمي - انمي كلوفر AnimeClover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESC,
    images: ["/og-image.png"],
  },
};

export default async function SchedulePage({ searchParams }: { searchParams: { day?: string } }) {
  const day = searchParams.day && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.day) ? searchParams.day : undefined;
  const week = await fetchAiringWeek(day).catch(() => null);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "انمي كلوفر الرئيسية", path: "/" },
    { name: "جدول مواعيد الحلقات", path: "/schedule" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd) }}
      />
      <AiringSchedule initial={week} selectedDay={day} />
    </>
  );
}
