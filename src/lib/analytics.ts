export interface TrackingPayload {
  event_type: "heartbeat" | "page_view" | "browse_anime" | "play_anime";
  path?: string;
  anime_id?: number;
  anime_title?: string;
  episode_number?: number;
  duration_seconds?: number;
}

const VISITOR_KEY = "masry_vid";

export function getVisitorId(): string {
  if (typeof window === "undefined") return "server_session";
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id || id.length < 8) {
      id = "v_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "guest_" + Date.now().toString(36);
  }
}

export function trackEvent(payload: TrackingPayload): void {
  if (typeof window === "undefined") return;

  const visitor_id = getVisitorId();
  const body = {
    visitor_id,
    event_type: payload.event_type,
    path: payload.path || window.location.pathname,
    anime_id: payload.anime_id,
    anime_title: payload.anime_title,
    episode_number: payload.episode_number,
    duration_seconds: payload.duration_seconds || 0,
  };

  try {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Fail silently to never disrupt user experience
  }
}

