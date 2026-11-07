import { NextResponse } from "next/server";
import { SITE_URL, STATIC_PAGE_LASTMOD, getDailyIsoDate } from "@/lib/seo";

export const dynamic = "force-dynamic";
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

  const urlEntries = staticPages
    .map((page) => {
      const pageUrl = escapeXml(`${SITE_URL}${page.path}`);
      return `  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
