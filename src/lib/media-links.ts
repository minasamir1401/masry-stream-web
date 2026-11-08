/** Public URLs use a stored identity, never a mutable title or stream token. */
export function mediaHref(item: { id: number; media_type?: string; canonical_path?: string }): string {
  const path = item.canonical_path;
  return path && new RegExp(`^/(series|movie)/${item.id}$`).test(path) ? path : `/${item.media_type === "MOVIE" ? "movie" : "series"}/${item.id}`;
}
export function watchHref(id: number, episode = 1): string { return `/watch/${id}?ep=${episode}`; }
