import { cache } from "react";
import { notFound } from "next/navigation";
import { fetchMediaById, fetchMovieById, fetchEpisodeIndex, isMissing } from "./api";
import type { MediaItem } from "./types";

export async function detailEpisodes(media: MediaItem) {
  try { return await fetchEpisodeIndex(media.id); }
  catch (error) { if (media.catalog_stale) return undefined; throw error; }
}

export const loadMedia = cache(async (id: string, movie = false) => {
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  try { return await (movie ? fetchMovieById(id) : fetchMediaById(id)); }
  catch (error) { if (isMissing(error)) notFound(); throw error; }
});
export const loadWatch = cache(async (id: string, rawEpisode: string) => {
  if (!/^[1-9]\d*$/.test(rawEpisode) || !Number.isSafeInteger(Number(rawEpisode))) notFound();
  const media = await loadMedia(id);
  const episode = Number(rawEpisode);
  if (media.file_name) {
    const number = media.episode_number || 1;
    if (episode !== number) notFound();
    return { media, episode };
  }
  const index = await fetchEpisodeIndex(id);
  if (!index.episodes.some(entry => entry.number === episode && entry.state !== "upcoming")) notFound();
  return { media, episode };
});
