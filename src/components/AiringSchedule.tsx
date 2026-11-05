"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, RefreshCw, Search } from "lucide-react";
import { AiringWeek, displayDate, genreArabic } from "@/lib/schedule";
import { fetchAiringWeek } from "@/lib/api";
import { AnimeImage } from "./AnimeImage";

function shiftDate(value: string, days: number) { const date=new Date(value+"T12:00:00Z"); date.setUTCDate(date.getUTCDate()+days); return date.toISOString().slice(0,10); }
export function AiringSchedule({ initial, selectedDay }: { initial: AiringWeek | null; selectedDay?: string }) {
  const [week,setWeek]=useState(initial), [selected,setSelected]=useState(selectedDay||initial?.today||""), [loading,setLoading]=useState(false), [error,setError]=useState(!initial), [query,setQuery]=useState("");
  const [now,setNow]=useState(0);
  useEffect(()=>{setNow(Date.now()/1000);const timer=setInterval(()=>setNow(Date.now()/1000),60000);return ()=>clearInterval(timer);},[]);
  async function load(day?:string) {setLoading(true);setError(false);try{const result=await fetchAiringWeek(day);setWeek(result);setSelected(day||result.today);}catch{setError(true);}finally{setLoading(false);}}
  const current=week?.days.find(day=>day.date===selected)||week?.days[0];
  const items=(current?.items||[]).filter(item=>item.title.toLowerCase().includes(query.toLowerCase()));
  return <section className="schedule-page"><div className="schedule-intro"><div><div className="eyebrow"><CalendarDays size={17}/>لا تفوّت حلقتك القادمة</div><h1>جدول عرض الأنمي</h1><p>تابع الأنميات التي تُعرض كل يوم، واعرف موعد الحلقة القادمة.</p></div><div className="schedule-zone"><Clock3 size={19}/><span>كل المواعيد بتوقيت القاهرة<small>Africa/Cairo · توقيت العرض الأصلي</small></span></div></div>
    <div className="schedule-toolbar"><div className="week-switcher"><button disabled={loading||!week} onClick={()=>load(shiftDate(week!.week_start,-7))} aria-label="الأسبوع السابق"><ChevronRight size={18}/></button><span>{week?`${displayDate(week.week_start)} — ${displayDate(shiftDate(week.week_start,6))}`:"جدول الأسبوع"}</span><button disabled={loading||!week} onClick={()=>load(shiftDate(week!.week_start,7))} aria-label="الأسبوع التالي"><ChevronLeft size={18}/></button><button className="today-button" onClick={()=>load()} disabled={loading}>اليوم</button></div><button className="refresh-schedule" onClick={()=>load(selected||undefined)} disabled={loading}><RefreshCw size={16} className={loading?"animate-spin":""}/>تحديث المواعيد</button></div>
    {week&&<div className="day-tabs" role="tablist" aria-label="أيام الأسبوع">{week.days.map(day=><button key={day.date} role="tab" aria-selected={current?.date===day.date} className={current?.date===day.date?"active":""} onClick={()=>setSelected(day.date)}><span>{day.name}{day.date===week.today&&<i>اليوم</i>}</span><small>{displayDate(day.date)}</small><b>{day.items.length} أنمي</b></button>)}</div>}
    {week?.stale&&<div className="schedule-notice">تعذّر التحديث الآن؛ نعرض آخر مواعيد محفوظة. جرّب التحديث بعد قليل.</div>}
    <div className="schedule-results-heading"><h2>{current?`أنميات يوم ${current.name}`:"مواعيد العرض"}<span>{items.length} عرض</span></h2><label className="schedule-search"><Search size={16}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="ابحث داخل هذا اليوم..." aria-label="ابحث في مواعيد اليوم"/></label></div>
    {error?<div className="schedule-empty"><CalendarDays size={36}/><h3>تعذّر تحميل المواعيد حاليًا</h3><p>تعذّر جلب مواعيد الحلقات حاليًا. أعد المحاولة بعد قليل.</p><button className="primary-action" onClick={()=>load(selected||undefined)}>إعادة المحاولة</button></div>:loading?<div className="schedule-loading"><RefreshCw className="animate-spin"/>جارٍ تحديث جدول العرض...</div>:items.length?<div className="schedule-cards">{items.map(item=><Link className="airing-card" key={item.id} href={`/series/${item.anime_id}`}><div className="airing-poster"><AnimeImage src={item.poster_url} alt={item.title}/></div><div className="airing-info"><div className="airing-top"><span className={now&&item.airing_at<=now?"aired-tag":"upcoming-tag"}>{now&&item.airing_at<=now?"تم العرض":"قادم"}</span><time dir="ltr"><Clock3 size={14}/>{item.local_time}</time></div><h3 dir="auto">{item.title}</h3><p>الحلقة <b>{item.episode}</b></p><div className="airing-genres">{item.genres.slice(0,2).map(genre=><span key={genre}>{genreArabic[genre]||genre}</span>)}</div></div><ChevronLeft className="airing-chevron" size={18}/></Link>)}</div>:<div className="schedule-empty"><CalendarDays size={36}/><h3>{query?"لا توجد نتائج لهذا البحث":"لا توجد عروض معلنة لهذا اليوم"}</h3><p>{query?"جرّب البحث باسم مختلف.":"اختر يومًا آخر لمعرفة الحلقات القادمة."}</p></div>}
    <p className="schedule-source">المواعيد قابلة للتغيير من الجهة المنتجة؛ موعد العرض لا يعني توفر نسخة مترجمة فورًا.</p>
  </section>;
}
