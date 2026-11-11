"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clapperboard, Film, Grid2X2, Grid3X3, Search, SlidersHorizontal, X } from "lucide-react";
import { CatalogQuery } from "@/lib/api";
import { PaginatedMedia } from "@/lib/types";
import { genreArabic } from "@/lib/schedule";
import { MediaCard } from "./MediaCard";
import { AnimeImage } from "./AnimeImage";

const fields = [
  {key:"genre",label:"التصنيف",options:Object.entries(genreArabic).map(([value,label]) => ({value,label}))},
  {key:"year",label:"سنة الإصدار",options:Array.from({length:60},(_,i) => {const year=String(new Date().getFullYear()+1-i);return {value:year,label:year};})},
  {key:"sort",label:"الترتيب",options:[{value:"POPULARITY_DESC",label:"الأكثر شعبية"},{value:"START_DATE_DESC",label:"الأحدث إصدارًا"},{value:"SCORE_DESC",label:"الأعلى تقييمًا"},{value:"TRENDING_DESC",label:"الرائج الآن"},{value:"TITLE_ROMAJI",label:"حسب الاسم"},{value:"EPISODES_DESC",label:"عدد الحلقات"}]},
  {key:"season",label:"الموسم",options:[{value:"WINTER",label:"شتاء"},{value:"SPRING",label:"ربيع"},{value:"SUMMER",label:"صيف"},{value:"FALL",label:"خريف"}]},
  {key:"status",label:"حالة العرض",options:[{value:"RELEASING",label:"يعرض الآن"},{value:"FINISHED",label:"مكتمل"},{value:"NOT_YET_RELEASED",label:"لم يعرض بعد"},{value:"HIATUS",label:"متوقف مؤقتًا"},{value:"CANCELLED",label:"ملغي"}]},
  {key:"format",label:"نوع العمل",options:[{value:"TV",label:"مسلسل تلفزيوني"},{value:"MOVIE",label:"فيلم"},{value:"TV_SHORT",label:"مسلسل قصير"},{value:"ONA",label:"ONA"},{value:"OVA",label:"OVA"},{value:"SPECIAL",label:"حلقة خاصة"}]},
];
const sorting = [{value:"POPULARITY_DESC",label:"الأكثر شعبية"},{value:"START_DATE_DESC",label:"الأحدث"},{value:"SCORE_DESC",label:"الأعلى تقييمًا"},{value:"TRENDING_DESC",label:"الرائج الآن"}];

