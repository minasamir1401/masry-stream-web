"use client";

import React, { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CornerDownLeft,
  Heart,
  MessageSquare,
  Send,
  Star,
  ThumbsUp,
  User,
} from "lucide-react";
import { getVisitorId } from "@/lib/analytics";

interface CommentItem {
  id: number;
  author_name: string;
  content: string;
  parent_id: number | null;
  likes_count: number;
  is_current_user: boolean;
  created_at: string;
}

interface EpisodeDiscussionProps {
  mediaId: number;
  episodeNumber: number;
  animeTitle: string;
}

export function EpisodeDiscussion({
  mediaId,
  episodeNumber,
  animeTitle,
}: EpisodeDiscussionProps) {
  // Rating states
  const [averageScore, setAverageScore] = useState<number>(0);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [hoverScore, setHoverScore] = useState<number>(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingNotice, setRatingNotice] = useState<string | null>(null);

  // Comments states
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<CommentItem | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadRatings();
    loadComments();
  }, [mediaId, episodeNumber]);

  async function loadRatings() {
    try {
      const vid = getVisitorId();
      const res = await fetch(
        `/api/ratings/${mediaId}/${episodeNumber}?visitor_id=${encodeURIComponent(vid)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setAverageScore(data.average_score || 0);
        setTotalVotes(data.total_votes || 0);
        setUserScore(data.user_score || null);
      }
    } catch {
      // Graceful fallback
    }
  }

  async function handleRate(score: number) {
    if (submittingRating) return;
    setSubmittingRating(true);
    setRatingNotice(null);
    try {
      const vid = getVisitorId();
      const res = await fetch(`/api/ratings/${mediaId}/${episodeNumber}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, visitor_id: vid }),
      });
      if (res.ok) {
        const data = await res.json();
        setAverageScore(data.average_score);
        setTotalVotes(data.total_votes);
        setUserScore(score);
        setRatingNotice(`تم تسجيل تقييمك (${score} من 5) بنجاح`);
        setTimeout(() => setRatingNotice(null), 3500);
      }
    } catch {
      setRatingNotice("تعذر تسجيل التقييم حالياً");
    } finally {
      setSubmittingRating(false);
    }
  }

  async function loadComments() {
    setLoadingComments(true);
    try {
      const vid = getVisitorId();
      const res = await fetch(
        `/api/comments/${mediaId}/${episodeNumber}?visitor_id=${encodeURIComponent(vid)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setComments(data.items || []);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoadingComments(false);
    }
  }

  async function handlePostComment(e: FormEvent) {
    e.preventDefault();
    if (!commentContent.trim() || submittingComment) return;

    setSubmittingComment(true);
    setCommentError(null);
    setCommentSuccess(false);

    try {
      const vid = getVisitorId();
      const name = authorName.trim() || "متابع";
      const body = {
        author_name: name,
        content: commentContent.trim(),
        parent_id: replyingTo ? replyingTo.id : undefined,
        visitor_id: vid,
      };

      const res = await fetch(`/api/comments/${mediaId}/${episodeNumber}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "تعذر نشر التعليق");
      }

      const resData = await res.json();
      if (resData.comment) {
        setComments((prev) => [resData.comment, ...prev]);
        setCommentContent("");
        setReplyingTo(null);
        setCommentSuccess(true);
        setTimeout(() => setCommentSuccess(false), 3000);
      }
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : "فشل نشر التعليق");
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleLikeComment(commentId: number) {
    if (likedMap[commentId]) return;
    setLikedMap((prev) => ({ ...prev, [commentId]: true }));
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, likes_count: c.likes_count + 1 } : c
      )
    );
    try {
      await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
    } catch {
      // Fail silently
    }
  }

  const formatCommentDate = (isoStr: string) => {
    if (!isoStr) return "";
    try {
      const now = Date.now();
      const past = new Date(isoStr).getTime();
      const diffSec = Math.max(0, Math.floor((now - past) / 1000));
      if (diffSec < 60) return "الآن";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      const diffDays = Math.floor(diffHours / 24);
      return `منذ ${diffDays} يوم`;
    } catch {
      return "";
    }
  };

  return (
    <section className="mt-8 rounded-2xl border border-cinema-border bg-cinema-card/90 p-5 sm:p-7 space-y-8 shadow-xl">
      {/* 1. EPISODE RATING WIDGET */}
      <div className="rounded-xl border border-cinema-border/60 bg-cinema-bg/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <h3 className="font-bold text-white text-sm sm:text-base">
                تقييم الحلقة {episodeNumber}
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-cinema-muted">
              شارك رأيك في مستوى إنتاج وأحداث هذه الحلقة
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Average rating label */}
            <div className="text-left">
              <div className="flex items-baseline gap-1 text-amber-400 font-black text-xl">
                <span>{averageScore > 0 ? averageScore.toFixed(1) : "-"}</span>
                <span className="text-xs text-cinema-muted">/ 5</span>
              </div>
              <span className="text-[11px] text-cinema-muted">
                {totalVotes} {totalVotes === 1 ? "تقييم" : "تقييمات"}
              </span>
            </div>

            {/* Stars row */}
            <div className="flex items-center gap-1 border-r border-cinema-border/60 pr-4">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled =
                  hoverScore >= star || (!hoverScore && (userScore || 0) >= star);
                return (
                  <button
                    key={star}
                    type="button"
                    disabled={submittingRating}
                    onMouseEnter={() => setHoverScore(star)}
                    onMouseLeave={() => setHoverScore(0)}
                    onClick={() => handleRate(star)}
                    aria-label={`تقييم ${star} نجوم`}
                    className="p-1 transition transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`h-5 w-5 sm:h-6 sm:w-6 transition ${
                        isFilled
                          ? "fill-amber-400 text-amber-400"
                          : "text-cinema-muted/40 hover:text-amber-400"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {userScore && (
          <div className="mt-2.5 flex items-center justify-between text-xs text-cinema-muted border-t border-cinema-border/40 pt-2">
            <span>
              تقييمك المسجل لهذه الحلقة:{" "}
              <strong className="text-amber-400">{userScore} نجوم</strong>
            </span>
            <span className="text-[11px] text-cinema-muted/80">
              يمكنك النقر على النجوم لتغيير تقييمك في أي وقت
            </span>
          </div>
        )}

        {ratingNotice && (
          <div className="mt-2 text-xs font-semibold text-emerald-400 animate-fadeIn">
            {ratingNotice}
          </div>
        )}
      </div>

      {/* 2. REAL COMMENTS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-cinema-border pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-cinema-accent" />
            <h3 className="font-bold text-white text-base">
              نقاشات ومشاركات المتابعين
            </h3>
            <span className="rounded-full bg-cinema-bg px-2.5 py-0.5 text-xs text-cinema-muted font-mono">
              {comments.length}
            </span>
          </div>
          <span className="text-xs text-cinema-muted">
            التعليقات فورية ومحفوظة
          </span>
        </div>

        {/* Comment Input Form */}
        <form onSubmit={handlePostComment} className="space-y-3">
          {replyingTo && (
            <div className="flex items-center justify-between rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-300">
              <div className="flex items-center gap-1.5">
                <CornerDownLeft className="h-3.5 w-3.5" />
                <span>الرد على: <strong>{replyingTo.author_name}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-cinema-muted hover:text-white"
              >
                إلغاء الرد
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="sm:col-span-1">
              <div className="relative">
                <User className="absolute right-3 top-2.5 h-4 w-4 text-cinema-muted" />
                <input
                  type="text"
                  maxLength={40}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="اسمك (متابع)"
                  className="w-full rounded-xl border border-cinema-border bg-cinema-bg pr-9 pl-3 py-2 text-xs text-white placeholder-cinema-muted focus:outline-none focus:ring-1 focus:ring-cinema-accent"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <input
                type="text"
                required
                maxLength={1000}
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder={
                  replyingTo
                    ? `اكتب ردك على ${replyingTo.author_name}...`
                    : "اكتب رأيك أو تعليقك حول أحداث الحلقة..."
                }
                className="w-full rounded-xl border border-cinema-border bg-cinema-bg px-3.5 py-2 text-xs text-white placeholder-cinema-muted focus:outline-none focus:ring-1 focus:ring-cinema-accent"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-cinema-muted">
              شارك باحترام وبدون حرق لأحداث الحلقات القادمة.
            </span>
            <button
              type="submit"
              disabled={submittingComment || !commentContent.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-cinema-accent px-4 py-2 text-xs font-bold text-white hover:brightness-110 transition disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submittingComment ? "جاري النشر..." : "نشر التعليق"}</span>
            </button>
          </div>

          {commentSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold pt-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>تم نشر تعليقك وحفظه بنجاح</span>
            </div>
          )}

          {commentError && (
            <div className="flex items-center gap-1.5 text-xs text-red-400 font-semibold pt-1">
              <AlertCircle className="h-4 w-4" />
              <span>{commentError}</span>
            </div>
          )}
        </form>

        {/* Comments Feed */}
        <div className="space-y-3 pt-2">
          {loadingComments ? (
            <p className="py-6 text-center text-xs text-cinema-muted">
              جاري تحميل التعليقات...
            </p>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`rounded-xl border p-4 transition space-y-2 ${
                  comment.is_current_user
                    ? "border-purple-500/30 bg-purple-500/5"
                    : "border-cinema-border/60 bg-cinema-bg/40 hover:bg-cinema-bg/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cinema-accent/20 text-cinema-accent text-xs font-bold">
                      {comment.author_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-white text-xs">
                      {comment.author_name}
                    </span>
                    {comment.is_current_user && (
                      <span className="rounded-md bg-cinema-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-cinema-accent">
                        أنت
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-cinema-muted font-mono">
                    {formatCommentDate(comment.created_at)}
                  </span>
                </div>

                <p className="text-xs text-cinema-muted leading-relaxed whitespace-pre-wrap pr-9">
                  {comment.content}
                </p>

                <div className="flex items-center justify-end gap-3 pt-1 border-t border-cinema-border/30 pr-9">
                  <button
                    type="button"
                    onClick={() => handleLikeComment(comment.id)}
                    className={`inline-flex items-center gap-1 text-[11px] transition ${
                      likedMap[comment.id]
                        ? "text-pink-400 font-bold"
                        : "text-cinema-muted hover:text-pink-400"
                    }`}
                  >
                    <Heart
                      className={`h-3.5 w-3.5 ${
                        likedMap[comment.id] ? "fill-pink-400" : ""
                      }`}
                    />
                    <span>{comment.likes_count}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(comment);
                      setAuthorName((prev) => prev || "");
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-cinema-muted hover:text-white transition"
                  >
                    <CornerDownLeft className="h-3 w-3" />
                    <span>رد</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-cinema-border/50 py-8 text-center space-y-1">
              <MessageSquare className="mx-auto h-6 w-6 text-cinema-muted/40" />
              <p className="text-xs font-bold text-white">لا توجد تعليقات بعد</p>
              <p className="text-[11px] text-cinema-muted">
                كن أول من يشارك برأيه حول أحداث الحلقة {episodeNumber} من {animeTitle}!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
