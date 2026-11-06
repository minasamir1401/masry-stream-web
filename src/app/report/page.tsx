"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Film,
  HelpCircle,
  Layers,
  Send,
  ShieldAlert,
  Tv,
  Wrench,
} from "lucide-react";
import { getVisitorId } from "@/lib/analytics";

type ReportTab = "site_issue" | "anime_request";

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("site_issue");

  // Site issue fields
  const [siteIssueType, setSiteIssueType] = useState("مشكلة في مشغل الفيديو");
  const [siteTitle, setSiteTitle] = useState("");
  const [sitePageUrl, setSitePageUrl] = useState("");
  const [siteDetails, setSiteDetails] = useState("");
  const [siteEmail, setSiteEmail] = useState("");

  // Anime request / broken episode fields
  const [animeRequestType, setAnimeRequestType] = useState("طلب إضافة أنمي جديد");
  const [animeName, setAnimeName] = useState("");
  const [episodeNum, setEpisodeNum] = useState("");
  const [animeDetails, setAnimeDetails] = useState("");
  const [animeEmail, setAnimeEmail] = useState("");

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{ id: number; message: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const visitorId = getVisitorId();
      let body: any;

      if (activeTab === "site_issue") {
        if (!siteTitle.trim() || !siteDetails.trim()) {
          throw new Error("يرجى كتابة عنوان المشكلة وتفاصيلها");
        }
        body = {
          category: "site_issue",
          title: `[${siteIssueType}] ${siteTitle.trim()}`,
          details: sitePageUrl.trim()
            ? `${siteDetails.trim()}\n\nرابط الصفحة المتأثرة: ${sitePageUrl.trim()}`
            : siteDetails.trim(),
          contact_email: siteEmail.trim() || undefined,
          visitor_id: visitorId,
        };
      } else {
        if (!animeName.trim() || !animeDetails.trim()) {
          throw new Error("يرجى كتابة اسم الأنمي وتفاصيل الطلب");
        }
        const ep = episodeNum.trim() ? parseInt(episodeNum.trim(), 10) : undefined;
        body = {
          category: animeRequestType.includes("تالف") || animeRequestType.includes("ناقصة")
            ? "broken_episode"
            : "anime_request",
          title: `[${animeRequestType}] ${animeName.trim()}${ep ? ` - الحلقة ${ep}` : ""}`,
          details: animeDetails.trim(),
          episode_number: isNaN(ep as any) ? undefined : ep,
          contact_email: animeEmail.trim() || undefined,
          visitor_id: visitorId,
        };
      }

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "فشل إرسال البلاغ. يرجى المحاولة لاحقاً");
      }

      const data = await res.json();
      setSubmittedData({
        id: data.report_id,
        message: data.message || "تم استلام البلاغ بنجاح",
      });

      // Clear fields
      setSiteTitle("");
      setSitePageUrl("");
      setSiteDetails("");
      setSiteEmail("");
      setAnimeName("");
      setEpisodeNum("");
      setAnimeDetails("");
      setAnimeEmail("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-cinema-border bg-cinema-bg px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-cinema-muted focus:outline-none focus:ring-2 focus:ring-cinema-accent";
  const labelClass = "mb-1.5 block text-xs font-semibold text-cinema-muted";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      {/* Header */}
      <section className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-cinema-border bg-cinema-card px-4 py-1.5 text-xs font-bold text-cinema-accent">
          <ShieldAlert className="h-4 w-4" />
          <span>مركز الشكاوى والبلاغات وطلبات الأنمي</span>
        </div>
        <h1 className="text-3xl font-black text-white sm:text-4xl">
          أرسل شكوى أو اطلب أنمي
        </h1>
        <p className="mx-auto max-w-xl text-xs text-cinema-muted sm:text-sm">
          صلوتك مسموع واقتراحاتك تهمنا. اختر نوع البلاغ أدناه وسيقوم فريق الإدارة بمراجعته فورياً عبر لوحة التحكم.
        </p>
      </section>

      {/* Segmented Tab Switcher */}
      <div className="grid grid-cols-2 rounded-2xl border border-cinema-border bg-cinema-card p-1.5">
        <button
          type="button"
          onClick={() => {
            setActiveTab("site_issue");
            setErrorMsg(null);
            setSubmittedData(null);
          }}
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold transition ${
            activeTab === "site_issue"
              ? "bg-cinema-accent text-white shadow-lg"
              : "text-cinema-muted hover:text-white"
          }`}
        >
          <Wrench className="h-4 w-4" />
          <span>شكوى فنية في الموقع</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("anime_request");
            setErrorMsg(null);
            setSubmittedData(null);
          }}
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold transition ${
            activeTab === "anime_request"
              ? "bg-cinema-accent text-white shadow-lg"
              : "text-cinema-muted hover:text-white"
          }`}
        >
          <Tv className="h-4 w-4" />
          <span>طلب أنمي أو حلقة ناقصة</span>
        </button>
      </div>

      {/* Success Notification */}
      {submittedData && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white">{submittedData.message}</h3>
          <p className="text-xs text-cinema-muted">
            رقم متابعة البلاغ: <strong className="font-mono text-emerald-400">#{submittedData.id}</strong>
          </p>
          <p className="text-xs text-cinema-muted max-w-md mx-auto">
            تم تسجيل بلاغك في قاعدة البيانات وظهر مباشرة في قسم البلاغات لدى الإدارة للبدء في معالجته.
          </p>
          <button
            onClick={() => setSubmittedData(null)}
            className="mt-2 inline-flex items-center gap-2 rounded-xl border border-cinema-border bg-cinema-card px-4 py-2 text-xs font-bold text-white hover:border-cinema-accent transition"
          >
            إرسال طلب أو شكوى أخرى
          </button>
        </div>
      )}

      {/* Form Card */}
      {!submittedData && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-cinema-border bg-cinema-card p-6 sm:p-8 space-y-6 shadow-xl"
        >
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === "site_issue" ? (
            /* TAB 1: SITE TECHNICAL COMPLAINT */
            <div className="space-y-4">
              <div className="border-b border-cinema-border pb-3">
                <h3 className="font-bold text-white text-base">تفاصيل المشكلة الفنية في الموقع</h3>
                <p className="text-xs text-cinema-muted mt-0.5">
                  ساعدنا في تشخيص العطل لإصلاحه في أسرع وقت ممكن
                </p>
              </div>

              <div>
                <label className={labelClass}>نوع المشكلة</label>
                <select
                  value={siteIssueType}
                  onChange={(e) => setSiteIssueType(e.target.value)}
                  className={inputClass}
                >
                  <option value="مشكلة في مشغل الفيديو">مشكلة في مشغل الفيديو أو توقف العرض</option>
                  <option value="بطء في تحميل السيرفرات">بطء ملحوظ في تحميل السيرفرات أو التقطيع</option>
                  <option value="عطل في الترجمة">الترجمة غير متزامنة أو غير ظاهرة</option>
                  <option value="مشكلة في واجهة الهاتف">مشكلة في التصفح عبر الهاتف أو التجاوب</option>
                  <option value="رابط صفحة لا يعمل 404">صفحة تعطي خطأ 404 أو رابط تالف</option>
                  <option value="مشكلة أخرى">مشكلة فنية أخرى</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>عنوان مختصر للمشكلة *</label>
                <input
                  type="text"
                  required
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  placeholder="مثال: المشغل يتوقف فجأة بعد 5 دقائق في حلقة ون بيس"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>رابط الصفحة التي ظهرت بها المشكلة (اختياري)</label>
                <input
                  type="text"
                  value={sitePageUrl}
                  onChange={(e) => setSitePageUrl(e.target.value)}
                  placeholder="مثال: https://animeclover.click/watch/101922?ep=3"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>شرح تفصيلي للمشكلة *</label>
                <textarea
                  required
                  rows={4}
                  value={siteDetails}
                  onChange={(e) => setSiteDetails(e.target.value)}
                  placeholder="اكتب هنا ما حدث معك بالتفصيل، نوع المتصفح الذي تستخدمه، أو أي رسالة خطأ ظهرت لك..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>بريدك الإلكتروني لمتابعة الحل (اختياري)</label>
                <input
                  type="email"
                  value={siteEmail}
                  onChange={(e) => setSiteEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={inputClass}
                />
              </div>
            </div>
          ) : (
            /* TAB 2: ANIME REQUEST / BROKEN EPISODE */
            <div className="space-y-4">
              <div className="border-b border-cinema-border pb-3">
                <h3 className="font-bold text-white text-base">طلب أنمي أو إبلاغ عن حلقة متوقفة</h3>
                <p className="text-xs text-cinema-muted mt-0.5">
                  اطلب إضافة أعمال أنمي جديدة أو أبلغ عن حلقات ناقصة وسيرفرات تالفة
                </p>
              </div>

              <div>
                <label className={labelClass}>نوع الطلب</label>
                <select
                  value={animeRequestType}
                  onChange={(e) => setAnimeRequestType(e.target.value)}
                  className={inputClass}
                >
                  <option value="طلب إضافة أنمي جديد">طلب إضافة عمل أنمي غير موجود في الموقع</option>
                  <option value="سيرفر مشاهدة تالف">سيرفر المشاهدة في حلقة معينة لا يعمل</option>
                  <option value="حلقة ناقصة في مسلسل">حلقة ناقصة أو غير مرتبة في المسلسل</option>
                  <option value="طلب جودة أعلى 1080p">طلب توفير جودة أعلى أو سيرفر مباشر إضافي</option>
                  <option value="طلب فيلم أنمي">طلب فيلم أنمي كلاسيكي أو حديث</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className={labelClass}>اسم الأنمي بالعربي أو بالإنجليزي *</label>
                  <input
                    type="text"
                    required
                    value={animeName}
                    onChange={(e) => setAnimeName(e.target.value)}
                    placeholder="مثال: Bleach: Thousand-Year Blood War أو بليتش"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>رقم الحلقة (إذا وجدت)</label>
                  <input
                    type="number"
                    min={1}
                    value={episodeNum}
                    onChange={(e) => setEpisodeNum(e.target.value)}
                    placeholder="مثال: 12"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>ملاحظات وتفاصيل إضافية *</label>
                <textarea
                  required
                  rows={4}
                  value={animeDetails}
                  onChange={(e) => setAnimeDetails(e.target.value)}
                  placeholder="اكتب هنا أي تفاصيل: سنة الإنتاج إن عُرفت، ما هي السيرفرات المفضلة، أو تفاصيل العطل في الحلقة..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>بريدك الإلكتروني لإشعارك بتوفير العمل (اختياري)</label>
                <input
                  type="email"
                  value={animeEmail}
                  onChange={(e) => setAnimeEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cinema-accent px-6 py-3 text-sm font-bold text-white hover:brightness-110 transition disabled:opacity-50 shadow-lg shadow-cinema-accent/30"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? "جاري الإرسال والتسجيل..." : "إرسال البلاغ إلى الإدارة الآن"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Info Notice */}
      <div className="rounded-xl border border-cinema-border/50 bg-cinema-bg/40 p-4 text-xs text-cinema-muted space-y-1 text-center">
        <p>جميع البلاغات والطلبات يتم جدولتها وتخزينها ومراجعتها بانتظام من قِبل المشرفين.</p>
        <p>
          إذا كنت تبحث عن سياسات إزالة المحتوى وحقوق الملكية، تفضل بزيارة صفحة{" "}
          <Link href="/terms" className="text-cinema-accent font-bold hover:underline">
            الشروط والأحكام وDMCA
          </Link>.
        </p>
      </div>
    </div>
  );
}
