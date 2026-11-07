import Link from "next/link";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div>
          <Brand />
          <p>منصة انمي كلوفر العربية لمشاهدة وتحميل الأنمي المترجم اون لاين.</p>
        </div>
        <nav aria-label="روابط الموقع" className="flex flex-wrap items-center gap-4 text-xs">
          <Link href="/">انمي كلوفر الرئيسية</Link>
          <Link href="/series">مكتبة الأنمي</Link>
          <Link href="/movies">أفلام الأنمي</Link>
          <Link href="/schedule">جدول الحلقات</Link>
          <Link href="/report" className="text-pink-400 font-bold hover:text-pink-300">الشكاوى والطلبات</Link>
          <Link href="/about">عن انمي كلوفر</Link>
          <Link href="/privacy">سياسة الخصوصية</Link>
          <Link href="/terms">الشروط وDMCA</Link>
          <Link href="/contact">اتصل بنا</Link>
        </nav>
        <small>
          موقع انمي كلوفر الرسمي (AnimeClover) — مشاهدة وتحميل أحدث مسلسلات وأفلام وحلقات الأنمي المترجمة اون لاين بجودة Full HD.
          <br />
          جميع حقوق الأعمال والعلامات التجارية محفوظة لأصحابها ومؤلفيها الأصليين.
        </small>
      </div>
    </footer>
  );
}
