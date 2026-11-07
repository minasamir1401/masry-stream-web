import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "انمي كلوفر AnimeClover | الموقع الرسمي لمشاهدة وتحميل الأنمي المترجم",
    short_name: "انمي كلوفر",
    description:
      "موقع انمي كلوفر الرسمي (AnimeClover) لمشاهدة وتحميل مسلسلات وأفلام وحلقات الأنمي المترجمة اون لاين بجودات متعددة مجاناً وبأعلى جودة.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#100C1B",
    theme_color: "#A855F7",
    categories: ["entertainment", "video"],
    icons: [
      {
        src: "/icons/icon-48.png",
        sizes: "48x48",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/brand/anime-clover-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
