import { NextResponse } from "next/server";
import { fetchPopularSeries, fetchTrendingAnime } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
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
        const totalEp = item.total_episodes || (item.episodes ? item.episodes.length : 12);
        const epLimit = Math.min(Math.max(totalEp, 1), 24);
        for (let ep = 1; ep <= epLimit; ep++) {
          urls.push(`  <url>
    <loc>${escapeXml(`${siteUrl}/watch/${item.id}?ep=${ep}`)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>`);
        }
      }
    }
  } catch {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
