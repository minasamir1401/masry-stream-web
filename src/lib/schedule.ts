export interface AiringItem {
  canonical_path?: string; media_type?: string;
  title_english?: string; title_ar?: string; title_aliases?: string[];
  id: number; anime_id: number; title: string; episode: number; airing_at: number;
  local_time: string; poster_url?: string; banner_url?: string; genres: string[];
  duration?: number; score?: number; source_url?: string;
}
export interface AiringWeek {
  week_start: string; today: string; timezone: string; source: string; updated_at: string; stale: boolean;
  days: { date: string; name: string; items: AiringItem[] }[];
}
export const genreArabic: Record<string, string> = {
  Action: "أكشن", Adventure: "مغامرات", Fantasy: "خيال", Drama: "دراما", Comedy: "كوميديا",
  Romance: "رومانسي", Supernatural: "خارق للطبيعة", Thriller: "تشويق", Mystery: "غموض",
  Sports: "رياضة", "Slice of Life": "حياة يومية", "Sci-Fi": "خيال علمي", Horror: "رعب",
  Psychological: "نفسي", Music: "موسيقي", Mecha: "ميكا", "Mahou Shoujo": "فتيات ساحرات",
};
export function cairoToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
export function displayDate(value: string) {
  return new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}
