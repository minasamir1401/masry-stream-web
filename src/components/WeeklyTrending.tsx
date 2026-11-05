"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PlayCircle, Flame, ChevronLeft } from "lucide-react";

interface TrendingItem {
  id: number;
  titleEn: string;
  titleAr: string;
  badge: string;
  badgeColor: string;
  episodes: number;
  image: string;
  href: string;
}

const TRENDING_ANIME: TrendingItem[] = [
  {
    id: 11679,
    titleEn: "Chainsaw Man",
    titleAr: "الرجل المنشار",
    badge: "18+",
    badgeColor: "bg-rose-600 text-white",
    episodes: 12,
    image: "/theme/poster_chainsaw.jpg",
    href: "/series/11679",
  },
  {
    id: 21612,
    titleEn: "Demon Slayer",
    titleAr: "قاتل الشياطين",
    badge: "مكتمل",
    badgeColor: "bg-emerald-600 text-white",
    episodes: 44,
    image: "/theme/poster_demonslayer.jpg",
    href: "/series/21612",
  },
  {
    id: 21,
    titleEn: "One Piece",
    titleAr: "ون بيس",
    badge: "مستمر",
    badgeColor: "bg-purple-600 text-white",
    episodes: 1098,
    image: "/theme/poster_onepiece.jpg",
    href: "/series/21",
  },
  {
    id: 16498,
    titleEn: "Attack on Titan",
    titleAr: "هجوم العمالقة",
    badge: "مكتمل",
    badgeColor: "bg-blue-600 text-white",
    episodes: 87,
    image: "/theme/poster_aot.jpg",
    href: "/series/16498",
  },
  {
    id: 151807,
    titleEn: "Solo Leveling",
    titleAr: "سولو ليفلينغ",
    badge: "مستمر",
    badgeColor: "bg-purple-600 text-white",
    episodes: 12,
    image: "/theme/poster_sololeveling.jpg",
    href: "/series/151807",
  },
  {
    id: 20,
    titleEn: "Naruto Shippuden",
    titleAr: "ناروتو شيبودن",
    badge: "مكتمل",
    badgeColor: "bg-blue-600 text-white",
    episodes: 500,
    image: "/theme/poster_naruto.jpg",
    href: "/series/20",
  },
];

export function WeeklyTrending() {
  return (
    <section className="w-full">
      {/* Section Header: Title on Right, Link on Left */}
      <div className="flex items-center justify-between mb-3" dir="rtl">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
            الأكثر مشاهدة هذا الأسبوع
          </h2>
        </div>

        <Link
          href="/series"
          className="text-xs font-semibold text-purple-300 hover:text-fuchsia-400 flex items-center gap-1 transition-colors"
        >
          <span>عرض المزيد</span>
          <ChevronLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid of 6 Anime Cards (Arranged LTR to match visual sequence Chainsaw Man -> Naruto) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4" dir="ltr">
        {TRENDING_ANIME.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex flex-col rounded-2xl overflow-hidden bg-[#130a2a] border border-purple-900/40 hover:border-fuchsia-500/60 transition-all duration-300 hover:shadow-glow hover:-translate-y-1"
          >
            {/* Poster Art with Badge */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-purple-950/50">
              <Image
                src={item.image}
                alt={item.titleEn}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />

              {/* Status Badge */}
              <div className="absolute bottom-2 left-2">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider shadow-sm backdrop-blur-md ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="p-2.5 flex flex-col items-center justify-between flex-1 gap-1 text-center bg-gradient-to-b from-[#130a2a] to-[#0f0722]">
              <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                {item.titleEn}
              </span>
              <span className="text-[11px] font-medium text-purple-300/75 line-clamp-1" dir="rtl">
                {item.titleAr}
              </span>

              {/* Footer: Play icon & episode count */}
              <div className="flex items-center justify-center gap-1.5 mt-1 pt-1 border-t border-purple-900/30 w-full text-purple-300/80 text-[10px] font-semibold" dir="rtl">
                <PlayCircle className="w-3.5 h-3.5 text-purple-400 group-hover:text-fuchsia-400 transition-colors" />
                <span>الحلقات: {item.episodes}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
