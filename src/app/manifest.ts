import { MetadataRoute } from "next";
import { APP_ICON_SIZES, appIconPath, BRAND_MARK, SITE_BRAND } from "@/lib/brand";
import { DEFAULT_DESCRIPTION } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_BRAND,
    short_name: SITE_BRAND,
    description: DEFAULT_DESCRIPTION,
    lang: "ar",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#100C1B",
    theme_color: "#A855F7",
    categories: ["entertainment", "video"],
    icons: [
      ...APP_ICON_SIZES.map(size => ({
        src: appIconPath(size),
        sizes: `${size}x${size}`,
        type: "image/png",
        purpose: "any" as const,
      })),
      {
        src: "/icons/cloverfilx-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: BRAND_MARK,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
