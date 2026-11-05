import { MetadataRoute } from "next";
import { fetchPopularSeries } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://animeclover.com";
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
  ];

  try {
    const popular = await fetchPopularSeries(1, 60);
    const seriesRoutes: MetadataRoute.Sitemap = (popular.items || []).map((item) => ({
      url: `${siteUrl}/series/${item.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...seriesRoutes];
  } catch {
    return staticRoutes;
  }
}

