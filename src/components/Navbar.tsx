"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Compass, Film, Heart, Home, Search, X } from "lucide-react";
import { Brand } from "./Brand";
import { SiteSearch } from "./SiteSearch";
import { InstallNavButton } from "./InstallNavButton";

export function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => setSearchOpen(false), [pathname]);
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
          <SiteSearch expanded={searchOpen} onClose={() => setSearchOpen(false)} />
          <Link className={`app-icon-link ${pathname === "/favorites" ? "active" : ""}`} href="/favorites" aria-label="المفضلة"><Heart size={20} strokeWidth={1.6} /></Link>
        </div>
      </div>
    </header>
  );
}
