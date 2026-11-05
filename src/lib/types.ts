export interface Genre {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export interface Episode {
  id: number;
  telegram_message_id: number;
  telegram_channel: string;
  telegram_watch_url?: string;
  direct_streamable: boolean;
  title: string;
  episode_number?: number;
  season_number?: number;
  duration?: number;
  file_size: number;
  resolution?: string;
  quality_label?: string;
  stream_url: string;
}

export interface MediaItem {
  id: number;
  id_mal?: number;
  telegram_channel: string;
  telegram_message_id: number;
  telegram_watch_url?: string;
  title: string;
  original_title?: string;
  description?: string;
  release_year?: number;
  duration?: number;
  file_size: number;
  mime_type: string;
  file_name?: string;
  resolution?: string;
  quality_label?: string;
  poster_url?: string;
  poster_proxy_url?: string;
  banner_url?: string;
  average_score?: number;
  total_episodes?: number;
  status?: "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | "HIATUS" | "CANCELLED";
  available_episode?: number;
  popularity?: number;
  media_type: "MOVIE" | "SERIES" | "EPISODE";
  season_number?: number;
  episode_number?: number;
  parent_id?: number;
  is_available: boolean;
  direct_streamable: boolean;
  view_count: number;
  created_at: string;
  genres: Genre[];
  episodes?: Episode[];
  stream_url?: string;
}

export interface PaginatedMedia {
  items: MediaItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next_page?: boolean;
}


