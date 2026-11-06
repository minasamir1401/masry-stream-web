"use client";

import { useEffect, useState, FormEvent } from "react";
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { getVisitorId } from "@/lib/analytics";

interface SecurityChallengeModalProps {
  onSolved: () => void;
}

interface ChallengeData {
  question: string;
  num1: number;
  num2: number;
  operator: string;
  token: string;
}

export function SecurityChallengeModal({ onSolved }: SecurityChallengeModalProps) {
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  async function fetchChallenge() {
    setLoading(true);
    setErrorMessage(null);
    setAnswer("");
    try {
      const vid = getVisitorId();
      const res = await fetch(`/api/security/challenge?vid=${encodeURIComponent(vid)}`);
      if (!res.ok) throw new Error("تعذر تحميل مسألة التحقق");
      const data = await res.json();
      setChallenge(data);
    } catch {
      setErrorMessage("تعذر الاتصال بخادم الحماية، يرجى إعادة المحاولة");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchChallenge();
    // Disable background scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!challenge || !answer.trim()) return;

    const parsedAnswer = parseInt(answer.trim(), 10);
    if (isNaN(parsedAnswer)) {
      setErrorMessage("يرجى إدخال رقم صحيح كإجابة");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const vid = getVisitorId();
      const res = await fetch("/api/security/verify-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitor_id: vid,
          answer: parsedAnswer,
          token: challenge.token,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data?.detail || "الإجابة غير صحيحة، يرجى المحاولة مرة أخرى");
        fetchChallenge();
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          onSolved();
        }, 1200);
      }
    } catch {
      setErrorMessage("حدث خطأ أثناء إرسال التحقق، يرجى إعادة المحاولة");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
    >
      <div className="w-full max-w-md rounded-2xl border border-cinema-border bg-cinema-card p-6 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
          <ShieldCheck className="h-7 w-7" />
        </div>

        <h2 className="mt-4 text-center text-lg font-bold text-white">
          تحقق أمني مطلوب
        </h2>

        <p className="mt-2 text-center text-xs text-cinema-muted leading-relaxed">
          طلب مشرف المنصة إجراء تحقق سريع للتأكد من هوية المتصفح. يرجى حل المسألة الحسابية التالية للمتابعة.
        </p>

        {isSuccess ? (
          <div className="mt-6 flex flex-col items-center justify-center py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-bold text-emerald-400">
              تم التحقق بنجاح، جاري استئناف الجلسة...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-6 text-cinema-muted">
                <RefreshCw className="h-6 w-6 animate-spin text-cinema-accent" />
                <span className="mt-2 text-xs">جاري تجهيز مسألة التحقق...</span>
              </div>
            ) : challenge ? (
              <div className="rounded-xl border border-cinema-border bg-cinema-bg p-4 text-center">
                <div className="text-xs text-cinema-muted">ما هو ناتج:</div>
                <div className="mt-2 text-2xl font-black text-amber-400 tracking-wider">
                  {challenge.num1} {challenge.operator} {challenge.num2} = ؟
                </div>
              </div>
            ) : null}

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!loading && (
              <>
                <div>
                  <label htmlFor="challenge-answer" className="block text-xs font-medium text-cinema-muted mb-1.5">
                    اكتب الناتج بالأرقام:
                  </label>
                  <input
                    id="challenge-answer"
                    type="number"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="الناتج..."
                    autoFocus
                    required
                    className="w-full rounded-xl border border-cinema-border bg-cinema-bg px-4 py-2.5 text-center text-base font-bold text-white placeholder-cinema-muted focus:outline-none focus:ring-2 focus:ring-cinema-accent"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !answer.trim()}
                    className="flex-1 rounded-xl bg-cinema-accent px-4 py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 transition"
                  >
                    {submitting ? "جاري التحقق..." : "تأكيد الحل والمتابعة"}
                  </button>

                  <button
                    type="button"
                    onClick={fetchChallenge}
                    title="تغيير المسألة"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-cinema-border bg-cinema-bg text-cinema-muted hover:text-white transition"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
