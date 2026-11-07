import type { Metadata } from "next";
import { fetchHomepage, fetchAiringWeek, fetchPopularSeries } from "@/lib/api";
import { HomeExperience } from "@/components/HomeExperience";
import {
  SITE_URL,
  SITE_BRAND,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  CORE_KEYWORDS,
} from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    absolute: DEFAULT_TITLE,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: CORE_KEYWORDS,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ar_AR",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    siteName: SITE_BRAND,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "انمي كلوفر AnimeClover - الموقع الرسمي لمشاهدة وتحميل الأنمي المترجم اون لاين",
      },
      {
        url: "/preview_full.png",
        width: 1200,
        height: 630,
        alt: SITE_BRAND,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
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

  const popularItems =
    popular.status === "fulfilled" && popular.value.items.length
      ? popular.value.items
      : data.popular;

  const listCandidates = [
    ...popularItems,
    ...data.featured,
    ...data.spotlight,
  ].slice(0, 12);

  const homeCollectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/#webpage`,
    "url": SITE_URL,
    "name": DEFAULT_TITLE,
    "description": DEFAULT_DESCRIPTION,
    "isPartOf": { "@id": `${SITE_URL}/#website` },
    "about": { "@id": `${SITE_URL}/#organization` },
    "inLanguage": "ar",
    ...(listCandidates.length > 0
      ? {
          "mainEntity": {
            "@type": "ItemList",
            "name": "أحدث وأشهر مسلسلات الأنمي على انمي كلوفر AnimeClover",
            "itemListOrder": "https://schema.org/ItemListOrderDescending",
            "numberOfItems": listCandidates.length,
            "itemListElement": listCandidates.map((item, idx) => ({
              "@type": "ListItem",
              "position": idx + 1,
              "name": item.title,
              "url": `${SITE_URL}/${item.media_type === "MOVIE" ? "movie" : "series"}/${item.id}`,
            })),
          },
        }
      : {}),
  };

  const homeFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "ما هو موقع انمي كلوفر الرسمي (AnimeClover)؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "موقع انمي كلوفر (AnimeClover) هو منصة عربية متكاملة وموقع رسمي مخصص لمشاهدة وتحميل جميع مسلسلات وأفلام وحلقات الأنمي الياباني مترجمة باللغة العربية بجودة فائقة Full HD مجاناً وبدون إعلانات منبثقة مزعجة عبر الرابط animeclover.click.",
        },
      },
      {
        "@type": "Question",
        "name": "كيف يمكنني مشاهدة وتحميل حلقات الأنمي على منصة انمي كلوفر؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "يمكنك تصفح مكتبة مسلسلات وأفلام الأنمي أو البحث عن أي عمل، واختيار الحلقة لمشاهدتها فوراً عبر سيرفرات بث مباشرة متعددة الجودات مع دعم حفظ موضع المشاهدة تلقائياً.",
        },
      },
      {
        "@type": "Question",
        "name": "هل يوفر موقع انمي كلوفر جدول مواعيد عرض الأنمي الأسبوعي؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "نعم، يوفر موقع انمي كلوفر قسماً تفاعلياً لجدول مواعيد بث حلقات الأنمي الأسبوعية المحدثة لحظة بلحظة بتوقيت القاهرة والمنطقة العربية.",
        },
      },
      {
        "@type": "Question",
        "name": "هل يمكن تثبيت تطبيق انمي كلوفر على الهاتف والكمبيوتر؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "نعم، يدعم موقع انمي كلوفر تقنية تطبيقات الويب التقدمية (PWA) التي تتيح لك تثبيت المنصة كتطبيق سريع على هواتف أندرويد وآيفون وأجهزة الكمبيوتر بضغطة واحدة.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeCollectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqJsonLd) }}
      />
      <HomeExperience
        data={{
          ...data,
          popular: popularItems,
        }}
        week={schedule.status === "fulfilled" ? schedule.value : null}
        failed={home.status === "rejected"}
      />
    </>
  );
}
