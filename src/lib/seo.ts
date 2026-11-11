import { appIconPath, BRAND_SOCIAL_IMAGE, SITE_BRAND, SITE_BRAND_AR } from "./brand";
import type { Metadata } from "next";

export { SITE_BRAND } from "./brand";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://animeclover.click").replace(/\/+$/, "");
export const BRAND_ALTERNATE_NAMES = [SITE_BRAND_AR, "CloverFlix", "كلوفر فيلكس"];
export const ENGLISH_HOME_PATH = "/en";

export const DEFAULT_TITLE = `${SITE_BRAND} (${SITE_BRAND_AR}) | مشاهدة الأنمي المترجم`;

export const DEFAULT_DESCRIPTION =
  `شاهد مسلسلات وأفلام الأنمي المترجمة للعربية على ${SITE_BRAND_AR} (${SITE_BRAND}). اكتشف أعمالًا جديدة، وتابع أحدث الحلقات وجدول مواعيد العرض الأسبوعي.`;

export const CORE_KEYWORDS = [
  SITE_BRAND,
  ...BRAND_ALTERNATE_NAMES,
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

export function homeAlternates(language: "ar" | "en"): Metadata["alternates"] {
  const ar = `${SITE_URL}/`;
  const en = `${SITE_URL}${ENGLISH_HOME_PATH}`;
  return { canonical: language === "en" ? en : ar, languages: { ar, en, "x-default": ar } };
}

export function pageSocialMetadata(title: string, description: string, url: string, language: "ar" | "en" = "ar"): Pick<Metadata, "openGraph" | "twitter"> {
  const english = language === "en";
  return {
    openGraph: {
      type: "website",
      locale: english ? "en_US" : "ar_EG",
      siteName: SITE_BRAND,
      title,
      description,
      url,
      images: [english ? { ...BRAND_SOCIAL_IMAGE, alt: `The ${SITE_BRAND} anime platform logo` } : BRAND_SOCIAL_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description, images: [BRAND_SOCIAL_IMAGE.url] },
  };
}

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
        "alternateName": BRAND_ALTERNATE_NAMES,
        "url": SITE_URL,
        "slogan": "شاهد واكتشف الأنمي المترجم بالعربية",
        "description": DEFAULT_DESCRIPTION,
        "logo": {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          "url": `${SITE_URL}${appIconPath(512)}`,
          "contentUrl": `${SITE_URL}${appIconPath(512)}`,
          "width": 512,
          "height": 512,
          "caption": SITE_BRAND,
        },
        "image": {
          "@type": "ImageObject",
          "url": `${SITE_URL}${BRAND_SOCIAL_IMAGE.url}`,
          "width": BRAND_SOCIAL_IMAGE.width,
          "height": BRAND_SOCIAL_IMAGE.height,
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
        "inLanguage": ["ar", "en"],
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
        "alternateName": BRAND_ALTERNATE_NAMES,
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
          `الرئيسية - ${SITE_BRAND}`,
          "مكتبة الأنمي المترجم",
          "أفلام الأنمي",
          "جدول مواعيد الحلقات",
          "البحث عن أنمي",
          `عن منصة ${SITE_BRAND}`,
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
