"use client";
import { SITE_BRAND, SITE_BRAND_AR } from "@/lib/brand";
import { mediaHref } from "@/lib/media-links";
import { HomeDiscoveryGuide } from "./HomeDiscoveryGuide";
import { BilingualTitle } from "./BilingualTitle";
import { mediaNames } from "@/lib/media-names";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpLeft, CalendarDays, ChevronLeft, Clock3, Flame, Play, Star } from "lucide-react";
import { HomepageData } from "@/lib/api";
import { AiringWeek, genreArabic } from "@/lib/schedule";
import { MediaItem } from "@/lib/types";
import { HeroBanner } from "./HeroBanner";
import { selectHeroSlides } from "@/lib/hero-slides";
import { AnimeImage } from "./AnimeImage";
import { ContinueWatching } from "./ContinueWatching";
import { MediaCard } from "./MediaCard";
import { InstallAppBanner } from "./InstallAppBanner";

const filters = [
  { label: "الكل", value: "" },
  { label: "أكشن", value: "Action" },
  { label: "مغامرات", value: "Adventure" },
  { label: "خيال", value: "Fantasy" },
  { label: "دراما", value: "Drama" },
];

const detailsUrl = (item: MediaItem) => mediaHref(item);

function EpisodeCard({ item, eager }: { item: MediaItem; eager?: boolean }) {
  const ep = item.available_episode || 1;
  return (
    <article className="discovery-episode">
      <Link
        prefetch={false}
        className="discovery-episode-art"
        href={`/watch/${item.id}?ep=${ep}`}
        aria-label={`شاهد انمي ${mediaNames(item).label} الحلقة ${ep} مترجمة على ${SITE_BRAND}`}
      >
        <AnimeImage src={item.poster_url} alt={`انمي ${mediaNames(item).label} الحلقة ${ep} - ${SITE_BRAND}`} eager={eager} />
        <span className="discovery-episode-number">
          الحلقة {String(ep).padStart(2, "0")}
        </span>
        <span className="discovery-play">
          <Play size={24} fill="currentColor" />
        </span>
      </Link>
      <div className="discovery-card-heading">
        <Link prefetch={false} href={detailsUrl(item)} dir="auto"><BilingualTitle media={item}/></Link>
        {item.average_score ? (
          <span className="discovery-rating">
            <Star size={13} fill="currentColor" />
            {(item.average_score / 10).toFixed(1)}
          </span>
        ) : null}
      </div>
      <p className="discovery-card-meta">
        {item.genres.slice(0, 2).map((entry) => genreArabic[entry.name] || entry.name).join(" · ")}
      </p>
    </article>
  );
}

