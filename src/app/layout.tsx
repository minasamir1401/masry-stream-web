import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { InstallToastNotification } from "@/components/InstallToastNotification";
import { APP_ICON_SIZES, appIconPath, BRAND_SOCIAL_IMAGE } from "@/lib/brand";
import {
  SITE_URL,
  SITE_BRAND,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  CORE_KEYWORDS,
  buildRootGraphJsonLd,
  jsonLd,
  pageSocialMetadata,
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
    icon: APP_ICON_SIZES.map(size => ({ url: appIconPath(size), sizes: `${size}x${size}`, type: "image/png" })),
    apple: [
      { url: appIconPath(180), sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  authors: [{ name: SITE_BRAND, url: SITE_URL }],
  creator: SITE_BRAND,
  publisher: SITE_BRAND,
  generator: "Next.js",
  verification: {
    google: "Lo5jfaL9kqxdNMycHzc__ac1jP5rdLe4fTXIFEzQWdc",
  },
  keywords: CORE_KEYWORDS,
  alternates: {
    canonical: "/",
  },
  ...pageSocialMetadata(DEFAULT_TITLE, DEFAULT_DESCRIPTION, "/"),
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
        <meta name="thumbnail" content={`${SITE_URL}${BRAND_SOCIAL_IMAGE.url}`} />
        <link rel="image_src" href={`${SITE_URL}${BRAND_SOCIAL_IMAGE.url}`} />
        <link rel="preconnect" href="https://s4.anilist.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.myanimelist.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//s4.anilist.co" />
        <link rel="dns-prefetch" href="//cdn.myanimelist.net" />
        <link rel="dns-prefetch" href="//image.tmdb.org" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(rootGraphJsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="text-slate-100 min-h-screen flex flex-col font-arabic antialiased selection:bg-emerald-600 selection:text-white"
      >
        <Suspense fallback={null}><AnalyticsTracker /></Suspense>
        <InstallToastNotification />
        <Navbar />
        <main className="site-main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
