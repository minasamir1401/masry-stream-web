"use client";

import { Download, Share2, PlusSquare, MoreVertical, X } from "lucide-react";

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
}

export function InstallModal({ isOpen, onClose, isIOS }: InstallModalProps) {
  if (!isOpen) return null;

  return (
    <div className="install-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="install-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="install-modal-close" onClick={onClose} aria-label="إغلاق">
          <X size={18} />
        </button>

        <div className="install-modal-header">
          <div className="install-modal-logo-wrapper">
            <img src="/brand/anime-clover-mark.svg" alt="Anime Clover" width={52} height={52} />
          </div>
          <div>
            <h3>تثبيت تطبيق أنمي كلوفر</h3>
            <p>Anime Clover Application</p>
          </div>
        </div>

        <div className="install-modal-body">
          {isIOS ? (
            <div className="install-steps">
              <p className="install-intro">
                لتثبيت التطبيق على جهاز الآيفون أو الآيباد الخاص بك، اتبع الخطوات البسيطة التالية:
              </p>
              <div className="install-step">
                <span className="step-num">1</span>
                <div className="step-content">
                  <div className="step-title">
                    <Share2 size={16} />
                    <span>اضغط على زر المشاركة</span>
                  </div>
                  <p>اضغط على أيقونة المشاركة في شريط الأدوات السفلي لمتصفح Safari.</p>
                </div>
              </div>

              <div className="install-step">
                <span className="step-num">2</span>
                <div className="step-content">
                  <div className="step-title">
                    <PlusSquare size={16} />
                    <span>اختر "إضافة إلى الشاشة الرئيسية"</span>
                  </div>
                  <p>مرر للأسفل في القائمة واضغط على خيار Add to Home Screen.</p>
                </div>
              </div>

              <div className="install-step">
                <span className="step-num">3</span>
                <div className="step-content">
                  <div className="step-title">
                    <Download size={16} />
                    <span>تأكيد الإضافة</span>
                  </div>
                  <p>اضغط على "إضافة" (Add) في الزاوية العلوية لتثبيت التطبيق بشعار كلوفر الرسمي.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="install-steps">
              <p className="install-intro">
                لتثبيت التطبيق عبر المتصفح على جهاز الكمبيوتر أو الأندرويد:
              </p>
              <div className="install-step">
                <span className="step-num">1</span>
                <div className="step-content">
                  <div className="step-title">
                    <Download size={16} />
                    <span>أيقونة التثبيت في شريط العنوان</span>
                  </div>
                  <p>اضغط على أيقونة التثبيت التي تظهر داخل شريط العنوان (URL) في أعلى المتصفح.</p>
                </div>
              </div>

              <div className="install-step">
                <span className="step-num">2</span>
                <div className="step-content">
                  <div className="step-title">
                    <MoreVertical size={16} />
                    <span>أو من قائمة المتصفح</span>
                  </div>
                  <p>افتح قائمة المتصفح (الثلاث نقاط) واختر "تثبيت Anime Clover" أو "إضافة إلى الشاشة الرئيسية".</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="install-modal-footer">
          <button className="install-modal-btn" onClick={onClose}>
            حسناً، فهمت
          </button>
        </div>
      </div>
    </div>
  );
}

