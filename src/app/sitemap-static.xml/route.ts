import { ENGLISH_HOME_PATH, SITE_URL } from "@/lib/seo";
import { xmlResponse, escapeXml } from "@/lib/sitemaps";
export const dynamic = "force-dynamic";
export async function GET() {
  const paths = ["/", ENGLISH_HOME_PATH, "/series", "/movies", "/schedule", "/about", "/contact", "/privacy", "/terms"];
  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${escapeXml(SITE_URL + path)}</loc></url>`).join("\n")}</urlset>`);
}
