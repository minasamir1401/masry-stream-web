import { NextResponse } from "next/server";
import { fetchPopularSeries, fetchTrendingAnime } from "@/lib/api";
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
    const [popular, trending] = await Promise.allSettled([
      fetchPopularSeries(1, 50),
      fetchTrendingAnime(1, 50),
    ]);

    const seen = new Set<number>();
    const items = [
      ...(popular.status === "fulfilled" ? popular.value.items || [] : []),
      ...(trending.status === "fulfilled" ? trending.value.items || [] : []),
    ];

    for (const item of items) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        const rawTitle = item.title || item.original_title || `أنمي #${item.id}`;
        const posterUrl = item.poster_url || `${SITE_URL}/og-image.png`;
        const totalEp = item.total_episodes || (item.episodes ? item.episodes.length : 12);
        const epLimit = Math.min(Math.max(totalEp, 1), 24);

        for (let ep = 1; ep <= epLimit; ep++) {
          const watchUrl = `${SITE_URL}/watch/${item.id}?ep=${ep}`;
          const imageTitle = escapeXml(`انمي ${rawTitle} الحلقة ${ep} مترجمة - انمي كلوفر`.slice(0, 100));

          urls.push(`  <url>
    <loc>${escapeXml(watchUrl)}</loc>
    <lastmod>${dailyDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
    <image:image>
      <image:loc>${escapeXml(posterUrl)}</image:loc>
      <image:title>${imageTitle}</image:title>
    </image:image>
  </url>`);
        }
      }
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
