import { NextResponse } from "next/server";
import { fetchPopularSeries, fetchTrendingAnime, fetchAnimeMovies } from "@/lib/api";
import { SITE_URL, STATIC_PAGE_LASTMOD, getDailyIsoDate } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return "";
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

async function buildSitemapXml(): Promise<string> {
  const dailyDate = getDailyIsoDate();
  const urls: string[] = [];

  const staticPages = [
    { path: "/", changefreq: "daily", priority: "1.0", lastmod: dailyDate },
    { path: "/series", changefreq: "daily", priority: "0.9", lastmod: dailyDate },
    { path: "/movies", changefreq: "daily", priority: "0.9", lastmod: dailyDate },
    { path: "/schedule", changefreq: "daily", priority: "0.9", lastmod: dailyDate },
    { path: "/about", changefreq: "monthly", priority: "0.8", lastmod: STATIC_PAGE_LASTMOD },
    { path: "/contact", changefreq: "monthly", priority: "0.6", lastmod: STATIC_PAGE_LASTMOD },
    { path: "/report", changefreq: "monthly", priority: "0.6", lastmod: STATIC_PAGE_LASTMOD },
    { path: "/privacy", changefreq: "monthly", priority: "0.4", lastmod: STATIC_PAGE_LASTMOD },
    { path: "/terms", changefreq: "monthly", priority: "0.4", lastmod: STATIC_PAGE_LASTMOD },
  ];

  for (const page of staticPages) {
    urls.push(`  <url>
    <loc>${escapeXml(`${SITE_URL}${page.path}`)}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  }

  try {
    const [popular1, popular2, trending1, moviesRes] = await Promise.allSettled([
      fetchPopularSeries(1, 50),
      fetchPopularSeries(2, 50),
      fetchTrendingAnime(1, 50),
      fetchAnimeMovies(1, 50),
    ]);

    const seenSeries = new Set<number>();
    const seriesItems = [
      ...(popular1.status === "fulfilled" ? popular1.value.items || [] : []),
      ...(popular2.status === "fulfilled" ? popular2.value.items || [] : []),
      ...(trending1.status === "fulfilled" ? trending1.value.items || [] : []),
    ];

    for (const item of seriesItems) {
      if (!seenSeries.has(item.id)) {
        seenSeries.add(item.id);
        urls.push(`  <url>
    <loc>${escapeXml(`${SITE_URL}/series/${item.id}`)}</loc>
    <lastmod>${dailyDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`);
      }
    }

    const movieItems = moviesRes.status === "fulfilled" ? moviesRes.value.items || [] : [];
    const seenMovies = new Set<number>();
    for (const movie of movieItems) {
      if (!seenMovies.has(movie.id)) {
        seenMovies.add(movie.id);
        urls.push(`  <url>
    <loc>${escapeXml(`${SITE_URL}/movie/${movie.id}`)}</loc>
    <lastmod>${dailyDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`);
      }
    }
  } catch {}

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}

export async function GET() {
  const xml = await buildSitemapXml();
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Length": Buffer.byteLength(xml, "utf8").toString(),
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function HEAD() {
  const xml = await buildSitemapXml();
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Length": Buffer.byteLength(xml, "utf8").toString(),
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
