import Link from "next/link";

export function Brand() {
  return (
    <Link
      href="/"
      className="site-brand clover-brand"
      aria-label="انمي كلوفر AnimeClover - الصفحة الرئيسية"
      title="موقع انمي كلوفر الرسمي AnimeClover"
      dir="ltr"
    >
      <img
        className="clover-brand-symbol"
        src="/brand/anime-clover-mark.svg"
        width={48}
        height={48}
        alt="شعار موقع انمي كلوفر AnimeClover"
      />
      <span className="clover-brand-wordmark">
        <span className="clover-brand-sub">انمي كلوفر · ANIME</span>
        <strong>CLOVER</strong>
      </span>
    </Link>
  );
}
