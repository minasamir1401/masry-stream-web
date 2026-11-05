"use client";
import { useState } from "react";
export function AnimeImage({ src, alt, className = "", eager = false }: { src?: string; alt: string; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <img className={className} src={failed || !src ? "/placeholder-poster.svg" : src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} />;
}
