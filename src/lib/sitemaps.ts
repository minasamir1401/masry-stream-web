import { NextRequest, NextResponse } from "next/server";
import { SITE_URL } from "./seo";

export const escapeXml = (value: string): string => value.replace(/[<>&'"]/g, char => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[char]!));

async function inventory(kind: string, page = 1): Promise<{ paths: string[]; pages: number }> {
  const base = process.env.INTERNAL_BACKEND_URL || "http://127.0.0.1:8000";
  const response = await fetch(`${base}/api/anime/seo/sitemap/${kind}?page=${page}`, { next: { revalidate: 300 } });
  if (!response.ok) throw new Error("Sitemap inventory temporarily unavailable");
  return response.json();
}

export function xmlResponse(xml: string): NextResponse {
  return new NextResponse(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=300", "X-Content-Type-Options": "nosniff" } });
}

export async function sitemap(kind: string, request: NextRequest): Promise<NextResponse> {
  const raw = request.nextUrl.searchParams.get("page") || "1";
  if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw))) return new NextResponse(null, { status: 404 });
  try {
    const data = await inventory(kind, Number(raw));
    if (Number(raw) > data.pages) return new NextResponse(null, { status: 404 });
    return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${data.paths.map(path => `<url><loc>${escapeXml(SITE_URL + path)}</loc></url>`).join("\n")}</urlset>`);
  } catch {
    return new NextResponse(null, { status: 503, headers: { "Retry-After": "60", "Cache-Control": "no-store" } });
  }
}

export async function sitemapIndex(): Promise<NextResponse> {
  try {
    const kinds = ["series", "movies", "episodes"];
    const sections = await Promise.all(kinds.map(async kind => {
      const { pages } = await inventory(kind);
      return Array.from({ length: pages }, (_, index) => `${SITE_URL}/sitemap-${kind}.xml${index ? `?page=${index + 1}` : ""}`);
    }));
    const urls = [`${SITE_URL}/sitemap-static.xml`, ...sections.flat()];
    return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<sitemap><loc>${escapeXml(url)}</loc></sitemap>`).join("\n")}</sitemapindex>`);
  } catch {
    return new NextResponse(null, { status: 503, headers: { "Retry-After": "60", "Cache-Control": "no-store" } });
  }
}
