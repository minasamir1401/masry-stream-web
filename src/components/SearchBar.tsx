"use client";
import { mediaHref } from "@/lib/media-links";
import { BilingualTitle } from "./BilingualTitle";
import { mediaNames } from "@/lib/media-names";


import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Film } from "lucide-react";
import { searchMedia } from "@/lib/api";
import { MediaItem } from "@/lib/types";

interface SearchBarProps {
  initialQuery?: string;
  autoFocus?: boolean;
}

export function SearchBar({ initialQuery = "", autoFocus = false }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<MediaItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await searchMedia(query.trim(), 1);
        setSuggestions(res.items.slice(0, 5));
        setIsOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث بالعنوان العربي أو الإنجليزي أو اسم الشخصية..."
          autoFocus={autoFocus}
          className="w-full h-14 bg-cinema-card border border-cinema-border rounded-2xl py-3 pl-12 pr-12 text-base text-white placeholder-cinema-textMuted focus:outline-none focus:border-cinema-accent focus:ring-2 focus:ring-cinema-accent/30 shadow-card transition-all"
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cinema-textMuted" />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-cinema-textMuted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full inset-x-0 mt-2 bg-cinema-card border border-cinema-border rounded-2xl shadow-2xl overflow-hidden z-40">
          <div className="p-2 flex flex-col gap-1">
            {suggestions.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setIsOpen(false);
                  router.push(mediaHref(item));
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-cinema-elevated text-right transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-cinema-accent/20 flex items-center justify-center flex-none">
                  <Film className="w-4 h-4 text-cinema-accentLight" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate"><BilingualTitle media={item}/></h4>
                  <span className="text-[11px] text-cinema-textMuted">
                    {item.release_year || "ديزني"} • {item.resolution || "FHD"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

