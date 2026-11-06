import { NextResponse } from "next/server";
import { fetchAnimeMovies } from "@/lib/api";

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
    const movies = await fetchAnimeMovies(1, 100);
    for (const item of movies.items || []) {
      const rawTitle = item.title || item.original_title || `فيلم أنمي #${item.id}`;
      const videoTitle = escapeXml(`فيلم ${rawTitle} مترجم بجودة عالية`.slice(0, 100));
      const rawDesc = item.description || `مشاهدة وتحميل فيلم ${rawTitle} مترجم اون لاين بجودة عالية HD على انمي كلوفر`;
      const videoDesc = escapeXml(rawDesc.slice(0, 500));
      const thumbUrl = item.poster_url || `${siteUrl}/icon.svg`;
      const watchUrl = `${siteUrl}/watch/${item.id}?ep=1`;

      urls.push(`  <url>
    <loc>${escapeXml(`${siteUrl}/movie/${item.id}`)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
    <video:video>
      <video:thumbnail_loc>${escapeXml(thumbUrl)}</video:thumbnail_loc>
      <video:title>${videoTitle}</video:title>
      <video:description>${videoDesc}</video:description>
      <video:player_loc>${escapeXml(watchUrl)}</video:player_loc>
      <video:publication_date>${now}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>
  </url>`);
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
