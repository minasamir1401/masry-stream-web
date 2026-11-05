"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Compass, Film, Heart, Home, Search, ShieldCheck, X } from "lucide-react";
import { Brand } from "./Brand";
import { InstallNavButton } from "./InstallNavButton";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => setSearchOpen(false), [pathname]);
  useEffect(() => {if (searchOpen) searchInput.current?.focus();}, [searchOpen]);
  const links = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/series", label: "اكتشف الأنمي", icon: Compass },
    { href: "/movies", label: "الأفلام", icon: Film },
    { href: "/schedule", label: "جدول الحلقات", icon: CalendarDays },
  ];
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Brand />
        <nav className="app-navigation" aria-label="التنقل الرئيسي">{links.map(link => <Link key={link.href} href={link.href} className={(link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)) ? "active" : ""} aria-current={pathname === link.href ? "page" : undefined}><link.icon size={15} strokeWidth={1.7}/>{link.label}</Link>)}</nav>
        <div className="app-header-tools">
          <InstallNavButton />
          <button className="app-icon-link app-search-toggle" aria-label={searchOpen ? "إغلاق البحث" : "فتح البحث"} aria-expanded={searchOpen} aria-controls="site-search" onClick={() => setSearchOpen(value => !value)}>{searchOpen ? <X size={20}/> : <Search size={20}/>}</button>
          <form id="site-search" className={`app-search ${searchOpen ? "is-open" : ""}`} role="search" onKeyDown={event => {if (event.key === "Escape") setSearchOpen(false);}} onSubmit={event => { event.preventDefault(); if (query.trim()) {router.push(`/search?q=${encodeURIComponent(query.trim())}`);setSearchOpen(false);} }}>
            <button type="submit" aria-label="بحث"><Search size={18} strokeWidth={1.6} /></button>
            <input ref={searchInput} aria-label="ابحث عن أنمي" placeholder="ابحث عن أنميك المفضل..." value={query} onChange={event => setQuery(event.target.value)} />
          </form>
          <Link className={`app-icon-link ${pathname === "/favorites" ? "active" : ""}`} href="/favorites" aria-label="المفضلة"><Heart size={20} strokeWidth={1.6} /></Link>
          <Link className={`app-icon-link ${pathname === "/admin" ? "active" : ""}`} href="/admin" aria-label="لوحة التحكم" title="لوحة التحكم"><ShieldCheck size={20} strokeWidth={1.6} /></Link>
        </div>
      </div>
    </header>
  );
}
