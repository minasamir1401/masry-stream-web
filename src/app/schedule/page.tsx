import type { Metadata } from "next";
import { fetchAiringWeek } from "@/lib/api";
import { AiringSchedule } from "@/components/AiringSchedule";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "جدول مواعيد عرض الأنمي الأسبوعي | انمي كلوفر AnimeClover",
  },
  description:
    "جدول مواعيد نزول حلقات مسلسلات الأنمي الأسبوعية المترجمة اون لاين ومواعيد البث المحدثة فور صدورها في اليابان على موقع انمي كلوفر (انمي لكوفر - AnimeClover).",
  keywords: [
    "انمي",
    "أنمي",
    "جدول الأنمي",
    "جدول نزول الحلقات",
    "مواعيد عرض الأنمي",
    "أنمي اليوم",
    "انمي اليوم",
    "انمي كلوفر",
    "أنمي كلوفر",
    "انمي لكوفر",
    "أنمي لكوفر",
    "AnimeClover",
    "animeclover",
    "anime schedule",
    "anime airing schedule",
  ],
  alternates: {
    canonical: "/schedule",
  },
  openGraph: {
    title: "جدول مواعيد عرض الأنمي الأسبوعي | انمي كلوفر AnimeClover",
    description: "مواعيد الحلقات الجديدة والعد التنازلي على مدار أيام الأسبوع في انمي كلوفر (انمي لكوفر - AnimeClover).",
    url: "/schedule",
    siteName: "انمي كلوفر AnimeClover",
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
    title: "جدول مواعيد عرض الأنمي الأسبوعي | انمي كلوفر AnimeClover",
    description: "مواعيد الحلقات الجديدة والعد التنازلي على مدار أيام الأسبوع في انمي كلوفر AnimeClover.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function SchedulePage({ searchParams }: { searchParams: { day?: string } }) {
  const day = searchParams.day && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.day) ? searchParams.day : undefined;
  const week = await fetchAiringWeek(day).catch(() => null);
  return <AiringSchedule initial={week} selectedDay={day} />;
}
