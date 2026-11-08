import { mediaHref } from "@/lib/media-links";
import { arabicSummary } from "@/lib/content";
import { mediaMetadata } from "@/lib/media-seo";
import { mediaNames } from "@/lib/media-names";
import { BilingualTitle } from "@/components/BilingualTitle";
import { jsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchMediaById, fetchPopularSeries, fetchAnimeMovies } from "@/lib/api";
import { WatchExperience } from "@/components/WatchExperience";
import { loadWatch } from "@/lib/media-page";
import "./watch.css";

export const dynamic = "force-dynamic";

interface WatchPageProps {
  params: { id: string };
  searchParams?: { ep?: string };
}

export async function generateMetadata({ params, searchParams }: WatchPageProps): Promise<Metadata> {
  const { media, episode } = await loadWatch(params.id, searchParams?.ep || "1");
  return mediaMetadata(media, "watch", episode);
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { media, episode } = await loadWatch(params.id, searchParams?.ep || "1");
  const [recommendations] = await Promise.allSettled([
    media.media_type === "SERIES" ? fetchPopularSeries(1, 7) : fetchAnimeMovies(1, 7),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://animeclover.click";
  const posterImg = media.banner_url || media.poster_url || `${siteUrl}/preview_full.png`;

  // Schema: TVEpisode
  const jsonLdEpisode = {
    "@context": "https://schema.org",
    "@type": media.media_type === "MOVIE" ? "Movie" : "TVEpisode",
    "name": media.media_type === "MOVIE" ? mediaNames(media).label : `${mediaNames(media).label} — الحلقة ${episode}`,
    "alternateName": mediaNames(media).aliases,
    "episodeNumber": episode,
    "partOfSeries": media.media_type === "SERIES" ? {
      "@type": "TVSeries",
      "name": mediaNames(media).label,
      "url": `${siteUrl}${mediaHref(media)}`,
    } : undefined,
    "image": posterImg,
    "description": arabicSummary(media),
    "inLanguage": ["ja", "ar"],
  };

  // Schema: BreadcrumbList
  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "انمي كلوفر الرئيسية",
        "item": siteUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": mediaNames(media).label,
        "item": `${siteUrl}${mediaHref(media)}`,
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
        dangerouslySetInnerHTML={{ __html: jsonLd(jsonLdEpisode) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(jsonLdBreadcrumb) }}
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
