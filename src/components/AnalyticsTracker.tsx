"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getVisitorId, trackEvent } from "@/lib/analytics";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef<string>("");
  const lastHeartbeatRef = useRef<number>(Date.now());

  useEffect(() => {
    getVisitorId();
  }, []);

  useEffect(() => {
    if (!pathname || pathname === lastPathRef.current) return;
    lastPathRef.current = pathname;

    trackEvent({
      event_type: "page_view",
      path: pathname,
    });

    const seriesMatch = pathname.match(/^\/(?:series|movie)\/(\d+)/);
    if (seriesMatch) {
      const animeId = parseInt(seriesMatch[1], 10);
      const timer = setTimeout(() => {
        const pageTitle = typeof document !== "undefined" ? document.title.split("|")[0].trim() : undefined;
        trackEvent({
          event_type: "browse_anime",
          path: pathname,
          anime_id: isNaN(animeId) ? undefined : animeId,
          anime_title: pageTitle || undefined,
          duration_seconds: 5,
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  useEffect(() => {
    const HEARTBEAT_INTERVAL = 30000;
    lastHeartbeatRef.current = Date.now();

    const intervalId = setInterval(() => {
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
  }, []);

  return null;
}

