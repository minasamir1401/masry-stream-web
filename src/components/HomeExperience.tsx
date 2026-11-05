"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpLeft, CalendarDays, ChevronLeft, Flame, Play, Star } from "lucide-react";
import { HomepageData } from "@/lib/api";
import { AiringWeek, genreArabic } from "@/lib/schedule";
import { MediaItem } from "@/lib/types";
import { HeroBanner } from "./HeroBanner";
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

const detailsUrl = (item: MediaItem) => `/${item.media_type === "MOVIE" ? "movie" : "series"}/${item.id}`;

function buildRowItems(items: MediaItem[], startIndex: number, count = 20): MediaItem[] {
  if (!items || items.length === 0) return [];
  const result: MediaItem[] = [];
  for (let i = 0; i < count; i++) {
    result.push(items[(startIndex + i) % items.length]);
  }
  return result;
}

function EpisodeCard({ item, eager }: { item: MediaItem; eager?: boolean }) {
  const ep = item.available_episode || 1;
  return (
    <article className="discovery-episode">
      <Link
        className="discovery-episode-art"
        href={`/watch/${item.id}?ep=${ep}`}
        aria-label={`شاهد ${item.title}، الحلقة ${ep}`}
      >
        <AnimeImage src={item.poster_url} alt={`غلاف ${item.title}`} eager={eager} />
        <span className="discovery-episode-number">
          الحلقة {String(ep).padStart(2, "0")}
        </span>
        <span className="discovery-play">
          <Play size={24} fill="currentColor" />
        </span>
      </Link>
      <div className="discovery-card-heading">
        <Link href={detailsUrl(item)} dir="auto">{item.title}</Link>
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

  const row1 = buildRowItems(visible, 0, 20);
  const row2 = buildRowItems(visible, 7, 20);
  const row3 = buildRowItems(visible, 14, 20);

  return (
    <div className="home-shell discovery-home">
      <HeroBanner items={data.featured} />
      <div className="discovery-content">
        <InstallAppBanner />
        <ContinueWatching suggestions={data.featured} />
        <section className="discovery-section" aria-labelledby="latest-heading">
          <div className="discovery-section-heading">
            <h2 id="latest-heading">
              <CalendarDays size={23} />
              أحدث الحلقات
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
            <div className="discovery-marquee-viewport" aria-label="أحدث حلقات الأنمي المعروضة">
              <div className="discovery-marquee-strip">
                <div className="discovery-marquee-row">
                  <div className="discovery-marquee-track discovery-marquee-track-1">
                    <div className="discovery-marquee-group">
                      {row1.map((item, index) => (
                        <EpisodeCard key={`r1-g1-${item.id}-${index}`} item={item} eager={index < 4} />
                      ))}
                    </div>
                    <div className="discovery-marquee-group" aria-hidden="true">
                      {row1.map((item, index) => (
                        <EpisodeCard key={`r1-g2-${item.id}-${index}`} item={item} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="discovery-marquee-row">
                  <div className="discovery-marquee-track discovery-marquee-track-2">
                    <div className="discovery-marquee-group">
                      {row2.map((item, index) => (
                        <EpisodeCard key={`r2-g1-${item.id}-${index}`} item={item} />
                      ))}
                    </div>
                    <div className="discovery-marquee-group" aria-hidden="true">
                      {row2.map((item, index) => (
                        <EpisodeCard key={`r2-g2-${item.id}-${index}`} item={item} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="discovery-marquee-row">
                  <div className="discovery-marquee-track discovery-marquee-track-3">
                    <div className="discovery-marquee-group">
                      {row3.map((item, index) => (
                        <EpisodeCard key={`r3-g1-${item.id}-${index}`} item={item} />
                      ))}
                    </div>
                    <div className="discovery-marquee-group" aria-hidden="true">
                      {row3.map((item, index) => (
                        <EpisodeCard key={`r3-g2-${item.id}-${index}`} item={item} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
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
                الأكثر شعبية
              </h2>
              <Link className="discovery-text-link" href="/series?sort=POPULARITY_DESC">
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

        <Link className="discovery-schedule" href="/schedule">
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
      </div>
    </div>
  );
}
