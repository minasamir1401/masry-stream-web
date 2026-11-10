import { SITE_BRAND } from "@/lib/brand";
import { ENGLISH_HOME_PATH } from "@/lib/seo";
import Link from "next/link";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="footer-brand">
          <Brand />
          <p>اكتشف أنميك القادم، وتابع الحلقات ومواعيد العرض في مكان واحد.</p>
          <Link href={ENGLISH_HOME_PATH} lang="en" hrefLang="en" className="mt-3 text-sm font-semibold text-purple-200 hover:text-white">English</Link>
        </div>
        <div className="footer-link-groups">
          <nav aria-labelledby="footer-explore"><h2 id="footer-explore">اكتشف وشاهد</h2><Link href="/">الرئيسية</Link><Link href="/series">مكتبة الأنمي</Link><Link href="/movies">أفلام الأنمي</Link><Link href="/schedule">جدول الحلقات</Link></nav>
          <nav aria-labelledby="footer-help"><h2 id="footer-help">معلومات ومساعدة</h2><Link href="/about">عن <bdi>{SITE_BRAND}</bdi></Link><Link href="/report">الشكاوى والطلبات</Link><Link href="/contact">اتصل بنا</Link></nav>
          <nav aria-labelledby="footer-policy"><h2 id="footer-policy">السياسات والحقوق</h2><Link href="/privacy">سياسة الخصوصية</Link><Link href="/terms">الشروط وDMCA</Link></nav>
        </div>
      </div>
      <div className="footer-bottom"><span><bdi lang="en">{SITE_BRAND}</bdi></span><small>حقوق الأعمال والعلامات التجارية محفوظة لأصحابها الأصليين.</small></div>
    </footer>
  );
}
