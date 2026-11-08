import Link from "next/link";
import { ArrowUpLeft, CalendarDays, Clapperboard, Compass } from "lucide-react";

export function HomeDiscoveryGuide() {
  return <section className="discovery-section discovery-seo-section" aria-labelledby="about-brand-heading">
    <div className="discovery-seo-card">
      <div className="discovery-seo-header"><span className="discovery-guide-eyebrow">دليلك في انمي كلوفر</span><h2 id="about-brand-heading" className="discovery-seo-title">حكايتك القادمة تبدأ هنا</h2><p className="discovery-seo-lead">ابحث باسم الأنمي بالعربي أو الإنجليزي، أو اختَر طريقة الاكتشاف اللي تناسبك.</p></div>
      <div className="discovery-seo-grid">
        <Link href="/series" className="discovery-guide-link"><span className="discovery-guide-icon"><Compass size={23}/></span><div><h3>اكتشف المسلسلات</h3><p>تصفّح الأنميات حسب النوع وسنة العرض، وافتح العمل لمراجعة قصته وحلقاته.</p></div><ArrowUpLeft size={19}/></Link>
        <Link href="/movies" className="discovery-guide-link"><span className="discovery-guide-icon"><Clapperboard size={23}/></span><div><h3>اختَر فيلم لليلة</h3><p>اكتشف أفلام الأنمي، وشوف معلومات كل فيلم وخيارات المشاهدة المتاحة.</p></div><ArrowUpLeft size={19}/></Link>
        <Link href="/schedule" className="discovery-guide-link"><span className="discovery-guide-icon"><CalendarDays size={23}/></span><div><h3>تابع مواعيد الحلقات</h3><p>اعرف موعد الحلقة القادمة، وتابع جدول عرض أنمياتك بتوقيت القاهرة.</p></div><ArrowUpLeft size={19}/></Link>
      </div>
      <div className="discovery-guide-genres"><span>تصفّح حسب النوع</span>{[["Action","أكشن"],["Adventure","مغامرات"],["Fantasy","خيال"],["Drama","دراما"]].map(([key,label])=><Link key={key} href={`/series?genre=${key}`}>{label}</Link>)}</div>
    </div>
  </section>;
}
