import { BookOpen, ChevronLeft } from "lucide-react";
import type { MediaItem } from "@/lib/types";
import { arabicSummary } from "@/lib/content";
import { StoryProvenance } from "./StoryProvenance";

export function WatchSynopsis({media}:{media:MediaItem}) {
  return <details className="watch-synopsis"><summary><BookOpen size={15}/>عن الحكاية<ChevronLeft size={14}/></summary><p lang="ar" dir="rtl">{arabicSummary(media)}</p><StoryProvenance media={media}/></details>;
}
