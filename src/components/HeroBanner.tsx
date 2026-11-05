"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpLeft, ChevronLeft, ChevronRight, Pause, Play, Star, Zap } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { genreArabic } from "@/lib/schedule";
import { HeroImage, loadHeroImage } from "./HeroImage";
import { FavoriteButton } from "./FavoriteButton";
import { AnimeImage } from "./AnimeImage";

export function HeroBanner({ items }: { items: MediaItem[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const active = index % Math.max(1, items.length);
  const item = items[active];
  useEffect(() => {
    if (items.length < 2) return;
    const upcoming = items[(active + 1) % items.length];
    const poster = upcoming.poster_proxy_url || upcoming.poster_url;
    if (poster) { const preload = new Image(); preload.src = poster; }
    void loadHeroImage(upcoming).then(image => { const preload = new Image(); preload.src = image.image_url; }).catch(() => {});
  }, [active, items]);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    const updateVisibility = () => setVisible(document.visibilityState === "visible");
    update();
    updateVisibility();
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {preference.removeEventListener("change", update);document.removeEventListener("visibilitychange", updateVisibility);};
  }, []);
  useEffect(() => {
    if (items.length < 2 || paused || hovered || focused || reducedMotion || !visible) return;
    const timer = setTimeout(() => setIndex(value => (value + 1) % items.length), 9000);
    return () => clearTimeout(timer);
  }, [active, items.length, paused, hovered, focused, reducedMotion, visible]);
  if (!item) return <section className="discovery-hero hero-empty"><div className="hero-empty-copy"><span className="hero-weekly"><Zap size={16} />حكايتك القادمة هنا</span><h1>عالم من الحكايات.<br /><em>على مزاجك.</em></h1><p>اكتشف أنمي جديد، وارجع لأعمالك المفضلة.</p><Link className="discovery-primary" href="/series">استكشف الأنمي<ArrowUpLeft size={18} /></Link></div></section>;
  const season = item.title.match(/\s+(?:Season\s*|S)(\d+)$/i);
  const title = season ? item.title.slice(0, season.index) : item.title;
  const ordinals: Record<string, string> = { "1":"الأول", "2":"الثاني", "3":"الثالث", "4":"الرابع", "5":"الخامس" };
  const next = (step: number) => setIndex(value => (value + step + items.length) % items.length);
  return (
    <section className="discovery-hero cinematic-hero" aria-label="الأعمال المميزة" aria-roledescription="عرض شرائح" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => {if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);}}>
      <div className="discovery-hero-art" key={`art-${item.id}`} aria-hidden="true"><HeroImage item={item}/></div>
      <div className="discovery-hero-shade" />
      <div className="hero-aura" aria-hidden="true" />
      <div className="hero-visual" key={`visual-${item.id}`}>
        <div className="hero-orbit" aria-hidden="true" />
        <Link prefetch={false} className="hero-poster" href={`/${item.media_type === "MOVIE" ? "movie" : "series"}/${item.id}`} aria-label={`اكتشف ${item.title}`}>
          <AnimeImage src={item.poster_proxy_url || item.poster_url} alt={`الغلاف الرسمي — ${item.title}`} eager/>
          <span className="hero-poster-play" aria-hidden="true"><Play size={22} fill="currentColor"/></span>
        </Link>
        {item.is_available && <div className="hero-available"><span/><span>متاح الآن<span className="hero-available-detail">{item.available_episode ? `حتى الحلقة ${item.available_episode}` : "ابدأ المشاهدة"}</span></span></div>}
      </div>
      <div className="discovery-hero-copy" key={`copy-${item.id}`}>
        <span className="hero-weekly"><Zap size={15} fill="currentColor" />أحدث الحلقات<span className="hero-weekly-line"/>{item.available_episode ? `الحلقة ${String(item.available_episode).padStart(2,"0")}` : "جديد على Anime Clover"}</span>
        <h1 dir="auto" title={item.title}>{title}</h1>
        {season && <h2 className="hero-season">الموسم {ordinals[season[1]] || season[1]}</h2>}
        <p className="hero-tagline">حلقة جديدة. حكايتك مستمرة.</p>
        <div className="discovery-hero-meta">
          {item.genres.slice(0,2).map(genre => <span key={genre.name}>{genreArabic[genre.name] || genre.name}</span>)}
          {item.release_year && <span>{item.release_year}</span>}
          {item.average_score ? <strong><Star size={16} fill="currentColor" />{(item.average_score/10).toFixed(1)}</strong> : null}
        </div>
        <div className="discovery-hero-actions"><Link prefetch={false} className="discovery-primary" href={`/watch/${item.id}?ep=${item.available_episode || 1}`}><Play size={19} fill="currentColor" />شاهد {item.available_episode ? `الحلقة ${item.available_episode}` : "الآن"}</Link><FavoriteButton item={item} /></div>
        <Link prefetch={false} className="hero-detail-link" href={`/${item.media_type === "MOVIE" ? "movie" : "series"}/${item.id}`}>اكتشف القصة<ArrowUpLeft size={15}/></Link>
      </div>
      {items.length > 1 && <div className="discovery-hero-bottom"><div className="hero-slide-status"><span className="hero-slide-count" dir="ltr"><strong>{String(active+1).padStart(2,"0")}</strong><span>/ {String(items.length).padStart(2,"0")}</span></span><div className="discovery-hero-pagination" aria-label="اختيار العمل">{items.map((entry, position) => <button key={entry.id} type="button" aria-label={`عرض ${entry.title}`} aria-pressed={position === active} className={position === active ? "selected" : ""} onClick={() => setIndex(position)} />)}</div></div><div className="hero-arrow-controls">{!reducedMotion && <button className="hero-autoplay" onClick={() => setPaused(value => !value)} aria-label={paused ? "تشغيل العرض التلقائي" : "إيقاف العرض التلقائي"} aria-pressed={paused}>{paused ? <Play size={13}/> : <Pause size={13}/>}</button>}<button onClick={() => next(-1)} aria-label="العمل السابق"><ChevronRight size={18}/></button><button onClick={() => next(1)} aria-label="العمل التالي"><ChevronLeft size={18}/></button></div></div>}
    </section>
  );
}
