"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpLeft, LoaderCircle, Search, X } from "lucide-react";
import { fetchAnimeSuggestions } from "@/lib/api";
import { mediaHref } from "@/lib/media-links";
import { mediaNames } from "@/lib/media-names";
import type { MediaItem } from "@/lib/types";
import { AnimeImage } from "./AnimeImage";
import { BilingualTitle } from "./BilingualTitle";

export function SiteSearch({ expanded, onClose }: { expanded: boolean; onClose: () => void }) {
  const router = useRouter(), pathname = usePathname();
  const input = useRef<HTMLInputElement>(null);
  const listId = `anime-suggestions-${useId().replace(/:/g, "")}`;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [active, setActive] = useState(-1);
  const term = query.trim();
  useEffect(() => { if (open && active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" }); }, [active, open, listId]);
  useEffect(() => { setOpen(false); setActive(-1); }, [pathname]);
  useEffect(() => { if (expanded) input.current?.focus(); }, [expanded]);
  useEffect(() => {
    setActive(-1); setItems([]);
    if (!term || !open) { setStatus("idle"); return; }
    let current = true;
    const controller = new AbortController();
    setStatus("loading");
    const timer = setTimeout(async () => {
      try {
        const result = await fetchAnimeSuggestions(term, controller.signal);
        if (current) { setItems(result.items); setStatus("ready"); }
      } catch { if (current && !controller.signal.aborted) setStatus("error"); }
    }, 220);
    return () => { current = false; clearTimeout(timer); controller.abort(); };
  }, [term, open]);
  function close() { setOpen(false); setActive(-1); onClose(); }
  function searchAll() { if (term) { router.push(`/search?q=${encodeURIComponent(term)}`); close(); } }
  const visible = open && !!term;
  return <form id="site-search" className={`app-search ${expanded ? "is-open" : ""}`} role="search"
    onSubmit={event => { event.preventDefault(); if (visible && active >= 0 && items[active]) { router.push(mediaHref(items[active])); close(); } else searchAll(); }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}
    onKeyDown={event => {
      if (event.key === "Escape") { event.preventDefault(); close(); if (expanded) (document.querySelector(".app-search-toggle") as HTMLButtonElement | null)?.focus(); }
      if ((event.key === "ArrowDown" || event.key === "ArrowUp") && items.length) {
        event.preventDefault(); setOpen(true); setActive(value => value < 0 ? (event.key === "ArrowDown" ? 0 : items.length - 1) : (value + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length);
      }
    }}>
    <button type="submit" aria-label="بحث"><Search size={18}/></button>
    <input ref={input} type="search" role="combobox" aria-label="ابحث عن أنمي بالعربي أو الإنجليزي" placeholder="اسم الأنمي بالعربي أو الإنجليزي..." autoComplete="off" spellCheck={false}
      aria-autocomplete="list" aria-expanded={visible} aria-controls={visible ? listId : undefined} aria-activedescendant={visible && active >= 0 ? `${listId}-${active}` : undefined}
      value={query} onFocus={() => setOpen(true)} onChange={event => { setQuery(event.target.value); setOpen(true); setActive(-1); }}/>
    {query && <button className="search-clear" type="button" aria-label="مسح البحث" onClick={() => {setQuery(""); setItems([]); setActive(-1); input.current?.focus();}}><X size={15}/></button>}
    {visible && <div className="search-suggestions">
      <div className="search-suggestions-heading"><span>اقتراحات الأنمي</span>{status === "loading" && <LoaderCircle size={15} className="animate-spin" aria-hidden="true"/>}</div>
      <p className="search-suggestions-status" role="status" aria-live="polite">{status === "loading" ? "جارٍ البحث..." : status === "error" ? "تعذّر تحميل الاقتراحات. جرّب عرض نتائج البحث." : status === "ready" && !items.length ? "لا توجد اقتراحات مطابقة. جرّب اسمًا آخر." : items.length ? `${items.length} اقتراحات؛ استخدم الأسهم للاختيار.` : ""}</p>
      <ul id={listId} role="listbox" aria-label="الأنميات المقترحة">{items.map((item, index) => <li key={item.id} role="none"><Link prefetch={false} href={mediaHref(item)} role="option" id={`${listId}-${index}`} aria-selected={active === index} className={`search-suggestion ${active === index ? "is-active" : ""}`} onMouseEnter={() => setActive(index)} onClick={close} aria-label={mediaNames(item).label}>
        <AnimeImage src={item.poster_proxy_url || item.poster_url} alt=""/><span className="search-suggestion-copy"><BilingualTitle media={item}/><span className="search-suggestion-meta">{item.media_type === "MOVIE" ? "فيلم" : "مسلسل"}{item.release_year ? ` · ${item.release_year}` : ""}</span></span><ArrowUpLeft size={16}/>
      </Link></li>)}</ul>
      <Link className="search-all-results" prefetch={false} href={`/search?q=${encodeURIComponent(term)}`} onClick={close}>عرض كل نتائج البحث<ArrowUpLeft size={15}/></Link>
    </div>}
  </form>;
}
