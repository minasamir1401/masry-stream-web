import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { InstallToastNotification } from "@/components/InstallToastNotification";
import {
  SITE_URL,
  SITE_BRAND,
  SITE_NAME_EN,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  CORE_KEYWORDS,
  buildRootGraphJsonLd,
} from "@/lib/seo";
import "./globals.css";
import "./discovery.css";

export const viewport: Viewport = {
  themeColor: "#0b0e14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_BRAND}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_BRAND,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_BRAND,
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
  authors: [{ name: SITE_BRAND, url: SITE_URL }],
  creator: SITE_NAME_EN,
  publisher: SITE_BRAND,
  generator: "Next.js",
  verification: {
    google: "Lo5jfaL9kqxdNMycHzc__ac1jP5rdLe4fTXIFEzQWdc",
  },
  keywords: CORE_KEYWORDS,
  alternates: {
    canonical: "/",
    languages: {
      "ar": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_AR",
    url: SITE_URL,
    siteName: SITE_BRAND,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
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
  const rootGraphJsonLd = buildRootGraphJsonLd();

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="thumbnail" content={`${SITE_URL}/og-image.png`} />
        <link rel="image_src" href={`${SITE_URL}/og-image.png`} />
        <link rel="preconnect" href="https://s4.anilist.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.myanimelist.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//s4.anilist.co" />
        <link rel="dns-prefetch" href="//cdn.myanimelist.net" />
        <link rel="dns-prefetch" href="//image.tmdb.org" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootGraphJsonLd) }}
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
