import { NextResponse } from "next/server";
import { fetchAnimeMovies, fetchCatalog } from "@/lib/api";
import { SITE_URL, getDailyIsoDate } from "@/lib/seo";

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

export async function GET() {
  const dailyDate = getDailyIsoDate();
  const urls: string[] = [];

  try {
    const [movies1, movies2, catalogMovies] = await Promise.allSettled([
      fetchAnimeMovies(1, 50),
      fetchAnimeMovies(2, 50),
      fetchCatalog({ format: "MOVIE", page: "1" }),
    ]);

    const seen = new Set<number>();
    const items = [
      ...(movies1.status === "fulfilled" ? movies1.value.items || [] : []),
      ...(movies2.status === "fulfilled" ? movies2.value.items || [] : []),
      ...(catalogMovies.status === "fulfilled" ? catalogMovies.value.items || [] : []),
    ];

    for (const item of items) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        urls.push(`  <url>
    <loc>${escapeXml(`${SITE_URL}/movie/${item.id}`)}</loc>
    <lastmod>${dailyDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`);
      }
    }
  } catch {}

  if (urls.length === 0) {
    urls.push(`  <url>
    <loc>${escapeXml(`${SITE_URL}/movies`)}</loc>
    <lastmod>${dailyDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
