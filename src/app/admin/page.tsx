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
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Film,
  Filter,
  Flag,
  Globe,
  Inbox,
  KeyRound,
  Link as LinkIcon,
  Lock,
  LogOut,
  MessageSquare,
  Monitor,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  ThumbsUp,
  Trash2,
  Tv,
  User,
  UserCheck,
  Users,
  Video,
  X,
} from "lucide-react";
import { getVisitorId, setAdminFlag } from "@/lib/analytics";

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

interface InteractedAnimeItem {
  anime_id: number | null;
  title: string;
  episodes: number[];
  watch_minutes: number;
  plays: number;
  browses: number;
  last_seen?: string;
}

interface ActionTimelineItem {
  id: number;
  event_type: string;
  action_text: string;
  path: string;
  anime_title: string | null;
  episode_number: number | null;
  duration_seconds: number;
  duration_minutes?: number | null;
  created_at: string;
}

interface VisitorSessionItem {
  visitor_id: string;
  display_id: string;
  first_seen: string;
  last_seen: string;
  is_active: boolean;
  duration_minutes: number;
  watch_minutes: number;
  browse_minutes: number;
  page_views: number;
  anime_browsed: number;
  anime_played: number;
  last_path: string;
  device: string;
  primary_anime: string | null;
  animes_list: InteractedAnimeItem[];
  actions_summary: string;
  recent_actions: ActionTimelineItem[];
}

interface RecentEventItem {
  id: number;
  visitor_id: string;
  display_id: string;
  event_type: string;
  action_text: string;
  path: string;
  anime_title: string | null;
  episode_number: number | null;
  duration_seconds: number;
  duration_minutes: number | null;
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
  const [activeTab, setActiveTab] = useState<"anime" | "analytics" | "reports" | "credentials" | "system">("anime");

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

  // Analytics data & filtering state
  const [periodDays, setPeriodDays] = useState<number>(7);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [selectedVisitorDetail, setSelectedVisitorDetail] = useState<VisitorSessionItem | null>(null);
  const [loadingVisitorDetail, setLoadingVisitorDetail] = useState(false);
  const [visitorDeepDetail, setVisitorDeepDetail] = useState<any | null>(null);
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState<"all" | "active" | "watching">("all");
  const [eventsFilter, setEventsFilter] = useState<"all" | "play" | "browse" | "search" | "page">("all");
  const [cleaningAdmin, setCleaningAdmin] = useState(false);
  const [cleanNotice, setCleanNotice] = useState<string | null>(null);

