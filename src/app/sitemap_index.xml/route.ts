import { NextResponse } from "next/server";
import { SITE_URL, getDailyIsoDate } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function buildSitemapIndexXml(): string {
  const dailyDate = getDailyIsoDate();

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-static.xml</loc>
    <lastmod>${dailyDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-series.xml</loc>
    <lastmod>${dailyDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-movies.xml</loc>
    <lastmod>${dailyDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-episodes.xml</loc>
    <lastmod>${dailyDate}</lastmod>
  </sitemap>
</sitemapindex>`;
}

export async function GET() {
  const xml = buildSitemapIndexXml();
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
  const xml = buildSitemapIndexXml();
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