export function CatalogBrowser({ data, filters, failed=false, title="اكتشف الأنمي" }: { data:PaginatedMedia; filters:CatalogQuery; failed?:boolean; title?:string }) {
  const [query,setQuery] = useState(filters.q || "");
  const [pending,startTransition] = useTransition();
  const [expanded,setExpanded] = useState(false);
  const [density,setDensity] = useState<"comfortable"|"compact">("compact");
  const router=useRouter(), pathname=usePathname();
  const movies=pathname === "/movies";
  useEffect(() => setQuery(filters.q || ""),[filters.q]);
  function url(changes:CatalogQuery) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...filters, ...changes })) {
      if (value && !(movies && key === "format") && !(key === "page" && value === "1")) {
        params.set(key, value);
      }
    }
    return `${pathname}${params.size ? `?${params}` : ""}`;
  }
  function apply(changes:CatalogQuery) { startTransition(() => router.push(url({...changes,page:"1"}))); }
  const active = Object.entries(filters).filter(([key,value]) => value && !["page","sort"].includes(key) && !(movies && key === "format"));
  const page=Number(filters.page)||1, hasNext=data.has_next_page ?? page<data.total_pages;
  const pages=Array.from(new Set([1,page-1,page,...(hasNext ? [page+1] : [])])).filter(value => value>=1).sort((a,b) => a-b);
  const shownFields=fields.filter(field => (!movies || field.key !== "format") && (expanded || ["genre","year","sort"].includes(field.key)));
  function reset() { setQuery("");startTransition(() => router.push(pathname)); }

  return <section className="library-page">
    <div className="library-intro"><div className="library-intro-copy"><div className="library-breadcrumb"><Link href="/">الرئيسية</Link><ChevronLeft size={12}/><span>{movies ? "الأفلام" : "مكتبة الأنمي"}</span></div><span className="library-eyebrow">{movies ? <Film size={15}/> : <Clapperboard size={15}/>}حكايتك الجاية مستنياك</span><h1>{title}</h1><p>{movies ? "حكاية كاملة في ليلة واحدة. اكتشف أفلام الأنمي التي تستحق وقتك." : "عوالم جديدة، وشخصيات ما تتنسيش. اختار حكايتك من مكتبة الأنمي."}</p></div>{data.items.length>0 && <div className="library-cover-stack" aria-hidden="true">{data.items.slice(0,3).map(item => <AnimeImage key={item.id} src={item.poster_url} alt=""/>)}</div>}</div>
    <div className="library-tabs-bar"><nav className="library-sort-tabs" aria-label="اختيار ترتيب الأعمال">{sorting.map(sort => <Link key={sort.value} href={url({sort:sort.value,page:"1"})} className={(filters.sort || "POPULARITY_DESC") === sort.value ? "active" : ""} aria-current={(filters.sort || "POPULARITY_DESC") === sort.value ? "true" : undefined}>{sort.label}</Link>)}</nav><div className="library-kind-switch"><Link href="/series" className={!movies ? "active" : ""}>كل الأنمي</Link><Link href="/movies" className={movies ? "active" : ""}>الأفلام</Link></div></div>
    <div className="library-filter-panel"><form className="library-search" onSubmit={event => {event.preventDefault();apply({q:query.trim() || undefined});}}><Search size={19}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder={movies ? "ابحث عن فيلم..." : "ابحث باسم الأنمي..."} aria-label="اسم الأنمي"/><button type="submit" className="discovery-primary" disabled={pending}>بحث</button></form><div className="library-filter-controls">{shownFields.map(field => <label key={field.key}><span>{field.label}</span><select disabled={pending} aria-label={field.label} value={filters[field.key] || (field.key === "sort" ? "POPULARITY_DESC" : "")} onChange={event => apply({[field.key]:event.target.value || undefined})}>{field.key !== "sort" && <option value="">الكل</option>}{field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>)}<button type="button" className={`library-more-filters ${expanded ? "active" : ""}`} aria-expanded={expanded} onClick={() => setExpanded(value => !value)}><SlidersHorizontal size={17}/>{expanded ? "فلاتر أقل" : "فلاتر متقدمة"}</button></div>{active.length>0 && <div className="library-active-filters">{active.map(([key,value]) => {const field=fields.find(entry => entry.key === key);const label=key === "q" ? `البحث: ${value}` : field?.options.find(option => option.value === value)?.label || value;return <button key={key} onClick={() => apply({[key]:undefined})} aria-label={`إزالة فلتر ${label}`}>{label}<X size={12}/></button>;})}<button className="library-clear" onClick={reset}>مسح الكل</button></div>}</div>
    <div className="library-results-heading"><div><h2>{filters.q ? `نتائج «${filters.q}»` : movies ? "أفلام تستحق المشاهدة" : "استكشف الأعمال"}</h2><span aria-live="polite">{pending ? "جارٍ تحديث النتائج..." : `${data.items.length.toLocaleString("ar-EG")} عمل في الصفحة ${page.toLocaleString("ar-EG")}`}</span></div><div className="library-density" role="group" aria-label="كثافة عرض الكروت"><button aria-label="كروت أكبر" aria-pressed={density === "comfortable"} onClick={() => setDensity("comfortable")}><Grid2X2 size={17}/></button><button aria-label="كروت أكثر" aria-pressed={density === "compact"} onClick={() => setDensity("compact")}><Grid3X3 size={17}/></button></div></div>
    <div aria-busy={pending}>{failed ? <div className="discovery-empty"><h2>تعذّر تحميل المكتبة حاليًا</h2><p>حاول مرة أخرى بعد قليل.</p><button className="discovery-primary" onClick={() => startTransition(() => router.refresh())}>إعادة المحاولة</button></div> : data.items.length ? <div className={`library-grid ${density} ${pending ? "is-pending" : ""}`}>{data.items.map((item,index) => <MediaCard key={item.id} item={item} priority={index<6}/>)}</div> : <div className="discovery-empty"><Search size={30}/><h2>لسه ما لقيناش حكايتك</h2><p>جرّب اسمًا آخر أو خفّف شروط البحث.</p><button className="discovery-primary" onClick={reset}>إعادة ضبط البحث</button></div>}</div>
    {(page>1 || hasNext) && <nav className="library-pagination" aria-label="صفحات الأنمي">{page>1 ? <Link href={url({page:String(page-1)})} aria-label="الصفحة السابقة"><ChevronRight size={17}/></Link> : <span className="disabled"><ChevronRight size={17}/></span>}{pages.map((value,index) => <span className="library-page-number" key={value}>{index>0 && value-pages[index-1]>1 && <i>…</i>}<Link href={url({page:String(value)})} aria-current={value === page ? "page" : undefined}>{value}</Link></span>)}{hasNext && <Link href={url({page:String(page+1)})} aria-label="الصفحة التالية"><ChevronLeft size={17}/></Link>}</nav>}
  </section>;
}
