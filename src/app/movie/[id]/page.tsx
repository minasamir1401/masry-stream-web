import { StoryProvenance } from "@/components/StoryProvenance";
import { mediaHref } from "@/lib/media-links";
import { mediaMetadata } from "@/lib/media-seo";
import { mediaNames } from "@/lib/media-names";
import { BilingualTitle } from "@/components/BilingualTitle";
import { arabicSummary } from "@/lib/content";
import { jsonLd, SITE_URL, SITE_BRAND } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { loadMedia } from "@/lib/media-page";
import { MediaItem } from "@/lib/types";
import { fetchMovieById, fetchMovies } from "@/lib/api";
import { formatBytes, formatDuration } from "@/lib/utils";
import { MediaSlider } from "@/components/MediaSlider";
import {
  Play,
  Clock,
  HardDrive,
  Sparkles,
  Calendar,
  Send,
  Radio,
  FileVideo,
  ArrowRight,
} from "lucide-react";

export const revalidate = 60;

interface MovieDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: MovieDetailPageProps): Promise<Metadata> {
  const media = await loadMedia(params.id, true);
  return mediaMetadata(media, "movie");
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const movie = await loadMedia(params.id, true);
  if (mediaHref(movie) !== `/movie/${movie.id}`) permanentRedirect(mediaHref(movie));
  const relatedResult = await fetchMovies({ page: 1, pageSize: 8 }).catch(() => null);
  const related = (relatedResult?.items || []).filter(item => item.id !== movie.id);

  const posterSrc = movie.poster_proxy_url || movie.poster_url || "/placeholder-poster.svg";

  const jsonLdMovie = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": mediaNames(movie).label,
    "alternateName": mediaNames(movie).aliases,
    "description": arabicSummary(movie),
    "image": posterSrc,
    "duration": movie.duration ? `PT${Math.round(movie.duration / 60)}M` : undefined,
    "inLanguage": ["ar", "ja"],
    "publisher": {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      "name": SITE_BRAND,
      "url": SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(jsonLdMovie) }}
      />
      <div className="py-6 pb-20">
      {movie.catalog_stale && <p className="catalog-stale-note" role="status">نعرض آخر معلومات محفوظة لهذا العمل. قد تتأخر التحديثات مؤقتًا.</p>}
      {/* Back navigation */}
      <Link
        href="/movies"
        className="inline-flex items-center gap-2 text-xs font-semibold text-cinema-textMuted hover:text-white mb-6 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة لدليل الأفلام</span>
      </Link>

      {/* Main Details Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-cinema-card border border-cinema-border/70 p-6 sm:p-10 shadow-cinema mb-16">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cinema-accent/15 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Poster Column (4 cols) */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="relative aspect-[2/3] w-full max-w-[320px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-cinema-border">
              <Image
                src={posterSrc}
                alt={movie.title}
                fill
                priority
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          {/* Details Column (8 cols) */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-6">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-cinema-accent text-white text-xs font-bold shadow-glow flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>فيلم أنمي</span>
              </span>

              {movie.resolution && (
                <span className="px-3 py-1 rounded-md bg-cinema-elevated text-white text-xs font-bold border border-cinema-border">
                  {movie.resolution}
                </span>
              )}

              {movie.release_year && (
                <span className="flex items-center gap-1 text-xs text-cinema-textSecondary bg-cinema-elevated px-3 py-1 rounded-md border border-cinema-border">
                  <Calendar className="w-3.5 h-3.5 text-cinema-accentLight" />
                  <span>{movie.release_year}</span>
                </span>
              )}

              {movie.duration ? (
                <span className="flex items-center gap-1 text-xs text-cinema-textSecondary bg-cinema-elevated px-3 py-1 rounded-md border border-cinema-border">
                  <Clock className="w-3.5 h-3.5 text-cinema-accentLight" />
                  <span>{formatDuration(movie.duration)}</span>
                </span>
              ) : null}

              {movie.file_size > 0 && (
                <span className="flex items-center gap-1 text-xs text-cinema-textSecondary bg-cinema-elevated px-3 py-1 rounded-md border border-cinema-border">
                  <HardDrive className="w-3.5 h-3.5 text-cinema-blue" />
                  <span>{formatBytes(movie.file_size)}</span>
                </span>
              )}
            </div>

            {/* Title & Original Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                <BilingualTitle media={movie}/>
              </h1>
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {movie.genres.map((g: any) => (
                  <Link
                    key={g.id}
                    href={`/movies?genre=${g.slug}`}
                    className="px-3 py-1 rounded-lg bg-cinema-elevated hover:bg-cinema-hover text-cinema-textSecondary hover:text-white text-xs font-semibold border border-cinema-border transition-colors"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                نبذة عن العمل
              </h3>
              <p className="text-sm sm:text-base text-cinema-textSecondary leading-relaxed whitespace-pre-line">
                {arabicSummary(movie)}
              </p>
              <StoryProvenance media={movie}/>

            </div>

            {/* CTA Button */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href={`/watch/${movie.id}`}
                className="flex items-center gap-3 px-8 py-4 rounded-xl bg-cinema-accent hover:bg-cinema-accentLight text-white font-extrabold text-base shadow-glow transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Play className="w-5 h-5 fill-current ml-0.5" />
                <span>شاهد الفيلم الآن</span>
              </Link>
            </div>

            {/* Technical File Metadata Box */}
            <div className="mt-4 pt-6 border-t border-cinema-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[11px] text-cinema-textMuted block">جودة العرض</span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-cinema-accent" />
                  <span>{movie.quality_label || "حسب المصدر"}</span>
                </span>
              </div>

              <div>
                <span className="text-[11px] text-cinema-textMuted block">حالة المشاهدة</span>
                <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
                  تحقق من خيارات المشاهدة
                </span>
              </div>

              <div>
                <span className="text-[11px] text-cinema-textMuted block">صيغة الملف</span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <FileVideo className="w-3.5 h-3.5 text-cinema-accentLight" />
                  <span>{movie.mime_type || "MP4"}</span>
                </span>
              </div>

              <div>
                <span className="text-[11px] text-cinema-textMuted block">تقنية الدفق</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <Radio className="w-3.5 h-3.5" />
                  <span>Range HTTP 206</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Titles */}
      {related.length > 0 && (
        <MediaSlider
          title="أعمال مشابهة قد تعجبك"
          subtitle="أفلام وأعمال أخرى قد تعجبك"
          items={related}
        />
      )}
    </div>
    </>
  );
}
