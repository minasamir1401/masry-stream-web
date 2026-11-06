import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronLeft, Clock3, Film, Layers3, Star, Tv } from "lucide-react";
import { fetchMediaById, fetchPopularSeries } from "@/lib/api";
import { genreArabic } from "@/lib/schedule";
import { formatDuration } from "@/lib/utils";
import { EpisodeList } from "@/components/EpisodeList";
import { AnimeImage } from "@/components/AnimeImage";
import { MediaCard } from "@/components/MediaCard";
import { SeriesWatchActions, SeriesSynopsis } from "@/components/SeriesDetailExtras";
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
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!/^\d+$/.test(params.id)) return { title: "الأنمي غير موجود - AnimeClover" };
  const series = await fetchMediaById(params.id).catch(() => null);
  if (!series) return { title: "الأنمي غير موجود - AnimeClover" };

  const cleanDesc = series.description
    ? series.description.replace(/<[^>]*>?/gm, "").slice(0, 170).trim()
    : "شاهد جميع حلقات وأفلام هذا العمل بجودة فائقة Full HD على أنمي كلوفر.";

  const titleAr = series.title;
  const titleEn = series.original_title && series.original_title !== series.title ? ` ${series.original_title}` : "";
  const pageTitle = `انمي ${titleAr}${titleEn} جميع الحلقات مترجمة تحميل ومشاهدة اون لاين - AnimeClover`;
  const pageDesc = `انمي ${titleAr} جميع الحلقات تحميل ومشاهدة اون لاين${titleEn ? ` (${series.original_title})` : ""} مترجم كامل الحلقات بجودة عالية مع روابط تحميل سريعة على موقع أنمي كلوفر AnimeClover. ${cleanDesc}`;

  const genresList = (series.genres || []).map((g) => genreArabic[g.name] || g.name);
  const keywords = [
    series.title,
    `انمي ${series.title}`,
    `انمي ${series.title} جميع الحلقات`,
    `انمي ${series.title} مترجم`,
    `مشاهدة انمي ${series.title}`,
    `تحميل انمي ${series.title}`,
    `حلقات ${series.title}`,
    series.original_title || "",
    `${series.original_title || series.title} anime online`,
    `watch ${series.original_title || series.title} sub`,
    ...genresList,
    "AnimeClover",
    "animeclover",
    "أنمي كلوفر",
    "انمي كلوفر",
    "انمي لكوفر",
    "أنمي لكوفر",
  ].filter(Boolean);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://animeclover.click";
  const canonicalUrl = `${siteUrl}/series/${series.id}`;
  const posterImg = series.banner_url || series.poster_url || `${siteUrl}/preview_full.png`;

  return {
    title: {
      absolute: pageTitle,
    },
    description: pageDesc,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: series.media_type === "MOVIE" ? "video.movie" : "video.tv_show",
      title: pageTitle,
      description: pageDesc,
      url: canonicalUrl,
      siteName: "AnimeClover",
      images: [
        {
          url: posterImg,
          width: 1200,
          height: 630,
          alt: series.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDesc,
      images: [posterImg],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function Page({ params }: PageProps) {
  if (!/^\d+$/.test(params.id)) notFound();

  const [seriesResult, recommendedResult] = await Promise.allSettled([
    fetchMediaById(params.id),
    fetchPopularSeries(1, 7),
  ]);

  const series = seriesResult.status === "fulfilled" ? seriesResult.value : null;
  if (!series) notFound();

  const recommended = recommendedResult.status === "fulfilled" ? recommendedResult.value : null;
  const total = series.total_episodes || series.episodes?.length;
  const status = series.status ? statuses[series.status] : undefined;
  const recommendations = (recommended?.items || []).filter((item) => item.id !== series.id).slice(0, 6);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://animeclover.click";
  const cleanDescription = (series.description || "").replace(/<[^>]*>?/gm, "").trim();

  // JSON-LD Schemas for search engines
  const jsonLdSeries = {
    "@context": "https://schema.org",
    "@type": series.media_type === "MOVIE" ? "Movie" : "TVSeries",
    "name": series.title,
    "alternateName": series.original_title ? [series.original_title] : undefined,
    "description": cleanDescription,
    "image": series.poster_url || series.banner_url,
    "genre": (series.genres || []).map((g) => genreArabic[g.name] || g.name),
    "startDate": series.release_year ? `${series.release_year}-01-01` : undefined,
    "numberOfEpisodes": total || undefined,
    "inLanguage": ["ja", "ar", "en"],
    "aggregateRating": series.average_score
      ? {
          "@type": "AggregateRating",
          "ratingValue": (series.average_score / 10).toFixed(1),
          "bestRating": "10",
          "worstRating": "1",
          "ratingCount": 150,
        }
      : undefined,
    "publisher": {
      "@type": "Organization",
      "name": "AnimeClover",
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
        "name": "الرئيسية",
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
        "name": series.title,
        "item": `${siteUrl}/series/${series.id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSeries) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <div className="anime-detail-page">
        <nav className="detail-breadcrumb" aria-label="مسار الأنمي">
          <Link href="/">الرئيسية</Link>
          <ChevronLeft size={12} />
          <Link href="/series">مكتبة الأنمي</Link>
          <ChevronLeft size={12} />
          <span dir="auto">{series.title}</span>
        </nav>

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
            <h1 id="anime-title" dir="auto">
              {series.title}
            </h1>
            {series.original_title && series.original_title !== series.title && (
              <p className="anime-original-title" dir="auto">
                {series.original_title}
              </p>
            )}
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
                : "كل حلقات العمل متوفرة الآن في مكان واحد بأعلى جودة وسيرفرات مباشرة."}
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

        <SeriesSynopsis description={series.description} />
        <EpisodeList key={series.id} animeId={series.id} initialTotal={total} />

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
