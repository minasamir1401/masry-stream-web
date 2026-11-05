import type { MediaItem } from "./types";

export const WATCH_HISTORY_KEY = "anime-slayer-watch-history-v1";
export const WATCH_HISTORY_EVENT = "watch-history-updated";
export interface WatchProgress {
  animeId: number;
  title: string;
  posterUrl?: string;
  episode: number;
  currentTime: number;
  duration: number;
  updatedAt: number;
}

export function readWatchHistory(): WatchProgress[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(WATCH_HISTORY_KEY) || "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((entry): entry is WatchProgress => !!entry && Number.isInteger(entry.animeId) && typeof entry.title === "string" && Number.isInteger(entry.episode) && entry.episode > 0 && Number.isFinite(entry.duration) && Number.isFinite(entry.currentTime) && Number.isFinite(entry.updatedAt) && entry.currentTime >= 5 && entry.duration > 30 && entry.currentTime / entry.duration < .95).sort((a,b) => b.updatedAt - a.updatedAt).slice(0,20);
  } catch { return []; }
}

export function saveWatchProgress(item: MediaItem, episode: number, currentTime: number, duration: number) {
  if (typeof window === "undefined" || !Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 30 || currentTime < 5) return;
  try {
    const history = readWatchHistory().filter(entry => entry.animeId !== item.id);
    if (currentTime / duration < .95) history.unshift({ animeId:item.id, title:item.title, posterUrl:item.poster_url || item.poster_proxy_url, episode, currentTime, duration, updatedAt:Date.now() });
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history.slice(0,20)));
    window.dispatchEvent(new Event(WATCH_HISTORY_EVENT));
  } catch { /* Storage may be unavailable or full; playback should continue. */ }
}

export function findWatchProgress(animeId: number, episode: number) {
  return readWatchHistory().find(entry => entry.animeId === animeId && entry.episode === episode);
}
