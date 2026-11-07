"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getVisitorId, isUserAdmin, trackEvent, checkSecurityStatus } from "@/lib/analytics";
import { BannedOverlay } from "@/components/BannedOverlay";
import { SecurityChallengeModal } from "@/components/SecurityChallengeModal";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef<string>("");
  const lastHeartbeatRef = useRef<number>(Date.now());

  const [isBanned, setIsBanned] = useState<boolean>(false);
  const [banReason, setBanReason] = useState<string | null>(null);
  const [requiresChallenge, setRequiresChallenge] = useState<boolean>(false);
  const isCrawler = typeof navigator !== "undefined" &&
    /googlebot|google-inspectiontool|googleother|bingbot|yandexbot|duckduckbot|baiduspider|twitterbot|facebookexternalhit|applebot|linkedinbot/i.test(navigator.userAgent);

  useEffect(() => {
    if (isCrawler) return;
    function handleSecurityStatus(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.is_banned) {
        setIsBanned(true);
        setBanReason(detail.ban_reason || null);
      }
      if (detail?.requires_challenge) {
        setRequiresChallenge(true);
      }
    }

    window.addEventListener("masry_security_status", handleSecurityStatus);
    return () => {
      window.removeEventListener("masry_security_status", handleSecurityStatus);
    };
  }, [isCrawler]);

  useEffect(() => {
    if (isCrawler) return;
    if (pathname?.startsWith("/admin") || isUserAdmin()) return;
    checkSecurityStatus().then((status) => {
      if (status.is_banned) {
        setIsBanned(true);
        setBanReason(status.ban_reason || null);
      } else if (status.requires_challenge) {
        setRequiresChallenge(true);
      }
    });
  }, [pathname, isCrawler]);

  useEffect(() => {
    if (isCrawler) return;
    if (pathname?.startsWith("/admin") || isUserAdmin()) return;
    getVisitorId();
  }, [pathname, isCrawler]);

  useEffect(() => {
    if (isCrawler) return;
    if (!pathname || pathname === lastPathRef.current) return;
    if (pathname.startsWith("/admin") || isUserAdmin()) return;

    lastPathRef.current = pathname;

    trackEvent({
      event_type: "page_view",
      path: pathname,
    });

    const seriesMatch = pathname.match(/^\/(?:series|movie)\/(\d+)/);
    if (seriesMatch) {
      const animeId = parseInt(seriesMatch[1], 10);
      const timer = setTimeout(() => {
        if (isUserAdmin()) return;
        const pageTitle = typeof document !== "undefined" ? document.title.split("|")[0].trim() : undefined;
        trackEvent({
          event_type: "browse_anime",
          path: pathname,
          anime_id: isNaN(animeId) ? undefined : animeId,
          anime_title: pageTitle || undefined,
          duration_seconds: 5,
        });
      }, 800);
      return () => clearTimeout(timer);
    }

    const watchMatch = pathname.match(/^\/watch\/(\d+)/);
    if (watchMatch) {
      const animeId = parseInt(watchMatch[1], 10);
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const epStr = params?.get("ep") || "1";
      const episodeNum = parseInt(epStr, 10);

      const timer = setTimeout(() => {
        if (isUserAdmin()) return;
        const pageTitle = typeof document !== "undefined" ? document.title.split("|")[0].trim() : undefined;
        trackEvent({
          event_type: "browse_anime",
          path: pathname,
          anime_id: isNaN(animeId) ? undefined : animeId,
          anime_title: pageTitle || undefined,
          episode_number: isNaN(episodeNum) ? 1 : episodeNum,
          duration_seconds: 5,
        });
      }, 800);
      return () => clearTimeout(timer);
    }

    if (pathname === "/search" && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("q");
      if (query && query.trim()) {
        const timer = setTimeout(() => {
          if (isUserAdmin()) return;
          trackEvent({
            event_type: "search",
            path: `/search?q=${encodeURIComponent(query.trim())}`,
            anime_title: query.trim(),
            duration_seconds: 2,
          });
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname, isCrawler]);

  useEffect(() => {
    if (isCrawler) return;
    const HEARTBEAT_INTERVAL = 30000;
    lastHeartbeatRef.current = Date.now();

    const intervalId = setInterval(() => {
      if (typeof window === "undefined") return;
      if (window.location.pathname.startsWith("/admin") || isUserAdmin()) return;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        lastHeartbeatRef.current = Date.now();
        return;
      }

      const now = Date.now();
      const elapsedSeconds = Math.round((now - lastHeartbeatRef.current) / 1000);
      lastHeartbeatRef.current = now;

      if (elapsedSeconds >= 10) {
        trackEvent({
          event_type: "heartbeat",
          path: window.location.pathname,
          duration_seconds: Math.min(elapsedSeconds, 60),
        });
      }
    }, HEARTBEAT_INTERVAL);

    const handleBeforeUnload = () => {
      if (typeof window === "undefined") return;
      if (window.location.pathname.startsWith("/admin") || isUserAdmin()) return;
      const now = Date.now();
      const elapsedSeconds = Math.round((now - lastHeartbeatRef.current) / 1000);
      if (elapsedSeconds >= 5) {
        trackEvent({
          event_type: "heartbeat",
          path: window.location.pathname,
          duration_seconds: Math.min(elapsedSeconds, 60),
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isCrawler]);

  return (
    <>
      {isBanned && <BannedOverlay reason={banReason} />}
      {requiresChallenge && (
        <SecurityChallengeModal
          onSolved={() => {
            setRequiresChallenge(false);
          }}
        />
      )}
    </>
  );
}
