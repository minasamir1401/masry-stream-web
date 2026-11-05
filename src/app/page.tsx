import type { Metadata } from "next";
import { fetchHomepage, fetchAiringWeek, fetchPopularSeries } from "@/lib/api";
import { HomeExperience } from "@/components/HomeExperience";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Anime Clover | أنمي كلوفر - مشاهدة وتحميل أحدث مسلسلات وأفلام الأنمي المترجم اون لاين",
  description:
    "موقع أنمي كلوفر Anime Clover لمشاهدة أحدث مسلسلات وأفلام الأنمي الياباني المترجمة باللغة العربية بجودة Full HD. مواعيد الحلقات الأسبوعية، استكشاف التصنيفات، وبث مباشر سريع بدون إعلانات مزعجة. Watch subbed anime series and movies online in HD on Anime Clover.",
  alternates: {
    canonical: "/",
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
