import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchMovieById, fetchPopularSeries, fetchAnimeMovies } from "@/lib/api";
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
    return { title: "الحلقة غير متوفرة | Anime Clover" };
  }
  const episode = Number(rawEpisode);
  const media = await fetchMovieById(params.id).catch(() => null);
  if (!media) return { title: "الحلقة غير متوفرة | Anime Clover" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://animeclover.com";
  const canonicalUrl = `${siteUrl}/watch/${media.id}?ep=${episode}`;
  const posterImg = media.banner_url || media.poster_url || `${siteUrl}/preview_full.png`;

  const titleAr = media.title;
  const titleEn = media.original_title && media.original_title !== media.title ? ` (${media.original_title})` : "";
  const pageTitle = `أنمي ${titleAr} الحلقة ${episode} مترجمة HD | Watch ${media.original_title || titleAr} Ep ${episode} Sub - Anime Clover`;
  const pageDesc = `شاهد وحمّل الآن أنمي ${titleAr}${titleEn} الحلقة ${episode} مترجمة عربي بجودة فائقة Full HD مع سيرفرات تشغيل مباشرة وسريعة وبدون إعلانات. Watch ${media.original_title || titleAr} episode ${episode} online on Anime Clover.`;

  const keywords = [
    media.title,
    `أنمي ${media.title} الحلقة ${episode}`,
    `حلقة ${episode} ${media.title}`,
    `${media.title} episode ${episode}`,
    `مشاهدة ${media.title} حلقة ${episode}`,
    `تحميل ${media.title} حلقة ${episode}`,
    media.original_title || "",
    `${media.original_title || media.title} ep ${episode}`,
    `watch ${media.title} episode ${episode} sub`,
    "Anime Clover",
    "أنمي كلوفر",
    "animeclover",
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
      title: `أنمي ${titleAr} الحلقة ${episode} مترجمة اون لاين | Anime Clover`,
      description: pageDesc,
      url: canonicalUrl,
      siteName: "Anime Clover | أنمي كلوفر",
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
      title: `أنمي ${titleAr} الحلقة ${episode} مترجمة اون لاين | Anime Clover`,
      description: pageDesc,
      images: [posterImg],
    },
  };
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const rawEpisode = searchParams?.ep || "1";
  if (!/^[1-9]\d*$/.test(rawEpisode) || !/^\d+$/.test(params.id)) notFound();
  const episode = Number(rawEpisode);
  if (!Number.isSafeInteger(episode)) notFound();

  const media = await fetchMovieById(params.id).catch(() => null);
  if (!media) notFound();

  const [recommendations] = await Promise.allSettled([
    media.media_type === "SERIES" ? fetchPopularSeries(1, 7) : fetchAnimeMovies(1, 7),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://animeclover.com";
  const posterImg = media.banner_url || media.poster_url || `${siteUrl}/preview_full.png`;

  // Schema: TVEpisode
  const jsonLdEpisode = {
    "@context": "https://schema.org",
    "@type": "TVEpisode",
    "name": `${media.title} - الحلقة ${episode}`,
    "episodeNumber": episode,
    "partOfSeries": {
      "@type": "TVSeries",
      "name": media.title,
      "url": `${siteUrl}/series/${media.id}`,
    },
    "image": posterImg,
    "description": `شاهد الحلقة ${episode} من أنمي ${media.title} مترجمة عربي بجودة Full HD على أنمي كلوفر Anime Clover.`,
    "inLanguage": ["ja", "ar"],
  };

  // Schema: VideoObject for Google Video Rich Snippets
  const jsonLdVideo = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": `أنمي ${media.title} الحلقة ${episode} مترجمة عربي`,
    "description": `مشاهدة الحلقة ${episode} من أنمي ${media.title} اون لاين بجودة عالية HD على Anime Clover.`,
    "thumbnailUrl": [posterImg],
    "uploadDate": new Date().toISOString(),
    "embedUrl": `${siteUrl}/watch/${media.id}?ep=${episode}`,
    "publisher": {
      "@type": "Organization",
      "name": "Anime Clover",
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
