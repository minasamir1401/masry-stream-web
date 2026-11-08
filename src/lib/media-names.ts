/** Public names use Arabic and Latin scripts; native provider names stay internal. */
export interface TitleFields {
  title: string;
  title_english?: string;
  title_ar?: string;
  original_title?: string;
  title_aliases?: string[];
}

export function cleanPublicTitle(value?: string): string {
  return (value || "").normalize("NFKC").replace(new RegExp("[^\\p{Script=Latin}\\p{Script=Arabic}\\p{N}\\p{P}\\p{Zs}]", "gu"), " ").replace(/\s+/g, " ").trim();
}

export function mediaNames(media: TitleFields) {
  const arabic = /[\u0621-\u064a]/;
  const candidates = [media.title_english, media.title, media.original_title].map(cleanPublicTitle);
  const en = candidates.find(value => /[A-Za-z]/.test(value) && !arabic.test(value)) || "";
  const ar = [media.title_ar, media.original_title, media.title].map(cleanPublicTitle).find(value => arabic.test(value)) || "";
  const aliases = Array.from(new Set([ar, en, ...(media.title_aliases || []).map(cleanPublicTitle)].filter(Boolean)));
  return { en, ar, aliases, label: [ar, en].filter(Boolean).join(" | ") || "أنمي" };
}

export function isArabicText(text?: string): boolean {
  const letters = (text || "").match(new RegExp("\\p{L}","gu")) || [];
  return letters.length >= 12 && letters.filter(char=>/[\u0600-\u06ff]/.test(char)).length / letters.length >= .65;
}

export function matchesMediaName(media: TitleFields, query: string) {
  const normalize = (value: string) => value.normalize("NFKD").toLowerCase().replace(new RegExp("\\p{M}", "gu"), "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/ـ/g, "");
  return mediaNames(media).aliases.some(alias => normalize(alias).includes(normalize(query.trim())));
}

export function normalizeMediaPayload<T>(payload: T): T {
  if (Array.isArray(payload)) payload.forEach(normalizeMediaPayload);
  else if (payload && typeof payload === "object") {
    const item = payload as Record<string, unknown>;
    if (typeof item.title === "string" && ("media_type" in item || "anime_id" in item || "poster_url" in item)) {
      const names = mediaNames(item as unknown as TitleFields);
      Object.assign(item, { title: names.en || names.ar || "أنمي", title_english: names.en, title_ar: names.ar, original_title: names.ar, title_aliases: names.aliases });
      const story = [item.description_ar,item.description].find(value=>typeof value === "string" && isArabicText(value));
      item.description = story;
      item.description_ar = story;
      delete item.description_original;
    }
    Object.values(item).forEach(value => { if (value && typeof value === "object") normalizeMediaPayload(value); });
  }
  return payload;
}