  // Reports & Comments state
  const [reportsSubTab, setReportsSubTab] = useState<"reports" | "comments">("reports");
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportCategoryFilter, setReportCategoryFilter] = useState<string>("all");
  const [reportStatusFilter, setReportStatusFilter] = useState<string>("all");
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [reportActionNotice, setReportActionNotice] = useState<string | null>(null);

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
      loadReports();
      loadAdminComments();

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
        setAdminFlag(true);
      } else {
        setAuthenticated(false);
        setAdminFlag(false);
      }
    } catch {
      setAuthenticated(false);
      setAdminFlag(false);
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (loginLoading || loginCooldown > 0) return;
    setLoginLoading(true);
    setLoginError(null);
    try {
      const vid = getVisitorId();
      const data = await adminRequest<{ status: string; username: string }>("/login", "POST", {
        username: loginUsername.trim(),
        password: loginPassword,
        visitor_id: vid,
      });
      if (data && data.status === "authenticated") {
        setCurrentUsername(data.username);
        setAuthenticated(true);
        setAdminFlag(true);
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
      setAdminFlag(false);
      setCurrentUsername("");
      setAnalytics(null);
    }
  }

  async function handleCleanAdminSessions() {
    setCleaningAdmin(true);
    setCleanNotice(null);
    try {
      const res = await adminRequest<{ status: string; deleted_sessions: number }>("/analytics/cleanup-admin", "POST");
      setCleanNotice(`تم تطهير ${res?.deleted_sessions || 0} جلسة خاصة بتجارب المشرفين بنجاح`);
      await loadAnalytics(periodDays);
    } catch (err) {
      setCleanNotice(err instanceof Error ? err.message : "تعذر تطهير سجلات المشرفين");
    } finally {
      setCleaningAdmin(false);
    }
  }

  async function handleOpenVisitorDetail(session: VisitorSessionItem) {
    setSelectedVisitorDetail(session);
    setLoadingVisitorDetail(true);
    setVisitorDeepDetail(null);
    try {
      const data = await adminRequest<any>(`/analytics/visitor/${session.visitor_id}`);
      if (data) {
        setVisitorDeepDetail(data);
      } else {
        setVisitorDeepDetail(session);
      }
    } catch {
      setVisitorDeepDetail(session);
    } finally {
      setLoadingVisitorDetail(false);
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

  async function loadReports() {
    setReportsLoading(true);
    try {
      const data = await adminRequest<any>("/reports");
      if (data && Array.isArray(data.items)) {
        setReportsList(data.items);
      } else if (Array.isArray(data)) {
        setReportsList(data);
      }
    } catch {
      // Handled silently
    } finally {
      setReportsLoading(false);
    }
  }

  async function handleUpdateReportStatus(reportId: number, status: string, notes?: string) {
    try {
      await adminRequest(`/reports/${reportId}`, "PATCH", { status, admin_notes: notes });
      setReportActionNotice("تم تحديث حالة البلاغ بنجاح");
      setTimeout(() => setReportActionNotice(null), 3000);
      loadReports();
    } catch (err) {
      setReportActionNotice(err instanceof Error ? err.message : "فشل تحديث البلاغ");
    }
  }

  async function handleDeleteReport(reportId: number) {
    if (!confirm("هل أنت متأكد من حذف هذا البلاغ نهائياً؟")) return;
    try {
      await adminRequest(`/reports/${reportId}`, "DELETE");
      setReportActionNotice("تم حذف البلاغ بنجاح");
      setTimeout(() => setReportActionNotice(null), 3000);
      loadReports();
    } catch (err) {
      setReportActionNotice(err instanceof Error ? err.message : "فشل حذف البلاغ");
    }
  }

  async function loadAdminComments() {
    setCommentsLoading(true);
    try {
      const data = await adminRequest<any>("/comments");
      if (data && Array.isArray(data.items)) {
        setCommentsList(data.items);
      } else if (Array.isArray(data)) {
        setCommentsList(data);
      }
    } catch {
      // Handled silently
    } finally {
      setCommentsLoading(false);
    }
  }

  async function handleDeleteAdminComment(commentId: number) {
    if (!confirm("هل تريد حذف هذا التعليق نهائياً؟")) return;
    try {
      await adminRequest(`/comments/${commentId}`, "DELETE");
      setReportActionNotice("تم حذف التعليق بنجاح");
      setTimeout(() => setReportActionNotice(null), 3000);
      loadAdminComments();
    } catch (err) {
      setReportActionNotice(err instanceof Error ? err.message : "فشل حذف التعليق");
    }
  }

  async function handleToggleAdminCommentApproval(commentId: number) {
    try {
      await adminRequest(`/comments/${commentId}/toggle-approval`, "PATCH");
      loadAdminComments();
    } catch (err) {
      setReportActionNotice(err instanceof Error ? err.message : "فشل تعديل حالة التعليق");
    }
  }

  const formatEventType = (type: string) => {
    switch (type) {
      case "browse_anime":
        return "تصفح أنمي";
      case "play_anime":
        return "مشاهدة حلقة";
      case "search":
        return "بحث في الموقع";
      case "page_view":
        return "زيارة صفحة";
      case "heartbeat":
        return "نشاط مستمر";
      default:
        return type;
    }
  };

  const formatTimeAgo = (isoStr: string) => {
    if (!isoStr) return "-";
    try {
      const now = Date.now();
      const past = new Date(isoStr).getTime();
      const diffSec = Math.max(0, Math.floor((now - past) / 1000));
      if (diffSec < 60) return "الآن";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      const diffDays = Math.floor(diffHours / 24);
      return `منذ ${diffDays} يوم`;
    } catch {
      return isoStr;
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
              onClick={() => {
                setActiveTab("reports");
                loadReports();
                loadAdminComments();
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                activeTab === "reports"
                  ? "bg-cinema-accent text-white"
                  : "border border-cinema-border bg-cinema-card text-cinema-muted hover:text-white"
              }`}
            >
              <Inbox className="h-4 w-4" />
              البلاغات والطلبات والتعليقات
              {reportsList.filter((r) => r.status === "pending").length > 0 && (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300">
                  {reportsList.filter((r) => r.status === "pending").length}
                </span>
              )}
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
                <div className="flex flex-wrap items-center gap-3">
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

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    استبعاد زيارات السوبر أدمن مفعل تلقائيًا
                  </span>

                  <button
                    onClick={handleCleanAdminSessions}
                    disabled={cleaningAdmin}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-cinema-border bg-cinema-bg px-3 py-1.5 text-xs font-semibold text-cinema-muted hover:text-white transition disabled:opacity-50"
                    title="حذف أي جلسات تجريبية سابقة تخص المشرف لتنظيف الإحصائيات"
                  >
                    <Trash2 className={`h-3.5 w-3.5 ${cleaningAdmin ? "animate-spin" : ""}`} />
                    تطهير زيارات الأدمن السابقة
                  </button>

                  <button
                    onClick={() => loadAnalytics(periodDays)}
                    disabled={analyticsLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-cinema-accent px-3 py-1.5 text-xs font-bold text-white hover:brightness-110 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${analyticsLoading ? "animate-spin" : ""}`} />
                    تحديث لحظي
                  </button>
                </div>
              </div>

              {cleanNotice && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{cleanNotice}</span>
                </div>
              )}

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
                    <span className="text-xs font-semibold text-cinema-muted">إجمالي الزوار الفعليين</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3 text-3xl font-black text-white">
                    {analytics?.overview.total_visitors.toLocaleString() ?? "-"}
                  </div>
                  <p className="mt-1 text-xs text-cinema-muted">الجلسات الحقيقية (باستثناء المشرفين)</p>
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
                    متوسط مدة الزائر: {analytics?.overview.avg_duration_minutes ?? "-"} دقيقة
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
                        إجمالي وقت الاستماع والمشاهدة الفعلي
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
                    الوقت الحقيقي المسجل داخل مشغّل الفيديو أثناء تشغيل الحلقات
                  </p>
                </div>
              </div>

              {/* SECTION: Visitor Sessions & Behavior Explorer */}
              <div className={cardClass}>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cinema-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-emerald-400" />
                      <h3 className="font-bold text-white text-base">
                        متابعة زوار المنصة وسجل نشاط كل زائر
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-cinema-muted">
                      تعرف على الأنمي الذي فتحه الزائر، ما قام به بالتفصيل، ومدة بقائه في الموقع بالدقائق
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="absolute right-3 top-2.5 h-4 w-4 text-cinema-muted" />
                      <input
                        type="text"
                        value={sessionSearch}
                        onChange={(e) => setSessionSearch(e.target.value)}
                        placeholder="ابحث برقم الزائر أو اسم الأنمي..."
                        className="rounded-xl border border-cinema-border bg-cinema-bg pr-9 pl-3 py-1.5 text-xs text-white placeholder-cinema-muted focus:outline-none focus:ring-1 focus:ring-cinema-accent w-56"
                      />
                    </div>

                    <div className="flex items-center rounded-xl border border-cinema-border bg-cinema-bg p-1 text-xs">
                      <button
                        onClick={() => setSessionFilter("all")}
                        className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                          sessionFilter === "all" ? "bg-cinema-accent text-white" : "text-cinema-muted hover:text-white"
                        }`}
                      >
                        الكل ({analytics?.recent_sessions.length || 0})
                      </button>
                      <button
                        onClick={() => setSessionFilter("active")}
                        className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                          sessionFilter === "active" ? "bg-cinema-accent text-white" : "text-cinema-muted hover:text-white"
                        }`}
                      >
                        المتواجدون الآن ({analytics?.recent_sessions.filter((s) => s.is_active).length || 0})
                      </button>
                      <button
                        onClick={() => setSessionFilter("watching")}
                        className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                          sessionFilter === "watching" ? "bg-cinema-accent text-white" : "text-cinema-muted hover:text-white"
                        }`}
                      >
                        شاهدوا فيديو ({analytics?.recent_sessions.filter((s) => s.watch_minutes > 0).length || 0})
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-right text-xs text-cinema-muted">
                    <thead>
                      <tr className="border-b border-cinema-border/50 text-cinema-muted">
                        <th className="py-2.5 font-semibold">الزائر والحالة</th>
                        <th className="py-2.5 font-semibold">الأنميات التي فتحها / شاهدها</th>
                        <th className="py-2.5 font-semibold">ماذا فعل الزائر؟</th>
                        <th className="py-2.5 font-semibold text-center">وقت البقاء بالموقع</th>
                        <th className="py-2.5 font-semibold text-left">آخر تواجد</th>
                        <th className="py-2.5 font-semibold text-center">تفاصيل الرحلة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cinema-border/30">
                      {analytics?.recent_sessions && analytics.recent_sessions.length > 0 ? (
                        analytics.recent_sessions
                          .filter((s) => {
                            if (sessionFilter === "active" && !s.is_active) return false;
                            if (sessionFilter === "watching" && s.watch_minutes <= 0) return false;
                            if (sessionSearch.trim()) {
                              const q = sessionSearch.trim().toLowerCase();
                              const matchId = s.display_id.toLowerCase().includes(q) || s.visitor_id.toLowerCase().includes(q);
                              const matchSummary = s.actions_summary.toLowerCase().includes(q);
                              const matchAnime = s.animes_list.some((a) => a.title.toLowerCase().includes(q));
                              return matchId || matchSummary || matchAnime;
                            }
                            return true;
                          })
                          .map((s, idx) => (
                            <tr key={idx} className="hover:bg-cinema-bg/40 transition">
                              <td className="py-3 font-medium text-white">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">{s.display_id}</span>
                                  {s.is_active ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                                      نشط الآن
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-cinema-muted">
                                      {formatTimeAgo(s.last_seen)}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1 flex items-center gap-1 text-[11px] text-cinema-muted">
                                  <Globe className="h-3 w-3 shrink-0" />
                                  <span className="truncate max-w-[140px]">{s.device}</span>
                                </div>
                              </td>

                              <td className="py-3">
                                {s.animes_list && s.animes_list.length > 0 ? (
                                  <div className="flex flex-wrap items-center gap-1.5 max-w-[260px]">
                                    {s.animes_list.slice(0, 2).map((anime, aIdx) => (
                                      <span
                                        key={aIdx}
                                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium ${
                                          anime.watch_minutes > 0
                                            ? "border border-purple-500/30 bg-purple-500/10 text-purple-300"
                                            : "border border-pink-500/30 bg-pink-500/10 text-pink-300"
                                        }`}
                                      >
                                        {anime.watch_minutes > 0 ? (
                                          <PlayCircle className="h-3 w-3 text-purple-400 shrink-0" />
                                        ) : (
                                          <Eye className="h-3 w-3 text-pink-400 shrink-0" />
                                        )}
                                        <span className="truncate max-w-[160px]">{anime.title}</span>
                                        {anime.episodes.length > 0 && (
                                          <span className="text-[10px] text-cinema-muted">
                                            (حلقة {anime.episodes.join("، ")})
                                          </span>
                                        )}
                                      </span>
                                    ))}
                                    {s.animes_list.length > 2 && (
                                      <span className="rounded-lg bg-cinema-bg px-1.5 py-0.5 text-[10px] text-cinema-muted">
                                        +{s.animes_list.length - 2} أعمال أخرى
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-cinema-muted italic">تصفح عام للموقع</span>
                                )}
                              </td>

                              <td className="py-3 max-w-[280px]">
                                <p className="text-xs text-cinema-muted line-clamp-2 leading-relaxed">
                                  {s.actions_summary}
                                </p>
                              </td>

                              <td className="py-3 text-center">
                                <div className="font-bold text-amber-400 text-sm">
                                  {s.duration_minutes} دقيقة
                                </div>
                                {s.watch_minutes > 0 && (
                                  <div className="mt-0.5 text-[11px] text-purple-400 font-medium">
                                    منها {s.watch_minutes} د مشاهدة
                                  </div>
                                )}
                              </td>

                              <td className="py-3 text-left">
                                <div className="text-white text-xs">{formatDate(s.last_seen)}</div>
                                <div className="text-[10px] text-cinema-muted">{s.page_views} صفحات</div>
                              </td>

                              <td className="py-3 text-center">
                                <button
                                  onClick={() => handleOpenVisitorDetail(s)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-cinema-border bg-cinema-bg px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-cinema-accent hover:border-cinema-accent transition"
                                >
                                  <span>تفاصيل الرحلة</span>
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-cinema-muted">
                            لا توجد جلسات مسجلة في هذا النطاق
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tables Grid: Top Watched & Browsed */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Top Watched Anime */}
                <div className={cardClass}>
                  <div className="flex items-center justify-between border-b border-cinema-border pb-3">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4 text-cinema-accent" />
                      <h3 className="font-bold text-white text-sm">الأنميات الأكثر سماعًا ومشاهدة</h3>
                    </div>
                    <span className="text-xs text-cinema-muted">مرتب حسب مرات التشغيل</span>
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

              {/* SECTION: Clean Live Events Stream */}
              <div className={cardClass}>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cinema-border pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-cyan-400" />
                      <h3 className="font-bold text-white text-sm">
                        سجل الأحداث المباشرة الفعلي (تم استبعاد النبضات الروتينية heartbeat)
                      </h3>
                    </div>
                    <p className="mt-0.5 text-xs text-cinema-muted">
                      تدفق الأنشطة الحقيقية المنفذة من الزوار فقط
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {[
                      { key: "all", label: "كل الأنشطة" },
                      { key: "play", label: "مشاهدة فيديو" },
                      { key: "browse", label: "تصفح أنمي" },
                      { key: "search", label: "بحث" },
                      { key: "page", label: "زيارات الصفحات" },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setEventsFilter(f.key as any)}
                        className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                          eventsFilter === f.key
                            ? "bg-cinema-accent text-white"
                            : "border border-cinema-border bg-cinema-bg text-cinema-muted hover:text-white"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-right text-xs text-cinema-muted">
                    <thead>
                      <tr className="border-b border-cinema-border/50 text-cinema-muted">
                        <th className="py-2 font-semibold">التوقيت</th>
                        <th className="py-2 font-semibold">نوع النشاط</th>
                        <th className="py-2 font-semibold">تفاصيل الحدث / الأنمي</th>
                        <th className="py-2 font-semibold text-center">رقم الحلقة</th>
                        <th className="py-2 font-semibold text-center">المدة المسجلة</th>
                        <th className="py-2 font-semibold text-left">الزائر</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cinema-border/30">
                      {analytics?.recent_events && analytics.recent_events.length > 0 ? (
                        analytics.recent_events
                          .filter((ev) => {
                            if (eventsFilter === "play") return ev.event_type === "play_anime";
                            if (eventsFilter === "browse") return ev.event_type === "browse_anime";
                            if (eventsFilter === "search") return ev.event_type === "search";
                            if (eventsFilter === "page") return ev.event_type === "page_view";
                            return true;
                          })
                          .map((ev) => (
                            <tr key={ev.id} className="hover:bg-cinema-bg/40">
                              <td className="py-2 font-mono text-cinema-muted">{formatDate(ev.created_at)}</td>
                              <td className="py-2">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                                    ev.event_type === "play_anime"
                                      ? "bg-purple-500/20 text-purple-300"
                                      : ev.event_type === "browse_anime"
                                      ? "bg-pink-500/20 text-pink-300"
                                      : ev.event_type === "search"
                                      ? "bg-amber-500/20 text-amber-300"
                                      : "bg-blue-500/20 text-blue-300"
                                  }`}
                                >
                                  {formatEventType(ev.event_type)}
                                </span>
                              </td>
                              <td className="py-2 font-medium text-white max-w-[280px] truncate">
                                {ev.action_text || ev.anime_title || ev.path}
                              </td>
                              <td className="py-2 text-center">
                                {ev.episode_number ? (
                                  <span className="rounded bg-cinema-bg px-1.5 py-0.5 font-bold text-cinema-accent">
                                    الحلقة {ev.episode_number}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="py-2 text-center">
                                {ev.duration_seconds > 0 ? (
                                  <span className="font-semibold text-amber-400">
                                    {ev.duration_minutes ? `${ev.duration_minutes} د` : `${ev.duration_seconds} ث`}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="py-2 font-mono text-left text-white">{ev.display_id}</td>
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

              {/* MODAL: Visitor Deep Journey Inspector */}
              {selectedVisitorDetail && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
                  onClick={() => setSelectedVisitorDetail(null)}
                >
                  <div
                    className="w-full max-w-3xl rounded-2xl border border-cinema-border bg-cinema-card p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-cinema-border pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-white">
                            ملف رحلة الزائر: {selectedVisitorDetail.display_id}
                          </h3>
                          {selectedVisitorDetail.is_active ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                              نشط الآن في الموقع
                            </span>
                          ) : (
                            <span className="rounded-full bg-cinema-bg px-2.5 py-0.5 text-xs text-cinema-muted">
                              آخر ظهور: {formatTimeAgo(selectedVisitorDetail.last_seen)}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs font-mono text-cinema-muted">
                          معرّف الجلسة: {selectedVisitorDetail.visitor_id}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedVisitorDetail(null)}
                        className="rounded-lg border border-cinema-border bg-cinema-bg p-1.5 text-cinema-muted hover:text-white transition"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Stats Highlights */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-xl border border-cinema-border/60 bg-cinema-bg/40 p-3">
                        <span className="text-[11px] text-cinema-muted">إجمالي وقت فتح الموقع</span>
                        <div className="mt-1 text-xl font-black text-amber-400">
                          {selectedVisitorDetail.duration_minutes} دقيقة
                        </div>
                      </div>

                      <div className="rounded-xl border border-cinema-border/60 bg-cinema-bg/40 p-3">
                        <span className="text-[11px] text-cinema-muted">وقت مشاهدة الفيديو</span>
                        <div className="mt-1 text-xl font-black text-purple-400">
                          {selectedVisitorDetail.watch_minutes} دقيقة
                        </div>
                      </div>

                      <div className="rounded-xl border border-cinema-border/60 bg-cinema-bg/40 p-3">
                        <span className="text-[11px] text-cinema-muted">وقت التصفح</span>
                        <div className="mt-1 text-xl font-black text-pink-400">
                          {selectedVisitorDetail.browse_minutes} دقيقة
                        </div>
                      </div>

                      <div className="rounded-xl border border-cinema-border/60 bg-cinema-bg/40 p-3">
                        <span className="text-[11px] text-cinema-muted">الصفحات المزارة</span>
                        <div className="mt-1 text-xl font-black text-white">
                          {selectedVisitorDetail.page_views}
                        </div>
                      </div>
                    </div>

                    {/* Device info */}
                    <div className="rounded-xl border border-cinema-border/50 bg-cinema-bg/30 px-3.5 py-2 text-xs text-cinema-muted flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-cinema-accent" />
                        <span>جهاز الزائر:</span>
                        <strong className="text-white font-medium">{selectedVisitorDetail.device}</strong>
                      </div>
                      <div className="text-[11px]">
                        أول ظهور: {formatDate(selectedVisitorDetail.first_seen)}
                      </div>
                    </div>

                    {/* SECTION: Animes Opened & Watched */}
                    <div>
                      <div className="flex items-center gap-2 border-b border-cinema-border pb-2 mb-3">
                        <Tv className="h-4 w-4 text-cinema-accent" />
                        <h4 className="font-bold text-white text-sm">
                          الأنميات والأعمال التي فتحها وشاهدها هذا الزائر
                        </h4>
                      </div>

                      {((visitorDeepDetail?.animes || selectedVisitorDetail.animes_list) &&
                        (visitorDeepDetail?.animes || selectedVisitorDetail.animes_list).length > 0) ? (
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          {(visitorDeepDetail?.animes || selectedVisitorDetail.animes_list).map(
                            (anime: any, aIdx: number) => (
                              <div
                                key={aIdx}
                                className="rounded-xl border border-cinema-border bg-cinema-bg/60 p-3.5 space-y-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <h5 className="font-bold text-white text-sm line-clamp-1">
                                    {anime.title}
                                  </h5>
                                  {anime.anime_id && (
                                    <a
                                      href={`/series/${anime.anime_id}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-cinema-muted hover:text-white"
                                      title="فتح صفحة العمل"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  {anime.watch_minutes > 0 ? (
                                    <span className="inline-flex items-center gap-1 rounded bg-purple-500/20 px-2 py-0.5 font-bold text-purple-300">
                                      <PlayCircle className="h-3 w-3" />
                                      {anime.watch_minutes} دقيقة مشاهدة
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded bg-pink-500/20 px-2 py-0.5 font-bold text-pink-300">
                                      <Eye className="h-3 w-3" />
                                      تصفح فقط
                                    </span>
                                  )}

                                  {anime.episodes && anime.episodes.length > 0 && (
                                    <span className="rounded bg-cinema-card px-2 py-0.5 text-cinema-muted border border-cinema-border/50">
                                      الحلقات: {anime.episodes.join("، ")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-cinema-muted italic py-3">
                          لم يقم هذا الزائر بفتح صفحات أنمي مخصصة حتى الآن (تصفح عام في الرئيسية أو الأقسام).
                        </p>
                      )}
                    </div>

                    {/* SECTION: Step-by-Step Timeline */}
                    <div>
                      <div className="flex items-center gap-2 border-b border-cinema-border pb-2 mb-3">
                        <Activity className="h-4 w-4 text-cyan-400" />
                        <h4 className="font-bold text-white text-sm">
                          الخط الزمني لرحلة الزائر خطوة بخطوة
                        </h4>
                      </div>

                      {loadingVisitorDetail ? (
                        <div className="py-6 text-center text-cinema-muted text-xs flex items-center justify-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin text-cinema-accent" />
                          <span>جاري تحميل تفاصيل خطوات الزائر...</span>
                        </div>
                      ) : (visitorDeepDetail?.timeline && visitorDeepDetail.timeline.length > 0) ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {visitorDeepDetail.timeline.map((step: any, sIdx: number) => (
                            <div
                              key={sIdx}
                              className="flex items-center justify-between gap-3 rounded-lg border border-cinema-border/40 bg-cinema-bg/40 px-3 py-2 text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                    step.event_type === "play_anime"
                                      ? "bg-purple-500/20 text-purple-300"
                                      : step.event_type === "browse_anime"
                                      ? "bg-pink-500/20 text-pink-300"
                                      : step.event_type === "search"
                                      ? "bg-amber-500/20 text-amber-300"
                                      : "bg-blue-500/20 text-blue-300"
                                  }`}
                                >
                                  {formatEventType(step.event_type)}
                                </span>
                                <span className="font-medium text-white">{step.action_text}</span>
                              </div>

                              <div className="flex items-center gap-2 text-cinema-muted font-mono text-[11px] shrink-0">
                                {step.duration_seconds > 0 && (
                                  <span className="text-amber-400 font-sans">
                                    {Math.round(step.duration_seconds / 60)} د
                                  </span>
                                )}
                                <span>{formatDate(step.created_at)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-cinema-muted italic py-3">
                          لا توجد خطوات مفصلة إضافية مسجلة لهذه الجلسة.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Reports & Comments Management */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              {reportActionNotice && (
                <div className="flex items-center gap-2 rounded-xl border border-cinema-accent/30 bg-cinema-accent/10 px-4 py-3 text-sm text-cinema-accent">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{reportActionNotice}</span>
                </div>
              )}

              {/* Sub-tabs header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 rounded-xl border border-cinema-border bg-cinema-card p-1">
                  <button
                    onClick={() => setReportsSubTab("reports")}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                      reportsSubTab === "reports"
                        ? "bg-cinema-accent text-white"
                        : "text-cinema-muted hover:text-white"
                    }`}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    البلاغات والشكاوى والطلبات
                    <span className="rounded-full bg-cinema-bg px-2 py-0.5 text-[10px] text-white">
                      {reportsList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setReportsSubTab("comments")}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                      reportsSubTab === "comments"
                        ? "bg-cinema-accent text-white"
                        : "text-cinema-muted hover:text-white"
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    تعليقات الحلقات
                    <span className="rounded-full bg-cinema-bg px-2 py-0.5 text-[10px] text-white">
                      {commentsList.length}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (reportsSubTab === "reports") loadReports();
                      else loadAdminComments();
                    }}
                    disabled={reportsLoading || commentsLoading}
                    className="inline-flex items-center gap-2 rounded-xl border border-cinema-border bg-cinema-card px-3.5 py-2 text-xs text-cinema-muted transition hover:text-white disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${reportsLoading || commentsLoading ? "animate-spin" : ""}`} />
                    تحديث القائمة
                  </button>
                </div>
              </div>

              {/* SUB-TAB: Reports */}
              {reportsSubTab === "reports" && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-cinema-border bg-cinema-card/50 p-3">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-cinema-muted" />
                      <span className="text-xs font-bold text-white">تصفية حسب:</span>
                    </div>

                    <select
                      value={reportCategoryFilter}
                      onChange={(e) => setReportCategoryFilter(e.target.value)}
                      className="rounded-lg border border-cinema-border bg-cinema-bg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cinema-accent"
                    >
                      <option value="all">كل التصنيفات</option>
                      <option value="site_issue">مشكلة أو خلل بالموقع</option>
                      <option value="anime_request">طلب إضافة أنمي</option>
                      <option value="broken_episode">حلقة تالفة أو ناقصة</option>
                      <option value="other">أخرى</option>
                    </select>

                    <select
                      value={reportStatusFilter}
                      onChange={(e) => setReportStatusFilter(e.target.value)}
                      className="rounded-lg border border-cinema-border bg-cinema-bg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cinema-accent"
                    >
                      <option value="all">كل الحالات</option>
                      <option value="pending">قيد الانتظار</option>
                      <option value="in_progress">جاري المتابعة</option>
                      <option value="resolved">تم الحل</option>
                      <option value="dismissed">تم التجاهل</option>
                    </select>
                  </div>

                  {/* Reports Cards */}
                  {reportsLoading ? (
                    <div className="flex items-center justify-center py-12 text-cinema-muted">
                      <RefreshCw className="h-6 w-6 animate-spin text-cinema-accent" />
                      <span className="mr-3 text-sm">جاري تحميل البلاغات...</span>
                    </div>
                  ) : reportsList.filter((r) => {
                      const matchCat = reportCategoryFilter === "all" || r.category === reportCategoryFilter;
                      const matchStatus = reportStatusFilter === "all" || r.status === reportStatusFilter;
                      return matchCat && matchStatus;
                    }).length === 0 ? (
                    <div className="rounded-2xl border border-cinema-border bg-cinema-card p-12 text-center">
                      <Inbox className="mx-auto h-12 w-12 text-cinema-muted/50" />
                      <h3 className="mt-3 text-base font-bold text-white">لا توجد بلاغات تطابق الفلتر المحدد</h3>
                      <p className="mt-1 text-xs text-cinema-muted">
                        سيظهر هنا أي بلاغ فني أو طلب أنمي يرسله زوار الموقع.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reportsList
                        .filter((r) => {
                          const matchCat = reportCategoryFilter === "all" || r.category === reportCategoryFilter;
                          const matchStatus = reportStatusFilter === "all" || r.status === reportStatusFilter;
                          return matchCat && matchStatus;
                        })
                        .map((report) => (
                          <div
                            key={report.id}
                            className="rounded-2xl border border-cinema-border bg-cinema-card p-5 space-y-3 transition hover:border-cinema-border/80"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cinema-border/40 pb-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-lg px-2.5 py-1 text-xs font-bold border ${
                                    report.category === "broken_episode"
                                      ? "border-red-500/30 bg-red-500/10 text-red-300"
                                      : report.category === "anime_request"
                                      ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
                                      : report.category === "site_issue"
                                      ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                      : "border-purple-500/30 bg-purple-500/10 text-purple-300"
                                  }`}
                                >
                                  {report.category === "broken_episode"
                                    ? "حلقة تالفة أو ناقصة"
                                    : report.category === "anime_request"
                                    ? "طلب أنمي جديد"
                                    : report.category === "site_issue"
                                    ? "مشكلة في الموقع"
                                    : "أخرى"}
                                </span>

                                <span
                                  className={`rounded-lg px-2.5 py-1 text-xs font-bold border ${
                                    report.status === "pending"
                                      ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                      : report.status === "in_progress"
                                      ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                                      : report.status === "resolved"
                                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                      : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
                                  }`}
                                >
                                  {report.status === "pending"
                                    ? "قيد الانتظار"
                                    : report.status === "in_progress"
                                    ? "جاري المتابعة"
                                    : report.status === "resolved"
                                    ? "تم الحل"
                                    : "تم التجاهل"}
                                </span>

                                {report.priority && (
                                  <span className="text-[11px] text-cinema-muted">
                                    الأولوية: {report.priority}
                                  </span>
                                )}
                              </div>

                              <span className="text-xs text-cinema-muted">
                                {formatTimeAgo(report.created_at)} ({formatDate(report.created_at)})
                              </span>
                            </div>

                            <div>
                              <h4 className="text-base font-bold text-white">{report.title}</h4>
                              <p className="mt-1 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                {report.details || report.description}
                              </p>
                            </div>

                            {(report.anime_title || report.anime_id) && (
                              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-cinema-border/40 bg-cinema-bg/60 px-3 py-2 text-xs">
                                <Film className="h-3.5 w-3.5 text-cinema-accent shrink-0" />
                                <span className="text-cinema-muted">الأنمي المستهدف:</span>
                                <span className="font-bold text-white">{report.anime_title || `أنمي #${report.anime_id}`}</span>
                                {report.episode_number && (
                                  <span className="text-cinema-muted">
                                    - الحلقة: <strong className="text-white">{report.episode_number}</strong>
                                  </span>
                                )}
                                {report.anime_id && (
                                  <a
                                    href={`/watch/${report.anime_id}${report.episode_number ? `?ep=${report.episode_number}` : ""}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mr-auto inline-flex items-center gap-1 text-cinema-accent hover:underline"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    فتح الحلقة للمعاينة
                                  </a>
                                )}
                              </div>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-cinema-border/30">
                              <div className="flex flex-wrap items-center gap-3 text-xs text-cinema-muted">
                                {(report.contact_email || report.reporter_email) && (
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3 text-cinema-accent" />
                                    البريد: <strong className="text-white">{report.contact_email || report.reporter_email}</strong>
                                  </span>
                                )}
                                <span className="font-mono text-[11px]">
                                  معرف الزائر: {(report.visitor_id || report.reporter_visitor_id) ? (report.visitor_id || report.reporter_visitor_id).slice(0, 12) + "..." : "غير معروف"}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => handleUpdateReportStatus(report.id, "in_progress")}
                                  disabled={report.status === "in_progress"}
                                  className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-300 hover:bg-blue-500/20 disabled:opacity-30"
                                >
                                  جاري المعالجة
                                </button>
                                <button
                                  onClick={() => handleUpdateReportStatus(report.id, "resolved")}
                                  disabled={report.status === "resolved"}
                                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-30"
                                >
                                  تم الحل
                                </button>
                                <button
                                  onClick={() => handleUpdateReportStatus(report.id, "dismissed")}
                                  disabled={report.status === "dismissed"}
                                  className="rounded-lg border border-zinc-500/30 bg-zinc-500/10 px-2.5 py-1 text-xs font-bold text-zinc-400 hover:bg-zinc-500/20 disabled:opacity-30"
                                >
                                  تجاهل
                                </button>
                                <button
                                  onClick={() => handleDeleteReport(report.id)}
                                  className="rounded-lg border border-red-500/30 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20"
                                  title="حذف البلاغ"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB: Comments */}
              {reportsSubTab === "comments" && (
                <div className="space-y-4">
                  {commentsLoading ? (
                    <div className="flex items-center justify-center py-12 text-cinema-muted">
                      <RefreshCw className="h-6 w-6 animate-spin text-cinema-accent" />
                      <span className="mr-3 text-sm">جاري تحميل تعليقات الحلقات...</span>
                    </div>
                  ) : commentsList.length === 0 ? (
                    <div className="rounded-2xl border border-cinema-border bg-cinema-card p-12 text-center">
                      <MessageSquare className="mx-auto h-12 w-12 text-cinema-muted/50" />
                      <h3 className="mt-3 text-base font-bold text-white">لا توجد تعليقات مسجلة بعد</h3>
                      <p className="mt-1 text-xs text-cinema-muted">
                        عندما يشارك الزوار بتعليقاتهم أسفل الحلقات، ستظهر هنا فورياً للإدارة والرقابة.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {commentsList.map((comm) => (
                        <div
                          key={comm.id}
                          className="rounded-2xl border border-cinema-border bg-cinema-card p-5 space-y-3 transition hover:border-cinema-border/80"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cinema-border/40 pb-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cinema-accent/20 text-xs font-bold text-cinema-accent">
                                {comm.author_name ? comm.author_name.slice(0, 1) : "ز"}
                              </div>
                              <span className="font-bold text-white text-sm">{comm.author_name || "زائر"}</span>
                              <span className="font-mono text-[11px] text-cinema-muted">
                                ({comm.visitor_id ? comm.visitor_id.slice(0, 8) + "..." : "غير معروف"})
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-lg px-2 py-0.5 text-xs font-bold border ${
                                  comm.is_approved
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                    : "border-red-500/30 bg-red-500/10 text-red-300"
                                }`}
                              >
                                {comm.is_approved ? "معتمد وظاهر" : "مخفي ومحجوب"}
                              </span>
                              <span className="text-xs text-cinema-muted">
                                {formatTimeAgo(comm.created_at)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-cinema-muted">
                            <Film className="h-3.5 w-3.5 text-cinema-accent" />
                            <span>معرف الأنمي: <strong className="text-white">{comm.media_id}</strong></span>
                            <span>- الحلقة: <strong className="text-white">{comm.episode_number}</strong></span>
                            <a
                              href={`/watch/${comm.media_id}?ep=${comm.episode_number}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mr-auto inline-flex items-center gap-1 text-cinema-accent hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              مشاهدة الحلقة والتعليق
                            </a>
                          </div>

                          <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed bg-cinema-bg/40 rounded-xl p-3 border border-cinema-border/30">
                            {comm.content}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <div className="flex items-center gap-1.5 text-xs text-cinema-muted">
                              <ThumbsUp className="h-3.5 w-3.5 text-cinema-accent" />
                              <span>{comm.likes_count || 0} إعجاب</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleAdminCommentApproval(comm.id)}
                                className={`rounded-lg border px-3 py-1 text-xs font-bold transition ${
                                  comm.is_approved
                                    ? "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                                }`}
                              >
                                {comm.is_approved ? "إخفاء التعليق" : "إلغاء الإخفاء والاعتماد"}
                              </button>
                              <button
                                onClick={() => handleDeleteAdminComment(comm.id)}
                                className="rounded-lg border border-red-500/30 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20"
                                title="حذف التعليق نهائياً"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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
