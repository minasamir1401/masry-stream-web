import { NextResponse } from "next/server";

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://animeclover.click";
  const now = new Date().toISOString();

  const staticPages = [
    { path: "", changefreq: "daily", priority: "1.0" },
    { path: "/series", changefreq: "daily", priority: "0.9" },
    { path: "/movies", changefreq: "daily", priority: "0.9" },
    { path: "/schedule", changefreq: "daily", priority: "0.9" },
    { path: "/search", changefreq: "weekly", priority: "0.8" },
    { path: "/about", changefreq: "monthly", priority: "0.6" },
    { path: "/contact", changefreq: "monthly", priority: "0.6" },
    { path: "/report", changefreq: "weekly", priority: "0.7" },
    { path: "/privacy", changefreq: "monthly", priority: "0.5" },
    { path: "/terms", changefreq: "monthly", priority: "0.5" },
  ];

  const urlEntries = staticPages
    .map((page) => {
      const pageUrl = escapeXml(`${siteUrl}${page.path}`);
      const imageBlock =
        page.path === ""
          ? `\n    <image:image>
      <image:loc>${siteUrl}/og-image.png</image:loc>
      <image:title>انمي كلوفر AnimeClover</image:title>
    </image:image>
    <image:image>
      <image:loc>${siteUrl}/icons/icon-512.png</image:loc>
      <image:title>شعار انمي كلوفر AnimeClover</image:title>
    </image:image>`
          : "";

      return `  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${now}</lastmod>
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
