import { NextResponse } from "next/server";
import { fetchAnimeMovies } from "@/lib/api";
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
    const movies = await fetchAnimeMovies(1, 100);
    for (const item of movies.items || []) {
      const rawTitle = item.title || item.original_title || `فيلم أنمي #${item.id}`;
      const imageTitle = escapeXml(`فيلم ${rawTitle} مترجم - انمي كلوفر AnimeClover`.slice(0, 100));
      const thumbUrl = item.poster_url || `${SITE_URL}/og-image.png`;

      urls.push(`  <url>
    <loc>${escapeXml(`${SITE_URL}/movie/${item.id}`)}</loc>
    <lastmod>${dailyDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
    <image:image>
      <image:loc>${escapeXml(thumbUrl)}</image:loc>
      <image:title>${imageTitle}</image:title>
    </image:image>
  </url>`);
    }
  } catch {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
