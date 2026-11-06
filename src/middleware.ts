import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BOT_PATTERNS = [
  /python-requests/i,
  /aiohttp/i,
  /httpx/i,
  /scrapy/i,
  /urllib/i,
  /curl\//i,
  /wget\//i,
  /go-http-client/i,
  /headlesschrome/i,
  /phantomjs/i,
  /puppeteer/i,
  /playwright/i,
  /selenium/i,
  /postmanruntime/i,
];

const SEARCH_ENGINE_BOTS = [
  /googlebot/i,
  /google-inspectiontool/i,
  /mediapartners-google/i,
  /adsbot-google/i,
  /bingbot/i,
  /yandexbot/i,
  /duckduckbot/i,
  /baiduspider/i,
  /twitterbot/i,
  /facebookexternalhit/i,
  /applebot/i,
  /linkedinbot/i,
];

function isSearchEngineCrawler(userAgent: string): boolean {
  if (!userAgent) return false;
  return SEARCH_ENGINE_BOTS.some((pattern) => pattern.test(userAgent));
}

interface RateRecord {
  count: number;
  resetAt: number;
}

interface ContinuousSessionRecord {
  firstSeen: number;
  lastSeen: number;
  lockedUntil: number;
}

const rateLimitStore = new Map<string, RateRecord>();
const continuousSessionStore = new Map<string, ContinuousSessionRecord>();
let lastPurge = Date.now();

const MAX_CONSECUTIVE_MS = 10 * 3600 * 1000; // 10 hours limit
const INACTIVITY_GAP_MS = 30 * 60 * 1000;    // 30 min inactivity resets counter
const LOCKOUT_COOLDOWN_MS = 1 * 3600 * 1000; // 1 hour cooldown period

function checkContinuousSession(ip: string): { isBlocked: boolean; retryAfter: number } {
  const now = Date.now();
  const session = continuousSessionStore.get(ip);

  if (!session) {
    continuousSessionStore.set(ip, {
      firstSeen: now,
      lastSeen: now,
      lockedUntil: 0,
    });
    return { isBlocked: false, retryAfter: 0 };
  }

  // Check if currently locked out
  if (session.lockedUntil > 0 && now < session.lockedUntil) {
    const remainingSeconds = Math.ceil((session.lockedUntil - now) / 1000);
    return { isBlocked: true, retryAfter: remainingSeconds };
  }

  // If locked period has passed, reset session
  if (session.lockedUntil > 0 && now >= session.lockedUntil) {
    session.firstSeen = now;
    session.lastSeen = now;
    session.lockedUntil = 0;
    return { isBlocked: false, retryAfter: 0 };
  }

  // Check if user took a break longer than the inactivity gap (intermittent usage is allowed!)
  if (now - session.lastSeen > INACTIVITY_GAP_MS) {
    session.firstSeen = now;
    session.lastSeen = now;
    session.lockedUntil = 0;
    return { isBlocked: false, retryAfter: 0 };
  }

  // Continuous session: check duration from firstSeen
  if (now - session.firstSeen > MAX_CONSECUTIVE_MS) {
    session.lockedUntil = now + LOCKOUT_COOLDOWN_MS;
    const retrySeconds = Math.ceil(LOCKOUT_COOLDOWN_MS / 1000);
    return { isBlocked: true, retryAfter: retrySeconds };
  }

  session.lastSeen = now;
  return { isBlocked: false, retryAfter: 0 };
}

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (now - lastPurge > 60000) {
    lastPurge = now;
    rateLimitStore.forEach((record, key) => {
      if (record.resetAt < now) {
        rateLimitStore.delete(key);
      }
    });
  }

  const record = rateLimitStore.get(ip);
  if (!record || record.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip static assets and SEO critical endpoints
  if (
    path.startsWith("/_next") ||
    path.startsWith("/icons") ||
    path.startsWith("/brand") ||
    path === "/robots.txt" ||
    path.startsWith("/sitemap") ||
    path === "/manifest.webmanifest" ||
    path === "/favicon.ico" ||
    path.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|css|js|xml)$/)
  ) {
    return NextResponse.next();
  }

  const userAgent = request.headers.get("user-agent") || "";

  // Always allow legitimate search engine crawlers without limits or blocks
  if (isSearchEngineCrawler(userAgent)) {
    return NextResponse.next();
  }

  const clientIp =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.ip ||
    "127.0.0.1";

  // 1. Detect continuous session exceeding 10 hours
  const sessionStatus = checkContinuousSession(clientIp);
  if (sessionStatus.isBlocked) {
    return new NextResponse(
      JSON.stringify({
        error:
          "تم تعليق الوصول مؤقتاً لتجاوز الحد الأقصى للاستخدام المتواصل (10 ساعات). يرجى أخذ استراحة والعودة لاحقاً.",
      }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Retry-After": sessionStatus.retryAfter.toString(),
        },
      }
    );
  }

  // 2. Detect known automated scrapers
  const isMaliciousBot = BOT_PATTERNS.some((pattern) => pattern.test(userAgent));

  if (isMaliciousBot) {
    // Tarpit delay before sending 403 to exhaust scraper concurrency
    await new Promise((resolve) => setTimeout(resolve, 2500));
    return new NextResponse(
      JSON.stringify({ error: "Access denied by security shield" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 2. Sliding-window rate limit on API endpoints (exempt video/media streaming segments)
  const isMediaStream = path.includes("/hls/") || path.includes("/video/") || path.includes("/stream/");
  if (path.startsWith("/api/") && !isMediaStream) {
    const isAllowed = checkRateLimit(clientIp, 120, 60000);
    if (!isAllowed) {
      return new NextResponse(
        JSON.stringify({ error: "Rate limit exceeded. Please wait." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }
  }

  const response = NextResponse.next();

  // 3. Inject standard security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/watch/:path*",
    "/series/:path*",
    "/movie/:path*",
    "/movies/:path*",
    "/schedule/:path*",
  ],
};
