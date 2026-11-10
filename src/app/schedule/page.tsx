import type { Metadata } from "next";
import { fetchAiringWeek } from "@/lib/api";
import { AiringSchedule } from "@/components/AiringSchedule";
import { SITE_BRAND, buildBreadcrumbJsonLd, jsonLd, pageSocialMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const PAGE_TITLE = `جدول مواعيد عرض الأنمي الأسبوعي | ${SITE_BRAND}`;
const PAGE_DESC =
  `جدول مواعيد نزول حلقات مسلسلات الأنمي الأسبوعية المترجمة اون لاين ومواعيد البث المحدثة بتوقيت القاهرة والمنطقة العربية على موقع ${SITE_BRAND}.`;

export const metadata: Metadata = {
  title: {
    absolute: PAGE_TITLE,
  },
  description: PAGE_DESC,
  keywords: [
    SITE_BRAND,
    "جدول الأنمي",
    "جدول نزول الحلقات",
    "مواعيد عرض الأنمي",
    "انمي اليوم",
    `جدول ${SITE_BRAND}`,
  ],
  alternates: {
    canonical: "/schedule",
  },
  ...pageSocialMetadata(PAGE_TITLE, PAGE_DESC, "/schedule"),
};

export default async function SchedulePage({ searchParams }: { searchParams: { day?: string } }) {
  const day = searchParams.day && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.day) ? searchParams.day : undefined;
  const week = await fetchAiringWeek(day).catch(() => null);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: `${SITE_BRAND} الرئيسية`, path: "/" },
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
