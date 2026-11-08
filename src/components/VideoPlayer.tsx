"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { MediaItem } from "@/lib/types";
import { findWatchProgress, saveWatchProgress } from "@/lib/watch-history";
import { trackEvent } from "@/lib/analytics";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Gauge,
  Radio,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export interface VideoServerOption {
  name: string;
  url: string;
  type?: "direct" | "embed" | "hls";
  subtitleUrl?: string;
}

interface VideoPlayerProps {
  streamUrl?: string;
  title: string;
  posterUrl?: string;
  embedUrl?: string;
  servers?: VideoServerOption[];
  subtitleUrl?: string;
  hasArabicSubs?: boolean;
  resolveUrl?: string;
  expectedDuration?: number;
  progressItem?: MediaItem;
  episodeNumber?: number;
}

export function VideoPlayer({ streamUrl, title, posterUrl, embedUrl, servers: initialServers, subtitleUrl, hasArabicSubs, resolveUrl, expectedDuration, progressItem, episodeNumber = 1 }: VideoPlayerProps) {
  const [servers, setServers] = useState(initialServers);
  useEffect(() => setServers(initialServers), [initialServers]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [subtitleLines, setSubtitleLines] = useState<string[]>([]);
  const attemptedServersRef = useRef(new Set<string>());
  const resumeTimeRef = useRef(0);
  const wantsPlaybackRef = useRef(false);
  const refreshingSourcesRef = useRef(false);
  const lastRefreshRef = useRef(0);
  const lastPositionRef = useRef(0);
  const recoverPlaybackRef = useRef<() => boolean>(() => false);

  const firstServer = servers?.[0];
  const initialUrl = firstServer?.url || embedUrl || streamUrl || "";
  const [activeUrl, setActiveUrl] = useState<string>(initialUrl);
  const [playerMode, setPlayerMode] = useState<"direct" | "embed">(
    firstServer ? firstServer.type === "hls" ? "direct" : firstServer.type || "embed" : embedUrl ? "embed" : "direct"
  );

  useEffect(() => {
    const selected = servers?.[0];
    attemptedServersRef.current.clear();
    setActiveUrl(selected?.url || embedUrl || streamUrl || "");
    setPlayerMode(selected ? selected.type === "hls" ? "direct" : selected.type || "embed" : embedUrl ? "embed" : "direct");
  }, [embedUrl, streamUrl, servers]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hlsAttempt, setHlsAttempt] = useState(0);
  const activeServer = servers?.find((server) => server.url === activeUrl);
  const isHls = activeServer?.type === "hls";
  const activeSubtitle = activeServer?.subtitleUrl || subtitleUrl;

  useEffect(() => {
    if (!progressItem) return;
    const video = videoRef.current;
    if (!video) return;
    const saved = findWatchProgress(progressItem.id, episodeNumber);
    if (saved && resumeTimeRef.current === 0) resumeTimeRef.current = saved.currentTime;
    let lastSave = 0;
    const persist = () => {
      if ((expectedDuration || 0) > 180 && video.duration < 60) return;
      saveWatchProgress(progressItem, episodeNumber, video.currentTime, video.duration);
    };
    const onTime = () => { if (Date.now() - lastSave > 5000) { lastSave = Date.now(); persist(); } };
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("pause", persist);
    video.addEventListener("ended", persist);
    window.addEventListener("pagehide", persist);
    return () => {
      persist();
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("pause", persist);
      video.removeEventListener("ended", persist);
      window.removeEventListener("pagehide", persist);
    };
  }, [progressItem?.id, episodeNumber, expectedDuration, playerMode]);

  const playTrackSentRef = useRef(false);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || playerMode !== "direct") return;
    let lastClock = performance.now();
    let lastPosition = video.currentTime;
    let seconds = 0;
    const send = (kind: "play_anime" | "watch_progress", duration: number) => trackEvent({
      event_type: kind, anime_id: progressItem?.id, anime_title: progressItem?.title || title,
      episode_number: episodeNumber, duration_seconds: duration,
    });
    const sample = () => {
      const now = performance.now();
      const delta = video.currentTime - lastPosition;
      const elapsed = (now - lastClock) / 1000;
      if (!video.seeking && delta > 0 && elapsed > 0 && delta <= elapsed * video.playbackRate + 0.75) {
        seconds += Math.min(delta / video.playbackRate, elapsed, 2);
        if (!playTrackSentRef.current) { playTrackSentRef.current = true; send("play_anime", 0); }
      }
      lastPosition = video.currentTime;
      lastClock = now;
    };
    const flush = () => { sample(); const duration = Math.floor(seconds); seconds -= duration; if (duration > 0) send("watch_progress", duration); };
    const reset = () => { lastPosition = video.currentTime; lastClock = performance.now(); };
    const timer = setInterval(() => { sample(); if (seconds >= 15) flush(); }, 1000);
    video.addEventListener("timeupdate", sample);
    video.addEventListener("seeking", reset);
    video.addEventListener("seeked", reset);
    video.addEventListener("pause", flush);
    video.addEventListener("ended", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      flush(); clearInterval(timer); video.removeEventListener("timeupdate", sample);
      video.removeEventListener("seeking", reset); video.removeEventListener("seeked", reset);
      video.removeEventListener("pause", flush); video.removeEventListener("ended", flush); window.removeEventListener("pagehide", flush);
    };
  }, [progressItem?.id, progressItem?.title, title, episodeNumber, playerMode, activeUrl]);

  async function refreshSources() {
    if (!resolveUrl || refreshingSourcesRef.current) return;
    refreshingSourcesRef.current = true;
    lastRefreshRef.current = Date.now();
    resumeTimeRef.current = videoRef.current?.currentTime || lastPositionRef.current;
    setHasError(false);
    setIsBuffering(true);
    try {
      const response = await fetch(resolveUrl + "?refresh=true", { cache: "no-store" });
      if (!response.ok) throw new Error("Source refresh failed");
      const result = await response.json();
      const nextServers: VideoServerOption[] = (result.servers || []).map((server: VideoServerOption & { subtitle_url?: string; playback_url?: string }, index: number) => ({
        ...server,
        url: server.playback_url || server.url,
        subtitleUrl: server.subtitle_url ? `/api/anime/${result.anime_id}/subtitles/${result.episode}/ar.vtt?server=${index}` : undefined,
      }));
      if (!nextServers.length) throw new Error("No playable source");
      attemptedServersRef.current.clear();
      setServers(nextServers);
      setHlsAttempt((attempt) => attempt + 1);
      if (nextServers[0].url === activeUrl && !isHls) videoRef.current?.load();
    } catch {
      setHasError(true);
      setIsBuffering(false);
    } finally {
      refreshingSourcesRef.current = false;
    }
  }

  function advanceServer() {
    attemptedServersRef.current.add(activeUrl);
    const next = servers?.find((server) => !attemptedServersRef.current.has(server.url));
    if (!next) {
      if (refreshingSourcesRef.current) return true;
      if (resolveUrl && Date.now() - lastRefreshRef.current > 120000) {
        void refreshSources();
        return true;
      }
      return false;
    }
    resumeTimeRef.current = videoRef.current?.currentTime || lastPositionRef.current;
    setPlayerMode(next.type === "hls" ? "direct" : next.type || "embed");
    setActiveUrl(next.url);
    setHasError(false);
    setIsBuffering(true);
    return true;
  }
  recoverPlaybackRef.current = advanceServer;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || playerMode !== "direct" || !activeUrl) return;
    let lastPosition = video.currentTime;
    let lastProgress = performance.now();
    let recovering = false;
    const resetDeadline = () => { lastProgress = performance.now(); };
    const timer = window.setInterval(() => {
      const now = performance.now();
      if (document.hidden || video.ended || refreshingSourcesRef.current || (!wantsPlaybackRef.current && video.paused)) {
        lastProgress = now;
        return;
      }
      if (video.readyState >= 2 && Math.abs(video.currentTime - lastPosition) > 0.05) {
        lastPosition = video.currentTime;
        lastProgress = now;
      }
      // Give enough leeway (25s) for transient buffering on slower connections before switching servers
      if (!recovering && now - lastProgress >= 25000) {
        recovering = true;
        if (!recoverPlaybackRef.current()) {
          setIsBuffering(false);
          setHasError(true);
        }
      }
    }, 1000);
    video.addEventListener("seeking", resetDeadline);
    video.addEventListener("playing", resetDeadline);
    video.addEventListener("canplay", resetDeadline);
    return () => {
      window.clearInterval(timer);
      video.removeEventListener("seeking", resetDeadline);
      video.removeEventListener("playing", resetDeadline);
      video.removeEventListener("canplay", resetDeadline);
    };
  }, [activeUrl, playerMode, hlsAttempt]);

  useEffect(() => {
    setSubtitleLines([]);
    const element = videoRef.current?.querySelector("track");
    if (!element || playerMode !== "direct") return;
    const track = element.track;
    const updateSubtitles = () => {
      setSubtitleLines(Array.from(track.activeCues || []).map((cue) =>
        (cue as VTTCue).getCueAsHTML().textContent || ""
      ).filter(Boolean));
    };
    const loadSubtitles = () => {
      // Keep cue timing active while rendering readable captions above our controls.
      track.mode = "hidden";
      updateSubtitles();
    };
    element.addEventListener("load", loadSubtitles);
    track.addEventListener("cuechange", updateSubtitles);
    loadSubtitles();
    return () => {
      element.removeEventListener("load", loadSubtitles);
      track.removeEventListener("cuechange", updateSubtitles);
    };
  }, [activeSubtitle, activeUrl, playerMode]);

  useEffect(() => {
    const controls = controlsRef.current;
    const container = containerRef.current;
    if (!controls || !container) return;
    const observer = new ResizeObserver(() => {
      container.style.setProperty("--video-controls-height", `${controls.offsetHeight}px`);
    });
    observer.observe(controls);
    return () => observer.disconnect();
  }, [playerMode]);

  useEffect(() => {
    setHasError(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBufferedPercent(0);
    const video = videoRef.current;
    if (!video || playerMode !== "direct" || !isHls) return;
    if (!Hls.isSupported()) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = activeUrl;
        if (hlsAttempt) video.play().catch(() => {});
        return;
      }
      setHasError(true);
      return;
    }
    const hls = new Hls({
      startFragPrefetch: true,
      progressive: true,
      maxBufferLength: 90,
      maxMaxBufferLength: 300,
      maxBufferSize: 256 * 1024 * 1024,
      backBufferLength: 60,
      enableWorker: true,
      lowLatencyMode: false,
      maxBufferHole: 0.5,
      highBufferWatchdogPeriod: 2,
      nudgeOffset: 0.1,
      nudgeMaxRetry: 5,
      fragLoadingTimeOut: 30000,
      fragLoadingMaxRetry: 6,
      fragLoadingRetryDelay: 500,
      manifestLoadingTimeOut: 25000,
      manifestLoadingMaxRetry: 4,
      levelLoadingTimeOut: 25000,
      levelLoadingMaxRetry: 4,
      xhrSetup: (xhr) => {
        xhr.withCredentials = true;
      },
    });
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            if (!advanceServer()) {
              setHasError(true);
              setIsBuffering(false);
            }
            break;
        }
      }
    });
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (hlsAttempt || wantsPlaybackRef.current) video.play().catch(() => {});
    });
    hls.loadSource(activeUrl);
    hls.attachMedia(video);
    return () => hls.destroy();
  }, [activeUrl, playerMode, isHls, hlsAttempt]);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.currentTime > 0) lastPositionRef.current = video.currentTime;
      if (video.buffered.length > 0 && video.duration > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBufferedPercent((bufferedEnd / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      if ((expectedDuration || 0) > 180 && video.duration > 0 && video.duration < 60) {
        video.pause();
        if (!advanceServer()) setHasError(true);
        return;
      }
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
      setIsBuffering(false);
      setHasError(false);
      if (resumeTimeRef.current > 0) {
        video.currentTime = Math.min(resumeTimeRef.current, video.duration || resumeTimeRef.current);
        resumeTimeRef.current = 0;
      }
      if (wantsPlaybackRef.current) video.play().catch(() => {});
    };

    const handleCanPlay = () => {
      if ((expectedDuration || 0) > 180 && video.duration > 0 && video.duration < 60) return;
      setIsBuffering(false);
      setHasError(false);
    };

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
      setHasStarted(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      if (advanceServer()) return;
      setIsBuffering(false);
      setHasError(true);
    };
    const handleRateChange = () => {
      if (video.playbackRate) {
        setPlaybackRate(video.playbackRate);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("error", handleError);
    video.addEventListener("ratechange", handleRateChange);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("error", handleError);
      video.removeEventListener("ratechange", handleRateChange);
    };
  }, [activeUrl, playerMode, expectedDuration]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;

      const video = videoRef.current;
      if (!video) return;

      switch (e.code) {
        case "Space":
        case "KeyK":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case "ArrowRight":
          e.preventDefault();
          video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "Period":
          if (e.shiftKey) {
            e.preventDefault();
            const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
            const next = speeds.find((s) => s > playbackRate) || 2;
            handleSpeedSelect(next);
          }
          break;
        case "Comma":
          if (e.shiftKey) {
            e.preventDefault();
            const speeds = [2, 1.5, 1.25, 1, 0.75, 0.5];
            const prev = speeds.find((s) => s < playbackRate) || 0.5;
            handleSpeedSelect(prev);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isMuted, playbackRate]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSpeedMenu) {
        setShowControls(false);
      }
    }, 3500);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      wantsPlaybackRef.current = true;
      setHasStarted(true);
      if (video.readyState < 3) setIsBuffering(true);
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name === "AbortError") return;
          // If browser blocked unmuted autoplay, try with mute
          console.warn("Autoplay was prevented:", err);
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => setHasError(true));
        });
      }
    } else {
      wantsPlaybackRef.current = false;
      video.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const seekTime = (parseFloat(e.target.value) / 100) * (duration || 1);
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    video.volume = val;
    setVolume(val);
    if (val === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const handleSpeedSelect = (rate: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
      video.defaultPlaybackRate = rate;
    }
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds <= 0) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="player-shell space-y-3">
      <div className="player-sourcebar flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="player-server-options flex flex-wrap items-center gap-2">
          <span className="text-xs text-cinema-textMuted font-medium">سيرفر المشاهدة:</span>
          {servers && servers.length > 0 ? (
            servers.map((s) => (
              <button
                key={s.url}
                type="button"
                aria-pressed={activeUrl === s.url}
                onClick={() => {
                  if (activeUrl === s.url) return;
                  attemptedServersRef.current.clear();
                  wantsPlaybackRef.current = true;
                  setHasStarted(true);
                  setIsBuffering(true);
                  setHasError(false);
                  resumeTimeRef.current = videoRef.current?.currentTime || lastPositionRef.current;
                  setPlayerMode(s.type === "hls" ? "direct" : s.type || "embed");
                  setActiveUrl(s.url);
                }}
                className={`player-server-button px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeUrl === s.url
                    ? "bg-cinema-accent text-white shadow-glow"
                    : "bg-cinema-card border border-cinema-border text-cinema-textSecondary hover:text-white"
                }`}
              >
                {s.name}
              </button>
            ))
          ) : embedUrl ? (
            <button
              type="button"
              onClick={() => {
                setPlayerMode("embed");
                setActiveUrl(embedUrl);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                playerMode === "embed"
                  ? "bg-cinema-accent text-white shadow-glow"
                  : "bg-cinema-card border border-cinema-border text-cinema-textSecondary hover:text-white"
              }`}
            >
              سيرفر البث المدمج
            </button>
          ) : null}

          {streamUrl && !servers?.some((server) => server.type === "direct" || server.type === "hls") && (
            <button
              type="button"
              onClick={() => {
                setActiveUrl(streamUrl);
                setPlayerMode("direct");
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                playerMode === "direct"
                  ? "bg-cinema-accent text-white shadow-glow"
                  : "bg-cinema-card border border-cinema-border text-cinema-textSecondary hover:text-white"
              }`}
            >
              المشغل المباشر
            </button>
          )}
        </div>

        {hasArabicSubs && <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>مترجم عربي</span>
        </div>}
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="video-player relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-cinema-border/50 group select-none"
      >
        {playerMode === "embed" && activeUrl ? (
          <iframe
            key={activeUrl}
            src={activeUrl}
            title={title}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="w-full h-full border-0"
          />
        ) : (
          <>
            {/* HTML5 Native Video supporting HTTP 206 Partial Content & Subtitles */}
            <video
              ref={videoRef}
              src={isHls ? undefined : activeUrl || streamUrl}
              poster={posterUrl}
              preload="auto"
              playsInline
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
            >
              {activeSubtitle && (
                <track
                  key={activeSubtitle}
                  src={activeSubtitle}
                  kind="subtitles"
                  srcLang="ar"
                  label="العربية"
                />
              )}
            </video>

            {!hasError && subtitleLines.length > 0 && (
              <div
                className="video-subtitles"
                data-controls-visible={showControls || !isPlaying}
                aria-live="off"
              >
                {subtitleLines.map((line, index) => (
                  <div key={index} dir="auto"><span>{line}</span></div>
                ))}
              </div>
            )}

            {/* Prominent Center Play Button Overlay (when paused) */}
            {!isPlaying && !isBuffering && !hasError && (
              <button
                type="button"
                aria-label="تشغيل الفيديو"
                onClick={togglePlay}
                className="player-play-overlay absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 cursor-pointer z-20 transition-all duration-300"
              >
                <span className="player-big-play w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-cinema-accent hover:bg-cinema-accentLight text-white flex items-center justify-center shadow-glow transform transition-transform duration-300 hover:scale-110">
                  <Play className="w-9 h-9 sm:w-11 sm:h-11 fill-current ml-1" />
                </span>
              </button>
            )}

            {/* Buffering Spinner */}
            {isBuffering && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none z-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-cinema-accent border-t-transparent rounded-full animate-spin shadow-glow" />
                  <span className="text-xs font-semibold text-white tracking-wide">
                    جارٍ تحميل الحلقة...
                  </span>
                </div>
              </div>
            )}

      {/* Stream Error Overlay */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/85 backdrop-blur-md z-30 p-6 text-center">
          <div className="max-w-md flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-base">تعذّر تشغيل الحلقة حاليًا</h4>
            <p className="text-xs text-cinema-textMuted leading-relaxed">
              يرجى التحقق من اتصال الخادم أو النقر على إعادة المحاولة أدناه.
            </p>
            <button
              onClick={() => {
                if (resolveUrl) {
                  wantsPlaybackRef.current = true;
                  void refreshSources();
                  return;
                }
                if (isHls) {
                  setHlsAttempt((attempt) => attempt + 1);
                  return;
                }
                if (videoRef.current) {
                  videoRef.current.load();
                  setIsBuffering(false);
                  setHasError(false);
                  videoRef.current.play().catch(() => {});
                }
              }}
              className="px-5 py-2.5 rounded-lg bg-cinema-accent hover:bg-cinema-accentLight text-white text-xs font-bold flex items-center gap-2 shadow-glow"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة المحاولة والتشغيل</span>
            </button>
          </div>
        </div>
      )}

      {/* Protocol Badge (Top-left) */}
      <div
        className={`player-protocol-badge absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-cinema-textSecondary transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
        <span>مشاهدة الفيديو</span>
      </div>

      {/* Top Title Overlay */}
      <div
        className={`player-title-overlay absolute top-4 right-4 z-20 text-white font-bold text-sm bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-lg border border-white/10 transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        {title}
      </div>

      {/* Cinema Controls Bar */}
      <div
        ref={controlsRef}
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 sm:p-6 flex flex-col gap-3 z-20 transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Scrubber Timeline */}
        <div className="relative w-full h-2 flex items-center group/scrubber cursor-pointer">
          <div className="absolute inset-x-0 h-1 bg-white/20 rounded-full" />
          <div
            className="absolute right-0 h-1 bg-white/40 rounded-full"
            style={{ width: `${bufferedPercent}%` }}
          />
          <div
            className="absolute right-0 h-1 bg-cinema-accent rounded-full shadow-glow"
            style={{ width: `${currentPercent}%` }}
          />
          <input
            type="range"
            aria-label="تقدّم المشاهدة"
            min={0}
            max={100}
            value={currentPercent || 0}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-white text-sm">
          {/* Right Group (Play, Skip, Time) */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime -= 10;
              }}
              title="تراجع 10 ثوانٍ"
              className="p-1.5 rounded-lg hover:bg-white/10 text-cinema-textSecondary hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime += 10;
              }}
              title="تقديم 10 ثوانٍ"
              className="p-1.5 rounded-lg hover:bg-white/10 text-cinema-textSecondary hover:text-white transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <span dir="ltr" className="player-time text-xs font-medium text-cinema-textSecondary">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Left Group (Volume, Speed, Fullscreen) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="كتم الصوت"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-cinema-accentLight" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                aria-label="مستوى الصوت"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 accent-cinema-accent bg-white/20 rounded-full cursor-pointer hidden sm:block"
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpeedMenu((prev) => !prev);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  showSpeedMenu
                    ? "bg-cinema-accent text-white shadow-glow"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="سرعة التشغيل"
              >
                <Gauge className="w-3.5 h-3.5 text-cinema-accentLight" />
                <span>{playbackRate}x</span>
              </button>

              {showSpeedMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-full left-0 mb-2 bg-cinema-card/95 backdrop-blur-md border border-cinema-border rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 z-30 min-w-[85px]"
                >
                  <div className="text-[10px] text-cinema-textMuted px-2 py-0.5 text-center font-bold border-b border-cinema-border/50">
                    سرعة التشغيل
                  </div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={(e) => handleSpeedSelect(rate, e)}
                      className={`px-3 py-1 text-xs rounded-md text-right font-bold transition-colors ${
                        playbackRate === rate
                          ? "bg-cinema-accent text-white shadow-glow"
                          : "text-cinema-textSecondary hover:bg-cinema-elevated hover:text-white"
                      }`}
                    >
                      {rate === 1 ? "1x (عادي)" : `${rate}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="ملء الشاشة"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )}
</div>
</div>
  );
}
