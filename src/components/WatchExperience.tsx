"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, Clock3, Film, Keyboard, Maximize2, Minimize2, Play, RefreshCw, Search, Star, Tv } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { genreArabic } from "@/lib/schedule";
import { formatDuration } from "@/lib/utils";
import { EpisodePlayback } from "./EpisodePlayback";
import { EpisodeDiscussion } from "./EpisodeDiscussion";
import { AnimeImage } from "./AnimeImage";
import { FavoriteButton } from "./FavoriteButton";
import { MediaCard } from "./MediaCard";

type EpisodeEntry={number:number;state:"listed"|"unverified"|"upcoming"};
type EpisodeIndex={total:number;released:number;episodes:EpisodeEntry[]};
interface WatchExperienceProps {media:MediaItem;episode:number;streamUrl?:string;recommendations:MediaItem[];}

export function WatchExperience({media,episode,streamUrl,recommendations}:WatchExperienceProps) {
  const [theater,setTheater]=useState(false);
  const [index,setIndex]=useState<EpisodeIndex|null>(null);
  const [loading,setLoading]=useState(true),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
  const [query,setQuery]=useState("");
  const size=40;
  const [page,setPage]=useState(Math.floor((episode-1)/size)+1);
  const series=media.media_type === "SERIES";
  const details=`/${series ? "series" : "movie"}/${media.id}`;
  useEffect(() => {
    if (!series) { setLoading(false); return; }
    const controller=new AbortController();
    setLoading(true);setFailed(false);
    fetch(`/api/anime/${media.id}/episodes`,{cache:"no-store",signal:controller.signal}).then(async response => {if (!response.ok) throw new Error("episodes");const value:EpisodeIndex=await response.json();if (!controller.signal.aborted) setIndex(value);}).catch(() => {if (!controller.signal.aborted) setFailed(true);}).finally(() => {if (!controller.signal.aborted) setLoading(false);});
    return () => controller.abort();
  },[media.id,series,attempt]);
  const episodes=(index?.episodes || []).filter(entry => !query || String(entry.number).includes(query));
  const pages=Math.max(1,Math.ceil(episodes.length/size));
  const currentPage=Math.min(page,pages);
  const previous=index?.episodes.find(entry => entry.number === episode-1 && entry.state !== "upcoming");
  const next=index?.episodes.find(entry => entry.number === episode+1 && entry.state !== "upcoming");
  const currentTitle=series ? `${media.title} — الحلقة ${episode}` : media.title;
  const duration=media.episodes?.find(entry => entry.episode_number === episode)?.duration || media.duration;
  const watchUrl=(number:number) => `/watch/${media.id}?ep=${number}`;

  return <div className={`watch-experience ${theater ? "is-theater" : ""}`}>
    <nav className="watch-breadcrumb" aria-label="مسار المشاهدة"><Link href="/">الرئيسية</Link><ChevronLeft size={12}/><Link href={series ? "/series" : "/movies"}>{series ? "الأنمي" : "الأفلام"}</Link><ChevronLeft size={12}/><Link href={details} dir="auto">{media.title}</Link><ChevronLeft size={12}/><span>{series ? `الحلقة ${episode}` : "المشاهدة"}</span></nav>
    <div className="watch-heading"><div><div className="watch-eyebrow"><span/>{series ? "وقت حلقتك المفضلة" : "ليلتك مع فيلم جديد"}</div><h1 dir="auto">{media.title}</h1></div><Link className="watch-back" href={details}><ArrowRight size={16}/>صفحة العمل</Link></div>
    <div className={`watch-layout ${series ? "" : "watch-movie-layout"}`}><div className="watch-main">
      <div className="watch-player-card"><div className="watch-player-heading"><div className="flex items-center gap-2"><span className="watch-episode-badge">{series ? `الحلقة ${String(episode).padStart(2,"0")}` : "الفيلم الكامل"}</span></div><button className="watch-theater-toggle" onClick={() => setTheater(value => !value)} aria-pressed={theater}>{theater ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}<span>{theater ? "الوضع العادي" : "وضع السينما"}</span></button></div>
        <EpisodePlayback key={`${media.id}-${episode}`} media={media} episode={episode} title={currentTitle} duration={duration} streamUrl={streamUrl} nextEpisode={next?.number}/>
      </div>
      {series && <div className="watch-episode-navigation">{previous ? <Link prefetch={false} href={watchUrl(previous.number)}><ChevronRight size={18}/><span><small>ارجع للحكاية</small>الحلقة السابقة</span></Link> : <span className="watch-nav-disabled"><ChevronRight size={18}/>الحلقة السابقة</span>}<span className="watch-now-label"><Play size={13} fill="currentColor"/>بتشاهد الحلقة {episode}</span>{next ? <Link prefetch={false} className="watch-next" href={watchUrl(next.number)}><span><small>كمّل الحكاية</small>الحلقة التالية</span><ChevronLeft size={18}/></Link> : <span className="watch-nav-disabled">الحلقة التالية<ChevronLeft size={18}/></span>}</div>}
      <section className="watch-about" aria-label="عن العمل"><Link prefetch={false} href={details} className="watch-about-poster"><AnimeImage src={media.poster_url} alt={`غلاف ${media.title}`}/></Link><div className="watch-about-copy"><div className="watch-about-top"><span className="watch-about-type">{series ? <Tv size={14}/> : <Film size={14}/>} {series ? "مسلسل أنمي" : "فيلم أنمي"}</span><div className="watch-meta">{media.average_score ? <strong><Star size={12} fill="currentColor"/>{(media.average_score/10).toFixed(1)}</strong> : null}{media.release_year && <span>{media.release_year}</span>}{duration ? <span><Clock3 size={12}/>{formatDuration(duration)}</span> : null}</div></div><h2 dir="auto"><Link prefetch={false} href={details}>{media.title}</Link></h2><div className="watch-genres">{media.genres.slice(0,3).map(genre => <Link key={genre.name} href={`/series?genre=${encodeURIComponent(genre.name)}`}>{genreArabic[genre.name] || genre.name}</Link>)}</div>{media.description && <details className="watch-synopsis"><summary><BookOpen size={13}/>عن الحكاية<ChevronLeft size={13}/></summary><p dir="auto">{media.description}</p></details>}</div><FavoriteButton item={media}/></section>
      {<details className="watch-shortcuts"><summary><Keyboard size={16}/>اختصارات المشغّل<ChevronLeft size={14}/></summary><div><span><kbd>Space</kbd>تشغيل / إيقاف</span><span><kbd>← →</kbd>تقديم / تأخير ١٠ ثوانٍ</span><span><kbd>M</kbd>كتم الصوت</span><span><kbd>F</kbd>ملء الشاشة</span></div></details>}
      <EpisodeDiscussion mediaId={media.id} episodeNumber={episode} animeTitle={media.title} />
    </div>
    {series && <aside className="watch-sidebar"><section className="watch-episode-panel" aria-labelledby="watch-episodes-heading"><div className="watch-panel-heading"><h2 id="watch-episodes-heading"><Tv size={18}/>الحلقات</h2><span>{index ? `${index.total} حلقة` : "كل الحلقات"}</span></div><p className="watch-panel-note">حكاية كاملة، حلقة ورا حلقة.</p><label className="watch-episode-search"><Search size={15}/><input inputMode="numeric" aria-label="ابحث برقم الحلقة" value={query} placeholder="ابحث برقم الحلقة..." onChange={event => {setQuery(event.target.value.replace(/[٠-٩]/g,char => String(char.charCodeAt(0)-1632)).replace(/[^0-9]/g,""));setPage(1);}}/>{query && <button aria-label="مسح بحث الحلقات" onClick={() => {setQuery("");setPage(Math.floor((episode-1)/size)+1);}}>×</button>}</label>
    {loading ? <div className="watch-episodes-loading" role="status"><RefreshCw size={18} className="animate-spin"/><span>بنجهّز قائمة الحلقات...</span></div> : failed ? <div className="watch-panel-empty"><p>تعذّر تحميل الحلقات</p><button onClick={() => setAttempt(value => value+1)}><RefreshCw size={14}/>إعادة المحاولة</button></div> : <><div className="watch-episode-grid">{episodes.slice((currentPage-1)*size,currentPage*size).map(entry => entry.state === "upcoming" ? <span key={entry.number} className="watch-episode upcoming" title="لم تُعرض بعد">{String(entry.number).padStart(2,"0")}<small>قريبًا</small></span> : <Link prefetch={false} key={entry.number} href={watchUrl(entry.number)} className={`watch-episode ${entry.number === episode ? "current" : ""}`} aria-current={entry.number === episode ? "page" : undefined} aria-label={`الحلقة ${entry.number}${entry.number === episode ? "، تشاهد الآن" : ""}`}>{entry.number === episode && <Play size={10} fill="currentColor"/>}{String(entry.number).padStart(2,"0")}</Link>)}</div>{!episodes.length && <p className="watch-panel-empty">{query ? "مفيش حلقة بالرقم ده" : "لا توجد حلقات معلنة حاليًا"}</p>}{pages>1 && <div className="watch-episode-pages"><button aria-label="صفحة الحلقات السابقة" disabled={currentPage<=1} onClick={() => setPage(value => value-1)}><ChevronRight size={16}/></button><span>{currentPage} / {pages}</span><button aria-label="صفحة الحلقات التالية" disabled={currentPage>=pages} onClick={() => setPage(value => value+1)}><ChevronLeft size={16}/></button></div>}<div className="watch-episode-legend"><span><i/>تشاهد الآن</span><span><i/>لم تُعرض بعد</span></div></>}
    </section><div className="watch-sidebar-tip"><Check size={17}/><div><strong>حكايتك محفوظة</strong><p>تقدّم المشاهدة بيتحفظ تلقائيًا على نفس المتصفح للمشغّل المباشر.</p></div></div></aside>}
    </div>
    {recommendations.length>0 && <section className="watch-recommendations"><div className="discovery-section-heading"><h2>الحكاية الجاية</h2><Link className="discovery-text-link" href={series ? "/series" : "/movies"}>اكتشف أكتر<ChevronLeft size={16}/></Link></div><div className="discovery-posters">{recommendations.map(item => <MediaCard key={item.id} item={item}/>)}</div></section>}
  </div>;
}
