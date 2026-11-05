"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export function CategoryCards() {
  const cards = [
    {
      title: "الأفلام",
      href: "/movies",
      image: "/theme/cat_movies.png",
      glowBorder: "hover:border-rose-500/80 hover:shadow-rose-900/40",
    },
    {
      title: "المواسم",
      href: "/series",
      image: "/theme/cat_seasons.png",
      glowBorder: "hover:border-blue-500/80 hover:shadow-blue-900/40",
    },
    {
      title: "قائمة الأنمي",
      href: "/series",
      image: "/theme/cat_list.png",
      glowBorder: "hover:border-indigo-500/80 hover:shadow-indigo-900/40",
    },
    {
      title: "التصنيفات",
      href: "/search",
      image: "/theme/cat_categories.png",
      glowBorder: "hover:border-fuchsia-500/80 hover:shadow-fuchsia-900/40",
    },
  ];

  return (
    <section className="w-full">
      {/* Arranged LTR to match the exact visual Left-to-Right sequence: الأفلام -> المواسم -> قائمة الأنمي -> التصنيفات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4" dir="ltr">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className={`relative h-20 sm:h-24 rounded-2xl overflow-hidden border border-purple-800/30 bg-[#0e0722] shadow-lg transition-all duration-300 hover:scale-[1.02] ${card.glowBorder}`}
          >
            <Image
              src={card.image}
              alt={card.title}
              fill
              className="object-cover object-center"
              unoptimized
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
