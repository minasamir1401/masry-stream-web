import type { Metadata } from "next";
import { fetchAiringWeek } from "@/lib/api";
import { AiringSchedule } from "@/components/AiringSchedule";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "جدول مواعيد عرض الأنمي الأسبوعي | Anime Airing Schedule - Anime Clover",
  },
  description:
    "تابع جدول مواعيد نزول حلقات الأنمي الأسبوعية المترجمة بتوقيتك المحلي فور صدورها في اليابان مع العد التنازلي وروابط المشاهدة المباشرة على أنمي كلوفر Anime Clover.",
  keywords: [
    "جدول الأنمي",
    "جدول نزول الحلقات",
    "مواعيد عرض الأنمي",
    "أنمي اليوم",
    "anime schedule",
    "anime airing schedule",
    "anime episodes countdown",
    "Anime Clover",
    "أنمي كلوفر",
  ],
  openGraph: {
    title: "جدول مواعيد عرض الأنمي الأسبوعي | Anime Clover",
    description: "مواعيد الحلقات الجديدة والعد التنازلي على مدار أيام الأسبوع في أنمي كلوفر.",
    url: "/schedule",
    siteName: "Anime Clover | أنمي كلوفر",
  },
};

export default async function SchedulePage({ searchParams }: { searchParams: { day?: string } }) {
  const day = searchParams.day && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.day) ? searchParams.day : undefined;
  const week = await fetchAiringWeek(day).catch(() => null);
  return <AiringSchedule initial={week} selectedDay={day} />;
}
