import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "غير محدد";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} س ${minutes} د`;
  }
  return `${minutes} دقيقة`;
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 ميجابايت";
  const k = 1024;
  const sizes = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت", "تيرابايت"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = (bytes / Math.pow(k, i)).toFixed(2);
  return `${val} ${sizes[i]}`;
}

export function formatNumberArabic(num: number): string {
  return new Intl.NumberFormat("ar-EG").format(num);
}

