import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "wouter";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Send,
  Share2,
  Star,
  Calendar,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCat,
  decodeName,
  decodeCity,
  decodeImgs,
} from "@/components/SuggestModal";
import { UserProfileModal } from "@/components/UserProfileModal";
import { PostLikesModal } from "@/components/PostLikesModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToken = () =>
  localStorage.getItem("motohippi_token") ||
  sessionStorage.getItem("motohippi_token") ||
  "";

const getApiBase = () => {
  const base =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:3001";
  return base.replace(/\/api\/?$/, "").replace(/\/+$/, "");
};

const authFetch = (url: string, opts: RequestInit = {}) => {
  const cleanBase = getApiBase();
  const fullUrl = url.startsWith("http")
    ? url
    : `${cleanBase}${url.startsWith("/api") ? url : `/api${url}`}`;
  const token = getToken();
  return fetch(fullUrl, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  });
};

function timeAgo(iso?: string) {
  if (!iso) return "";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (Number.isNaN(s)) return "";
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function formatFullDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PostDetail() {
  const params = useParams<{ postId: string }>();
  const postId = Number(params.postId);
  const isValidId = Number.isInteger(postId) && postId > 0;

  const [, navigate] = useLocation();
  const { isLoggedIn, user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [imgIdx, setImgIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [liking, setLiking] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showLikesModal, setShowLikesModal] = useState(false);

  const commentsSectionRef = useRef<HTMLDivElement | null>(null);
  const commentInputRef = useRef<HTMLInputElement | null>(null);

  // Pull cached post from feed if available so navigation feels instant
  const cachedPostFromFeed = (() => {
    if (!isValidId) return undefined;
    const feed = queryClient.getQueryData<any>(["/api/feed"]);
    return feed?.posts?.find((p: any) => p.id === postId);
  })();

  const {
    data: post,
    isLoading: isPostLoading,
    isError: isPostError,
  } = useQuery({
    queryKey: ["/api/posts", postId],
    queryFn: async () => {
      const res = await authFetch(`/api/posts/${postId}`);
      if (!res.ok) {
        throw new Error(res.status === 404 ? "Post not found" : "Failed to load post");
      }
      return res.json();
    },
    enabled: isValidId,
    initialData: cachedPostFromFeed,
    retry: false,
  });

  const { data: comments = [], isLoading: isCommentsLoading } = useQuery<any[]>({
    queryKey: ["/api/posts", postId, "comments"],
    queryFn: async () => {
      const res = await authFetch(`/api/posts/${postId}/comments`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: isValidId && !!post,
  });

  // Sync local optimistic like state with fetched post
  useEffect(() => {
    if (post) {
      setLiked(!!post.isLiked);
      setLikesCount(post.likesCount ?? 0);
    }
  }, [post?.id, post?.isLiked, post?.likesCount]);

  // Reset image index & scroll to top when opening a post (unless jumping to #comments)
  useEffect(() => {
    setImgIdx(0);
    if (typeof window !== "undefined" && window.location.hash !== "#comments") {
      window.scrollTo(0, 0);
      const mainEl = document.querySelector("main");
      if (mainEl) mainEl.scrollTop = 0;
    }
  }, [postId]);

  // Scroll to comments if navigated with #comments
  useEffect(() => {
    if (!post) return;
    if (typeof window !== "undefined" && window.location.hash === "#comments") {
      const timer = setTimeout(() => {
        commentsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        commentInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [post?.id]);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/feed");
    }
  };

  const handleLike = async () => {
    if (!post) return;
    if (!getToken()) {
      toast({
        title: "Sign in required",
        description: "Join MotoHippi to like spots and connect with riders.",
      });
      return;
    }
    if (liking) return;

    setLiking(true);
    const next = !liked;
    setLiked(next);
    setLikesCount((c) => Math.max(0, c + (next ? 1 : -1)));

    try {
      await authFetch(`/api/posts/${post.id}/like`, { method: "POST" });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId] });
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
    } catch {
      // revert on failure
      setLiked(!next);
      setLikesCount((c) => Math.max(0, c + (next ? -1 : 1)));
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    if (!post) return;
    const placeName = decodeName(post.location);
    const postUrl = `${window.location.origin}/feed/${post.id}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: placeName || "MotoHippi Spot",
          text: post.content?.slice(0, 120) || undefined,
          url: postUrl,
        });
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(postUrl);
      toast({
        title: "Link copied!",
        description: "Direct post link copied to clipboard.",
      });
    } catch {
      toast({
        title: "Share failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleSendComment = async () => {
    if (!post || !commentText.trim() || sendingComment) return;
    if (!getToken()) {
      toast({
        title: "Sign in required",
        description: "Join or log in to MotoHippi to post comments!",
      });
      return;
    }

    setSendingComment(true);
    try {
      const res = await authFetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: commentText.trim() }),
      });

      if (res.ok) {
        const created = await res.json();
        queryClient.setQueryData<any[]>(
          ["/api/posts", postId, "comments"],
          (prev = []) => [created, ...prev],
        );
        setCommentText("");
        queryClient.invalidateQueries({ queryKey: ["/api/posts", postId] });
        queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      } else {
        toast({
          title: "Could not post comment",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Network error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setSendingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post || deleting) return;
    setDeleting(true);
    try {
      const res = await authFetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
        queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "posts"] });
        toast({ title: "Post deleted" });
        navigate("/feed");
      } else {
        toast({
          title: "Failed to delete post",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Failed to delete post",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  // ── Invalid / Not Found State ──
  if (!isValidId || (!isPostLoading && (isPostError || !post))) {
    return (
      <div className="min-h-screen bg-[#070A0F] text-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h1 className="text-xl font-black text-white">Post not found</h1>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
          This story may have been removed or the link is invalid.
        </p>
        <Link href="/feed">
          <button
            type="button"
            className="mt-6 px-6 py-2.5 rounded-full bg-primary text-black text-sm font-black hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Back to Stories
          </button>
        </Link>
      </div>
    );
  }

  // ── Loading State ──
  if (isPostLoading && !post) {
    return (
      <div className="min-h-screen bg-[#070A0F] text-white">
        <div className="sticky top-0 z-30 bg-[#070A0F]/90 backdrop-blur-xl border-b border-white/8 px-4 h-14 flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full bg-white/10" />
          <Skeleton className="h-4 w-40 rounded-full bg-white/10" />
        </div>
        <div className="max-w-5xl mx-auto p-4 md:p-6 grid lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-7 h-80 md:h-[480px] rounded-3xl bg-white/10" />
          <div className="lg:col-span-5 space-y-4">
            <Skeleton className="h-14 w-full rounded-2xl bg-white/10" />
            <Skeleton className="h-28 w-full rounded-2xl bg-white/10" />
            <Skeleton className="h-48 w-full rounded-2xl bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  const images = decodeImgs(post.imageUrl);
  const placeName = decodeName(post.location);
  const placeCity = decodeCity(post.location);
  const catId = (post.hashtags as string[])?.[0] ?? "all";
  const cat = getCat(catId);
  const ratingTag = ((post.hashtags as string[]) ?? []).find(
    (h: string) => typeof h === "string" && h.startsWith("rating:"),
  );
  const ratingVal = ratingTag ? Number(ratingTag.split(":")[1]) : null;
  const tags = ((post.hashtags as string[]) ?? [])
    .slice(1)
    .filter((h: string) => typeof h === "string" && !h.startsWith("rating:"));

  const isAuthor = isLoggedIn && user?.id && (post.author?.id === user.id || post.authorId === user.id);
  const authorId = post.author?.id || post.userId;
  const displayCommentsCount = Math.max(post.commentsCount ?? 0, comments.length);

  return (
    <div className="min-h-screen bg-[#070A0F] text-foreground flex flex-col">
      {/* ── Sticky Post Sub-Header ── */}
      <div className="sticky top-0 z-30 bg-[#070A0F]/90 backdrop-blur-xl border-b border-white/8">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={handleBack}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors shrink-0 cursor-pointer"
              aria-label="Back to Stories"
            >
              <ArrowLeft size={17} />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-white truncate">
                {placeName || "Story"}
              </h1>
              {placeCity && (
                <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                  <MapPin size={10} className="text-primary shrink-0" />
                  {placeCity}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAuthor && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
                title="Delete post"
                aria-label="Delete post"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Share post"
              aria-label="Share post"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 md:py-6 pb-28 md:pb-10">
        <div
          className={`grid gap-5 md:gap-6 ${
            images.length > 0 || post.videoUrl
              ? "lg:grid-cols-12 items-start"
              : "max-w-2xl mx-auto"
          }`}
        >
          {/* ── Left: Media Gallery (if images or video exist) ── */}
          {(images.length > 0 || post.videoUrl) && (
            <div className="lg:col-span-7">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                {post.videoUrl ? (
                  <video
                    src={post.videoUrl}
                    controls
                    playsInline
                    className="w-full max-h-[70vh] object-contain bg-black"
                  />
                ) : (
                  <div className="relative flex items-center justify-center bg-black min-h-[260px] max-h-[75vh]">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={imgIdx}
                        src={images[imgIdx]}
                        alt={placeName || "MotoHippi post"}
                        className="w-full max-h-[75vh] object-contain block"
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0.3 }}
                        transition={{ duration: 0.2 }}
                      />
                    </AnimatePresence>

                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          disabled={imgIdx === 0}
                          onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white backdrop-blur-md disabled:opacity-25 hover:bg-black/90 transition-all cursor-pointer"
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          disabled={imgIdx === images.length - 1}
                          onClick={() =>
                            setImgIdx((i) => Math.min(images.length - 1, i + 1))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white backdrop-blur-md disabled:opacity-25 hover:bg-black/90 transition-all cursor-pointer"
                          aria-label="Next image"
                        >
                          <ChevronRight size={18} />
                        </button>

                        {/* Counter pill */}
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 border border-white/15 text-[11px] font-bold text-white backdrop-blur-md">
                          {imgIdx + 1} / {images.length}
                        </div>

                        {/* Dot indicators */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md">
                          {images.map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setImgIdx(i)}
                              aria-label={`View image ${i + 1}`}
                              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                i === imgIdx
                                  ? "w-4 bg-primary"
                                  : "w-1.5 bg-white/45 hover:bg-white/75"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Right / Below: Author, Caption, Details & Comments ── */}
          <div
            className={`${
              images.length > 0 || post.videoUrl ? "lg:col-span-5" : "w-full"
            } space-y-4`}
          >
            {/* Details Card */}
            <div className="rounded-2xl sm:rounded-3xl bg-[#111317] border border-white/10 p-4 sm:p-5 space-y-4">
              {/* Author Row */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => authorId && setSelectedUserId(authorId)}
                  className="flex items-center gap-3 min-w-0 text-left group cursor-pointer"
                >
                  <Avatar className="w-10 h-10 shrink-0 ring-1 ring-white/20 group-hover:ring-primary/60 transition-all">
                    <AvatarImage src={post.author?.avatarUrl} />
                    <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">
                      {post.author?.name?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-white truncate group-hover:text-primary transition-colors">
                      {post.author?.name || "Rider"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {post.author?.username ? `@${post.author.username} · ` : ""}
                      {timeAgo(post.createdAt)}
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black border"
                    style={{
                      color: cat.color,
                      background: cat.bg,
                      borderColor: cat.border,
                    }}
                  >
                    <cat.Icon size={11} strokeWidth={2.5} />
                    <span>{cat.label}</span>
                  </div>

                  {ratingVal && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-black bg-amber-400/10 border border-amber-400/30 text-amber-400">
                      <Star size={11} className="fill-amber-400" />
                      <span>{ratingVal.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Place Title & City */}
              {(placeName || placeCity) && (
                <div className="space-y-1">
                  {placeName && (
                    <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                      {placeName}
                    </h2>
                  )}
                  {placeCity && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                      <MapPin size={13} className="text-primary shrink-0" />
                      <span>{placeCity}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Full Caption */}
              {post.content && (
                <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap break-words">
                  {post.content}
                </p>
              )}

              {/* Hashtags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Full Timestamp */}
              {post.createdAt && (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                  <Calendar size={12} className="shrink-0" />
                  <span>Posted {formatFullDate(post.createdAt)}</span>
                </div>
              )}

              {/* Engagement Bar */}
              <div className="pt-3 border-t border-white/8 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.88 }}
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      liked
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "bg-white/5 border-white/10 text-white/85 hover:bg-white/10"
                    }`}
                  >
                    <Heart size={15} className={liked ? "fill-primary" : ""} />
                    <span>{liked ? "Liked" : "Like"}</span>
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setShowLikesModal(true)}
                    className="px-2.5 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    title="See who liked this post"
                  >
                    {likesCount} {likesCount === 1 ? "like" : "likes"}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      commentsSectionRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                      commentInputRef.current?.focus();
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/85 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <MessageCircle size={15} />
                    <span>{displayCommentsCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/85 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Share2 size={15} />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ── Comments Card ── */}
            <div
              id="comments"
              ref={commentsSectionRef}
              className="rounded-2xl sm:rounded-3xl bg-[#111317] border border-white/10 overflow-hidden"
            >
              <div className="px-4 sm:px-5 py-3.5 border-b border-white/8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} className="text-primary" />
                  <h3 className="text-sm font-black text-white">
                    Comments & Community Tips
                  </h3>
                </div>
                <span className="text-xs font-bold text-muted-foreground">
                  {displayCommentsCount}
                </span>
              </div>

              {/* Guest Sign-in Nudge */}
              {!isLoggedIn && (
                <div className="mx-4 mt-4 p-3 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-primary flex items-center gap-1">
                      <Sparkles size={12} /> Join the conversation
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Log in to like or leave a tip for riders.
                    </p>
                  </div>
                  <Link href="/login">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-full bg-primary text-black text-xs font-black shrink-0 cursor-pointer"
                    >
                      Log In
                    </button>
                  </Link>
                </div>
              )}

              {/* Comments List */}
              <div className="p-4 sm:p-5 space-y-3 max-h-[460px] overflow-y-auto">
                {isCommentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-2xl bg-white/10" />
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                    <MessageCircle size={26} className="opacity-25" />
                    <p className="text-sm font-semibold text-white/70">
                      No comments yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Be the first to share a tip or ask about this spot!
                    </p>
                  </div>
                ) : (
                  comments.map((c: any) => {
                    const cAuthorId = c.author?.id || c.userId;
                    return (
                      <div key={c.id} className="flex gap-3">
                        <Avatar
                          onClick={() => cAuthorId && setSelectedUserId(cAuthorId)}
                          className="w-8 h-8 shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
                          title="View rider profile"
                        >
                          <AvatarImage src={c.author?.avatarUrl} />
                          <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-bold">
                            {c.author?.name?.charAt(0) ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 bg-white/[0.04] border border-white/[0.06] rounded-2xl px-3.5 py-2.5">
                          <div className="flex items-baseline justify-between gap-2 mb-0.5">
                            <p
                              onClick={() => cAuthorId && setSelectedUserId(cAuthorId)}
                              className="text-xs font-black text-white hover:text-primary transition-colors cursor-pointer truncate"
                            >
                              {c.author?.name || "Rider"}
                            </p>
                            <p className="text-[10px] text-muted-foreground shrink-0">
                              {timeAgo(c.createdAt)}
                            </p>
                          </div>
                          <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap break-words">
                            {c.content}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Desktop inline comment composer */}
              <div className="hidden md:flex px-4 py-3 border-t border-white/8 gap-2 bg-[#0d0f10]">
                <input
                  ref={commentInputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendComment();
                    }
                  }}
                  placeholder="Add a comment or riding tip…"
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-white/6 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                />
                <button
                  type="button"
                  onClick={handleSendComment}
                  disabled={!commentText.trim() || sendingComment}
                  className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-black disabled:opacity-40 shrink-0 cursor-pointer"
                  aria-label="Send comment"
                >
                  {sendingComment ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Sticky Comment Composer ── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0f10]/95 backdrop-blur-xl border-t border-white/10 px-3 py-2.5 flex items-center gap-2"
        style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
      >
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendComment();
            }
          }}
          placeholder="Add a comment or riding tip…"
          className="flex-1 px-4 py-2.5 rounded-2xl bg-white/6 border border-white/10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-primary/50"
        />
        <button
          type="button"
          onClick={handleSendComment}
          disabled={!commentText.trim() || sendingComment}
          className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-black disabled:opacity-40 shrink-0 cursor-pointer"
          aria-label="Send comment"
        >
          {sendingComment ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Send size={15} />
          )}
        </button>
      </div>

      {/* ── Delete Confirmation Dialog ── */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setConfirmDelete(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm z-[71] rounded-3xl bg-[#111317] border border-white/15 p-5 shadow-2xl space-y-4"
            >
              <div>
                <h3 className="text-base font-black text-white">Delete this post?</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  This action cannot be undone. All likes and comments on this post will be removed.
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeletePost}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-black text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {deleting && <Loader2 size={13} className="animate-spin" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Author / Commenter Profile Modal ── */}
      <AnimatePresence>
        {selectedUserId && (
          <UserProfileModal
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Likes Modal ── */}
      <AnimatePresence>
        {showLikesModal && (
          <PostLikesModal
            post={post}
            onClose={() => setShowLikesModal(false)}
            onViewAuthor={(id) => {
              setShowLikesModal(false);
              setSelectedUserId(id);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

