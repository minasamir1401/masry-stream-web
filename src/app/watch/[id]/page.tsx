import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchMediaById, fetchPopularSeries, fetchAnimeMovies } from "@/lib/api";
import { WatchExperience } from "@/components/WatchExperience";
import "./watch.css";

export const dynamic = "force-dynamic";

interface WatchPageProps {
  params: { id: string };
  searchParams?: { ep?: string };
}

export async function generateMetadata({ params, searchParams }: WatchPageProps): Promise<Metadata> {
  const rawEpisode = searchParams?.ep || "1";
  if (!/^[1-9]\d*$/.test(rawEpisode) || !/^\d+$/.test(params.id)) {
    return { title: "الحلقة غير متوفرة - AnimeClover" };
  }
  const episode = Number(rawEpisode);
  const media = await fetchMediaById(params.id).catch(() => null);
  if (!media) return { title: "الحلقة غير متوفرة - AnimeClover" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://animeclover.click";
  const canonicalUrl = `${siteUrl}/watch/${media.id}?ep=${episode}`;
  const posterImg = media.banner_url || media.poster_url || `${siteUrl}/preview_full.png`;

  const titleAr = media.title;
  const titleEn = media.original_title && media.original_title !== media.title ? ` (${media.original_title})` : "";
  const pageTitle = `انمي ${titleAr} الحلقة ${episode} مترجمة اون لاين - AnimeClover`;
  const pageDesc = `انمي ${titleAr} الحلقة ${episode} مترجمة اون لاين تحميل ومشاهدة بجودة عالية ${titleAr}${titleEn} الحلقة ${episode} كاملة مع التحميل على موقع أنمي كلوفر AnimeClover.`;

  const keywords = [
    media.title,
    `انمي ${media.title} الحلقة ${episode}`,
    `انمي ${media.title} حلقة ${episode}`,
    `انمي ${media.title} الحلقة ${episode} مترجمة`,
    `مشاهدة انمي ${media.title} الحلقة ${episode}`,
    `تحميل انمي ${media.title} الحلقة ${episode}`,
    `${media.title} episode ${episode}`,
    media.original_title || "",
    `${media.original_title || media.title} ep ${episode}`,
    `watch ${media.title} episode ${episode} sub`,
    "AnimeClover",
    "animeclover",
    "animeclover.click",
    "أنمي كلوفر",
    "انمي كلوفر",
    "انمي لكوفر",
    "أنمي لكوفر",
  ].filter(Boolean);

  return {
    title: {
      absolute: pageTitle,
    },
    description: pageDesc,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "video.episode",
      title: pageTitle,
      description: pageDesc,
      url: canonicalUrl,
      siteName: "AnimeClover",
      images: [
        {
          url: posterImg,
          width: 1200,
          height: 630,
          alt: `${media.title} - الحلقة ${episode}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDesc,
      images: [posterImg],
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
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const rawEpisode = searchParams?.ep || "1";
  if (!/^[1-9]\d*$/.test(rawEpisode) || !/^\d+$/.test(params.id)) notFound();
  const episode = Number(rawEpisode);
  if (!Number.isSafeInteger(episode)) notFound();

  const media = await fetchMediaById(params.id).catch(() => null);
  if (!media) notFound();

  const [recommendations] = await Promise.allSettled([
    media.media_type === "SERIES" ? fetchPopularSeries(1, 7) : fetchAnimeMovies(1, 7),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://animeclover.click";
  const posterImg = media.banner_url || media.poster_url || `${siteUrl}/preview_full.png`;

  // Schema: TVEpisode
  const jsonLdEpisode = {
    "@context": "https://schema.org",
    "@type": "TVEpisode",
    "name": `انمي ${media.title} الحلقة ${episode}`,
    "episodeNumber": episode,
    "partOfSeries": {
      "@type": "TVSeries",
      "name": media.title,
      "url": `${siteUrl}/series/${media.id}`,
    },
    "image": posterImg,
    "description": `مشاهدة وتحميل انمي ${media.title} الحلقة ${episode} مترجمة عربي اون لاين بجودة Full HD على موقع أنمي كلوفر AnimeClover.`,
    "inLanguage": ["ja", "ar"],
  };

  // Schema: VideoObject for Google Video Rich Snippets
  const jsonLdVideo = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": `انمي ${media.title} الحلقة ${episode} مترجمة اون لاين`,
    "description": `مشاهدة انمي ${media.title} الحلقة ${episode} اون لاين بجودة عالية HD مع روابط تحميل مباشرة على AnimeClover.`,
    "thumbnailUrl": [posterImg],
    "uploadDate": new Date().toISOString(),
    "embedUrl": `${siteUrl}/watch/${media.id}?ep=${episode}`,
    "publisher": {
      "@type": "Organization",
      "name": "AnimeClover",
      "url": siteUrl,
    },
  };

  // Schema: BreadcrumbList
  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "الرئيسية",
        "item": siteUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": media.title,
        "item": `${siteUrl}/series/${media.id}`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `الحلقة ${episode}`,
        "item": `${siteUrl}/watch/${media.id}?ep=${episode}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdEpisode) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdVideo) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <WatchExperience
        media={media}
        episode={episode}
        streamUrl={media.file_name ? `/api/stream/${media.id}` : undefined}
        recommendations={
          recommendations.status === "fulfilled"
            ? recommendations.value.items.filter((item) => item.id !== media.id).slice(0, 6)
            : []
        }
      />
    </>
  );
}
