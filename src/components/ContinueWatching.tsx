"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CirclePlay, Play } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { readWatchHistory, WATCH_HISTORY_EVENT, WatchProgress } from "@/lib/watch-history";
import { AnimeImage } from "./AnimeImage";

export function ContinueWatching({ suggestions }: { suggestions: MediaItem[] }) {
  const [history,setHistory] = useState<WatchProgress[]>([]);
  useEffect(() => {
    const update = () => setHistory(readWatchHistory());
    update();
    window.addEventListener(WATCH_HISTORY_EVENT,update);
    window.addEventListener("storage",update);
    return () => { window.removeEventListener(WATCH_HISTORY_EVENT,update); window.removeEventListener("storage",update); };
  },[]);
  const cards = history.length ? history.slice(0,3) : suggestions.slice(0,3).map(item => ({ animeId:item.id, title:item.title, posterUrl:item.poster_url, episode:item.available_episode || 1, currentTime:0, duration:0, updatedAt:0 }));
  if (!cards.length) return null;
  return <section className="resume-section" aria-labelledby="resume-heading"><div className="discovery-section-heading"><h2 id="resume-heading"><CirclePlay size={23}/>{history.length ? "أكمل المشاهدة" : "ابدأ حكاية جديدة"}</h2>{history.length > 0 && <span className="section-subtle">من آخر مكان وقفت عنده</span>}</div><div className="resume-grid">{cards.map(item => {
    const percent = item.duration > 0 ? Math.min(100,Math.round(item.currentTime / item.duration * 100)) : 0;
    return <Link key={item.animeId} className="resume-card" href={`/watch/${item.animeId}?ep=${item.episode}`} aria-label={`${history.length ? "أكمل" : "شاهد"} ${item.title}، الحلقة ${item.episode}`}><AnimeImage src={item.posterUrl} alt={item.title}/><div className="resume-card-shade"/><div className="resume-card-content"><div className="resume-card-title"><div><strong dir="auto">{item.title}</strong><span>الحلقة {String(item.episode).padStart(2,"0")}{percent ? ` · باقي ${Math.max(1,Math.ceil((item.duration-item.currentTime)/60))} دقيقة` : " · ابدأ المشاهدة"}</span></div><span className="resume-play"><Play size={15} fill="currentColor"/></span></div>{percent > 0 && <div className="resume-progress"><progress max={100} value={percent} aria-label={`شاهدت ${percent}٪ من الحلقة`}/><span>{percent}%</span></div>}</div></Link>;
  })}</div></section>;
}
