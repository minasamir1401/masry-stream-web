import { NextRequest } from "next/server";
import { sitemap } from "@/lib/sitemaps";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) { return sitemap("series", request); }
