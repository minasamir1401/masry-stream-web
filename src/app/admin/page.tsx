"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  Film,
  KeyRound,
  Link as LinkIcon,
  Lock,
  LogOut,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Trash2,
  Tv,
  User,
  Users,
  Video,
  X,
} from "lucide-react";

interface AnalyticsOverview {
  total_visitors: number;
  active_now: number;
  total_duration_minutes: number;
  avg_duration_minutes: number;
  total_anime_played: number;
  total_watch_minutes: number;
  total_anime_browsed: number;
}

interface TopWatchedItem {
  anime_id: number | null;
  title: string;
  plays_count: number;
  watch_minutes: number;
  unique_viewers: number;
}

interface TopBrowsedItem {
  anime_id: number | null;
  title: string;
  browse_count: number;
  unique_browsers: number;
}

interface VisitorSessionItem {
  visitor_id: string;
  first_seen: string;
  last_seen: string;
  duration_minutes: number;
  page_views: number;
  anime_browsed: number;
  anime_played: number;
  watch_minutes: number;
  last_path: string;
}

interface RecentEventItem {
  id: number;
  visitor_id: string;
  event_type: string;
  path: string;
  anime_title: string | null;
  episode_number: number | null;
  duration_seconds: number;
  created_at: string;
}

interface AnalyticsData {
  period_days: number;
  overview: AnalyticsOverview;
  top_watched_anime: TopWatchedItem[];
  top_browsed_anime: TopBrowsedItem[];
  recent_sessions: VisitorSessionItem[];
  recent_events: RecentEventItem[];
}

const inputClass =
  "w-full rounded-xl border border-cinema-border bg-cinema-bg px-3.5 py-2.5 text-sm text-white placeholder-cinema-muted focus:outline-none focus:ring-2 focus:ring-cinema-accent";
const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-cinema-accent px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50";
const cardClass = "rounded-2xl border border-cinema-border bg-cinema-card p-5 sm:p-6 shadow-xl";

class AdminRequestError extends Error {
  constructor(message: string, public status: number, public retryAfter = 0) { super(message); }
}

