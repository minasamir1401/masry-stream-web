import { Genre, MediaItem, PaginatedMedia } from "./types";
import { AiringWeek } from "./schedule";

export interface HomepageData { featured: MediaItem[]; spotlight: MediaItem[]; popular: MediaItem[]; recommended: MediaItem[]; }
export async function fetchHomepage(): Promise<HomepageData> {
  const response = await fetch(`${getBaseUrl()}/api/anime/homepage`, { next: { revalidate: 120 } });
  if (!response.ok) throw new Error("تعذّر تحميل الرئيسية");
  return response.json();
}
export async function fetchAiringWeek(day?: string): Promise<AiringWeek> {
  const response = await fetch(`${getBaseUrl()}/api/anime/schedule${day ? `?day=${encodeURIComponent(day)}` : ""}`, { next: { revalidate: 300 } });
  if (!response.ok) throw new Error("تعذّر تحميل مواعيد العرض");
  return response.json();
}
export type CatalogQuery = Record<string, string | undefined>;
export async function fetchCatalog(filters: CatalogQuery): Promise<PaginatedMedia> {
  const query = new URLSearchParams();
  for (const key of ["q", "page", "genre", "year", "season", "status", "format", "sort"]) {
    if (filters[key]) query.set(key, filters[key]!);
  }
  const response = await fetch(`${getBaseUrl()}/api/anime/catalog?${query}`, { next: { revalidate: 60 } });
  if (!response.ok) throw new Error("تعذّر تحميل الأنمي");
  return response.json();
}

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return "";
  }
  return process.env.INTERNAL_BACKEND_URL || "http://127.0.0.1:8000";
};

export async function fetchMovies(params?: {
  page?: number;
  pageSize?: number;
  genre?: string;
  mediaType?: string;
  sortBy?: string;
}): Promise<PaginatedMedia> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.pageSize) query.set("page_size", params.pageSize.toString());
  if (params?.genre) query.set("genre", params.genre);
  if (params?.mediaType) query.set("media_type", params.mediaType);
  if (params?.sortBy) query.set("sort_by", params.sortBy);

  const url = `${getBaseUrl()}/api/movies?${query.toString()}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch movies: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchMovieById(id: number | string): Promise<MediaItem> {
  const url = `${getBaseUrl()}/api/movies/${id}`;
  const res = await fetch(url, { next: { revalidate: 120 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch media details for id ${id}`);
  }
  return res.json();
}

export async function fetchSeries(params?: {
  page?: number;
  pageSize?: number;
  genre?: string;
  sortBy?: string;
}): Promise<PaginatedMedia> {
  return fetchMovies({
    ...params,
    mediaType: "SERIES",
  });
}

export async function searchMedia(query: string, page = 1): Promise<PaginatedMedia> {
  const url = `${getBaseUrl()}/api/search?q=${encodeURIComponent(query)}&page=${page}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to perform search: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchCategories(): Promise<Genre[]> {
  const url = `${getBaseUrl()}/api/categories`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function fetchTrendingAnime(page = 1, pageSize = 24): Promise<PaginatedMedia> {
  const url = `${getBaseUrl()}/api/anime/trending?page=${page}&page_size=${pageSize}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch trending anime: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchPopularSeries(page = 1, pageSize = 24): Promise<PaginatedMedia> {
  const url = `${getBaseUrl()}/api/anime/popular-series?page=${page}&page_size=${pageSize}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch popular series: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchAnimeMovies(page = 1, pageSize = 24): Promise<PaginatedMedia> {
  const url = `${getBaseUrl()}/api/anime/movies?page=${page}&page_size=${pageSize}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch anime movies: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchTopRatedAnime(page = 1, pageSize = 24): Promise<PaginatedMedia> {
  const url = `${getBaseUrl()}/api/anime/top-rated?page=${page}&page_size=${pageSize}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch top rated anime: ${res.statusText}`);
  }
  return res.json();
}


export async function searchAnime(query: string, page = 1): Promise<PaginatedMedia> {
  const url = `${getBaseUrl()}/api/anime/search?q=${encodeURIComponent(query)}&page=${page}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to search anime: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchAnimeById(id: number | string): Promise<MediaItem> {
  const url = `${getBaseUrl()}/api/anime/${id}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch anime details for id ${id}`);
  }
  return res.json();
}

export interface AnimeStreamResponse {
  availability?: "available" | "source_unavailable";
  diagnostics?: {
    providers: { provider: string; status: string; elapsed_ms?: number }[];
    issues: { reason: string; host: string; count: number }[];
  };
  anime_id: number;
  episode: number;
  embed_url: string | null;
  has_arabic_subs?: boolean;
  servers: {
    name: string;
    type: "direct" | "embed" | "hls";
    subtitle_url?: string;
    playback_url?: string;
    url: string;
  }[];
}

export async function fetchAnimeStream(id: number | string, episode = 1): Promise<AnimeStreamResponse> {
  try {
    const url = `${getBaseUrl()}/api/anime/${id}/stream/${episode}`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  return {
    anime_id: Number(id),
    episode,
    embed_url: null,
    servers: [],
  };
}



