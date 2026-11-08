import Link from "next/link";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="footer-brand">
          <Brand />
          <p>اكتشف أنميك القادم، وتابع الحلقات ومواعيد العرض في مكان واحد.</p>
        </div>
        <div className="footer-link-groups">
          <nav aria-labelledby="footer-explore"><h2 id="footer-explore">اكتشف وشاهد</h2><Link href="/">الرئيسية</Link><Link href="/series">مكتبة الأنمي</Link><Link href="/movies">أفلام الأنمي</Link><Link href="/schedule">جدول الحلقات</Link></nav>
          <nav aria-labelledby="footer-help"><h2 id="footer-help">معلومات ومساعدة</h2><Link href="/about">عن انمي كلوفر</Link><Link href="/report">الشكاوى والطلبات</Link><Link href="/contact">اتصل بنا</Link></nav>
          <nav aria-labelledby="footer-policy"><h2 id="footer-policy">السياسات والحقوق</h2><Link href="/privacy">سياسة الخصوصية</Link><Link href="/terms">الشروط وDMCA</Link></nav>
        </div>
      </div>
      <div className="footer-bottom"><span>انمي كلوفر <bdi lang="en">AnimeClover</bdi></span><small>حقوق الأعمال والعلامات التجارية محفوظة لأصحابها الأصليين.</small></div>
    </footer>
  );
}
