import type { MediaItem } from "./types";

/** The hero follows the live popularity feed, with current content as fallback. */
export function selectHeroSlides(popular: MediaItem[], fallback: MediaItem[], limit = 8): MediaItem[] {
  const seen = new Set<number>();
  return [...popular, ...fallback].filter(item => {
    if (seen.has(item.id) || item.status === "NOT_YET_RELEASED" || item.status === "CANCELLED") return false;
    if (!item.banner_url && !item.poster_url && !item.poster_proxy_url) return false;
    seen.add(item.id);
    return true;
  }).slice(0, limit);
}

export function matchingBanner(item: Pick<MediaItem, "id" | "banner_url">): string | undefined {
  if (!item.banner_url) return undefined;
  try {
    const url = new URL(item.banner_url);
    const prefix = `/file/anilistcdn/media/anime/banner/${item.id}`;
    const belongsToWork = url.pathname.startsWith(`${prefix}-`) || ["jpg", "jpeg", "png", "webp", "avif"].some(extension => url.pathname === `${prefix}.${extension}`);
    if (url.protocol === "https:" && url.hostname.endsWith(".anilist.co") && belongsToWork) return url.href;
  } catch {}
  return undefined;
}
