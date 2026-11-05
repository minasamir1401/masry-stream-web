"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { readFavorites } from "@/components/FavoriteButton";
import { MediaCard } from "@/components/MediaCard";
export default function FavoritesPage() {
  const [items,setItems]=useState<MediaItem[]>([]),[ready,setReady]=useState(false);
  useEffect(()=>{const update=()=>{setItems(readFavorites());setReady(true);};update();window.addEventListener("favorites-updated",update);window.addEventListener("storage",update);return()=>{window.removeEventListener("favorites-updated",update);window.removeEventListener("storage",update);};},[]);
  return <section className="favorites-page"><h1><Heart/>قائمتي المفضلة</h1><p>أعمالك المحفوظة على هذا المتصفح، في مكان واحد.</p>{items.length?<div className="favorites-grid">{items.map(item=><MediaCard key={item.id} item={item}/>)}</div>:<div className="schedule-empty"><Heart size={40}/><h2>{ready?"قائمتك لسه فاضية":"جارٍ تحميل المفضلة..."}</h2><p>اضغط «أضف للمفضلة» على العمل الذي يعجبك.</p><Link className="primary-action" href="/">اكتشف الأنمي</Link></div>}</section>;
}
