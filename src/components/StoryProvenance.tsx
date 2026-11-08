import type { MediaItem } from "@/lib/types";

export function StoryProvenance({media}:{media:MediaItem}) {
  if(media.description_ar_kind!=="machine")return null;
  return <span className="story-provenance">ترجمة آلية للملخص الأصلي</span>;
}
