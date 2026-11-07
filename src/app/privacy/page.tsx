import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Shield, Eye, Database, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: {
    absolute: "سياسة الخصوصية | انمي كلوفر AnimeClover",
  },
  description: "سياسة الخصوصية وحماية بيانات المستخدمين في منصة انمي كلوفر الرسمية (AnimeClover)، وكيفية التعامل مع ملفات تعريف الارتباط وسجلات المشاهدة.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-10">
      {/* Header */}
      <section className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-cinema-border bg-cinema-card px-4 py-1.5 text-xs font-bold text-cinema-accent">
          <Shield className="h-4 w-4" />
          <span>خصوصيتك وأمان بياناتك أولويتنا</span>
        </div>
        <h1 className="text-3xl font-black text-white sm:text-4xl">
          سياسة الخصوصية
        </h1>
        <p className="text-xs text-cinema-muted">
          آخر تحديث: نوفمبر 2026
        </p>
      </section>

      {/* Intro */}
      <div className="rounded-2xl border border-cinema-border bg-cinema-card p-6 text-sm text-cinema-muted leading-relaxed space-y-4">
        <p>
          نحن في منصة <strong>أنمي كلوفر (AnimeClover)</strong> نحرص على حماية خصوصية زوارنا ومستخدمينا بأعلى معايير الأمان الرقمي. توضح هذه الوثيقة نوعية المعلومات التي نجمعها، وكيفية استخدامها لحفظ تفضيلاتك وتقديم أفضل تجربة مشاهدة ممكنة.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-cinema-border bg-cinema-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-white">
            <Database className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-bold">1. البيانات التي نقوم بجمعها</h2>
          </div>
          <p className="text-xs text-cinema-muted leading-relaxed">
            لا تطلب منصة أنمي كلوفر إنشاء حساب إجباري أو تقديم بيانات شخصية حساسة للاستمتاع بالمشاهدة. البيانات المجمعة تقتصر على:
          </p>
          <ul className="space-y-2 text-xs text-cinema-muted list-disc list-inside pt-1">
            <li><strong>تفضيلات المشاهدة المحلية:</strong> قائمة الأعمال المفضلة، وسجل متابعة الحلقات وموضع التوقف في الفيديو، وتُحفظ محلياً داخل متصفحك (LocalStorage).</li>
            <li><strong>بيانات التفاعل الاختيارية:</strong> الاسم المستعار ونص التعليق الذي تنشره على الحلقات، وتقييمك للحلقات بالنجوم.</li>
            <li><strong>بيانات التحليلات مجهولة المصدر:</strong> الصفحات المزارة، ومدة بقاء الجلسة، ونوع الجهاز والمتصفح لتحسين استقرار وسرعة الخوادم، دون ربطها بهوية شخصية محددة.</li>
            <li><strong>بيانات البلاغات والشكاوى:</strong> التفاصيل والبريد الإلكتروني الاختياري المقدم طواعية عند إرسال بلاغ أو طلب أنمي للتواصل معك.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-cinema-border bg-cinema-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-white">
            <Lock className="h-5 w-5 text-pink-400" />
            <h2 className="text-lg font-bold">2. ملفات تعريف الارتباط والتخزين المحلي</h2>
          </div>
          <p className="text-xs text-cinema-muted leading-relaxed">
            نستخدم التخزين المحلي (LocalStorage) وتقنيات ملفات تعريف الارتباط (Cookies) لتمكين الميزات الأساسية:
          </p>
          <ul className="space-y-2 text-xs text-cinema-muted list-disc list-inside pt-1">
            <li>تذكر آخر حلقة شاهدتها وموضع توقف الفيديو لتتمكن من المتابعة لاحقاً بضغطة واحدة.</li>
            <li>حفظ اختياراتك لمشغّل الفيديو (مستوى الصوت، وضع ملء الشاشة، جودة العرض).</li>
            <li>منع تكرار تقييم الحلقة الواحدة أكثر من مرة من نفس المتصفح للحفاظ على عدالة التقييمات.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-cinema-border bg-cinema-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-white">
            <Eye className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold">3. عدم مشاركة البيانات مع أطراف ثالثة</h2>
          </div>
          <p className="text-xs text-cinema-muted leading-relaxed">
            نحن نلتزم بعدم بيع أو تأجير أو مشاركة أي بيانات تخص زوارنا مع جهات إعلانية أو أطراف خارجية لأغراض تسويقية. يتم استخدام البيانات حصرياً داخل بيئة الموقع لضمان عمل الخدمة بكفاءة.
          </p>
        </div>

        <div className="rounded-2xl border border-cinema-border bg-cinema-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold">4. أمن البيانات وحمايتها</h2>
          </div>
          <p className="text-xs text-cinema-muted leading-relaxed">
            نطبق تدابير أمنية صارمة وتشفير HTTPS قياسي لحماية كافة الاتصالات بين متصفحك وخوادمنا، مما يضمن أمان وسلامة تصفحك وتفاعلك على الموقع في كافة الأوقات.
          </p>
        </div>

        <div className="rounded-2xl border border-cinema-border bg-cinema-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold">5. الاستفسار وحذف البيانات</h2>
          </div>
          <p className="text-xs text-cinema-muted leading-relaxed">
            يمكنك في أي وقت مسح سجل المشاهدة والمفضلة مباشرة من خلال تنظيف بيانات التخزين المؤقت لمتصفحك. في حال كان لديك أي استفسار يتعلق بالخصوصية، يمكنك التواصل معنا مباشرة عبر صفحة <Link href="/contact" className="text-cinema-accent font-bold hover:underline">اتصل بنا</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
