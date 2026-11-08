import { mediaHref, watchHref } from "./media-links";
import { arabicSummary } from "./content";
import type { Metadata } from "next";
import type { MediaItem } from "./types";
import { mediaNames } from "./media-names";

export function mediaMetadata(media: MediaItem, kind: "series" | "movie" | "watch", episode?: number): Metadata {
  const names = mediaNames(media);
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://animeclover.click").replace(/\/$/, "");
  const suffix = kind === "watch" ? (media.media_type === "MOVIE" ? "مشاهدة الفيلم" : `الحلقة ${episode}`) : kind === "movie" ? "فيلم أنمي" : "الحلقات والمعلومات";
  const title = `${names.label} — ${suffix} | انمي كلوفر`;
  const description = `${names.label} — ${suffix}. ${arabicSummary(media)}`.replace(/\s+/g," ").slice(0,260).replace(/\s+\S*$/,"");
  const canonical = `${site}${kind === "watch" ? watchHref(media.id, episode || 1) : mediaHref(media)}`;
  const image = media.banner_url || media.poster_url || `${site}/preview_full.png`;
  return {
    title: { absolute: title }, description, keywords: [...names.aliases, "انمي كلوفر", "AnimeClover"],
    alternates: { canonical },
    openGraph: { type: kind === "watch" && media.media_type !== "MOVIE" ? "video.episode" : kind === "movie" || media.media_type === "MOVIE" ? "video.movie" : "video.tv_show", title, description, url: canonical, locale: "ar_EG", siteName: "انمي كلوفر AnimeClover", images: [{ url: image, alt: names.label }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1, "max-snippet": -1 } },
  };
}
