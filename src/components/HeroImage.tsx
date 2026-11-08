"use client";
import { useEffect, useState } from "react";
import { MediaItem } from "@/lib/types";
import { matchingBanner } from "@/lib/hero-slides";

type ImageCandidate={image_url:string;source:"kitsu"|"anilist"};
type HeroImageData=ImageCandidate & {anime_id:number;id_mal:number|null;stale:boolean;alternatives?:ImageCandidate[]};
const cache=new Map<string,{image:HeroImageData;expires:number}>();
const pending=new Map<string,Promise<HeroImageData>>();
export function loadHeroImage(item:Pick<MediaItem,"id"|"id_mal"|"banner_url">):Promise<HeroImageData> {
  const banner=matchingBanner(item);
  if (banner) return Promise.resolve({anime_id:item.id,id_mal:item.id_mal || null,image_url:banner,source:"anilist",stale:false});
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
  const [image,setImage]=useState<HeroImageData|null>(null),[candidate,setCandidate]=useState(0);
  useEffect(() => {
    let current=true;
    let retry:ReturnType<typeof setTimeout>|undefined;
    setImage(null);setCandidate(0);
    const load=() => loadHeroImage(item).then(result => {if (current) {setImage(result);setCandidate(0);}}).catch(() => {if (current) retry=setTimeout(load,60000);});
    void load();
    return () => {current=false;if (retry) clearTimeout(retry);};
  },[item.id,item.id_mal,item.banner_url]);
  const artwork=image?.anime_id === item.id ? [image.image_url,...(image.alternatives || []).map(entry => entry.image_url)] : [];
  const candidates=Array.from(new Set([matchingBanner(item),...artwork,item.poster_proxy_url,item.poster_url].filter((url):url is string => Boolean(url))));
  const active=candidates[candidate] || "/placeholder-poster.svg";
  return <img key={active} src={active} alt={`الصورة الرسمية — ${item.title}`} data-anime-id={item.id} data-mal-id={item.id_mal} decoding="async" fetchPriority="high" onError={() => {if (candidate<candidates.length) setCandidate(value => value+1);}}/>;
}
