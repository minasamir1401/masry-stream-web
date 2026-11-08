import { jsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Film, Sparkles, Users, Zap } from "lucide-react";
import { SITE_URL, SITE_BRAND, buildBreadcrumbJsonLd } from "@/lib/seo";

const PAGE_TITLE = "من نحن - عن منصة انمي كلوفر الرسمية | انمي كلوفر AnimeClover";
const PAGE_DESC =
  "تعرف على منصة انمي كلوفر الرسمية (AnimeClover)، البوابة العربية المتخصصة في مشاهدة وتحميل مسلسلات وأفلام الأنمي المترجمة بأعلى جودة وتجربة سينمائية سريعة بدون إعلانات مزعجة.";

export const metadata: Metadata = {
  title: {
    absolute: PAGE_TITLE,
  },
  description: PAGE_DESC,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESC,
    url: "/about",
    siteName: SITE_BRAND,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "عن منصة انمي كلوفر AnimeClover" }],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESC,
    images: ["/og-image.png"],
  },
};

export default function AboutPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "انمي كلوفر الرئيسية", path: "/" },
    { name: "عن منصة انمي كلوفر", path: "/about" },
  ]);

  const aboutPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": PAGE_TITLE,
    "description": PAGE_DESC,
    "url": `${SITE_URL}/about`,
    "inLanguage": "ar",
    "isPartOf": { "@id": `${SITE_URL}/#website` },
    "mainEntity": { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(aboutPageJsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-12">
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cinema-border bg-cinema-card px-4 py-1.5 text-xs font-bold text-cinema-accent">
            <Sparkles className="h-4 w-4" />
            <span>انمي كلوفر AnimeClover — بوابتك العربية لعالم الأنمي</span>
          </div>
          <h1 className="text-3xl font-black text-white sm:text-4xl md:text-5xl">
            عن منصة انمي كلوفر (AnimeClover)
          </h1>
          <p className="mx-auto max-w-2xl text-base text-cinema-muted sm:text-lg">
            منصة عربية متطورة مصممة خصيصاً لعشاق الأنمي، تقدم تجربة استكشاف ومشاهدة وتحميل فائقة السرعة مع واجهة سينمائية حديثة عبر النطاق الرسمي animeclover.click.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-cinema-border bg-cinema-card p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <Zap className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-white">سرعة وتشغيل فوري</h2>
            <p className="text-xs text-cinema-muted leading-relaxed">
              اعتماد بنية تحتية سحابية متطورة تضمن تحميل الحلقات فورياً ودعم صيغ HLS التكيفية وسيرفرات متعددة تناسب جميع سرعات الإنترنت.
            </p>
          </div>

          <div className="rounded-2xl border border-cinema-border bg-cinema-card p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400">
              <Film className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-white">مكتبة متجددة وشاملة</h2>
            <p className="text-xs text-cinema-muted leading-relaxed">
              آلاف المسلسلات والأفلام الكلاسيكية والحديثة مترجمة باحترافية، مع جدول أسبوعي دقيق لمواعيد بث الحلقات لحظة صدورها.
            </p>
          </div>

          <div className="rounded-2xl border border-cinema-border bg-cinema-card p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-white">مجتمع متفاعل وحقيقي</h2>
            <p className="text-xs text-cinema-muted leading-relaxed">
              نظام تقييم مباشر لكل حلقة، ومساحة تعليقات حرة لتبادل الآراء، ونظام لتلقي شكاوى واقتراحات المتابعين والرد عليها فورياً.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-cinema-border bg-cinema-card/70 p-8 space-y-6">
          <h2 className="text-2xl font-bold text-white">رؤية موقع انمي كلوفر ورسالته</h2>
          <div className="space-y-4 text-sm text-cinema-muted leading-relaxed">
            <p>
              تأسست منصة <strong>انمي كلوفر (AnimeClover)</strong> بهدف الارتقاء بمحتوى الأنمي العربي من خلال توفير تجربة مستخدم نقية خالية من الفوضى والإعلانات المزعجة المنبثقة، والتركيز الكامل على سرعة المشاهدة وجودة الفيديو العالية.
            </p>
            <p>
              نؤمن بأن المشاهد العربي يستحق واجهة حديثة تحفظ تقدمه تلقائياً، وتعمل بسلاسة على الهواتف الذكية وأجهزة الكمبيوتر والشاشات المنزلية، دون تعقيدات أو إجبار على التسجيل.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
            {[
              "حفظ تقدم المشاهدة تلقائياً في المتصفح",
              "سيرفرات مشاهدة متعددة وسريعة",
              "نظام تقييم الحلقات من المتابعين مباشرة",
              "نظام تعليقات حي ونقاشات تفاعلية",
              "دعم تطبيق الويب التقدمي (PWA) للتثبيت على الهاتف",
              "قنوات مخصصة للإبلاغ عن أي مشكلة أو طلب أنمي",
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-cinema-accent shrink-0" />
                <span className="text-sm font-medium text-white">{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-cinema-border bg-gradient-to-r from-purple-900/40 via-cinema-card to-pink-900/30 p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-white">هل تواجه مشكلة أو ترغب في اقتراح عمل جديد؟</h2>
          <p className="text-xs text-cinema-muted max-w-lg mx-auto">
            فريق انمي كلوفر يتابع كافة الشكاوى والطلبات عبر صفحة البلاغات المخصصة لضمان أفضل تجربة لجميع الزوار.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/report"
              className="rounded-xl bg-cinema-accent px-6 py-2.5 text-xs font-bold text-white hover:brightness-110 transition"
            >
              تقديم شكوى أو طلب أنمي
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-cinema-border bg-cinema-bg px-6 py-2.5 text-xs font-bold text-cinema-muted hover:text-white transition"
            >
              تواصل معنا
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
