import { jsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, ShieldAlert } from "lucide-react";
import { SITE_URL, SITE_BRAND, buildBreadcrumbJsonLd } from "@/lib/seo";

const PAGE_TITLE = "اتصل بنا - التواصل مع إدارة انمي كلوفر | انمي كلوفر AnimeClover";
const PAGE_DESC =
  "تواصل مع فريق إدارة موقع انمي كلوفر الرسمي (AnimeClover) للاستفسارات، الشراكات، الإبلاغ عن المشاكل التقنية، أو طلبات الأنمي.";

export const metadata: Metadata = {
  title: {
    absolute: PAGE_TITLE,
  },
  description: PAGE_DESC,
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESC,
    url: "/contact",
    siteName: SITE_BRAND,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "اتصل بنا - انمي كلوفر AnimeClover" }],
  },
};

export default function ContactPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "انمي كلوفر الرئيسية", path: "/" },
    { name: "اتصل بنا", path: "/contact" },
  ]);

  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": PAGE_TITLE,
    "description": PAGE_DESC,
    "url": `${SITE_URL}/contact`,
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
        dangerouslySetInnerHTML={{ __html: jsonLd(contactPageJsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-12 space-y-10">
        <section className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cinema-border bg-cinema-card px-4 py-1.5 text-xs font-bold text-cinema-accent">
            <MessageSquare className="h-4 w-4" />
            <span>نسعد دائماً بالتواصل معكم</span>
          </div>
          <h1 className="text-3xl font-black text-white sm:text-4xl">
            اتصل بفريق انمي كلوفر (AnimeClover)
          </h1>
          <p className="mx-auto max-w-xl text-xs text-cinema-muted sm:text-sm">
            فريق دعم منصة انمي كلوفر جاهز للرد على استفساراتكم ومساعدتكم في أي وقت
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-cinema-border bg-cinema-card p-6 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">الشكاوى وطلبات الأنمي</h2>
              <p className="mt-1 text-xs text-cinema-muted leading-relaxed">
                إذا واجهت مشكلة في مشغل الفيديو، أو تريد طلب أنمي غير موجود أو حلقة ناقصة، يرجى استخدام صفحة البلاغات المخصصة لتصل رسالتك فوراً للوحة تحكم الإدارة.
              </p>
            </div>
            <Link
              href="/report"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cinema-accent px-4 py-2.5 text-xs font-bold text-white hover:brightness-110 transition w-full"
            >
              الانتقال لصفحة الشكاوى والطلبات
            </Link>
          </div>

          <div className="rounded-2xl border border-cinema-border bg-cinema-card p-6 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">البريد الإلكتروني المباشر</h2>
              <p className="mt-1 text-xs text-cinema-muted leading-relaxed">
                للاستفسارات العامة، المقترحات التطويرية، أو الشؤون القانونية وحقوق الملكية، يمكنك مراسلتنا مباشرة على بريدنا الرسمي وسنرد في أقرب وقت.
              </p>
            </div>
            <a
              href="mailto:contact@animeclover.click"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cinema-border bg-cinema-bg px-4 py-2.5 text-xs font-bold text-white hover:border-cinema-accent transition w-full"
            >
              <span>contact@animeclover.click</span>
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-cinema-border bg-cinema-card/70 p-6 space-y-4">
          <h2 className="text-base font-bold text-white">أسئلة شائعة</h2>
          <div className="space-y-3 text-xs text-cinema-muted">
            <div className="border-b border-cinema-border/50 pb-3">
              <h3 className="font-bold text-white">كم من الوقت يستغرق الرد على الشكاوى والطلبات؟</h3>
              <p className="mt-1">يقوم فريقنا بمراجعة البلاغات الواردة عبر الداش بورد يومياً والتعامل مع روابط الحلقات أو المشاكل الفنية بأسرع وقت.</p>
            </div>
            <div className="border-b border-cinema-border/50 pb-3">
              <h3 className="font-bold text-white">كيف يمكنني الإبلاغ عن حلقة لا تعمل؟</h3>
              <p className="mt-1">من خلال صفحة <Link href="/report" className="text-cinema-accent font-bold hover:underline">الشكاوى والطلبات</Link> واختيار تبويب "طلب أنمي أو إبلاغ عن حلقة" وتحديد اسم العمل ورقم الحلقة.</p>
            </div>
            <div>
              <h3 className="font-bold text-white">هل يمكنني طلب ترجمة أنمي قديم؟</h3>
              <p className="mt-1">نعم، نستقبل طلبات الأنمي بشكل دوري ونعمل على توفير الأعمال المطلوبة بجودات متعددة.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
