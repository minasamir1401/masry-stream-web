import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "قائمتي المفضلة",
  description: "قائمة أعمال الأنمي المفضلة المحفوظة على متصفحك في موقع انمي كلوفر AnimeClover.",
  alternates: {
    canonical: "/favorites",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
