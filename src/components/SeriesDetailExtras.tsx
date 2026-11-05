"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown, Play } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { readWatchHistory, WATCH_HISTORY_EVENT, WatchProgress } from "@/lib/watch-history";
import { FavoriteButton } from "./FavoriteButton";

export function SeriesWatchActions({item,upcoming=false}:{item:MediaItem;upcoming?:boolean}) {
  const [resume,setResume]=useState<WatchProgress|null>(null);
  useEffect(() => { const update=() => setResume(readWatchHistory().find(entry => entry.animeId === item.id) || null);update();window.addEventListener("storage",update);window.addEventListener(WATCH_HISTORY_EVENT,update);return () => {window.removeEventListener("storage",update);window.removeEventListener(WATCH_HISTORY_EVENT,update);}; },[item.id]);
  return <div className="anime-profile-actions">{upcoming ? <span className="anime-upcoming-action">لم يبدأ العرض بعد</span> : <Link prefetch={false} className="discovery-primary" href={`/watch/${item.id}?ep=${resume?.episode || 1}`}><Play size={18} fill="currentColor"/><span>{resume ? "أكمل المشاهدة" : "ابدأ المشاهدة"}{resume && <small>الحلقة {resume.episode}</small>}</span></Link>}<FavoriteButton item={item}/></div>;
}

export function SeriesSynopsis({description}:{description?:string}) {
  const [expanded,setExpanded]=useState(false);
  const text=description || "لسه مفيش وصف متاح للحكاية دي.";
  return <section id="about" className="anime-story"><div className="anime-story-heading"><h2><BookOpen size={19}/>عن الحكاية</h2>{text.length>260 && <button aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? "عرض أقل" : "اقرأ المزيد"}<ChevronDown size={15}/></button>}</div><p dir="auto" className={expanded ? "expanded" : ""}>{text}</p></section>;
}
