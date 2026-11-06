import Link from "next/link";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div>
          <Brand />
          <p>حكايات لا تنتهي. اكتشف عالمك القادم.</p>
        </div>
        <nav aria-label="روابط الموقع" className="flex flex-wrap items-center gap-4 text-xs">
          <Link href="/series">اكتشف الأنمي</Link>
          <Link href="/schedule">جدول الحلقات</Link>
          <Link href="/report" className="text-pink-400 font-bold hover:text-pink-300">الشكاوى والطلبات</Link>
          <Link href="/about">عن المنصة</Link>
          <Link href="/privacy">سياسة الخصوصية</Link>
          <Link href="/terms">الشروط وDMCA</Link>
          <Link href="/contact">اتصل بنا</Link>
        </nav>
        <small>
          أنمي كلوفر — منصة مشاهدة الأنمي المباشرة
          <br />
          حقوق الأعمال محفوظة لأصحابها.
        </small>
      </div>
    </footer>
  );
}
