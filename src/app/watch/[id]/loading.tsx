import { RefreshCw } from "lucide-react";

export default function WatchLoading() {
  return <div className="watch-experience" role="status" aria-busy="true">
    <div className="h-8 w-1/2 rounded-lg bg-white/5 animate-pulse mb-6" />
    <div className="aspect-video rounded-2xl border border-cinema-border bg-cinema-card flex items-center justify-center gap-3">
      <RefreshCw className="h-6 w-6 animate-spin text-cinema-accent" />جارٍ الانتقال للحلقة...
    </div>
  </div>;
}
