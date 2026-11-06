"use client";

import { useEffect } from "react";
import { ShieldAlert, AlertTriangle } from "lucide-react";

interface BannedOverlayProps {
  reason?: string | null;
}

export function BannedOverlay({ reason }: BannedOverlayProps) {
  useEffect(() => {
    // Disable scrolling and freeze audio/video players
    document.body.style.overflow = "hidden";
    try {
      const mediaElements = document.querySelectorAll("video, audio");
      mediaElements.forEach((el) => {
        try {
          (el as HTMLMediaElement).pause();
        } catch {}
      });
    } catch {}

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
    >
      <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-cinema-card p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <h2 className="mt-5 text-xl font-bold text-white">
          تم تعليق وصول هذا الجهاز
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          {reason || "تم حظر هذا الجهاز من قبل إدارة الموقع لمخالفة سياسات الاستخدام أو الاشتباه بأنشطة آلية غير مصرح بها."}
        </p>

        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-950/20 p-3.5 text-xs text-red-300">
          <div className="flex items-center justify-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>الوصول محجوب بالكامل</span>
          </div>
          <p className="mt-1 text-zinc-400">
            تم تقييد تشغيل الوسائط والتصفح. إذا كنت تعتقد أن هذا الإجراء تم عن طريق الخطأ، يرجى مراجعة إدارة المنصة.
          </p>
        </div>
      </div>
    </div>
  );
}
