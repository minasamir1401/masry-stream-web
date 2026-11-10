export const SITE_BRAND = "cloverfilx";
export const SITE_BRAND_AR = "كلوفر فيلكس";
export const BRAND_MARK = "/brand/cloverfilx-mark.svg";
export const BRAND_SOCIAL_IMAGE = {
  url: "/brand/cloverfilx-social.png",
  width: 1200,
  height: 630,
  alt: `شعار ${SITE_BRAND} لمنصة الأنمي المترجم`,
};

export const APP_ICON_SIZES = [48, 96, 144, 192, 512];

export function appIconPath(size: number) {
  return `/icons/cloverfilx-${size}.png`;
}
