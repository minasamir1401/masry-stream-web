import { SITE_BRAND, pageSocialMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, FileCheck, HelpCircle, Mail, Scale, ShieldAlert } from "lucide-react";

const PAGE_TITLE = `الشروط والأحكام وحقوق الملكية DMCA | ${SITE_BRAND}`;
const PAGE_DESC = `الشروط والأحكام وسياسة حقوق الملكية الفكرية DMCA وإخلاء المسؤولية القانونية لمنصة ${SITE_BRAND}.`;

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESC,
  alternates: {
    canonical: "/terms",
  },
  ...pageSocialMetadata(PAGE_TITLE, PAGE_DESC, "/terms"),
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-10">
      {/* Header */}
      <section className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-cinema-border bg-cinema-card px-4 py-1.5 text-xs font-bold text-cinema-accent">
          <Scale className="h-4 w-4" />
          <span>الشفافية القانونية والامتثال لحقوق النشر</span>
        </div>
        <h1 className="text-3xl font-black text-white sm:text-4xl">
          الشروط والأحكام وسياسة الملكية الفكرية (DMCA)
        </h1>
        <p className="text-xs text-cinema-muted">
          تحدد هذه الصفحة القواعد الحاكمة لاستخدام المنصة وإجراءات حماية حقوق الملكية
        </p>
      </section>

      {/* DMCA Highlight Box */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>إخلاء المسؤولية وحقوق الطبع والنشر (DMCA Notice)</span>
        </div>
        <p className="text-xs text-amber-200/90 leading-relaxed">
          منصة <strong><bdi>{SITE_BRAND}</bdi></strong> هي فهرس ومحرك وسائط متطور لعرض وتنظيم روابط الأنمي المتاحة علناً على شبكة الإنترنت. المنصة لا تستضيف أي ملفات فيديو محمية بحقوق الطبع والنشر على خوادمها الخاصة بشكل مباشر، وجميع ملفات الوسائط والسيرفرات المعروضة مستضافة لدى أطراف ثالثة ومواقع مشاركة ملفات عامة غير تابعة لنا.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-cinema-border bg-cinema-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-white">
            <FileCheck className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-bold">1. شروط الاستخدام العامة</h2>
          </div>
          <p className="text-xs text-cinema-muted leading-relaxed">
            باستخدامك لموقع <bdi>{SITE_BRAND}</bdi>، فإنك توافق على الالتزام بالشروط والضوابط التالية:
          </p>
          <ul className="space-y-2 text-xs text-cinema-muted list-disc list-inside pt-1">
            <li>الموقع مخصص للاستخدام الشخصي وغير التجاري.</li>
            <li>يُحظر استخدام أي أدوات آلية أو برمجيات خبيثة تهدف للإضرار بالخوادم أو تعطيل الخدمة لبقية المستخدمين.</li>
            <li>يُمنع نشر أي تعليقات مسيئة، أو ترويجية، أو تتضمن خطاب كراهية في مساحات النقاش المجتمعية.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-cinema-border bg-cinema-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5 text-pink-400" />
            <h2 className="text-lg font-bold">2. إجراءات الإبلاغ عن انتهاك حقوق الملكية (DMCA Takedown)</h2>
          </div>
          <p className="text-xs text-cinema-muted leading-relaxed">
            نحن نحترم حقوق الملكية الفكرية للمبدعين والشركات المنتجة. إذا كنت صاحب حقوق ملكية أو وكيلاً معتمداً وتعتقد أن محتوى متاحاً عبر روابط الموقع ينتهك حقوقك، نرجو تزويدنا بالبيانات التالية لاتخاذ الإجراء الفوري بإزالة الروابط:
          </p>
          <ul className="space-y-2 text-xs text-cinema-muted list-disc list-inside pt-1">
            <li>تحديد العمل المحمي بحقوق النشر المزعوم انتهاكه.</li>
            <li>الرابط المحدد (URL) للصفحة المعنية على موقعنا.</li>
            <li>بيانات الاتصال الخاصة بك (الاسم، والبريد الإلكتروني، والجهة التي تمثلها).</li>
            <li>إقرار كتابي يفيد بحسن النية بأن استخدام المادة غير مصرح به من قبل صاحب الحق.</li>
          </ul>
          <p className="text-xs text-cinema-muted pt-2">
            يرجى إرسال الإشعار القانوني عبر صفحة <Link href="/report" className="text-cinema-accent font-bold hover:underline">البلاغات والشكاوى</Link> أو مراسلتنا مباشرة على البريد المخصص وسنقوم بمراجعة الطلب وحذف الروابط في غضون 24 إلى 48 ساعة.
          </p>
        </div>

        <div className="rounded-2xl border border-cinema-border bg-cinema-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-white">
            <HelpCircle className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold">3. حدود المسؤولية القانونية</h2>
          </div>
          <p className="text-xs text-cinema-muted leading-relaxed">
            يتم توفير محتوى الموقع وميزاته "كما هي" دون أي ضمانات صريحة أو ضمنية. لا تتحمل منصة <bdi>{SITE_BRAND}</bdi> أي مسؤولية عن محتوى أو سياسات الخصوصية لمواقع الأطراف الثالثة وسيرفرات الفيديو الخارجية التي يتم التوجيه إليها.
          </p>
        </div>

        <div className="rounded-2xl border border-cinema-border bg-cinema-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-white">
            <Mail className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold">4. التواصل القانوني</h2>
          </div>
          <p className="text-xs text-cinema-muted leading-relaxed">
            لأي استفسارات قانونية أو إرسال إشعارات الإزالة، يمكنك زيارة صفحة <Link href="/contact" className="text-cinema-accent font-bold hover:underline">اتصل بنا</Link> أو التواصل عبر البريد الإلكتروني الرسمي للمنصة.
          </p>
        </div>
      </div>
    </div>
  );
}
