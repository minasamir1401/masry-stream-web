import Link from "next/link";
import { BRAND_MARK, SITE_BRAND } from "@/lib/brand";

export function Brand() {
  return (
    <Link
      href="/"
      className="site-brand clover-brand"
      aria-label={`${SITE_BRAND} - الصفحة الرئيسية`}
      dir="ltr"
    >
      <img
        className="clover-brand-symbol"
        src={BRAND_MARK}
        width={48}
        height={48}
        alt=""
      />
      <span className="clover-brand-wordmark" lang="en">
        <strong>{SITE_BRAND}</strong>
      </span>
    </Link>
  );
}