async function adminRequest<T>(path: string, method = "GET", body?: object): Promise<T | null> {
  const response = await fetch(`/api/admin${path}`, {
    method,
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 401 && path !== "/login") return null;
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const retryAfter = Number(response.headers.get("Retry-After"));
    throw new AdminRequestError(data.detail || "فشل تنفيذ العملية الإدارية", response.status, Number.isFinite(retryAfter) && retryAfter > 0 ? Math.ceil(retryAfter) : 60);
  }
  return response.json();
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"anime" | "analytics" | "credentials" | "system">("anime");

  // Login form
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginCooldown, setLoginCooldown] = useState(0);

  // Change credentials form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [credLoading, setCredLoading] = useState(false);
  const [credMessage, setCredMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Analytics data
  const [periodDays, setPeriodDays] = useState<number>(7);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Anime Management state
  const [animeQuery, setAnimeQuery] = useState("");
  const [animeSearchResults, setAnimeSearchResults] = useState<any[]>([]);
  const [animeSearchLoading, setAnimeSearchLoading] = useState(false);
  const [hiddenAnimeList, setHiddenAnimeList] = useState<any[]>([]);
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<any | null>(null);

  // Episode Management state
  const [animeEpisodes, setAnimeEpisodes] = useState<any[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [newEpisodeNumber, setNewEpisodeNumber] = useState<number>(1);
  const [newEpisodeTitle, setNewEpisodeTitle] = useState("");
  const [addingEpisode, setAddingEpisode] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);

  // Server Management state
  const [customServers, setCustomServers] = useState<any[]>([]);
  const [liveServers, setLiveServers] = useState<any[]>([]);
  const [serversLoading, setServersLoading] = useState(false);
  const [newServerName, setNewServerName] = useState("سيرفر رئيسي 1080p");
  const [newServerUrl, setNewServerUrl] = useState("");
  const [newServerType, setNewServerType] = useState<"direct" | "hls" | "embed">("direct");
  const [newServerSubtitle, setNewServerSubtitle] = useState("");
  const [savingServer, setSavingServer] = useState(false);
  const [editingServerId, setEditingServerId] = useState<number | null>(null);
  const [actionNotice, setActionNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (loginCooldown <= 0) return;
    const timer = setTimeout(() => setLoginCooldown(value => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [loginCooldown]);

  useEffect(() => {
    if (authenticated) {
      loadAnalytics(periodDays);
      loadHiddenAnime();

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const queryAnimeId = params.get("anime_id");
        if (queryAnimeId) {
          const idNum = Number(queryAnimeId);
          if (idNum > 0) {
            setActiveTab("anime");
            adminRequest<any>(`/anime/search?q=${idNum}`).then((data) => {
              const found = data?.items?.find((it: any) => it.id === idNum) || data?.items?.[0];
              if (found) {
                openAnimeEpisodes(found);
              } else {
                openAnimeEpisodes({ id: idNum, title: `أنمي #${idNum}` });
              }
            }).catch(() => {
              openAnimeEpisodes({ id: idNum, title: `أنمي #${idNum}` });
            });
          }
        }
      }
    }
  }, [authenticated, periodDays]);

  async function checkAuth() {
    try {
      const data = await adminRequest<{ status: string; username?: string }>("/status");
      if (data && data.status === "authenticated") {
        setAuthenticated(true);
        setCurrentUsername(data.username || "admin");
      } else {
        setAuthenticated(false);
      }
    } catch {
      setAuthenticated(false);
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (loginLoading || loginCooldown > 0) return;
    setLoginLoading(true);
    setLoginError(null);
    try {
      const data = await adminRequest<{ status: string; username: string }>("/login", "POST", {
        username: loginUsername.trim(),
        password: loginPassword,
      });
      if (data && data.status === "authenticated") {
        setCurrentUsername(data.username);
        setAuthenticated(true);
        setLoginCooldown(0);
        setLoginPassword("");
        setLoginUsername("");
      }
    } catch (err) {
      if (err instanceof AdminRequestError && err.status === 429) setLoginCooldown(err.retryAfter);
      setLoginError(err instanceof Error ? err.message : "فشل تسجيل الدخول");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await adminRequest("/logout", "POST");
    } finally {
      setAuthenticated(false);
      setCurrentUsername("");
      setAnalytics(null);
    }
  }

  async function loadAnalytics(days = periodDays) {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const data = await adminRequest<AnalyticsData>(`/analytics/overview?days=${days}`);
      if (data) {
        setAnalytics(data);
      }
    } catch (err) {
      setAnalyticsError(err instanceof Error ? err.message : "تعذر جلب بيانات التحليلات");
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function handleChangeCredentials(e: FormEvent) {
    e.preventDefault();
    setCredMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setCredMessage({ text: "كلمتا المرور الجديدة وغير متطابقتين", type: "error" });
      return;
    }

    if (!newUsername.trim() && !newPassword) {
      setCredMessage({ text: "يرجى إدخال اسم مستخدم جديد أو كلمة مرور جديدة للتحديث", type: "error" });
      return;
    }

    setCredLoading(true);
    try {
      const res = await adminRequest<{ status: string; username: string; message: string }>(
        "/change-credentials",
        "POST",
        {
          current_password: currentPassword,
          new_username: newUsername.trim() || undefined,
          new_password: newPassword || undefined,
        }
      );
      if (res) {
        setCredMessage({ text: res.message || "تم حفظ البيانات الجديدة بنجاح", type: "success" });
        setCurrentUsername(res.username);
        setCurrentPassword("");
        setNewUsername("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setCredMessage({
        text: err instanceof Error ? err.message : "فشل تحديث بيانات الدخول",
        type: "error",
      });
    } finally {
      setCredLoading(false);
    }
  }

  async function searchAnime(q: string) {
    if (!q.trim()) return;
    setAnimeSearchLoading(true);
    setActionNotice(null);
    try {
      const data = await adminRequest<{ items: any[]; total: number }>(`/anime/search?q=${encodeURIComponent(q.trim())}`);
      if (data) {
        setAnimeSearchResults(data.items || []);
      }
    } catch (err) {
      setActionNotice({ text: err instanceof Error ? err.message : "تعذر البحث عن الأنمي", type: "error" });
    } finally {
      setAnimeSearchLoading(false);
    }
  }

  async function loadHiddenAnime() {
    try {
      const data = await adminRequest<{ items: any[]; total: number }>("/anime/hidden");
      if (data) {
        setHiddenAnimeList(data.items || []);
      }
    } catch {}
  }

  async function handleToggleHideAnime(animeId: number, currentHidden: boolean, title?: string) {
    try {
      if (currentHidden) {
        await adminRequest(`/anime/${animeId}/unhide`, "POST");
        setActionNotice({ text: "تم إلغاء الإخفاء وإعادة إتاحة الأنمي للمستخدمين بنجاح", type: "success" });
      } else {
        await adminRequest(`/anime/${animeId}/hide`, "POST", { title: title || "" });
        setActionNotice({ text: "تم إخفاء الأنمي وحذفه من الظهور للمستخدمين بنجاح", type: "success" });
      }
      setAnimeSearchResults((prev) =>
        prev.map((item) => (item.id === animeId ? { ...item, is_hidden: !currentHidden } : item))
      );
      if (selectedAnime && selectedAnime.id === animeId) {
        setSelectedAnime((prev: any) => ({ ...prev, is_hidden: !currentHidden }));
      }
      loadHiddenAnime();
    } catch (err) {
      setActionNotice({ text: err instanceof Error ? err.message : "فشل تعديل حالة ظهور الأنمي", type: "error" });
    }
  }

  async function openAnimeEpisodes(anime: any) {
    setSelectedAnime(anime);
    setSelectedEpisode(null);
    setEpisodesLoading(true);
    setActionNotice(null);
    try {
      const data = await adminRequest<{ anime_id: number; episodes: any[]; total: number }>(`/anime/${anime.id}/episodes`);
      if (data) {
        setAnimeEpisodes(data.episodes || []);
        const nextNum = (data.episodes?.length || 0) + 1;
        setNewEpisodeNumber(nextNum);
        setNewEpisodeTitle(`الحلقة ${nextNum}`);
      }
    } catch (err) {
      setActionNotice({ text: err instanceof Error ? err.message : "تعذر جلب حلقات الأنمي", type: "error" });
    } finally {
      setEpisodesLoading(false);
    }
  }

  async function handleAddEpisode(e: FormEvent) {
    e.preventDefault();
    if (!selectedAnime || newEpisodeNumber < 1) return;
    setAddingEpisode(true);
    setActionNotice(null);
    try {
      await adminRequest(`/anime/${selectedAnime.id}/episodes`, "POST", {
        episode_number: Number(newEpisodeNumber),
        title: newEpisodeTitle.trim() || `الحلقة ${newEpisodeNumber}`,
      });
      setActionNotice({ text: `تمت إضافة الحلقة ${newEpisodeNumber} بنجاح`, type: "success" });
      openAnimeEpisodes(selectedAnime);
    } catch (err) {
      setActionNotice({ text: err instanceof Error ? err.message : "فشل إضافة الحلقة", type: "error" });
    } finally {
      setAddingEpisode(false);
    }
  }

  async function handleDeleteEpisode(episodeNumber: number) {
    if (!selectedAnime) return;
    try {
      await adminRequest(`/anime/${selectedAnime.id}/episodes/${episodeNumber}`, "DELETE");
      setActionNotice({ text: `تم حذف الحلقة المخصصة ${episodeNumber}`, type: "success" });
      openAnimeEpisodes(selectedAnime);
      if (selectedEpisode === episodeNumber) {
        setSelectedEpisode(null);
      }
    } catch (err) {
      setActionNotice({ text: err instanceof Error ? err.message : "فشل حذف الحلقة", type: "error" });
    }
  }

  async function openEpisodeServers(episodeNumber: number) {
    setSelectedEpisode(episodeNumber);
    setServersLoading(true);
    setActionNotice(null);
    setEditingServerId(null);
    setNewServerName("سيرفر رئيسي 1080p");
    setNewServerUrl("");
    setNewServerType("direct");
    setNewServerSubtitle("");
    try {
      const data = await adminRequest<{ custom_servers: any[]; live_servers: any[] }>(
        `/anime/${selectedAnime.id}/episodes/${episodeNumber}/servers`
      );
      if (data) {
        setCustomServers(data.custom_servers || []);
        setLiveServers(data.live_servers || []);
      }
    } catch (err) {
      setActionNotice({ text: err instanceof Error ? err.message : "تعذر جلب سيرفرات الحلقة", type: "error" });
    } finally {
      setServersLoading(false);
    }
  }

  async function handleSaveServer(e: FormEvent) {
    e.preventDefault();
    if (!selectedAnime || !selectedEpisode || !newServerUrl.trim()) return;
    setSavingServer(true);
    setActionNotice(null);
    try {
      if (editingServerId) {
        await adminRequest(`/servers/${editingServerId}`, "PUT", {
          name: newServerName.trim() || "سيرفر تشغيل",
          url: newServerUrl.trim(),
          server_type: newServerType,
          subtitle_url: newServerSubtitle.trim() || undefined,
          is_active: true,
        });
        setActionNotice({ text: "تم تحديث السيرفر بنجاح", type: "success" });
      } else {
        await adminRequest(`/anime/${selectedAnime.id}/episodes/${selectedEpisode}/servers`, "POST", {
          name: newServerName.trim() || "سيرفر تشغيل",
          url: newServerUrl.trim(),
          server_type: newServerType,
          subtitle_url: newServerSubtitle.trim() || undefined,
        });
        setActionNotice({ text: "تم إضافة سيرفر المشاهدة الجديد بنجاح", type: "success" });
      }
      setEditingServerId(null);
      setNewServerUrl("");
      setNewServerSubtitle("");
      openEpisodeServers(selectedEpisode);
    } catch (err) {
      setActionNotice({ text: err instanceof Error ? err.message : "فشل حفظ السيرفر", type: "error" });
    } finally {
      setSavingServer(false);
    }
  }

  async function handleDeleteServer(serverId: number) {
    try {
      await adminRequest(`/servers/${serverId}`, "DELETE");
      setActionNotice({ text: "تم حذف السيرفر بنجاح", type: "success" });
      if (selectedEpisode) {
        openEpisodeServers(selectedEpisode);
      }
    } catch (err) {
      setActionNotice({ text: err instanceof Error ? err.message : "فشل حذف السيرفر", type: "error" });
    }
  }

  const formatEventType = (type: string) => {
    switch (type) {
      case "browse_anime":
        return "تصفح أنمي";
      case "play_anime":
        return "استماع / مشاهدة أنمي";
      case "page_view":
        return "زيارة صفحة";
      case "heartbeat":
        return "جلسة تصفح نشطة";
      default:
        return type;
    }
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return "-";
    try {
      const d = new Date(isoStr);
      return d.toLocaleString("ar-EG", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-cinema-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-cinema-accent/20 px-2.5 py-1 text-xs font-bold text-cinema-accent">
              لوحة الإدارة
            </span>
            {authenticated && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                المشرف: {currentUsername}
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            إدارة المنصة والإحصائيات التحليلية
          </h1>
          <p className="mt-1 text-sm text-cinema-muted">
            متابعة دقيقة لحركة الزوار، وقت البقاء، مشاهدات الأنمي، والتحكم في بيانات الحساب
          </p>
        </div>

        {authenticated && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadAnalytics(periodDays)}
              disabled={analyticsLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-cinema-border bg-cinema-card px-3.5 py-2 text-sm text-cinema-muted transition hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${analyticsLoading ? "animate-spin" : ""}`} />
              تحديث البيانات
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-sm text-red-400 transition hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </div>
        )}
      </header>

      {/* Login Screen */}
      {!authenticated ? (
        <div className="mx-auto max-w-md pt-8">
          <form onSubmit={handleLogin} className={cardClass}>
            <div className="flex items-center gap-3 border-b border-cinema-border pb-4 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cinema-accent/20 text-cinema-accent">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">تسجيل دخول المشرف</h2>
                <p className="text-xs text-cinema-muted">الدخول إلى لوحة المتابعة المحمية</p>
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span role="alert">{loginCooldown > 0 ? `محاولات دخول كثيرة. يمكنك المحاولة بعد ${loginCooldown.toLocaleString("ar-EG")} ثانية.` : loginError}</span>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-cinema-muted">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم"
                    className={inputClass}
                    required
                    autoComplete="username"
                  />
                  <User className="absolute left-3 top-3 h-4 w-4 text-cinema-muted pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-cinema-muted">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className={inputClass}
                    required
                    autoComplete="current-password"
                  />
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-cinema-muted pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading || loginCooldown > 0}
                className={`w-full ${primaryButtonClass}`}
              >
                {loginCooldown > 0 ? `انتظر ${loginCooldown.toLocaleString("ar-EG")} ثانية` : loginLoading ? "جاري التحقق..." : "دخول إلى لوحة التحكم"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Authenticated View */
        <div className="space-y-6">
          {/* Tabs navigation */}
          <nav className="flex flex-wrap gap-2 border-b border-cinema-border pb-3">
            <button
              onClick={() => setActiveTab("anime")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                activeTab === "anime"
                  ? "bg-cinema-accent text-white"
                  : "border border-cinema-border bg-cinema-card text-cinema-muted hover:text-white"
              }`}
            >
              <Tv className="h-4 w-4" />
              إدارة الأنمي والحلقات والسيرفرات
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                activeTab === "analytics"
                  ? "bg-cinema-accent text-white"
                  : "border border-cinema-border bg-cinema-card text-cinema-muted hover:text-white"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              إحصائيات وتحليلات الزوار
            </button>
            <button
              onClick={() => setActiveTab("credentials")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                activeTab === "credentials"
                  ? "bg-cinema-accent text-white"
                  : "border border-cinema-border bg-cinema-card text-cinema-muted hover:text-white"
              }`}
            >
              <KeyRound className="h-4 w-4" />
              تغيير بيانات الدخول
            </button>
            <button
              onClick={() => setActiveTab("system")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                activeTab === "system"
                  ? "bg-cinema-accent text-white"
                  : "border border-cinema-border bg-cinema-card text-cinema-muted hover:text-white"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              حالة النظام
            </button>
          </nav>

          {/* TAB: Anime & Server Control */}
          {activeTab === "anime" && (
            <div className="space-y-6">
              {actionNotice && (
                <div
                  className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-sm font-semibold ${
                    actionNotice.type === "success"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-red-500/30 bg-red-500/10 text-red-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {actionNotice.type === "success" ? (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    )}
                    <span>{actionNotice.text}</span>
                  </div>
                  <button
                    onClick={() => setActionNotice(null)}
                    className="rounded-lg p-1 transition hover:bg-white/10"
                    aria-label="إغلاق الإشعار"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* View 1: When an Anime is Selected */}
              {selectedAnime ? (
                <div className="space-y-6">
                  {/* Selected Anime Top Bar */}
                  <div className={cardClass}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {selectedAnime.poster_url && (
                          <img
                            src={selectedAnime.poster_url}
                            alt={selectedAnime.title}
                            className="h-16 w-12 rounded-lg object-cover border border-cinema-border"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-cinema-accent">
                              معرف الأنمي #{selectedAnime.id}
                            </span>
                            <span
                              className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                                selectedAnime.is_hidden
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-emerald-500/20 text-emerald-400"
                              }`}
                            >
                              {selectedAnime.is_hidden ? "مخفي من الموقع" : "معروض للمستخدمين"}
                            </span>
                          </div>
                          <h2 className="text-lg font-black text-white sm:text-xl">
                            {selectedAnime.title}
                          </h2>
                          {selectedAnime.title_romaji && (
                            <p className="text-xs text-cinema-muted">
                              {selectedAnime.title_romaji}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() =>
                            handleToggleHideAnime(
                              selectedAnime.id,
                              Boolean(selectedAnime.is_hidden),
                              selectedAnime.title
                            )
                          }
                          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                            selectedAnime.is_hidden
                              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40"
                              : "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40"
                          }`}
                        >
                          {selectedAnime.is_hidden ? (
                            <>
                              <Eye className="h-4 w-4" />
                              إلغاء الإخفاء وإتاحة العرض
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4" />
                              إخفاء وحذف من العرض
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAnime(null);
                            setSelectedEpisode(null);
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-cinema-border bg-cinema-bg px-4 py-2 text-xs font-bold text-cinema-muted hover:text-white"
                        >
                          <ArrowRight className="h-4 w-4" />
                          الرجوع لقائمة الأنميات
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sub-view: When a specific Episode is Selected */}
                  {selectedEpisode ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-cinema-border pb-3">
                        <div className="flex items-center gap-2">
                          <Film className="h-5 w-5 text-cinema-accent" />
                          <h3 className="text-base font-bold text-white">
                            إدارة سيرفرات الحلقة {selectedEpisode}
                          </h3>
                        </div>
                        <button
                          onClick={() => setSelectedEpisode(null)}
                          className="inline-flex items-center gap-1.5 text-xs text-cinema-accent hover:underline"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                          الرجوع لقائمة الحلقات
                        </button>
                      </div>

                      {/* Add/Edit Server Form */}
                      <form onSubmit={handleSaveServer} className={cardClass}>
                        <h4 className="text-sm font-bold text-white border-b border-cinema-border pb-3">
                          {editingServerId ? "تعديل سيرفر المشاهدة" : "إضافة سيرفر مشاهدة مخصص"}
                        </h4>
                        <p className="mt-1 text-xs text-cinema-muted">
                          السيرفرات المضافة هنا تُعرض مباشرة في مشغل الفيديو وتعمل كأولوية قصوى لتخطي أي روابط تالفة أو محذوفة.
                        </p>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-cinema-muted mb-1.5">
                              اسم السيرفر المعروض
                            </label>
                            <input
                              type="text"
                              value={newServerName}
                              onChange={(e) => setNewServerName(e.target.value)}
                              placeholder="مثال: سيرفر رئيسي 1080p أو سيرفر VIP"
                              className={inputClass}
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-cinema-muted mb-1.5">
                              نوع السيرفر
                            </label>
                            <select
                              value={newServerType}
                              onChange={(e) => setNewServerType(e.target.value as any)}
                              className={inputClass}
                            >
                              <option value="direct">مباشر (Direct MP4 / WebM)</option>
                              <option value="hls">دفق مباشر (HLS .m3u8)</option>
                              <option value="embed">مشغل مدمج (Iframe Embed Player)</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-cinema-muted mb-1.5">
                              رابط الفيديو أو صفحة المشغل (URL)
                            </label>
                            <input
                              type="url"
                              value={newServerUrl}
                              onChange={(e) => setNewServerUrl(e.target.value)}
                              placeholder="https://example.com/video.mp4 أو .m3u8 أو رابط التضمين"
                              className={inputClass}
                              required
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-cinema-muted mb-1.5">
                              رابط ملف الترجمة العربي (WebVTT .vtt - اختياري)
                            </label>
                            <input
                              type="url"
                              value={newServerSubtitle}
                              onChange={(e) => setNewServerSubtitle(e.target.value)}
                              placeholder="https://example.com/subtitles/ar.vtt"
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div className="mt-5 flex items-center gap-3">
                          <button
                            type="submit"
                            disabled={savingServer}
                            className={primaryButtonClass}
                          >
                            <Plus className="h-4 w-4" />
                            {savingServer ? "جاري الحفظ..." : editingServerId ? "تحديث السيرفر" : "حفظ وإضافة السيرفر"}
                          </button>
                          {editingServerId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingServerId(null);
                                setNewServerName("سيرفر رئيسي 1080p");
                                setNewServerUrl("");
                                setNewServerSubtitle("");
                              }}
                              className="rounded-xl border border-cinema-border bg-cinema-bg px-4 py-2.5 text-sm text-cinema-muted hover:text-white"
                            >
                              إلغاء التعديل
                            </button>
                          )}
                        </div>
                      </form>

                      {/* Custom Servers List */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-white">
                          السيرفرات المخصصة المضافة للحلقة ({customServers.length})
                        </h4>
                        {serversLoading ? (
                          <div className="flex items-center justify-center p-8 text-cinema-muted">
                            <RefreshCw className="h-6 w-6 animate-spin text-cinema-accent" />
                          </div>
                        ) : customServers.length === 0 ? (
                          <div className="rounded-xl border border-cinema-border bg-cinema-card p-6 text-center text-sm text-cinema-muted">
                            لا توجد سيرفرات مخصصة مضافة لهذه الحلقة حتى الآن. أضف سيرفر من النموذج أعلاه ليظهر فورًا للمستخدمين.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-3">
                            {customServers.map((server) => (
                              <div
                                key={server.id}
                                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-cinema-border bg-cinema-card p-4 transition hover:border-cinema-accent/50"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Server className="h-4 w-4 text-cinema-accent" />
                                    <span className="font-bold text-white text-sm">
                                      {server.name}
                                    </span>
                                    <span className="rounded bg-cinema-accent/20 px-2 py-0.5 text-[11px] font-bold text-cinema-accent">
                                      {server.server_type === "direct"
                                        ? "مباشر MP4"
                                        : server.server_type === "hls"
                                        ? "دفق HLS"
                                        : "مدمج Embed"}
                                    </span>
                                    <span
                                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                        server.is_active
                                          ? "bg-emerald-500/20 text-emerald-400"
                                          : "bg-cinema-border text-cinema-muted"
                                      }`}
                                    >
                                      {server.is_active ? "نشط" : "معطل"}
                                    </span>
                                  </div>
                                  <p className="font-mono text-xs text-cinema-muted truncate max-w-xl">
                                    {server.url}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingServerId(server.id);
                                      setNewServerName(server.name);
                                      setNewServerUrl(server.url);
                                      setNewServerType(server.server_type);
                                      setNewServerSubtitle(server.subtitle_url || "");
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-cinema-border bg-cinema-bg px-3 py-1.5 text-xs text-cinema-muted hover:text-white"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    تعديل
                                  </button>
                                  <button
                                    onClick={() => handleDeleteServer(server.id)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    حذف
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Scraped/Live Fallback Info */}
                      {liveServers.length > 0 && (
                        <div className="rounded-xl border border-cinema-border bg-cinema-card/50 p-4">
                          <h4 className="text-xs font-bold text-cinema-muted mb-2">
                            سيرفرات احتياطية مكتشفة تلقائيًا من المشغلات ({liveServers.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {liveServers.map((ls, idx) => (
                              <span
                                key={idx}
                                className="rounded-lg border border-cinema-border bg-cinema-bg px-2.5 py-1 text-xs text-cinema-muted"
                              >
                                {ls.name} ({ls.type})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Sub-view: Episode List & Add Episode */
                    <div className="space-y-6">
                      {/* Add Episode Form */}
                      <form onSubmit={handleAddEpisode} className={cardClass}>
                        <h3 className="text-sm font-bold text-white border-b border-cinema-border pb-3">
                          إضافة حلقة جديدة للعمل
                        </h3>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-cinema-muted mb-1.5">
                              رقم الحلقة
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={newEpisodeNumber}
                              onChange={(e) => {
                                const num = Number(e.target.value);
                                setNewEpisodeNumber(num);
                                setNewEpisodeTitle(`الحلقة ${num}`);
                              }}
                              className={inputClass}
                              required
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-cinema-muted mb-1.5">
                              عنوان الحلقة
                            </label>
                            <input
                              type="text"
                              value={newEpisodeTitle}
                              onChange={(e) => setNewEpisodeTitle(e.target.value)}
                              placeholder="مثال: الحلقة 13 - بداية المعركة"
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end">
                          <button
                            type="submit"
                            disabled={addingEpisode}
                            className={primaryButtonClass}
                          >
                            <Plus className="h-4 w-4" />
                            {addingEpisode ? "جاري الإضافة..." : "إضافة الحلقة"}
                          </button>
                        </div>
                      </form>

                      {/* Episode Grid */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-white">
                            حلقات العمل المتاحة ({animeEpisodes.length})
                          </h3>
                          <span className="text-xs text-cinema-muted">
                            انقر على أي حلقة لإدارة سيرفرات المشاهدة الخاصة بها
                          </span>
                        </div>

                        {episodesLoading ? (
                          <div className="flex items-center justify-center p-8 text-cinema-muted">
                            <RefreshCw className="h-6 w-6 animate-spin text-cinema-accent" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {animeEpisodes.map((ep) => (
                              <div
                                key={ep.number}
                                className="group relative rounded-xl border border-cinema-border bg-cinema-card p-3 flex flex-col justify-between transition hover:border-cinema-accent hover:shadow-glow"
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-black text-white">
                                      حلقة {ep.number}
                                    </span>
                                    {ep.is_custom && (
                                      <button
                                        onClick={() => handleDeleteEpisode(ep.number)}
                                        className="text-cinema-muted hover:text-red-400 p-0.5"
                                        title="حذف الحلقة المخصصة"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                  <p className="mt-1 text-[11px] text-cinema-muted truncate">
                                    {ep.title}
                                  </p>
                                </div>

                                <div className="mt-3 pt-2 border-t border-cinema-border/50">
                                  <button
                                    onClick={() => openEpisodeServers(ep.number)}
                                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-cinema-accent/15 px-2 py-1.5 text-xs font-bold text-cinema-accent transition hover:bg-cinema-accent hover:text-white"
                                  >
                                    <Server className="h-3.5 w-3.5" />
                                    <span>
                                      {ep.custom_servers_count > 0
                                        ? `${ep.custom_servers_count} سيرفر`
                                        : "إضافة سيرفر"}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* View 2: Search & Anime List */
                <div className="space-y-6">
                  {/* Search Bar */}
                  <div className={cardClass}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex-1 min-w-[280px]">
                        <label className="block text-xs font-bold text-cinema-muted mb-1.5">
                          البحث عن أنمي للتحكم في ظهوره وحلقاته وسيرفراته
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={animeQuery}
                            onChange={(e) => setAnimeQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                setShowHiddenOnly(false);
                                searchAnime(animeQuery);
                              }
                            }}
                            placeholder="اكتب اسم الأنمي بالإنجليزية أو العربية (مثل: Death Note, Jujutsu Kaisen)..."
                            className={`${inputClass} pr-10`}
                          />
                          <Search className="absolute right-3.5 top-3 h-4 w-4 text-cinema-muted pointer-events-none" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-5">
                        <button
                          onClick={() => {
                            setShowHiddenOnly(false);
                            searchAnime(animeQuery);
                          }}
                          disabled={animeSearchLoading || !animeQuery.trim()}
                          className={primaryButtonClass}
                        >
                          <Search className={`h-4 w-4 ${animeSearchLoading ? "animate-spin" : ""}`} />
                          بحث
                        </button>
                        <button
                          onClick={() => {
                            setShowHiddenOnly(!showHiddenOnly);
                            loadHiddenAnime();
                          }}
                          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                            showHiddenOnly
                              ? "bg-red-500 text-white"
                              : "border border-cinema-border bg-cinema-card text-cinema-muted hover:text-white"
                          }`}
                        >
                          <EyeOff className="h-4 w-4" />
                          الأنميات المخفية ({hiddenAnimeList.length})
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Hidden Anime View */}
                  {showHiddenOnly ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-cinema-border pb-3">
                        <div className="flex items-center gap-2">
                          <EyeOff className="h-5 w-5 text-red-400" />
                          <h3 className="text-base font-bold text-white">
                            الأنميات المحذوفة / المخفية من العرض للمستخدمين ({hiddenAnimeList.length})
                          </h3>
                        </div>
                        <button
                          onClick={() => setShowHiddenOnly(false)}
                          className="text-xs text-cinema-accent hover:underline"
                        >
                          إغلاق وعودة للبحث
                        </button>
                      </div>

                      {hiddenAnimeList.length === 0 ? (
                        <div className="rounded-2xl border border-cinema-border bg-cinema-card p-8 text-center text-sm text-cinema-muted">
                          لا توجد أي أنميات مخفية حاليًا. جميع الأنميات معروضة بشكل طبيعي.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {hiddenAnimeList.map((item) => (
                            <div
                              key={item.anime_id}
                              className="rounded-xl border border-red-500/30 bg-cinema-card p-4 flex flex-col justify-between gap-3 shadow-lg"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-mono text-cinema-muted">
                                    ID #{item.anime_id}
                                  </span>
                                  <span className="rounded bg-red-500/20 px-2 py-0.5 text-[11px] font-bold text-red-400">
                                    مخفي
                                  </span>
                                </div>
                                <h4 className="mt-1 font-bold text-white text-sm">
                                  {item.title}
                                </h4>
                              </div>

                              <div className="flex items-center gap-2 pt-2 border-t border-cinema-border/40">
                                <button
                                  onClick={() => handleToggleHideAnime(item.anime_id, true)}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  إلغاء الإخفاء
                                </button>
                                <button
                                  onClick={() =>
                                    openAnimeEpisodes({
                                      id: item.anime_id,
                                      title: item.title,
                                      is_hidden: true,
                                    })
                                  }
                                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-cinema-border bg-cinema-bg px-3 py-1.5 text-xs text-cinema-muted hover:text-white"
                                >
                                  <Server className="h-3.5 w-3.5" />
                                  الحلقات
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Search Results */
                    <div className="space-y-4">
                      {animeSearchResults.length > 0 && (
                        <div className="flex items-center justify-between border-b border-cinema-border pb-3">
                          <h3 className="text-base font-bold text-white">
                            نتائج البحث ({animeSearchResults.length})
                          </h3>
                        </div>
                      )}

                      {animeSearchLoading ? (
                        <div className="flex items-center justify-center p-12 text-cinema-muted">
                          <RefreshCw className="h-8 w-8 animate-spin text-cinema-accent" />
                        </div>
                      ) : animeSearchResults.length === 0 ? (
                        <div className="rounded-2xl border border-cinema-border bg-cinema-card p-12 text-center text-cinema-muted">
                          <Tv className="mx-auto h-12 w-12 text-cinema-border mb-3" />
                          <h4 className="font-bold text-white text-base">لوحة التحكم في الأنميات والحلقات</h4>
                          <p className="text-xs text-cinema-muted mt-1 max-w-md mx-auto">
                            ابحث باسم أي أنمي لحذفه/إخفائه من الموقع فوراً، أو لإضافة حلقات جديدة وتعديل روابط وسيرفرات المشاهدة المخصصة.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {animeSearchResults.map((anime) => (
                            <div
                              key={anime.id}
                              className={`rounded-2xl border bg-cinema-card p-4 flex gap-4 transition hover:shadow-xl ${
                                anime.is_hidden
                                  ? "border-red-500/40 bg-red-950/10"
                                  : "border-cinema-border"
                              }`}
                            >
                              {anime.poster_url && (
                                <img
                                  src={anime.poster_url}
                                  alt={anime.title}
                                  className="h-28 w-20 flex-shrink-0 rounded-xl object-cover border border-cinema-border"
                                />
                              )}
                              <div className="flex flex-col justify-between flex-1 min-w-0">
                                <div>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[11px] font-mono text-cinema-accent">
                                      #{anime.id}
                                    </span>
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                        anime.is_hidden
                                          ? "bg-red-500/20 text-red-400"
                                          : "bg-emerald-500/20 text-emerald-400"
                                      }`}
                                    >
                                      {anime.is_hidden ? "مخفي من الموقع" : "معروض"}
                                    </span>
                                  </div>
                                  <h4 className="mt-1 font-bold text-white text-sm truncate">
                                    {anime.title}
                                  </h4>
                                  <p className="text-xs text-cinema-muted mt-0.5">
                                    {anime.total_episodes ? `${anime.total_episodes} حلقة` : "حلقات مستمرة"}
                                  </p>
                                </div>

                                <div className="mt-3 flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleToggleHideAnime(
                                        anime.id,
                                        Boolean(anime.is_hidden),
                                        anime.title
                                      )
                                    }
                                    className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                                      anime.is_hidden
                                        ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                        : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    }`}
                                  >
                                    {anime.is_hidden ? (
                                      <>
                                        <Eye className="h-3.5 w-3.5" />
                                        إلغاء الإخفاء
                                      </>
                                    ) : (
                                      <>
                                        <EyeOff className="h-3.5 w-3.5" />
                                        إخفاء / مسح
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => openAnimeEpisodes(anime)}
                                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-cinema-border bg-cinema-bg px-2.5 py-1.5 text-xs font-bold text-white hover:bg-cinema-accent hover:border-cinema-accent"
                                  >
                                    <Server className="h-3.5 w-3.5" />
                                    الحلقات والسيرفرات
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: Analytics */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Controls bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-cinema-border bg-cinema-card p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-cinema-accent" />
                  <span className="font-bold text-white text-sm">نطاق التقرير الزمني:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "اليوم", days: 1 },
                    { label: "آخر 7 أيام", days: 7 },
                    { label: "آخر 30 يوم", days: 30 },
                    { label: "جميع الأوقات", days: 0 },
                  ].map((p) => (
                    <button
                      key={p.days}
                      onClick={() => setPeriodDays(p.days)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        periodDays === p.days
                          ? "bg-cinema-accent text-white"
                          : "border border-cinema-border bg-cinema-bg text-cinema-muted hover:text-white"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {analyticsError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{analyticsError}</span>
                </div>
              )}

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Visitors */}
                <div className={cardClass}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-cinema-muted">إجمالي الزوار</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3 text-3xl font-black text-white">
                    {analytics?.overview.total_visitors.toLocaleString() ?? "-"}
                  </div>
                  <p className="mt-1 text-xs text-cinema-muted">سجل الجلسات الفريدة الموثقة</p>
                </div>

                {/* Active Now */}
                <div className={cardClass}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-cinema-muted">المتواجدون الآن</span>
                    <span className="flex h-3 w-3 items-center justify-center">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-400">
                      {analytics?.overview.active_now.toLocaleString() ?? "-"}
                    </span>
                    <span className="text-xs text-emerald-400/80">زائر نشط</span>
                  </div>
                  <p className="mt-1 text-xs text-cinema-muted">متفاعلون خلال آخر 5 دقائق</p>
                </div>

                {/* Total Open Minutes */}
                <div className={cardClass}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-cinema-muted">إجمالي وقت فتح الموقع</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                      <Clock className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">
                      {analytics?.overview.total_duration_minutes.toLocaleString() ?? "-"}
                    </span>
                    <span className="text-xs text-cinema-muted">دقيقة</span>
                  </div>
                  <p className="mt-1 text-xs text-cinema-muted">
                    متوسط الزائر: {analytics?.overview.avg_duration_minutes ?? "-"} دقيقة
                  </p>
                </div>

                {/* Anime Watched & Plays */}
                <div className={cardClass}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-cinema-muted">سماع ومشاهدة الأنمي</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                      <PlayCircle className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">
                      {analytics?.overview.total_anime_played.toLocaleString() ?? "-"}
                    </span>
                    <span className="text-xs text-cinema-muted">تشغيل</span>
                  </div>
                  <p className="mt-1 text-xs text-cinema-muted">
                    إجمالي المشاهدة: {analytics?.overview.total_watch_minutes ?? "-"} دقيقة
                  </p>
                </div>
              </div>

              {/* Second row KPI: Browsing */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className={cardClass}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-cinema-muted">
                        إجمالي تصفح أعمال الأنمي
                      </span>
                      <div className="mt-2 text-2xl font-black text-white">
                        {analytics?.overview.total_anime_browsed.toLocaleString() ?? "-"}
                      </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400">
                      <Eye className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-cinema-muted">
                    عمليات فتح صفحات تفاصيل الأنمي واستكشاف مواعيد وحلقات المسلسلات
                  </p>
                </div>

                <div className={cardClass}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-cinema-muted">
                        إجمالي وقت الاستماع والمشاهدة
                      </span>
                      <div className="mt-2 text-2xl font-black text-white">
                        {analytics?.overview.total_watch_minutes.toLocaleString() ?? "-"} دقيقة
                      </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                      <Tv className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-cinema-muted">
                    الوقت الفعلي الذي قضاة المشاهدون داخل مشغّل الفيديو
                  </p>
                </div>
              </div>

              {/* Tables Grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Top Watched Anime */}
                <div className={cardClass}>
                  <div className="flex items-center justify-between border-b border-cinema-border pb-3">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4 text-cinema-accent" />
                      <h3 className="font-bold text-white text-sm">الأنميات الأكثر سماعًا ومشاهدة</h3>
                    </div>
                    <span className="text-xs text-cinema-muted">مرتب حسب التشغيل</span>
                  </div>

                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-right text-xs text-cinema-muted">
                      <thead>
                        <tr className="border-b border-cinema-border/50 text-cinema-muted">
                          <th className="py-2 font-semibold">عنوان الأنمي</th>
                          <th className="py-2 font-semibold text-center">مرات التشغيل</th>
                          <th className="py-2 font-semibold text-center">دقائق المشاهدة</th>
                          <th className="py-2 font-semibold text-left">المشاهدون</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cinema-border/30">
                        {analytics?.top_watched_anime && analytics.top_watched_anime.length > 0 ? (
                          analytics.top_watched_anime.map((item, idx) => (
                            <tr key={idx} className="hover:bg-cinema-bg/40">
                              <td className="py-2.5 font-medium text-white max-w-[180px] truncate">
                                {item.title}
                              </td>
                              <td className="py-2.5 text-center font-bold text-cinema-accent">
                                {item.plays_count}
                              </td>
                              <td className="py-2.5 text-center">{item.watch_minutes} د</td>
                              <td className="py-2.5 text-left">{item.unique_viewers}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-cinema-muted">
                              لا توجد بيانات تشغيل مسجلة في هذا النطاق
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Browsed Anime */}
                <div className={cardClass}>
                  <div className="flex items-center justify-between border-b border-cinema-border pb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-pink-400" />
                      <h3 className="font-bold text-white text-sm">الأنميات الأكثر تصفحًا وزيارة</h3>
                    </div>
                    <span className="text-xs text-cinema-muted">مرتب حسب الزيارات</span>
                  </div>

                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-right text-xs text-cinema-muted">
                      <thead>
                        <tr className="border-b border-cinema-border/50 text-cinema-muted">
                          <th className="py-2 font-semibold">عنوان الأنمي</th>
                          <th className="py-2 font-semibold text-center">مرات التصفح</th>
                          <th className="py-2 font-semibold text-left">الزوار المهتمين</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cinema-border/30">
                        {analytics?.top_browsed_anime && analytics.top_browsed_anime.length > 0 ? (
                          analytics.top_browsed_anime.map((item, idx) => (
                            <tr key={idx} className="hover:bg-cinema-bg/40">
                              <td className="py-2.5 font-medium text-white max-w-[200px] truncate">
                                {item.title}
                              </td>
                              <td className="py-2.5 text-center font-bold text-pink-400">
                                {item.browse_count}
                              </td>
                              <td className="py-2.5 text-left">{item.unique_browsers}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="py-6 text-center text-cinema-muted">
                              لا توجد بيانات تصفح مسجلة في هذا النطاق
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Visitor Sessions Log */}
              <div className={cardClass}>
                <div className="flex items-center justify-between border-b border-cinema-border pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-400" />
                    <h3 className="font-bold text-white text-sm">
                      سجل جلسات الزوار ووقت بقائهم في الموقع بالدقائق
                    </h3>
                  </div>
                  <span className="text-xs text-cinema-muted">أحدث 20 جلسة</span>
                </div>

                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-right text-xs text-cinema-muted">
                    <thead>
                      <tr className="border-b border-cinema-border/50 text-cinema-muted">
                        <th className="py-2 font-semibold">معرّف الزائر</th>
                        <th className="py-2 font-semibold text-center">مدة فتح الموقع</th>
                        <th className="py-2 font-semibold text-center">الصفحات</th>
                        <th className="py-2 font-semibold text-center">أنميات متصفحة</th>
                        <th className="py-2 font-semibold text-center">أنميات مشاهدة</th>
                        <th className="py-2 font-semibold text-center">دقائق المشاهدة</th>
                        <th className="py-2 font-semibold text-left">آخر تواجد</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cinema-border/30">
                      {analytics?.recent_sessions && analytics.recent_sessions.length > 0 ? (
                        analytics.recent_sessions.map((s, idx) => (
                          <tr key={idx} className="hover:bg-cinema-bg/40">
                            <td className="py-2.5 font-mono text-white/90">{s.visitor_id}...</td>
                            <td className="py-2.5 text-center font-bold text-amber-400">
                              {s.duration_minutes} دقيقة
                            </td>
                            <td className="py-2.5 text-center">{s.page_views}</td>
                            <td className="py-2.5 text-center text-pink-400">{s.anime_browsed}</td>
                            <td className="py-2.5 text-center text-purple-400">{s.anime_played}</td>
                            <td className="py-2.5 text-center">{s.watch_minutes} د</td>
                            <td className="py-2.5 text-left">{formatDate(s.last_seen)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-cinema-muted">
                            لا توجد جلسات مسجلة بعد
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Realtime Live Events Stream */}
              <div className={cardClass}>
                <div className="flex items-center justify-between border-b border-cinema-border pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-400" />
                    <h3 className="font-bold text-white text-sm">
                      سجل الأحداث اللحظية المباشرة في قاعدة البيانات
                    </h3>
                  </div>
                  <span className="text-xs text-cinema-muted">تفاصيل النشاط التلقائي</span>
                </div>

                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-right text-xs text-cinema-muted">
                    <thead>
                      <tr className="border-b border-cinema-border/50 text-cinema-muted">
                        <th className="py-2 font-semibold">التوقيت</th>
                        <th className="py-2 font-semibold">نوع النشاط</th>
                        <th className="py-2 font-semibold">الأنمي / المسار</th>
                        <th className="py-2 font-semibold text-center">رقم الحلقة</th>
                        <th className="py-2 font-semibold text-center">المدة المسجلة</th>
                        <th className="py-2 font-semibold text-left">معرّف الزائر</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cinema-border/30">
                      {analytics?.recent_events && analytics.recent_events.length > 0 ? (
                        analytics.recent_events.map((ev) => (
                          <tr key={ev.id} className="hover:bg-cinema-bg/40">
                            <td className="py-2 font-mono">{formatDate(ev.created_at)}</td>
                            <td className="py-2 font-medium text-white">
                              {formatEventType(ev.event_type)}
                            </td>
                            <td className="py-2 max-w-[220px] truncate text-cinema-muted hover:text-white">
                              {ev.anime_title || ev.path}
                            </td>
                            <td className="py-2 text-center">
                              {ev.episode_number ? `الحلقة ${ev.episode_number}` : "-"}
                            </td>
                            <td className="py-2 text-center">
                              {ev.duration_seconds > 0 ? `${ev.duration_seconds} ث` : "-"}
                            </td>
                            <td className="py-2 font-mono text-left">{ev.visitor_id}...</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-cinema-muted">
                            لا توجد أحداث مباشرة بعد
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Change Credentials */}
          {activeTab === "credentials" && (
            <div className="mx-auto max-w-xl">
              <form onSubmit={handleChangeCredentials} className={cardClass}>
                <div className="flex items-center gap-3 border-b border-cinema-border pb-4 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cinema-accent/20 text-cinema-accent">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">تغيير بيانات الدخول للداش بورد</h2>
                    <p className="text-xs text-cinema-muted">
                      تعديل اسم المستخدم وكلمة المرور المشفرة للوحة التحكم
                    </p>
                  </div>
                </div>

                {credMessage && (
                  <div
                    className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm ${
                      credMessage.type === "success"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-red-500/30 bg-red-500/10 text-red-400"
                    }`}
                  >
                    {credMessage.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{credMessage.text}</span>
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <div className="rounded-xl border border-cinema-border/60 bg-cinema-bg/40 p-3 text-xs text-cinema-muted">
                    اسم المشرف الحالي النشط:{" "}
                    <strong className="text-white font-mono">{currentUsername}</strong>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-cinema-muted">
                      اسم المستخدم الجديد (اتركه فارغًا إذا كنت لا تريد تغييره)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="اسم المستخدم الجديد (مثال: admin)"
                        className={inputClass}
                        autoComplete="off"
                      />
                      <User className="absolute left-3 top-3 h-4 w-4 text-cinema-muted pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-cinema-muted">
                      كلمة المرور الحالية (مطلوبة لتأكيد هويتك)
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور الحالية"
                        className={inputClass}
                        required
                        autoComplete="current-password"
                      />
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-cinema-muted pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-cinema-muted">
                      كلمة المرور الجديدة (اتركها فارغة إذا أردت تغيير الاسم فقط)
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور الجديدة (6 أحرف فأكثر)"
                        className={inputClass}
                        autoComplete="new-password"
                      />
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-cinema-muted pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-cinema-muted">
                      تأكيد كلمة المرور الجديدة
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="أعد إدخال كلمة المرور الجديدة"
                        className={inputClass}
                        autoComplete="new-password"
                      />
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-cinema-muted pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={credLoading}
                    className={`w-full ${primaryButtonClass}`}
                  >
                    {credLoading ? "جاري الحفظ..." : "حفظ بيانات الدخول الجديدة"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: System Status */}
          {activeTab === "system" && (
            <div className="mx-auto max-w-xl space-y-4">
              <div className={cardClass}>
                <div className="flex items-center gap-3 border-b border-cinema-border pb-4 text-white">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-lg font-bold">حالة النظام والحماية</h2>
                </div>
                <div className="space-y-3 pt-2 text-sm text-cinema-muted">
                  <div className="flex justify-between border-b border-cinema-border/40 pb-2">
                    <span>حالة الخادم الخلفي:</span>
                    <span className="font-semibold text-emerald-400">متصل ويعمل بكفاءة</span>
                  </div>
                  <div className="flex justify-between border-b border-cinema-border/40 pb-2">
                    <span>حساب المشرف النشط:</span>
                    <span className="font-mono text-white">{currentUsername}</span>
                  </div>
                  <div className="flex justify-between border-b border-cinema-border/40 pb-2">
                    <span>تشفير كلمات المرور:</span>
                    <span className="font-mono text-white">PBKDF2-HMAC-SHA256 مع Salt فريد</span>
                  </div>
                  <div className="flex justify-between border-b border-cinema-border/40 pb-2">
                    <span>حماية الجلسات:</span>
                    <span className="text-white">HttpOnly Secure SameSite Cookie</span>
                  </div>
                  <div className="flex justify-between">
                    <span>حماية التخمين (Rate Limiting):</span>
                    <span className="text-emerald-400">نشطة (حد أقصى 5 محاولات في الدقيقة)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
