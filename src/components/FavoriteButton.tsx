"use client";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { MediaItem } from "@/lib/types";

export const FAVORITES_KEY = "anime-clover-favorites";
export const LEGACY_FAVORITES_KEY = "anime-slayer-favorites";

export function readFavorites(): MediaItem[] {
  try {
    const raw =
      localStorage.getItem(FAVORITES_KEY) ||
      localStorage.getItem(LEGACY_FAVORITES_KEY) ||
      "[]";
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function FavoriteButton({ item }: { item: MediaItem }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setSaved(readFavorites().some((entry) => entry.id === item.id));
  }, [item.id]);

  function toggle() {
    const entries = readFavorites();
    const next = saved ? entries.filter((entry) => entry.id !== item.id) : [...entries, item];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    setSaved(!saved);
    window.dispatchEvent(new Event("favorites-updated"));
  }

  return (
    <button
      className={`secondary-action ${saved ? "is-saved" : ""}`}
      onClick={toggle}
      aria-pressed={saved}
    >
      <Heart size={19} fill={saved ? "currentColor" : "none"} />
      {saved ? "في المفضلة" : "أضف للمفضلة"}
    </button>
  );
}
