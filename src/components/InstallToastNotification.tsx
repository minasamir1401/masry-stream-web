"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, Bell, X } from "lucide-react";
import { usePwaInstall } from "@/lib/usePwaInstall";
import { InstallModal } from "./InstallModal";

const DISMISS_KEY = "clover_pwa_notify_dismissed_at";
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export function InstallToastNotification() {
  const watching = usePathname().startsWith("/watch/");
  const { isStandalone, promptInstall, isIOS } = usePwaInstall();
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const checkEligibility = () => {
    if (isStandalone) return false;
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (!raw) return true;
      const timestamp = parseInt(raw, 10);
      if (isNaN(timestamp)) return true;
      return Date.now() - timestamp >= COOLDOWN_MS;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    if (isStandalone || watching) {
      setVisible(false);
      setModalOpen(false);
      return;
    }

    // Let visitors explore before suggesting installation.
    const initialTimer = setTimeout(() => {
      if (checkEligibility()) {
        setVisible(true);
      }
    }, 30000);

    return () => {
      clearTimeout(initialTimer);
    };
  }, [isStandalone, watching]);

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {}
  };

  const handleInstallClick = async () => {
    const result = await promptInstall();
    if (result === "ios" || result === "manual") {
      setModalOpen(true);
    }
    if (result === "accepted") {
      setVisible(false);
    }
  };

  if (!visible || isStandalone || watching) {
    return <InstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} isIOS={isIOS} />;
  }

  return (
    <>
      <aside
        className="pwa-toast-notification"
        role="alert"
        aria-live="polite"
        aria-label="إشعار تثبيت تطبيق أنمي كلوفر"
      >
        <div className="pwa-toast-card">
          <button
            className="pwa-toast-close"
            onClick={handleDismiss}
            aria-label="إغلاق الإشعار"
            title="إغلاق التنبيه"
          >
            <X size={16} />
          </button>

          <div className="pwa-toast-content">
            <div className="pwa-toast-logo-box">
              <img
                src="/brand/anime-clover-mark.svg"
                alt="شعار Anime Clover"
                width={44}
                height={44}
                className="pwa-toast-logo"
              />
              <span className="pwa-toast-pulse" aria-hidden="true" />
            </div>

            <div className="pwa-toast-details">
              <div className="pwa-toast-badge">
                <Bell size={11} />
                <span>إشعار من أنمي كلوفر</span>
              </div>
              <h4 className="pwa-toast-title">تطبيق Anime Clover جاهز للتثبيت</h4>
              <p className="pwa-toast-text">
                حمّل التطبيق على جهازك الآن لمشاهدة فورية بملء الشاشة، سرعة فائقة، وبدون متصفح.
              </p>
            </div>
          </div>

          <div className="pwa-toast-actions">
            <button className="pwa-toast-install-btn" onClick={handleInstallClick}>
              <Download size={15} />
              <span>تثبيت التطبيق الآن</span>
            </button>
            <button className="pwa-toast-later-btn" onClick={handleDismiss}>
              لاحقاً
            </button>
          </div>
        </div>
      </aside>

      <InstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} isIOS={isIOS} />
    </>
  );
}

