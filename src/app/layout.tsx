import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { InstallToastNotification } from "@/components/InstallToastNotification";
import "./globals.css";
import "./discovery.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://animeclover.com";

export const viewport: Viewport = {
  themeColor: "#0b0e14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Anime Clover | أنمي كلوفر - عالم مسلسلات وأفلام الأنمي المترجم اون لاين",
    template: "%s | Anime Clover",
  },
  description:
    "موقع Anime Clover (أنمي كلوفر) لمشاهدة وتحميل أحدث مسلسلات وأفلام الأنمي الياباني المترجمة باللغة العربية بجودة عالية Full HD ومواعيد الحلقات الأسبوعية بدون إعلانات مزعجة. Watch subbed anime series and movies online in HD on Anime Clover.",
  applicationName: "Anime Clover",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Anime Clover",
  },
  icons: {
    icon: [
      { url: "/brand/anime-clover-mark.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  authors: [{ name: "Anime Clover" }],
  generator: "Next.js",
  keywords: [
    "Anime Clover",
    "أنمي كلوفر",
    "anime clover",
    "animeclover",
    "أنمي مترجم",
    "مشاهدة انمي",
    "تحميل انمي",
    "انمي اون لاين",
    "مسلسلات أنمي",
    "أفلام أنمي",
    "حلقات الأنمي",
    "جدول الأنمي",
    "مواعيد عرض الأنمي",
    "انمي صيف 2026",
    "انمي خريف 2026",
    "انمي 2026",
    "watch anime online",
    "subbed anime",
    "arabic sub anime",
    "anime episodes streaming",
    "anime movies hd",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "ar": "/",
      "en": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_AR",
    alternateLocale: ["en_US"],
    url: siteUrl,
    siteName: "Anime Clover | أنمي كلوفر",
    title: "Anime Clover | أنمي كلوفر - عالم الأنمي المترجم اون لاين",
    description:
      "شاهد وحمل أحدث حلقات ومسلسلات الأنمي المترجمة بجودة عالية وفور صدورها على أنمي كلوفر Anime Clover.",
    images: [
      {
        url: "/preview_full.png",
        width: 1200,
        height: 630,
        alt: "Anime Clover - عالم مسلسلات وأفلام الأنمي",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anime Clover | أنمي كلوفر - مشاهدة مسلسلات وأفلام الأنمي",
    description:
      "بث مباشر وفوري لأحدث حلقات الأنمي المترجمة بجودة متعددة وسيرفرات سريعة على أنمي كلوفر Anime Clover.",
    images: ["/preview_full.png"],
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
  category: "entertainment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Anime Clover",
    "alternateName": ["أنمي كلوفر", "AnimeClover", "Anime Clover Online"],
    "url": siteUrl,
    "description":
      "موقع Anime Clover لمشاهدة وتحميل أحدث مسلسلات وأفلام الأنمي المترجمة باللغة العربية بجودة عالية.",
    "inLanguage": ["ar", "en", "ja"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const jsonLdOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Anime Clover",
    "url": siteUrl,
    "logo": `${siteUrl}/preview.png`,
    "sameAs": [],
  };

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="text-slate-100 min-h-screen flex flex-col font-arabic antialiased selection:bg-emerald-600 selection:text-white"
      >
        <AnalyticsTracker />
        <InstallToastNotification />
        <Navbar />
        <main className="site-main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
