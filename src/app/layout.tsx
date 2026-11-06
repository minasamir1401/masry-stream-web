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
    default: "انمي كلوفر AnimeClover | موقع مشاهدة وتحميل انمي مترجم اون لاين",
    template: "%s | انمي كلوفر AnimeClover",
  },
  description:
    "موقع انمي كلوفر (انمي لكوفر - AnimeClover) افضل موقع انمي عربي لمشاهدة وتحميل جميع مسلسلات وافلام وحلقات الانمي مترجمة اون لاين بجودة عالية Full HD مجانا وبدون اعلانات مزعجة.",
  applicationName: "AnimeClover",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AnimeClover",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48 32x32 16x16", type: "image/x-icon" },
      { url: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/brand/anime-clover-mark.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  authors: [{ name: "AnimeClover" }],
  generator: "Next.js",
  verification: {
    google: "Lo5jfaL9kqxdNMycHzc__ac1jP5rdLe4fTXIFEzQWdc",
  },
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
    "حلقات انمي",
    "AnimeClover",
    "animeclover",
    "Anime Clover",
    "animeclover.click",
    "anime online",
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
    siteName: "انمي كلوفر AnimeClover",
    title: "انمي كلوفر AnimeClover | موقع مشاهدة وتحميل انمي مترجم اون لاين",
    description:
      "موقع انمي كلوفر (انمي لكوفر - AnimeClover) افضل موقع انمي عربي لمشاهدة وتحميل مسلسلات وافلام وحلقات الانمي مترجمة اون لاين بجودات متعددة مجاناً وبأعلى جودة.",
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
        alt: "انمي كلوفر AnimeClover",
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
    "name": "انمي كلوفر AnimeClover",
    "alternateName": [
      "انمي كلوفر",
      "أنمي كلوفر",
      "انمي لكوفر",
      "أنمي لكوفر",
      "كلوفر انمي",
      "لكوفر انمي",
      "موقع انمي كلوفر",
      "موقع انمي لكوفر",
      "موقع انمي",
      "انمي اون لاين",
      "AnimeClover",
      "Anime Clover",
      "AnimeClover Online",
    ],
    "url": siteUrl,
    "description":
      "موقع انمي كلوفر AnimeClover (انمي لكوفر) لمشاهدة وتحميل أحدث مسلسلات وأفلام وحلقات الأنمي المترجمة باللغة العربية بجودة عالية وبدون إعلانات مزعجة.",
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
    "name": "انمي كلوفر AnimeClover",
    "alternateName": ["انمي كلوفر", "انمي لكوفر", "Anime Clover", "AnimeClover"],
    "url": siteUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${siteUrl}/icons/icon-512.png`,
      "width": 512,
      "height": 512,
    },
    "image": `${siteUrl}/og-image.png`,
    "sameAs": [],
  };

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="Lo5jfaL9kqxdNMycHzc__ac1jP5rdLe4fTXIFEzQWdc"
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icons/icon-48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icons/icon-96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="thumbnail" content={`${siteUrl}/og-image.png`} />
        <link rel="image_src" href={`${siteUrl}/og-image.png`} />
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
