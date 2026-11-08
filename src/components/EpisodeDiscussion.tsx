"use client";

import React, { FormEvent, useEffect, useId, useState } from "react";
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
import "./episode-discussion.css";
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
  const formId = useId();
  const [commentsError,setCommentsError] = useState("");
  // Rating states
  const [averageScore, setAverageScore] = useState<number>(0);
  const [ratingLoading,setRatingLoading] = useState(true);
  const [ratingUnavailable,setRatingUnavailable] = useState(false);
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
    setRatingLoading(true);
    try {
      const vid = getVisitorId();
      const res = await fetch(
        `/api/ratings/${mediaId}/${episodeNumber}?visitor_id=${encodeURIComponent(vid)}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("ratings");
      if (res.ok) {
        const data = await res.json();
        setAverageScore(data.average_score || 0);
        setTotalVotes(data.total_votes || 0);
        setUserScore(data.user_score || null);
      }
    } catch {
      setRatingUnavailable(true);
    } finally {
      setRatingLoading(false);
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
      if (!res.ok) throw new Error("rate");
      if (res.ok) {
        const data = await res.json();
        setAverageScore(data.average_score);
        setTotalVotes(data.total_votes);
        setUserScore(score);
        setRatingUnavailable(false);
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
    setCommentsError("");
    try {
      const vid = getVisitorId();
      const res = await fetch(
        `/api/comments/${mediaId}/${episodeNumber}?visitor_id=${encodeURIComponent(vid)}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("comments");
      if (res.ok) {
        const data = await res.json();
        setComments(data.items || []);
      }
    } catch {
      setCommentsError("تعذّر تحميل التعليقات الآن.");
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
      setCommentError("تعذّر نشر التعليق. كلامك لسه موجود؛ جرّب مرة تانية.");
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleLikeComment(commentId: number) {
    if (likedMap[commentId]) return;
    setCommentError(null);
    setLikedMap((prev) => ({ ...prev, [commentId]: true }));
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, likes_count: c.likes_count + 1 } : c
      )
    );
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
      if (!response.ok) throw new Error("like");
    } catch {
      setLikedMap(previous => ({...previous,[commentId]:false}));
      setComments(previous=>previous.map(item=>item.id===commentId?{...item,likes_count:Math.max(0,item.likes_count-1)}:item));
      setCommentError("تعذّر تسجيل الإعجاب. جرّب مرة تانية.");
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

  return <section className="episode-community" aria-label={`التقييم والنقاش — الحلقة ${episodeNumber}`}>
    <section className="episode-rating-card" aria-labelledby={`${formId}-rating`}>
      <div className="episode-rating-heading"><span className="community-icon"><Star size={20}/></span><div><h2 id={`${formId}-rating`}>إيه رأيك في الحلقة {episodeNumber}؟</h2><p>تقييمك يساعد متابعين تانيين يختاروا حكايتهم.</p></div></div>
      <div className="episode-rating-body"><div className="episode-rating-average" aria-live="polite">{ratingLoading?<span>بنحمّل التقييمات...</span>:ratingUnavailable?<span>التقييمات غير متاحة مؤقتًا</span>:totalVotes>0?<><strong><bdi>{averageScore.toFixed(1)}</bdi><small>من ٥</small></strong><span>{totalVotes.toLocaleString("ar-EG")} تقييم</span></>:<><strong className="rating-no-votes">لسه مفيش تقييم</strong><span>كن أول من يشارك رأيه</span></>}</div>
        <fieldset className="episode-rating-picker" disabled={submittingRating}><legend>{userScore?`تقييمك: ${userScore} من ٥`:"اختَر تقييمك"}</legend><div className="episode-rating-stars" dir="ltr" onMouseLeave={()=>setHoverScore(0)}>{[1,2,3,4,5].map(score=><label key={score} className={(hoverScore||userScore||0)>=score?"is-filled":""} onMouseEnter={()=>setHoverScore(score)}><input type="radio" name={`${formId}-score`} value={score} checked={userScore===score} onChange={()=>handleRate(score)} aria-label={`${score} من 5 نجوم`}/><Star size={26} aria-hidden="true"/></label>)}</div>{submittingRating&&<span className="rating-saving" role="status">جارٍ الحفظ...</span>}</fieldset>
      </div>
      {ratingNotice&&<p className={`community-notice ${ratingNotice.includes("تعذر")?"error":"success"}`} role="status">{ratingNotice}</p>}
    </section>
    <section className="episode-comments-card" aria-labelledby={`${formId}-comments`}>
      <div className="episode-comments-heading"><div><MessageSquare size={21}/><h2 id={`${formId}-comments`}>نتكلم عن الحلقة</h2>{!loadingComments&&<span className="community-count">{comments.length.toLocaleString("ar-EG")}</span>}</div><p>شارك رأيك من غير حرق للحلقات الجاية.</p></div>
      <form className="episode-comment-form" onSubmit={handlePostComment}>
        {replyingTo&&<div className="community-replying"><span><CornerDownLeft size={15}/>بترد على <bdi>{replyingTo.author_name}</bdi></span><button type="button" onClick={()=>setReplyingTo(null)}>إلغاء الرد</button></div>}
        <label className="community-name" htmlFor={`${formId}-name`}><span>اسمك <small>اختياري</small></span><input id={`${formId}-name`} aria-label="اسمك اختياري" maxLength={40} value={authorName} onChange={event=>setAuthorName(event.target.value)} placeholder="متابع" autoComplete="nickname"/></label>
        <label className="community-comment-label" htmlFor={`${formId}-content`}>{replyingTo?`ردك على ${replyingTo.author_name}`:"تعليقك"}<textarea id={`${formId}-content`} aria-label={replyingTo?`ردك على ${replyingTo.author_name}`:"تعليقك"} required maxLength={1000} value={commentContent} onChange={event=>{setCommentContent(event.target.value);setCommentSuccess(false);}} placeholder="إيه اللي عجبك في الحلقة؟" rows={4}/></label>
        <div className="community-form-bottom"><span>{commentContent.length.toLocaleString("ar-EG")} / ١٬٠٠٠ حرف</span><button type="submit" className="community-submit" disabled={submittingComment||!commentContent.trim()}><Send size={17}/>{submittingComment?"جارٍ النشر...":replyingTo?"نشر الرد":"نشر التعليق"}</button></div>
        {commentSuccess&&<p className="community-notice success" role="status"><CheckCircle2 size={15}/>تم نشر تعليقك.</p>}{commentError&&<p className="community-notice error" role="alert"><AlertCircle size={15}/>{commentError}</p>}
      </form>
      <div className="episode-comment-feed" aria-busy={loadingComments}>{loadingComments?<p className="community-empty" role="status">بنحمّل التعليقات...</p>:commentsError?<div className="community-empty"><AlertCircle size={24}/><p role="alert">{commentsError}</p><button type="button" onClick={loadComments}>إعادة المحاولة</button></div>:comments.length?comments.map(comment=><article className={`episode-comment ${comment.is_current_user?"is-own":""}`} key={comment.id}>
        <header><span className="community-avatar" aria-hidden="true">{comment.author_name.charAt(0)}</span><div><strong><bdi>{comment.author_name}</bdi>{comment.is_current_user&&<small>أنت</small>}</strong><time dateTime={comment.created_at}>{formatCommentDate(comment.created_at)}</time></div></header>
        {comment.parent_id&&<span className="comment-reply-context"><CornerDownLeft size={13}/>رد على تعليق سابق</span>}<p dir="auto">{comment.content}</p>
        <div className="community-comment-actions"><button type="button" onClick={()=>handleLikeComment(comment.id)} aria-pressed={!!likedMap[comment.id]} aria-label={`إعجاب بتعليق ${comment.author_name}`}><Heart size={16} fill={likedMap[comment.id]?"currentColor":"none"}/>{comment.likes_count.toLocaleString("ar-EG")}</button><button type="button" onClick={()=>{setReplyingTo(comment);document.getElementById(`${formId}-content`)?.focus();}}><CornerDownLeft size={16}/>رد</button></div>
      </article>):<div className="community-empty"><MessageSquare size={27}/><strong>ابدأ الحكاية بأول تعليق</strong><p>شارك رأيك في الحلقة {episodeNumber} من <bdi>{animeTitle}</bdi>.</p></div>}</div>
    </section>
  </section>;
}
