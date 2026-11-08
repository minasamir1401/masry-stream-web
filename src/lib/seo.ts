export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://animeclover.click").replace(/\/+$/, "");

export const SITE_NAME_AR = "انمي كلوفر";
export const SITE_NAME_EN = "AnimeClover";
export const SITE_BRAND = "انمي كلوفر AnimeClover";

export const DEFAULT_TITLE =
  "انمي كلوفر AnimeClover | مشاهدة وتحميل الأنمي المترجم";

export const DEFAULT_DESCRIPTION =
  "شاهد مسلسلات وأفلام الأنمي المترجمة إلى العربية على انمي كلوفر AnimeClover. تصفح الحلقات الجديدة، وابحث عن أنميك المفضل، وتابع جدول العرض الأسبوعي.";

export const BRAND_ALTERNATE_NAMES = [
  "انمي كلوفر",
  "أنمي كلوفر",
  "موقع انمي كلوفر",
  "منصة انمي كلوفر",
  "كلوفر انمي",
  "انمي كلوفر الرسمي",
  "AnimeClover",
  "Anime Clover",
  "animeclover.click",
];

export const CORE_KEYWORDS = [
  "انمي كلوفر",
  "أنمي كلوفر",
  "موقع انمي كلوفر",
  "منصة انمي كلوفر",
  "كلوفر انمي",
  "AnimeClover",
  "Anime Clover",
  "animeclover",
  "animeclover.click",
  "مشاهدة الأنمي المترجم اون لاين",
  "مشاهدة انمي مترجم عربي",
  "تحميل الأنمي المترجم",
  "مسلسلات الأنمي المترجمة",
  "أفلام الأنمي المترجمة",
  "حلقات أنمي مترجمة",
  "أحدث حلقات الأنمي",
  "جدول عرض الأنمي الأسبوعي",
];

const envSocials = (process.env.NEXT_PUBLIC_SOCIAL_LINKS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function getDailyIsoDate(): string {
  const now = new Date();
  return `${now.toISOString().slice(0, 10)}T00:00:00.000Z`;
}

export const STATIC_PAGE_LASTMOD = "2026-11-01T00:00:00.000Z";

export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function buildRootGraphJsonLd() {
  const orgId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const appId = `${SITE_URL}/#webapp`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        "name": SITE_BRAND,
        "legalName": SITE_NAME_EN,
        "alternateName": BRAND_ALTERNATE_NAMES,
        "url": SITE_URL,
        "slogan": "شاهد واكتشف الأنمي المترجم بالعربية",
        "description": DEFAULT_DESCRIPTION,
        "logo": {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          "url": `${SITE_URL}/icons/icon-512.png`,
          "contentUrl": `${SITE_URL}/icons/icon-512.png`,
          "width": 512,
          "height": 512,
          "caption": SITE_BRAND,
        },
        "image": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/og-image.png`,
          "width": 1200,
          "height": 630,
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer support",
          "email": "contact@animeclover.click",
          "url": `${SITE_URL}/contact`,
          "availableLanguage": ["Arabic", "English"],
        },
        "knowsAbout": [
          "الأنمي المترجم",
          "مسلسلات الأنمي اليابانية",
          "أفلام الأنمي",
          "جدول عرض الأنمي الأسبوعي",
          "Japanese Anime Streaming",
        ],
        ...(envSocials.length > 0 ? { sameAs: envSocials } : {}),
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        "url": SITE_URL,
        "name": SITE_BRAND,
        "alternateName": BRAND_ALTERNATE_NAMES,
        "description": DEFAULT_DESCRIPTION,
        "publisher": { "@id": orgId },
        "inLanguage": "ar",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${SITE_URL}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebApplication",
        "@id": appId,
        "name": SITE_BRAND,
        "alternateName": [SITE_NAME_AR, SITE_NAME_EN],
        "url": SITE_URL,
        "applicationCategory": "EntertainmentApplication",
        "operatingSystem": "All",
        "inLanguage": "ar",
        "publisher": { "@id": orgId },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
      },
      {
        "@type": "SiteNavigationElement",
        "@id": `${SITE_URL}/#navigation`,
        "name": [
          "الرئيسية - انمي كلوفر",
          "مكتبة الأنمي المترجم",
          "أفلام الأنمي",
          "جدول مواعيد الحلقات",
          "البحث عن أنمي",
          "عن منصة انمي كلوفر",
        ],
        "url": [
          `${SITE_URL}/`,
          `${SITE_URL}/series`,
          `${SITE_URL}/movies`,
          `${SITE_URL}/schedule`,
          `${SITE_URL}/search`,
          `${SITE_URL}/about`,
        ],
      },
    ],
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.name,
      "item": item.path.startsWith("http") ? item.path : `${SITE_URL}${item.path}`,
    })),
  };
}
