"use client";
import { useEffect, useState } from "react";
import { MediaItem } from "@/lib/types";

type ImageCandidate={image_url:string;source:"kitsu"|"anilist"};
type HeroImageData=ImageCandidate & {anime_id:number;id_mal:number|null;stale:boolean;alternatives?:ImageCandidate[]};
const cache=new Map<string,{image:HeroImageData;expires:number}>();
const pending=new Map<string,Promise<HeroImageData>>();
export function loadHeroImage(item:Pick<MediaItem,"id"|"id_mal">):Promise<HeroImageData> {
  const key=`${item.id}:${item.id_mal || 0}`;
  const saved=cache.get(key);
  if (saved && saved.expires>Date.now()) return Promise.resolve(saved.image);
  const inFlight=pending.get(key);
  if (inFlight) return inFlight;
  const request=fetch(`/api/anime/${item.id}/hero-image`,{cache:"no-store"}).then(async response => {
    if (!response.ok) throw new Error("Hero image unavailable");
    const image:HeroImageData=await response.json();
    if (!["kitsu","anilist"].includes(image.source) || image.anime_id !== item.id || (item.id_mal && image.id_mal !== item.id_mal) || !image.image_url) throw new Error("Hero identity mismatch");
    cache.set(key,{image,expires:Date.now()+3600000});
    return image;
  }).finally(() => pending.delete(key));
  pending.set(key,request);
  return request;
}

export function HeroImage({item}:{item:MediaItem}) {
  const [image,setImage]=useState<HeroImageData|null>(null),[failed,setFailed]=useState(false),[candidate,setCandidate]=useState(0);
  useEffect(() => {
    let current=true;
    let retry:ReturnType<typeof setTimeout>|undefined;
    setImage(null);setFailed(false);setCandidate(0);
    const load=() => loadHeroImage(item).then(result => {if (current) {setImage(result);setFailed(false);setCandidate(0);}}).catch(() => {if (current) {setFailed(true);retry=setTimeout(load,60000);}});
    void load();
    return () => {current=false;if (retry) clearTimeout(retry);};
  },[item.id,item.id_mal]);
  const candidates=image ? [{image_url:image.image_url,source:image.source},...(image.alternatives || [])] : [];
  const active=candidates[candidate];
  if (!active || failed) return <div className={`hero-image-placeholder ${failed ? "unavailable" : "loading"}`} role="status"><span className={failed ? "hero-image-status" : "sr-only"}>{failed ? "تعذّر تحميل صورة الأنمي حاليًا" : "جارٍ تحميل صورة الأنمي"}</span></div>;
  return <img key={active.image_url} src={active.image_url} alt={`الصورة الرسمية — ${item.title}`} data-image-source={active.source} data-anime-id={item.id} data-mal-id={image?.id_mal} decoding="async" fetchPriority="high" onError={() => {if (candidate+1<candidates.length) setCandidate(value => value+1);else setFailed(true);}}/>;
}
