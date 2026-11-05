"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { AnimeStreamResponse } from "@/lib/api";
import { MediaItem } from "@/lib/types";
import { VideoPlayer } from "./VideoPlayer";

const sourceCache = new Map<string, { expires: number; value: AnimeStreamResponse }>();

export function EpisodePlayback({ media, episode, title, duration, streamUrl, nextEpisode }: {
  media: MediaItem; episode: number; title: string; duration?: number; streamUrl?: string; nextEpisode?: number;
}) {
  const url = `/api/anime/${media.id}/stream/${episode}`;
  const cached = sourceCache.get(url);
  const [sources, setSources] = useState<AnimeStreamResponse | null>(cached && cached.expires > Date.now() ? cached.value : null);
  const [checking, setChecking] = useState(!sources && !streamUrl);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (streamUrl) return;
    const hit = sourceCache.get(url);
    if (!attempt && hit && hit.expires > Date.now()) {
      setSources(hit.value);
      setChecking(false);
      return;
    }
    const controller = new AbortController();
    let timedOut = false;
    const deadline = setTimeout(() => { timedOut = true; controller.abort(); }, 45000);
    setChecking(true);
    setConnectionFailed(false);
    async function checkSources() {
      for (let pass = 0; pass < 2; pass++) {
        if (controller.signal.aborted) return;
        const response = await fetch(url + (attempt || pass ? "?refresh=true" : ""), { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Source check failed");
        const value: AnimeStreamResponse = await response.json();
        if (!value.servers.length && pass === 0) continue;
        if (controller.signal.aborted) return;
        setSources(value);
        if (value.servers.length) {
          if (sourceCache.size >= 40) sourceCache.delete(sourceCache.keys().next().value!);
          sourceCache.set(url, { expires: Date.now() + 45000, value });
        }
        return;
      }
    }
    checkSources()
      .catch(() => { if (!controller.signal.aborted || timedOut) setConnectionFailed(true); })
      .finally(() => { clearTimeout(deadline); if (!controller.signal.aborted || timedOut) setChecking(false); });
    return () => { clearTimeout(deadline); controller.abort(); };
  }, [url, attempt, streamUrl]);

  useEffect(() => {
    if (!sources?.servers.length || !nextEpisode || streamUrl) return;
    const nextUrl = `/api/anime/${media.id}/stream/${nextEpisode}`;
    const cached = sourceCache.get(nextUrl);
    if (cached && cached.expires > Date.now()) return;
    const controller = new AbortController();
    // Warm only the next released episode, after the current player is ready.
    const timer = setTimeout(() => {
      fetch(nextUrl, { cache: "no-store", signal: controller.signal })
        .then(async response => {
          if (!response.ok) return;
          const value: AnimeStreamResponse = await response.json();
          if (!controller.signal.aborted && value.servers.length) {
            if (sourceCache.size >= 40) sourceCache.delete(sourceCache.keys().next().value!);
            sourceCache.set(nextUrl, { expires: Date.now() + 45000, value });
          }
        }).catch(() => {});
    }, 2000);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [sources, media.id, nextEpisode, streamUrl]);

  const servers = useMemo(() => sources?.servers.map((server, index) => ({
    ...server,
    url: server.playback_url || server.url,
    subtitleUrl: server.subtitle_url ? `/api/anime/${media.id}/subtitles/${episode}/ar.vtt?server=${index}` : undefined,
  })), [sources, media.id, episode]);
  const removedSources = sources?.diagnostics?.issues.some(issue =>
    ["deleted_media", "missing_media_file", "embedding_denied"].includes(issue.reason));

  if (!servers?.length && !streamUrl) {
    return <div role="status" aria-busy={checking}
      className="aspect-video rounded-2xl border border-cinema-border bg-cinema-card p-6 flex flex-col gap-5 items-center justify-center text-center">
      {checking && <RefreshCw className="h-8 w-8 animate-spin text-cinema-accent" />}
      <p>{checking ? "بنجهّز فيديو الحلقة، تقدر تختار حلقة تانية في أي وقت..." : connectionFailed
        ? "تعذّر الاتصال بسيرفر التشغيل. حاول مرة أخرى."
        : removedSources
          ? "روابط تشغيل هذه الحلقة غير متوفرة أو معطلة حاليًا. يمكنك اختيار حلقة أخرى."
          : "لم نتمكن من تشغيل هذه الحلقة حاليًا. يمكنك إعادة المحاولة."}</p>
      {!checking && <button onClick={() => setAttempt(value => value + 1)}
        className="inline-flex items-center gap-2 rounded-xl bg-cinema-accent px-5 py-3 font-bold text-white">
        <RefreshCw className="h-4 w-4" />إعادة المحاولة
      </button>}
    </div>;
  }
  return <VideoPlayer servers={servers} streamUrl={streamUrl} title={title}
    posterUrl={media.poster_proxy_url || media.poster_url} hasArabicSubs={sources?.has_arabic_subs}
    resolveUrl={url} expectedDuration={duration} progressItem={media} episodeNumber={episode} />;
}
