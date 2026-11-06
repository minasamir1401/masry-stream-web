import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { InstallToastNotification } from "@/components/InstallToastNotification";
import "./globals.css";
import "./discovery.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://animeclover.click";

export const viewport: Viewport = {
  themeColor: "#0b0e14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AnimeClover - موقع مشاهدة وتحميل الانمي مترجم اون لاين",
    template: "%s - AnimeClover",
  },
  description:
    "أنمي كلوفر AnimeClover موقع عربي يمكنك من خلاله تحميل ومشاهدة جميع افلام وحلقات الانمي مترجمة اون لاين بجودات متعددة مجاناً وبأعلى جودة Full HD.",
  applicationName: "AnimeClover",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AnimeClover",
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
  authors: [{ name: "AnimeClover" }],
  generator: "Next.js",
  verification: {
    google: "EqQAZNH4_rR23EZDbPVEPnqVl6HJ4pp128Dc6k-tgP8",
  },
  keywords: [
    "AnimeClover",
    "animeclover",
    "animeclover.click",
    "أنمي كلوفر",
    "انمي كلوفر",
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
    siteName: "AnimeClover",
    title: "AnimeClover - موقع مشاهدة وتحميل الانمي مترجم اون لاين",
    description:
      "أنمي كلوفر AnimeClover موقع عربي يمكنك من خلاله تحميل ومشاهدة جميع افلام وحلقات الانمي مترجمة اون لاين بجودات متعددة مجاناً وبأعلى جودة.",
    images: [
      {
        url: "/preview_full.png",
        width: 1200,
        height: 630,
        alt: "AnimeClover - موقع مشاهدة وتحميل الانمي مترجم اون لاين",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AnimeClover - موقع مشاهدة وتحميل الانمي مترجم اون لاين",
    description:
      "أنمي كلوفر AnimeClover موقع عربي يمكنك من خلاله تحميل ومشاهدة جميع افلام وحلقات الانمي مترجمة اون لاين بجودات متعددة مجاناً وبأعلى جودة.",
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
    "name": "AnimeClover",
    "alternateName": ["أنمي كلوفر", "انمي كلوفر", "Anime Clover", "AnimeClover Online"],
    "url": siteUrl,
    "description":
      "موقع أنمي كلوفر AnimeClover لمشاهدة وتحميل أحدث مسلسلات وأفلام وحلقات الأنمي المترجمة باللغة العربية بجودة عالية.",
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
    "name": "AnimeClover",
    "url": siteUrl,
    "logo": `${siteUrl}/preview_full.png`,
    "sameAs": [],
  };

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="EqQAZNH4_rR23EZDbPVEPnqVl6HJ4pp128Dc6k-tgP8"
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="preconnect" href="https://s4.anilist.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.myanimelist.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//s4.anilist.co" />
        <link rel="dns-prefetch" href="//cdn.myanimelist.net" />
        <link rel="dns-prefetch" href="//image.tmdb.org" />
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
