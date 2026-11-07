import { NextResponse } from "next/server";
import { SITE_URL, STATIC_PAGE_LASTMOD, getDailyIsoDate } from "@/lib/seo";

export const revalidate = 86400;

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

  const staticPages = [
    { path: "", changefreq: "daily", priority: "1.0", lastmod: dailyDate },
    { path: "/series", changefreq: "daily", priority: "0.9", lastmod: dailyDate },
    { path: "/movies", changefreq: "daily", priority: "0.9", lastmod: dailyDate },
    { path: "/schedule", changefreq: "daily", priority: "0.9", lastmod: dailyDate },
    { path: "/about", changefreq: "monthly", priority: "0.8", lastmod: STATIC_PAGE_LASTMOD },
    { path: "/contact", changefreq: "monthly", priority: "0.6", lastmod: STATIC_PAGE_LASTMOD },
    { path: "/report", changefreq: "monthly", priority: "0.6", lastmod: STATIC_PAGE_LASTMOD },
    { path: "/privacy", changefreq: "monthly", priority: "0.4", lastmod: STATIC_PAGE_LASTMOD },
    { path: "/terms", changefreq: "monthly", priority: "0.4", lastmod: STATIC_PAGE_LASTMOD },
  ];

  const urlEntries = staticPages
    .map((page) => {
      const pageUrl = escapeXml(page.path === "" ? `${SITE_URL}/` : `${SITE_URL}${page.path}`);
      const imageBlock =
        page.path === ""
          ? `\n    <image:image>
      <image:loc>${SITE_URL}/og-image.png</image:loc>
      <image:title>انمي كلوفر AnimeClover - الموقع الرسمي لمشاهدة وتحميل الأنمي المترجم</image:title>
    </image:image>
    <image:image>
      <image:loc>${SITE_URL}/icons/icon-512.png</image:loc>
      <image:title>شعار موقع انمي كلوفر AnimeClover</image:title>
    </image:image>`
          : "";

      return `  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${imageBlock}
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
