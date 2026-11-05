"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Genre } from "@/lib/types";
import { SlidersHorizontal } from "lucide-react";

interface FilterBarProps {
  categories: Genre[];
  selectedGenre?: string;
  selectedSort?: string;
  basePath?: string;
}

export function FilterBar({
  categories,
  selectedGenre,
  selectedSort = "latest",
  basePath = "/movies",
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleGenreClick = (slug?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("genre", slug);
    } else {
      params.delete("genre");
    }
    params.set("page", "1");
    router.push(`${basePath}?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort_by", e.target.value);
    params.set("page", "1");
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-4 mb-6 border-b border-cinema-border/50">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => handleGenreClick(undefined)}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            !selectedGenre
              ? "bg-cinema-accent text-white shadow-glow"
              : "bg-cinema-card hover:bg-cinema-elevated text-cinema-textSecondary hover:text-white border border-cinema-border"
          }`}
        >
          الكل
        </button>

        {categories.map((cat) => {
          const isActive = selectedGenre === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => handleGenreClick(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-cinema-accent text-white shadow-glow"
                  : "bg-cinema-card hover:bg-cinema-elevated text-cinema-textSecondary hover:text-white border border-cinema-border"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <SlidersHorizontal className="w-4 h-4 text-cinema-textMuted" />
        <span className="text-xs text-cinema-textMuted font-medium">الترتيب:</span>
        <select
          value={selectedSort}
          onChange={handleSortChange}
          className="bg-cinema-card border border-cinema-border rounded-lg text-xs font-semibold text-cinema-textSecondary py-1.5 px-3 focus:outline-none focus:border-cinema-accent"
        >
          <option value="latest">الأحدث إضافة</option>
          <option value="views">الأكثر مشاهدة</option>
          <option value="size">حجم الملف الأكبر</option>
          <option value="duration">الأطول مدة</option>
          <option value="title">الأبجدي (أ - ي)</option>
        </select>
      </div>
    </div>
  );
}

