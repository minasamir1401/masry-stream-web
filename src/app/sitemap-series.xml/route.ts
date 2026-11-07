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
    const [popular1, popular2, trending1] = await Promise.allSettled([
      fetchPopularSeries(1, 50),
      fetchPopularSeries(2, 50),
      fetchTrendingAnime(1, 50),
    ]);

    const seen = new Set<number>();
    const items = [
      ...(popular1.status === "fulfilled" ? popular1.value.items || [] : []),
      ...(popular2.status === "fulfilled" ? popular2.value.items || [] : []),
      ...(trending1.status === "fulfilled" ? trending1.value.items || [] : []),
    ];

    for (const item of items) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        const title = escapeXml(`انمي ${item.title || item.original_title || item.id} مترجم - انمي كلوفر`);
        const poster = item.poster_url ? escapeXml(item.poster_url) : "";

        let imageTag = "";
        if (poster) {
          imageTag = `\n    <image:image>
      <image:loc>${poster}</image:loc>
      <image:title>${title}</image:title>
    </image:image>`;
        }

        urls.push(`  <url>
    <loc>${escapeXml(`${SITE_URL}/series/${item.id}`)}</loc>
    <lastmod>${dailyDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>${imageTag}
  </url>`);
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
