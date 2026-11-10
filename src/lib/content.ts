import { mediaNames, isArabicText } from "./media-names";
import type { MediaItem } from "./types";
import { genreArabic } from "./schedule";
import { SITE_BRAND } from "./brand";

export function arabicSummary(media: MediaItem): string {
  for (const text of [media.description_ar, media.description]) {
    if (isArabicText(text)) return text!;
  }
  const kind = media.media_type === "MOVIE" ? "فيلم أنمي" : "مسلسل أنمي";
  const genres = (media.genres || []).map(genre => genreArabic[genre.name]).filter(Boolean).join("، ");
  const names = mediaNames(media);
  return `${names.ar || names.en || "هذا العمل"} ${kind}${media.release_year ? ` من إنتاج ${media.release_year}` : ""}${genres ? `، من تصنيفات ${genres}` : ""}. ${media.total_episodes && media.media_type === "SERIES" ? `العدد المعلن للحلقات: ${media.total_episodes}. ` : ""}لا يتوفر ملخص قصصي بالعربية لهذا العمل حاليًا. تصفّح معلوماته والحلقات التي عُرضت على ${SITE_BRAND}.`;
}
