import { mediaNames, type TitleFields } from "@/lib/media-names";

export function BilingualTitle({ media }: { media: TitleFields }) {
  const { en, ar } = mediaNames(media);
  return <span className={`bilingual-title${ar ? " has-ar" : ""}`}>{ar && <span className="anime-name-ar" lang="ar" dir="rtl">{ar}</span>}{en && <span className="anime-name-en" lang="en" dir="ltr">{en}</span>}{!en && !ar && "أنمي"}</span>;
}
