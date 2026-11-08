import { mediaHref } from "@/lib/media-links";
import { mediaMetadata } from "@/lib/media-seo";
import { mediaNames } from "@/lib/media-names";
import { BilingualTitle } from "@/components/BilingualTitle";
import { arabicSummary } from "@/lib/content";
import { jsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { CalendarDays, ChevronLeft, Clock3, Film, Layers3, Star, Tv } from "lucide-react";
import { fetchMediaById, fetchPopularSeries } from "@/lib/api";
import { genreArabic } from "@/lib/schedule";
import { formatDuration } from "@/lib/utils";
import { EpisodeList } from "@/components/EpisodeList";
import { AnimeImage } from "@/components/AnimeImage";
import { MediaCard } from "@/components/MediaCard";
import { SeriesWatchActions, SeriesSynopsis } from "@/components/SeriesDetailExtras";
import { loadMedia, detailEpisodes } from "@/lib/media-page";
import { fetchEpisodeIndex } from "@/lib/api";
import "./detail.css";

export const revalidate = 120;

const statuses: Record<string, string> = {
  FINISHED: "مكتمل",
  RELEASING: "يعرض الآن",
  NOT_YET_RELEASED: "قريبًا",
  HIATUS: "متوقف مؤقتًا",
  CANCELLED: "ملغي",
};

interface PageProps {
  params: { id: string };
  searchParams?: { episodes?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const media = await loadMedia(params.id);
  return mediaMetadata(media, "series");
}

export default async function Page({ params, searchParams }: PageProps) {
  if (!/^\d+$/.test(params.id)) notFound();

  const [seriesResult, recommendedResult] = await Promise.allSettled([
    loadMedia(params.id),
    fetchPopularSeries(1, 7),
  ]);

  if (seriesResult.status === "rejected") throw seriesResult.reason;
  const series = seriesResult.value;
  if (!series) notFound();
  if (mediaHref(series) !== `/series/${series.id}`) permanentRedirect(mediaHref(series));
  const episodeIndex = await detailEpisodes(series);

  const recommended = recommendedResult.status === "fulfilled" ? recommendedResult.value : null;
  const total = series.total_episodes || series.episodes?.length;
  const status = series.status ? statuses[series.status] : undefined;
  const recommendations = (recommended?.items || []).filter((item) => item.id !== series.id).slice(0, 6);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://animeclover.click";
  const cleanDescription = arabicSummary(series).replace(/<[^>]*>?/gm, "").trim();

  // JSON-LD Schemas for search engines
  const jsonLdSeries = {
    "@context": "https://schema.org",
    "@type": series.media_type === "MOVIE" ? "Movie" : "TVSeries",
    "name": mediaNames(series).label,
    "alternateName": mediaNames(series).aliases,
    "description": cleanDescription,
    "image": series.poster_url || series.banner_url,
    "genre": (series.genres || []).map((g) => genreArabic[g.name] || g.name),
    "numberOfEpisodes": total || undefined,
    "inLanguage": ["ja", "ar", "en"],
    "publisher": {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      "name": "انمي كلوفر AnimeClover",
      "url": siteUrl,
    },
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "انمي كلوفر الرئيسية",
        "item": siteUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "مكتبة الأنمي",
        "item": `${siteUrl}/series`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": mediaNames(series).label,
        "item": `${siteUrl}${mediaHref(series)}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(jsonLdSeries) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(jsonLdBreadcrumb) }}
      />

      <div className="anime-detail-page">
        <nav className="detail-breadcrumb" aria-label="مسار الأنمي">
          <Link href="/">الرئيسية</Link>
          <ChevronLeft size={12} />
          <Link href="/series">مكتبة الأنمي</Link>
          <ChevronLeft size={12} />
          <span dir="auto">{series.title}</span>
        </nav>

        {series.catalog_stale && <p className="catalog-stale-note" role="status">نعرض آخر معلومات محفوظة لهذا العمل. قد تتأخر التحديثات مؤقتًا.</p>}
        <section className="anime-profile" aria-labelledby="anime-title">
          <div className="anime-profile-atmosphere" aria-hidden="true">
            <AnimeImage src={series.banner_url || series.poster_url} alt="" eager />
          </div>
          <div className="anime-profile-poster">
            <AnimeImage
              src={series.poster_proxy_url || series.poster_url}
              alt={`الغلاف الرسمي — ${series.title}`}
              eager
            />
            {series.average_score ? (
              <span className="anime-poster-rating">
                <Star size={14} fill="currentColor" />
                {(series.average_score / 10).toFixed(1)}
                <small>/ 10</small>
              </span>
            ) : null}
          </div>
          <div className="anime-profile-copy">
            <div className="anime-profile-eyebrow">
              <span>
                {series.media_type === "MOVIE" ? <Film size={15} /> : <Tv size={15} />}{" "}
                {series.media_type === "MOVIE" ? "فيلم أنمي" : "مسلسل أنمي"}
              </span>
              {status && (
                <span className={`anime-status ${series.status === "RELEASING" ? "airing" : ""}`}>
                  <i />
                  {status}
                </span>
              )}
            </div>
            <h1 id="anime-title" dir="auto"><BilingualTitle media={series}/></h1>
            <div className="anime-profile-genres">
              {series.genres.map((genre) => (
                <Link key={genre.name} href={`/series?genre=${encodeURIComponent(genre.name)}`}>
                  {genreArabic[genre.name] || genre.name}
                </Link>
              ))}
            </div>
            <p className="anime-profile-intro">
              {series.status === "NOT_YET_RELEASED"
                ? "حكاية جديدة في الطريق. تابع مواعيد العرض وأضف العمل لقائمتك على Anime Clover."
                : "تصفّح معلومات العمل والحلقات التي عُرضت، واختر الحلقة لمراجعة خيارات المشاهدة المتاحة."}
            </p>
            <div className="anime-profile-stats">
              <div>
                <Layers3 size={17} />
                <span>
                  <small>الحلقات</small>
                  <strong>{total ? `${total} حلقة` : "غير معلن"}</strong>
                </span>
              </div>
              <div>
                <Clock3 size={17} />
                <span>
                  <small>مدة الحلقة</small>
                  <strong>{series.duration ? formatDuration(series.duration) : "غير معلنة"}</strong>
                </span>
              </div>
              <div>
                <CalendarDays size={17} />
                <span>
                  <small>سنة العرض</small>
                  <strong>{series.release_year || "غير معلنة"}</strong>
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <SeriesWatchActions item={series} upcoming={series.status === "NOT_YET_RELEASED"} />
            </div>
            <a className="anime-all-episodes" href="#episodes">
              تصفّح الحلقات
              <ChevronLeft size={14} />
            </a>
          </div>
        </section>

        <nav className="detail-section-links" aria-label="أقسام صفحة الأنمي">
          <a href="#episodes">
            <Layers3 size={15} />
            الحلقات{total ? <span>{total}</span> : null}
          </a>
          <a href="#about">عن الحكاية</a>
          {recommendations.length > 0 && <a href="#similar">حكايات تانية</a>}
        </nav>

        <SeriesSynopsis description={arabicSummary(series)} media={series} />
        <EpisodeList key={`${series.id}-${searchParams?.episodes || 1}`} animeId={series.id} initialTotal={total} initialData={episodeIndex} initialPage={Number(searchParams?.episodes) || 1} />

        {recommendations.length > 0 && (
          <section id="similar" className="anime-recommendations">
            <div className="discovery-section-heading">
              <h2>حكايات تستحق المشاهدة على Anime Clover</h2>
              <Link className="discovery-text-link" href="/series">
                اكتشف أكتر
                <ChevronLeft size={15} />
              </Link>
            </div>
            <div className="discovery-posters">
              {recommendations.map((item) => (
                <MediaCard item={item} key={item.id} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
