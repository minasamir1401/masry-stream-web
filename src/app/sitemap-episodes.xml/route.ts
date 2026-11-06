import { NextResponse } from "next/server";
import { fetchPopularSeries, fetchTrendingAnime } from "@/lib/api";

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://animeclover.click";
  const now = new Date().toISOString();

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
        const posterUrl = item.poster_url || `${siteUrl}/icon.svg`;
        const totalEp = item.total_episodes || (item.episodes ? item.episodes.length : 12);
        const epLimit = Math.min(Math.max(totalEp, 1), 24);

        for (let ep = 1; ep <= epLimit; ep++) {
          const watchUrl = `${siteUrl}/watch/${item.id}?ep=${ep}`;
          const videoTitle = escapeXml(`مشاهدة أنمي ${rawTitle} الحلقة ${ep} مترجمة`.slice(0, 100));
          const videoDesc = escapeXml(
            `شاهد الحلقة ${ep} من أنمي ${rawTitle} أون لاين بجودة عالية HD مع الترجمة العربية الكاملة على انمي كلوفر`.slice(0, 500)
          );

          urls.push(`  <url>
    <loc>${escapeXml(watchUrl)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
    <video:video>
      <video:thumbnail_loc>${escapeXml(posterUrl)}</video:thumbnail_loc>
      <video:title>${videoTitle}</video:title>
      <video:description>${videoDesc}</video:description>
      <video:player_loc>${escapeXml(watchUrl)}</video:player_loc>
      <video:publication_date>${now}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>
  </url>`);
        }
      }
    }
  } catch {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
