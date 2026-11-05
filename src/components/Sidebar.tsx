"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Clapperboard,
  Layers,
  Tag,
  RotateCw,
  Heart,
  Clock,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/series", label: "قائمة الأنمي", icon: LayoutGrid },
    { href: "/movies", label: "الأفلام", icon: Clapperboard },
    { href: "/series", label: "المواسم", icon: Layers },
    { href: "/search", label: "التصنيفات", icon: Tag },
    { href: "/movies", label: "آخر التحديثات", icon: RotateCw },
    { href: "/search?saved=favorites", label: "المفضلة", icon: Heart },
    { href: "/search?saved=watchlist", label: "المشاهدة لاحقاً", icon: Clock },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 h-[calc(100vh-2rem)] sticky top-4 rounded-3xl bg-[#0c061a]/95 border border-purple-900/40 backdrop-blur-xl p-3 justify-between shadow-2xl shadow-purple-950/50">
      {/* Navigation List */}
      <nav className="flex flex-col gap-1.5 pt-2">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = idx === 0 && pathname === "/";
          return (
            <Link
              key={item.label + idx}
              href={item.href}
              className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-lg shadow-purple-600/35"
                  : "text-purple-200/80 hover:text-white hover:bg-purple-950/40"
              }`}
            >
              <span>{item.label}</span>
              <Icon
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? "text-white" : "text-purple-300/70 group-hover:text-purple-200"
                }`}
              />
            </Link>
          );
        })}
      </nav>

      {/* Aesthetic Anime Torii Gate & Moon Artwork */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-purple-800/30 bg-gradient-to-t from-purple-950/60 to-transparent flex items-center justify-center p-2">
        <Image
          src="/theme/sidebar_goku_moon.png"
          alt="Anime silhouette art"
          fill
          className="object-cover object-center rounded-2xl opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c061a] via-transparent to-transparent pointer-events-none" />
      </div>
    </aside>
  );
}

