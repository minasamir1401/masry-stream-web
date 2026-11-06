import type { Metadata } from "next";
import { fetchHomepage, fetchAiringWeek, fetchPopularSeries } from "@/lib/api";
import { HomeExperience } from "@/components/HomeExperience";

export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    absolute: "انمي كلوفر AnimeClover | موقع مشاهدة وتحميل انمي مترجم اون لاين",
  },
  description:
    "موقع انمي كلوفر (انمي لكوفر - AnimeClover) افضل موقع انمي عربي لمشاهدة وتحميل جميع مسلسلات وافلام وحلقات الانمي مترجمة اون لاين بجودة عالية Full HD مجانا وبدون اعلانات مزعجة.",
  keywords: [
    "انمي",
    "أنمي",
    "انمي كلوفر",
    "أنمي كلوفر",
    "انمي لكوفر",
    "أنمي لكوفر",
    "كلوفر انمي",
    "لكوفر انمي",
    "موقع انمي كلوفر",
    "موقع انمي لكوفر",
    "موقع انمي",
    "مشاهدة انمي",
    "تحميل انمي",
    "انمي مترجم",
    "انمي اون لاين",
    "مسلسلات انمي",
    "افلام انمي",
    "AnimeClover",
    "animeclover",
    "Anime Clover",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "انمي كلوفر AnimeClover | موقع مشاهدة وتحميل انمي مترجم اون لاين",
    description:
      "موقع انمي كلوفر (انمي لكوفر - AnimeClover) افضل موقع انمي عربي لمشاهدة وتحميل جميع افلام وحلقات الانمي مترجمة اون لاين بجودات متعددة مجانا وبأعلى جودة.",
    url: "/",
    siteName: "انمي كلوفر AnimeClover",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "انمي كلوفر AnimeClover - موقع مشاهدة وتحميل الانمي مترجم اون لاين",
      },
      {
        url: "/preview_full.png",
        width: 1200,
        height: 630,
        alt: "AnimeClover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "انمي كلوفر AnimeClover | موقع مشاهدة وتحميل انمي مترجم اون لاين",
    description:
      "موقع انمي كلوفر (انمي لكوفر - AnimeClover) افضل موقع انمي عربي لمشاهدة وتحميل جميع افلام وحلقات الانمي مترجمة اون لاين بجودة عالية.",
    images: ["/og-image.png"],
  },
};

export default async function HomePage() {
  const [home, schedule, popular] = await Promise.allSettled([
    fetchHomepage(),
    fetchAiringWeek(),
    fetchPopularSeries(1, 6),
  ]);
  const data =
    home.status === "fulfilled"
      ? home.value
      : { featured: [], spotlight: [], popular: [], recommended: [] };

  const homeFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "ما هو موقع انمي كلوفر (انمي لكوفر)؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "موقع انمي كلوفر (AnimeClover والمعروف أيضا باسم انمي لكوفر) هو منصة عربية متطورة تتيح للمشاهدين متابعة وتحميل أحدث حلقات ومسلسلات وأفلام الأنمي الياباني مترجمة بالكامل بجودة فائقة Full HD وبدون إعلانات منبثقة مزعجة."
        }
      },
      {
        "@type": "Question",
        "name": "كيف يمكنني مشاهدة وتحميل الانمي على انمي كلوفر؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "يمكنك تصفح مكتبة الأنمي أو استخدام شريط البحث للعثور على أي عمل ترغب به، واختيار الحلقة لمشاهدتها عبر سيرفرات مباشرة فائقة السرعة مع إمكانية التحميل المباشر بجودات متعددة."
        }
      },
      {
        "@type": "Question",
        "name": "هل يوفر موقع انمي كلوفر جدول مواعيد عرض الانمي الأسبوعي؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "نعم، يوفر انمي كلوفر قسماً مخصصاً لجدول مواعيد بث حلقات الأنمي الأسبوعية المحدثة لحظة بلحظة مع عد تنازلي لموعد نزول كل حلقة بتوقيت المنطقة العربية."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqJsonLd) }}
      />
      <HomeExperience
        data={{
          ...data,
          popular: popular.status === "fulfilled" ? popular.value.items : data.popular,
        }}
        week={schedule.status === "fulfilled" ? schedule.value : null}
        failed={home.status === "rejected"}
      />
    </>
  );
}
