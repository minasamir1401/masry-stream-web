"use client";

import { BRAND_MARK, SITE_BRAND } from "@/lib/brand";
import { useEffect, useState } from "react";
import { Download, Sparkles, X } from "lucide-react";
import { usePwaInstall } from "@/lib/usePwaInstall";
import { InstallModal } from "./InstallModal";

export function InstallAppBanner() {
  const { isStandalone, promptInstall, isIOS } = usePwaInstall();
  const [dismissed, setDismissed] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDismissed = localStorage.getItem("clover_install_dismissed");
      if (!isDismissed) {
        setDismissed(false);
      }
    }
  }, []);

  if (isStandalone || dismissed) return null;

  const handleInstallClick = async () => {
    const result = await promptInstall();
    if (result === "ios" || result === "manual") {
      setModalOpen(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("clover_install_dismissed", "1");
    }
  };

  return (
    <>
      <div className="install-banner-wrapper" role="region" aria-label={`تثبيت تطبيق ${SITE_BRAND}`}>
        <div className="install-banner-card">
          <div className="install-banner-side">
            <div className="install-banner-logo-box">
              <img
                src={BRAND_MARK}
                alt={`شعار ${SITE_BRAND}`}
                width={54}
                height={54}
                className="install-banner-logo"
              />
            </div>
            <div className="install-banner-text">
              <div className="install-banner-badge">
                <Sparkles size={13} />
                <span>تطبيق خفيف وسريع</span>
              </div>
              <h3 className="install-banner-title">تطبيق <bdi>{SITE_BRAND}</bdi> على جهازك</h3>
              <p className="install-banner-desc">
                ثبّت التطبيق الآن للوصول المباشر ومشاهدة جميع مسلسلات وأفلام الأنمي بملء الشاشة بدون شريط المتصفح.
              </p>
            </div>
          </div>

          <div className="install-banner-actions">
            <button className="install-banner-primary-btn" onClick={handleInstallClick}>
              <Download size={18} />
              <span>تثبيت التطبيق</span>
            </button>
            <button
              className="install-banner-close-btn"
              onClick={handleDismiss}
              aria-label="إغلاق التنبيه"
              title="إغلاق"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      <InstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} isIOS={isIOS} />
    </>
  );
}

