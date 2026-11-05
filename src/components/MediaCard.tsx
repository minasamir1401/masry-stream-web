import Link from "next/link";
import { Play, Star } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { genreArabic } from "@/lib/schedule";
import { AnimeImage } from "./AnimeImage";
export function MediaCard({ item, priority=false }: { item:MediaItem; priority?:boolean }) {
  const href = `/${item.media_type === "SERIES" ? "series" : "movie"}/${item.id}`;
  return <article className="library-card"><Link href={href} className="library-card-art" aria-label={`تفاصيل ${item.title}`}><AnimeImage src={item.poster_proxy_url || item.poster_url} alt={`الغلاف الرسمي — ${item.title}`} eager={priority}/><span className="library-card-play"><Play size={23} fill="currentColor"/></span><span className="library-card-format">{item.media_type === "MOVIE" ? "فيلم" : "مسلسل"}</span></Link><div className="library-card-copy"><Link href={href} className="library-card-title" title={item.title} dir="auto">{item.title}</Link><div className="library-card-info">{item.average_score ? <span className="discovery-rating"><Star size={13} fill="currentColor"/>{(item.average_score/10).toFixed(1)}</span> : null}<span>{item.release_year}</span>{item.media_type === "SERIES" && item.total_episodes ? <span>{item.total_episodes} حلقة</span> : null}</div><p className="library-card-genres">{item.genres.slice(0,2).map(genre => genreArabic[genre.name] || genre.name).join(" · ")}</p></div></article>;
}