export function HomeExperience({ data, week, failed = false }: { data: HomepageData; week: AiringWeek | null; failed?: boolean }) {
  const [genre, setGenre] = useState("");
  const visible = data.spotlight.filter((item) => !genre || item.genres.some((entry) => entry.name === genre));
  const today = week?.days.find((day) => day.date === week.today);
  const popular = data.popular.length ? data.popular : data.recommended;
  const heroItems = selectHeroSlides(popular, data.featured);

  return (
    <div className="home-shell discovery-home">
      <header className="brand-top-banner" aria-label={`تعريف منصة ${SITE_BRAND}`}>
        <div className="brand-top-banner-inner">
          <h1 className="brand-primary-h1">
            موقع <span dir="ltr" lang="en">{SITE_BRAND}</span> ({SITE_BRAND_AR}) — مشاهدة الأنمي المترجم اون لاين
          </h1>
          <div className="brand-top-links">
            <Link href="/series">مكتبة الأنمي</Link>
            <Link href="/movies">أفلام الأنمي</Link>
            <Link href="/schedule">جدول الحلقات</Link>
          </div>
        </div>
      </header>
      <HeroBanner items={heroItems} />
      <div className="discovery-content">
        <InstallAppBanner />
        <ContinueWatching suggestions={data.featured} />
        <section className="discovery-section" aria-labelledby="latest-heading">
          <div className="discovery-section-heading">
            <h2 id="latest-heading">
              <CalendarDays size={23} />
              أحدث حلقات الأنمي على <bdi>{SITE_BRAND}</bdi>
            </h2>
            <div className="discovery-tabs" role="group" aria-label="تصفية الحلقات حسب التصنيف">
              {filters.map((filter) => (
                <button
                  key={filter.label}
                  aria-pressed={genre === filter.value}
                  className={genre === filter.value ? "selected" : ""}
                  onClick={() => setGenre(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {failed ? (
            <div className="discovery-empty">
              <h3>تعذّر تحميل الأعمال حاليًا</h3>
              <Link href="/">
                إعادة المحاولة
                <ChevronLeft size={16} />
              </Link>
            </div>
          ) : visible.length ? (
            <div className="discovery-episodes-grid" aria-label="أحدث حلقات الأنمي المعروضة">
              {visible.slice(0, 16).map((item, index) => (
                <EpisodeCard key={`${item.id}-${item.available_episode || index}`} item={item} eager={index < 4} />
              ))}
            </div>
          ) : (
            <div className="discovery-empty">
              <h3>لا توجد حلقات جديدة في هذا التصنيف</h3>
              <button onClick={() => setGenre("")}>
                عرض كل الحلقات
                <ChevronLeft size={16} />
              </button>
            </div>
          )}
        </section>

        {popular.length > 0 && (
          <section className="discovery-section" aria-labelledby="popular-heading">
            <div className="discovery-section-heading">
              <h2 id="popular-heading">
                <Flame size={25} />
                الأنميات الأكثر شعبية
              </h2>
              <Link prefetch={false} className="discovery-text-link" href="/series?sort=POPULARITY_DESC">
                عرض الكل
                <ChevronLeft size={16} />
              </Link>
            </div>
            <div className="discovery-posters">
              {popular.slice(0, 6).map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {today?.items.length ? (
          <section className="discovery-section" aria-labelledby="airing-today-heading">
            <div className="discovery-section-heading">
              <h2 id="airing-today-heading">
                <CalendarDays size={23} />
                أنميات تُعرض اليوم
              </h2>
              <Link prefetch={false} className="discovery-text-link" href="/schedule">
                جدول الأسبوع
                <ChevronLeft size={16} />
              </Link>
            </div>
            <div className="schedule-cards">
              {today.items.slice(0, 6).map((item) => (
                <Link
                  prefetch={false}
                  className="airing-card"
                  key={item.id}
                  href={mediaHref({id:item.anime_id, canonical_path:item.canonical_path, media_type:item.media_type})}
                >
                  <div className="airing-poster">
                    <AnimeImage src={item.poster_url} alt={mediaNames(item).label} />
                  </div>
                  <div className="airing-info">
                    <div className="airing-top">
                      <span className="upcoming-tag">الحلقة {item.episode}</span>
                      <time dir="ltr"><Clock3 size={14} />{item.local_time}</time>
                    </div>
                    <h3 dir="auto"><BilingualTitle media={item}/></h3>
                    <div className="airing-genres">
                      {item.genres.slice(0, 2).map((name) => (
                        <span key={name}>{genreArabic[name] || name}</span>
                      ))}
                    </div>
                  </div>
                  <ChevronLeft className="airing-chevron" size={18} />
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <Link prefetch={false} className="discovery-schedule" href="/schedule">
          <span className="schedule-promo-art" aria-hidden="true" />
          <div className="schedule-promo-copy">
            <h2>لا تفوّت حلقتك القادمة</h2>
            <p>
              {today?.items.length
                ? `${today.items.length.toLocaleString("ar-EG")} حلقة في جدول اليوم. تابع مواعيد أنمياتك المفضلة بتوقيت القاهرة.`
                : "تابع مواعيد عرض الحلقات الجديدة لجميع أنمياتك المفضلة."}
            </p>
          </div>
          <span className="schedule-promo-button">
            <CalendarDays size={19} />
            جدول الحلقات
            <ArrowUpLeft size={17} />
          </span>
        </Link>

        <HomeDiscoveryGuide />
      </div>
    </div>
  );
}
