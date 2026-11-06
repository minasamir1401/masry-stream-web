import { MetadataRoute } from "next";
import { fetchPopularSeries, fetchAnimeMovies, fetchTrendingAnime } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://animeclover.click";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: now,
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/series`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/movies`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/schedule`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  try {
    const [popularRes, trendingRes, moviesRes] = await Promise.allSettled([
      fetchPopularSeries(1, 50),
      fetchTrendingAnime(1, 50),
      fetchAnimeMovies(1, 50),
    ]);

    const seenIds = new Set<number>();
    const seriesRoutes: MetadataRoute.Sitemap = [];
    const watchRoutes: MetadataRoute.Sitemap = [];

    const seriesItems = [
      ...(popularRes.status === "fulfilled" ? popularRes.value.items || [] : []),
      ...(trendingRes.status === "fulfilled" ? trendingRes.value.items || [] : []),
    ];

    for (const item of seriesItems) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        seriesRoutes.push({
          url: `${siteUrl}/series/${item.id}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.85,
        });

        const totalEp = item.total_episodes || (item.episodes ? item.episodes.length : 12);
        const epLimit = Math.min(Math.max(totalEp, 1), 24);
        for (let ep = 1; ep <= epLimit; ep++) {
          watchRoutes.push({
            url: `${siteUrl}/watch/${item.id}?ep=${ep}`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.75,
          });
        }
      }
    }

    const movieRoutes: MetadataRoute.Sitemap = [];
    if (moviesRes.status === "fulfilled") {
      for (const item of moviesRes.value.items || []) {
        movieRoutes.push({
          url: `${siteUrl}/movie/${item.id}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.85,
        });
        watchRoutes.push({
          url: `${siteUrl}/watch/${item.id}?ep=1`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.75,
        });
      }
    }

    return [...staticRoutes, ...seriesRoutes, ...movieRoutes, ...watchRoutes];
  } catch {
    return staticRoutes;
  }
}

