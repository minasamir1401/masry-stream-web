import Link from "next/link";
import { Brand } from "./Brand";
export function Footer() {
  return <footer className="app-footer"><div className="app-footer-inner"><div><Brand /><p>حكايات لا تنتهي. اكتشف عالمك القادم.</p></div><nav aria-label="روابط الموقع"><Link href="/series">اكتشف الأنمي</Link><Link href="/schedule">جدول الحلقات</Link><Link href="/favorites">قائمتي</Link></nav><small>أنمي كلوفر — منصة مشاهدة الأنمي المباشرة<br />حقوق الأعمال محفوظة لأصحابها.</small></div></footer>;
}
