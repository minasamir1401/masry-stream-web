import Link from "next/link";

export function Brand() {
  return <Link href="/" className="site-brand clover-brand" aria-label="Anime Clover الرئيسية" dir="ltr"><img className="clover-brand-symbol" src="/brand/anime-clover-mark.svg" width={48} height={48} alt=""/><span className="clover-brand-wordmark" aria-hidden="true"><span>ANIME</span><strong>CLOVER</strong></span></Link>;
}
