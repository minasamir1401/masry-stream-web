"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
}

export function usePwaInstall() {
  const [, setTick] = useState(0);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const update = () => setTick((t) => t + 1);
    listeners.add(update);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(iosDevice);

    return () => {
      listeners.delete(update);
    };
  }, []);

  const canInstall = !isStandalone && (deferredPrompt !== null || isIOS);

  const promptInstall = async (): Promise<"accepted" | "dismissed" | "ios" | "manual"> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          deferredPrompt = null;
          notify();
          return "accepted";
        }
        return "dismissed";
      } catch {
        return "manual";
      }
    }

    if (isIOS) {
      return "ios";
    }

    return "manual";
  };

  return {
    isStandalone,
    canInstall: !isStandalone,
    hasNativePrompt: deferredPrompt !== null,
    isIOS,
    promptInstall,
  };
}

