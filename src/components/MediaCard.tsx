import { mediaHref } from "@/lib/media-links";
import { BilingualTitle } from "./BilingualTitle";
import { mediaNames } from "@/lib/media-names";
import Link from "next/link";
import { Play, Star } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { genreArabic } from "@/lib/schedule";
import { SITE_BRAND } from "@/lib/brand";
import { AnimeImage } from "./AnimeImage";

export function MediaCard({ item, priority = false, episode }: { item: MediaItem; priority?: boolean; episode?: number }) {
  const href = mediaHref(item);
  const names = mediaNames(item);
  const watchHref = episode ? `/watch/${item.id}?ep=${episode}` : href;
  const artLabel = episode ? `شاهد انمي ${names.label} الحلقة ${episode} مترجمة على ${SITE_BRAND}` : `تفاصيل ${names.label}`;
  const artAlt = episode ? `انمي ${names.label} الحلقة ${episode} - ${SITE_BRAND}` : `الغلاف الرسمي — ${names.label}`;
  const badge = episode ? `الحلقة ${String(episode).padStart(2, "0")}` : item.media_type === "MOVIE" ? "فيلم" : "مسلسل";

  return (
    <article className="library-card">
      <Link prefetch={false} href={watchHref} className="library-card-art" aria-label={artLabel}>
        <AnimeImage src={item.poster_proxy_url || item.poster_url} alt={artAlt} eager={priority} />
        <span className="library-card-play"><Play size={23} fill="currentColor" /></span>
        <span className="library-card-format">{badge}</span>
      </Link>
      <div className="library-card-copy">
        <Link prefetch={false} href={href} className="library-card-title" title={names.label} dir="auto">
          <BilingualTitle media={item} />
        </Link>
        <div className="library-card-info">
          {item.average_score ? <span className="discovery-rating"><Star size={13} fill="currentColor" />{(item.average_score / 10).toFixed(1)}</span> : null}
          {item.release_year ? <span>{item.release_year}</span> : null}
          {item.media_type === "SERIES" && item.total_episodes ? <span>{item.total_episodes} حلقة</span> : null}
        </div>
        <p className="library-card-genres">{item.genres.slice(0, 2).map(genre => genreArabic[genre.name] || genre.name).join(" · ")}</p>
      </div>
    </article>
  );
}
