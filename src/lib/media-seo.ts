import { mediaHref, watchHref } from "./media-links";
import { arabicSummary } from "./content";
import type { Metadata } from "next";
import type { MediaItem } from "./types";
import { mediaNames } from "./media-names";
import { BRAND_SOCIAL_IMAGE, SITE_BRAND } from "./brand";
import { BRAND_ALTERNATE_NAMES, SITE_URL } from "./seo";

export function mediaMetadata(media: MediaItem, kind: "series" | "movie" | "watch", episode?: number): Metadata {
  const names = mediaNames(media);
  const episodeNumber = episode ?? 1;
  const suffix = kind === "watch"
    ? (media.media_type === "MOVIE" ? "مشاهدة الفيلم" : `مشاهدة الحلقة ${episodeNumber}`)
    : kind === "movie" ? "فيلم أنمي" : "الحلقات والمعلومات";
  const title = `${names.label} — ${suffix} | ${SITE_BRAND}`;
  const summary = `${names.label} — ${suffix}. ${arabicSummary(media)}`.replace(/\s+/g, " ").trim();
  const description = summary.length > 260 ? summary.slice(0, 261).replace(/\s+\S*$/, "") : summary;
  const canonical = `${SITE_URL}${kind === "watch" ? watchHref(media.id, episodeNumber) : mediaHref(media)}`;
  const artwork = media.banner_url || media.poster_url;
  const image = artwork ? { url: artwork, alt: names.label } : BRAND_SOCIAL_IMAGE;
  return {
    title: { absolute: title }, description, keywords: [...names.aliases, SITE_BRAND, ...BRAND_ALTERNATE_NAMES],
    alternates: { canonical },
    openGraph: { type: kind === "watch" && media.media_type !== "MOVIE" ? "video.episode" : kind === "movie" || media.media_type === "MOVIE" ? "video.movie" : "video.tv_show", title, description, url: canonical, locale: "ar_EG", siteName: SITE_BRAND, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1, "max-snippet": -1 } },
  };
}
