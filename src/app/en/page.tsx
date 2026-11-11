import type { Metadata } from "next";
import Link from "next/link";
import { fetchPopularSeries } from "@/lib/api";
import { mediaHref } from "@/lib/media-links";
import { mediaNames } from "@/lib/media-names";
import { ENGLISH_HOME_PATH, SITE_BRAND, SITE_URL, homeAlternates, jsonLd, pageSocialMetadata } from "@/lib/seo";

const TITLE = `${SITE_BRAND} | Anime with Arabic Subtitles`;
const DESCRIPTION = `Discover anime series and movies with Arabic subtitles on ${SITE_BRAND}. Search by English or Arabic title, explore the catalog, and check the weekly episode schedule.`;

export const revalidate = 120;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: homeAlternates("en"),
  ...pageSocialMetadata(TITLE, DESCRIPTION, ENGLISH_HOME_PATH, "en"),
};

const sections = [
  { href: "/series", title: "Anime series", description: "Browse by genre or release year and open a series to find its synopsis and episode list." },
  { href: "/movies", title: "Anime movies", description: "Explore the film catalog and check details and available viewing options for each title." },
  { href: "/schedule", title: "Weekly release schedule", description: "Find upcoming episodes and check when they air in Cairo local time." },
];

export default async function EnglishHomePage() {
  const popular = await fetchPopularSeries(1, 8).catch(() => null);
  const titles = (popular?.items || [])
    .map(item => ({ id: item.id, href: mediaHref(item), name: mediaNames(item).en }))
    .filter(item => item.name);
  const structuredPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}${ENGLISH_HOME_PATH}#webpage`,
    url: `${SITE_URL}${ENGLISH_HOME_PATH}`,
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <article lang="en" dir="ltr" className="mx-auto max-w-5xl space-y-10 px-4 py-12 text-left sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredPage) }} />
      <header className="space-y-5 rounded-3xl border border-purple-400/20 bg-cinema-card p-6 sm:p-10">
        <Link href="/" hrefLang="ar" lang="ar" className="inline-block text-sm font-semibold text-purple-200 hover:text-white">الرئيسية بالعربية</Link>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">Discover anime with Arabic subtitles</h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-300">
          {SITE_BRAND} brings anime series, movies, and episode schedules together. Search for a title in English or Arabic to find the same work and open its Arabic catalog page.
        </p>
        <form action="/search" role="search" aria-label="Search anime titles" className="flex max-w-xl flex-wrap items-end gap-3">
          <label className="min-w-0 flex-1 basis-52 text-sm font-semibold text-white">
            Anime title
            <input type="search" name="q" dir="auto" required maxLength={200} placeholder="Search in English or Arabic" className="mt-2 block w-full rounded-xl border border-purple-400/30 bg-cinema-bg px-4 py-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400" />
          </label>
          <button type="submit" className="rounded-xl bg-purple-700 px-5 py-3 text-sm font-bold text-white hover:bg-purple-600">Search</button>
        </form>
      </header>

      <nav aria-label="Browse anime" className="grid gap-4 sm:grid-cols-3">
        {sections.map(({ href, title, description }) => (
          <Link key={href} href={href} hrefLang="ar" className="space-y-2 rounded-2xl border border-purple-400/20 bg-cinema-card p-5 hover:border-purple-400/60">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <p className="text-sm leading-relaxed text-slate-300">{description}</p>
          </Link>
        ))}
      </nav>

      {titles.length > 0 && (
        <section aria-labelledby="english-popular" className="space-y-4">
          <h2 id="english-popular" className="text-xl font-bold text-white">Popular anime series</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {titles.map(({ id, href, name }) => (
              <li key={id}>
                <Link href={href} hrefLang="ar" className="block rounded-xl border border-purple-400/20 bg-cinema-card p-4 text-purple-100 hover:border-purple-400/60">{name}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
