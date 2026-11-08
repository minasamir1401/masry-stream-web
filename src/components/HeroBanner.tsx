"use client";
import { mediaHref } from "@/lib/media-links";
import { BilingualTitle } from "./BilingualTitle";
import { mediaNames } from "@/lib/media-names";


import { useEffect, useId, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpLeft, ChevronLeft, ChevronRight, Pause, Play, Star, Zap } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { genreArabic } from "@/lib/schedule";
import { HeroImage, loadHeroImage } from "./HeroImage";
import { FavoriteButton } from "./FavoriteButton";

export function HeroBanner({ items }: { items: MediaItem[] }) {
  const screenId = `cinema-screen-${useId().replace(/:/g, "")}`;
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
    const timer = setTimeout(() => setIndex(value => (value + 1) % items.length), 6000);
    return () => clearTimeout(timer);
  }, [active, items.length, paused, hovered, focused, reducedMotion, visible]);
  if (!item) return <section className="discovery-hero hero-empty"><div className="hero-empty-copy"><span className="hero-weekly"><Zap size={16} />حكايتك القادمة هنا</span><h2 className="hero-title">عالم من الحكايات.<br /><em>على مزاجك.</em></h2><p>اكتشف أنمي جديد، وارجع لأعمالك المفضلة.</p><Link className="discovery-primary" href="/series">استكشف الأنمي<ArrowUpLeft size={18} /></Link></div></section>;
  const season = item.title.match(/\s+(?:Season\s*|S)(\d+)$/i);
  const detailsUrl = mediaHref(item);
  const watchUrl = item.is_available && item.available_episode ? `/watch/${item.id}?ep=${item.available_episode}` : detailsUrl;
  const ordinals: Record<string, string> = { "1":"الأول", "2":"الثاني", "3":"الثالث", "4":"الرابع", "5":"الخامس" };
  const next = (step: number) => setIndex(value => (value + step + items.length) % items.length);
  return (
    <section className="discovery-hero cinematic-hero hero-immersive hero-curved" style={{ "--hero-screen-clip": `url("#${screenId}")`, "--hero-screen-mobile-clip": `url("#${screenId}-mobile")` } as CSSProperties} aria-label="الأعمال المميزة" aria-roledescription="عرض شرائح" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => {if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);}}>
      <svg className="hero-screen-definitions" aria-hidden="true" width="0" height="0" focusable="false">
        <defs>
          <clipPath id={screenId} clipPathUnits="objectBoundingBox"><path d="M 0,0 Q .5,.22 1,0 L 1,1 Q .5,.78 0,1 Z" /></clipPath>
          <clipPath id={`${screenId}-mobile`} clipPathUnits="objectBoundingBox"><path d="M 0,0 Q .5,.12 1,0 L 1,1 Q .5,.88 0,1 Z" /></clipPath>
        </defs>
      </svg>
      <div className="hero-screen" aria-hidden="true">
        <div className="discovery-hero-art" key={`art-${item.id}`}><HeroImage item={item}/></div>
        <div className="discovery-hero-shade" />
        <div className="hero-screen-depth" />
        <svg className="hero-screen-edge" viewBox="0 0 1000 1000" preserveAspectRatio="none" focusable="false">
          <path className="hero-screen-edge-desktop" d="M 0,0 Q 500,220 1000,0 L 1000,1000 Q 500,780 0,1000 Z" />
          <path className="hero-screen-edge-mobile" d="M 0,0 Q 500,120 1000,0 L 1000,1000 Q 500,880 0,1000 Z" />
        </svg>
      </div>
      <div className="discovery-hero-copy" key={`copy-${item.id}`}>
        {item.is_available && <div className="hero-available"><span/><span>متاح الآن<span className="hero-available-detail">{item.available_episode ? `حتى الحلقة ${item.available_episode}` : "ابدأ المشاهدة"}</span></span></div>}
        <span className="hero-weekly"><Zap size={15} fill="currentColor" />أشهر الأنميات<span className="hero-weekly-line"/>{item.total_episodes ? `${item.total_episodes} حلقة` : "اكتشف العمل"}</span>
        <h2 className="hero-title" dir="auto" title={mediaNames(item).label}><BilingualTitle media={item}/></h2>
        {season && <h2 className="hero-season">الموسم {ordinals[season[1]] || season[1]}</h2>}
        <p className="hero-tagline">{item.status === "FINISHED" ? "عمل مكتمل — اكتشف القصة والحلقات." : item.status === "RELEASING" ? "يعرض الآن — تابع القصة والحلقات الجديدة." : "اكتشف القصة وتصفّح حلقات هذا العمل."}</p>
        <div className="discovery-hero-meta">
          {item.genres.slice(0,2).map(genre => <span key={genre.name}>{genreArabic[genre.name] || genre.name}</span>)}
          {item.release_year && <span>{item.release_year}</span>}
          {item.average_score ? <strong><Star size={16} fill="currentColor" />{(item.average_score/10).toFixed(1)}</strong> : null}
        </div>
        <div className="discovery-hero-actions"><Link prefetch={false} className="discovery-primary" href={watchUrl}><Play size={19} fill="currentColor" />{watchUrl === detailsUrl ? "استكشف الأنمي" : `شاهد الحلقة ${item.available_episode}`}</Link><FavoriteButton item={item} /></div>
        <Link prefetch={false} className="hero-detail-link" href={detailsUrl}>اكتشف القصة<ArrowUpLeft size={15}/></Link>
      </div>
      {items.length > 1 && <div className="discovery-hero-bottom"><div className="hero-slide-status"><span className="hero-slide-count" dir="ltr"><strong>{String(active+1).padStart(2,"0")}</strong><span>/ {String(items.length).padStart(2,"0")}</span></span><div className="discovery-hero-pagination" aria-label="اختيار العمل">{items.map((entry, position) => <button key={entry.id} type="button" aria-label={`عرض ${mediaNames(entry).label}`} aria-pressed={position === active} className={position === active ? "selected" : ""} onClick={() => setIndex(position)} />)}</div></div><div className="hero-arrow-controls">{!reducedMotion && <button className="hero-autoplay" onClick={() => setPaused(value => !value)} aria-label={paused ? "تشغيل العرض التلقائي" : "إيقاف العرض التلقائي"} aria-pressed={paused}>{paused ? <Play size={13}/> : <Pause size={13}/>}</button>}<button onClick={() => next(-1)} aria-label="العمل السابق"><ChevronRight size={18}/></button><button onClick={() => next(1)} aria-label="العمل التالي"><ChevronLeft size={18}/></button></div></div>}
    </section>
  );
}
