"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { MediaCard } from "./MediaCard";

interface MediaSliderProps {
  title: string;
  items: MediaItem[];
  viewAllHref?: string;
  subtitle?: string;
}

export function MediaSlider({ title, items, viewAllHref, subtitle }: MediaSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
      // In RTL, scrolling right goes to earlier items, left goes to later items
      const delta = direction === "right" ? scrollAmount : -scrollAmount;
      scrollContainerRef.current.scrollBy({ left: delta, behavior: "smooth" });
    }
  };

  return (
    <section className="relative my-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-cinema-textMuted mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs sm:text-sm font-semibold text-cinema-accentLight hover:text-white transition-colors ml-2"
            >
              عرض الكل
            </Link>
          )}

          {/* Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => handleScroll("right")}
              className="p-1.5 rounded-lg bg-cinema-card hover:bg-cinema-elevated border border-cinema-border text-cinema-textSecondary hover:text-white transition-colors"
              aria-label="التالي"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll("left")}
              className="p-1.5 rounded-lg bg-cinema-card hover:bg-cinema-elevated border border-cinema-border text-cinema-textSecondary hover:text-white transition-colors"
              aria-label="السابق"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 py-2 scroll-smooth"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="flex-none w-40 sm:w-48 md:w-56"
          >
            <MediaCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}

