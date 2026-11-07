import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/favorites"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin", "/api/", "/favorites"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/sitemap_index.xml`,
      `${SITE_URL}/sitemap-static.xml`,
      `${SITE_URL}/sitemap-series.xml`,
      `${SITE_URL}/sitemap-movies.xml`,
      `${SITE_URL}/sitemap-episodes.xml`,
    ],
  };
}
