import type { Metadata } from "next";
import { fetchHomepage, fetchAiringWeek, fetchPopularSeries } from "@/lib/api";
import { HomeExperience } from "@/components/HomeExperience";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "AnimeClover - موقع مشاهدة وتحميل الانمي مترجم اون لاين",
  description:
    "أنمي كلوفر AnimeClover موقع عربي يمكنك من خلاله تحميل ومشاهدة جميع افلام وحلقات الانمي مترجمة اون لاين بجودات متعددة مجاناً وبأعلى جودة Full HD بدون إعلانات مزعجة.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AnimeClover - موقع مشاهدة وتحميل الانمي مترجم اون لاين",
    description:
      "أنمي كلوفر AnimeClover موقع عربي يمكنك من خلاله تحميل ومشاهدة جميع افلام وحلقات الانمي مترجمة اون لاين بجودات متعددة مجاناً وبأعلى جودة.",
    url: "/",
    siteName: "AnimeClover",
  },
  twitter: {
    card: "summary_large_image",
    title: "AnimeClover - موقع مشاهدة وتحميل الانمي مترجم اون لاين",
    description:
      "أنمي كلوفر AnimeClover موقع عربي يمكنك من خلاله تحميل ومشاهدة جميع افلام وحلقات الانمي مترجمة اون لاين بجودات متعددة مجاناً وبأعلى جودة.",
  },
};

export default async function HomePage() {
  const [home, schedule, popular] = await Promise.allSettled([
    fetchHomepage(),
    fetchAiringWeek(),
    fetchPopularSeries(1, 6),
  ]);
  const data =
    home.status === "fulfilled"
      ? home.value
      : { featured: [], spotlight: [], popular: [], recommended: [] };
  return (
    <HomeExperience
      data={{
        ...data,
        popular: popular.status === "fulfilled" ? popular.value.items : data.popular,
      }}
      week={schedule.status === "fulfilled" ? schedule.value : null}
      failed={home.status === "rejected"}
    />
  );
}
