"use client";

import { BRAND_MARK, SITE_BRAND } from "@/lib/brand";
import { useState } from "react";
import { Download } from "lucide-react";
import { usePwaInstall } from "@/lib/usePwaInstall";
import { InstallModal } from "./InstallModal";

export function InstallNavButton() {
  const { isStandalone, promptInstall, isIOS } = usePwaInstall();
  const [modalOpen, setModalOpen] = useState(false);

  if (isStandalone) return null;

  const handleClick = async () => {
    const result = await promptInstall();
    if (result === "ios" || result === "manual") {
      setModalOpen(true);
    }
  };

  return (
    <>
      <button
        className="app-install-nav-btn"
        onClick={handleClick}
        aria-label="تثبيت التطبيق على جهازك"
        title={`تثبيت تطبيق ${SITE_BRAND}`}
      >
        <span className="install-nav-icon-wrapper">
          <img src={BRAND_MARK} alt="" width={16} height={16} />
        </span>
        <Download size={15} />
        <span className="install-nav-label">تثبيت التطبيق</span>
      </button>

      <InstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} isIOS={isIOS} />
    </>
  );
}

