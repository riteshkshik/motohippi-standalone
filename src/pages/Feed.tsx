import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useGetFeed } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Plus,
  Globe,
  Heart,
  MessageCircle,
  Share2,
  X,
  Coffee,
  BedDouble,
  Eye,
  Navigation2,
  Gem,
  Tent,
  UtensilsCrossed,
  LocateFixed,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Send,
  Upload,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Star,
  Sparkles,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/upload";

import {
  CATEGORIES,
  getCat,
  encodePlace,
  decodeName,
  decodeCity,
  encodeImgs,
  decodeImgs,
  SuggestModal,
} from "@/components/SuggestModal";
import { UserProfileModal } from "@/components/UserProfileModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("motohippi_token") || "";
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
  return fetch(fullUrl, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(opts.headers ?? {}),
    },
  });
};

function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Feed() {
  const { isLoggedIn } = useAuth();
  const [activeCat, setActiveCat] = useState("all");
  const [showSuggest, setShowSuggest] = useState(false);
  const [commentPost, setCommentPost] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [searchParams, setSearchParams] = useState(() =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams(),
  );

  const rawPostParam = searchParams.get("post");
  const parsedPostId = rawPostParam
    ? parseInt(rawPostParam.trim().split(/\s+/)[0], 10)
    : null;
  const targetPostId = Number.isFinite(parsedPostId) ? parsedPostId : null;

  // Direct fetch for shared post to guarantee deep-link works even for guests
  const { data: linkedPost, isLoading: isLinkedLoading } = useQuery({
    queryKey: ["/api/posts", targetPostId],
    queryFn: async () => {
      if (!targetPostId) return null;
      const res = await authFetch(`/api/posts/${targetPostId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!targetPostId,
  });

  const { data: feedData, isLoading } = useGetFeed();
  const posts = feedData?.posts ?? [];

  const filtered =
    activeCat === "all"
      ? posts
      : posts.filter((p) => (p.hashtags as string[])?.[0] === activeCat);

  // If a post is linked via ?post=ID, ONLY show that particular post
  const displayedPosts = useMemo(() => {
    if (targetPostId) {
      if (linkedPost) return [linkedPost];
      const match = posts.find((p) => p.id === targetPostId);
      if (match) return [match];
      return [];
    }
    return filtered;
  }, [filtered, posts, targetPostId, linkedPost]);

  const clearTargetPost = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("post");
    window.history.replaceState({}, "", url.pathname);
    setSearchParams(new URLSearchParams());
  };

  const handleSuggestClick = () => {
    if (!isLoggedIn) {
      toast({
        title: "Sign in required",
        description: "Join MotoHippi to recommend spots & share ride stories!",
      });
      return;
    }
    setShowSuggest(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Sticky header + filters ── */}
      <div className="sticky top-14 md:top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-white/6">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Globe size={16} className="text-primary" />
            </div>
            <div>
              <h1 className="text-[17px] font-black text-white leading-none">
                Stories
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">
                Explore · Suggest · Discover
              </p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleSuggestClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-black text-[13px] font-black hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 cursor-pointer"
          >
            <Plus size={14} strokeWidth={3} /> Suggest
          </motion.button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 px-5 pb-3 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const on = activeCat === cat.id;
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => setActiveCat(cat.id)}
                style={
                  on
                    ? {
                        background: cat.bg,
                        borderColor: cat.border,
                        color: cat.color,
                      }
                    : {}
                }
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold border shrink-0 transition-all cursor-pointer ${
                  on
                    ? "border-current"
                    : "bg-white/5 border-white/8 text-muted-foreground hover:border-white/20 hover:text-white"
                }`}
              >
                <cat.Icon size={11} strokeWidth={on ? 2.5 : 2} />
                {cat.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Feed ── */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-28">
        {/* Guest invitation banner */}
        {!isLoggedIn && (
          <div className="flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-primary/15 via-white/5 to-transparent border border-primary/25 text-white shadow-lg">
            <div className="pr-3">
              <p className="text-sm font-black flex items-center gap-1.5 text-primary">
                <Sparkles size={14} /> Welcome Rider!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Explore spots & routes. Join free to like, comment & share.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/login">
                <button className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white">
                  Log In
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-3.5 py-1.5 rounded-full text-xs font-black bg-primary text-black hover:bg-primary/90 transition-colors cursor-pointer shadow-md shadow-primary/20">
                  Join Free
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Deep link active banner */}
        {targetPostId && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-primary/10 border border-primary/30 text-white shadow-md">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles size={16} className="text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-black truncate">Viewing shared spot</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {linkedPost
                    ? decodeName(linkedPost.location) || "Shared recommendation"
                    : "Direct recommendation from link"}
                </p>
              </div>
            </div>
            <button
              onClick={clearTargetPost}
              className="px-3.5 py-1.5 rounded-full text-xs font-black bg-primary text-black hover:bg-primary/90 transition-colors shrink-0 cursor-pointer shadow-md shadow-primary/20"
            >
              View all spots
            </button>
          </div>
        )}

        {isLoading || (targetPostId && isLinkedLoading) ? (
          [1, 2, 3].map((i) => <CardSkeleton key={i} />)
        ) : displayedPosts.length === 0 ? (
          targetPostId ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-card/20 rounded-3xl border border-white/6 p-6">
              <MapPin className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <h3 className="text-base font-black text-white">Spot not found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                This post may have been removed or the link is invalid.
              </p>
              <button
                onClick={clearTargetPost}
                className="mt-4 px-4 py-2 rounded-full bg-primary text-black text-xs font-black cursor-pointer hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
              >
                Explore all spots
              </button>
            </div>
          ) : (
            <Empty cat={activeCat} onSuggest={handleSuggestClick} />
          )
        ) : (
          displayedPosts.map((post) => (
            <PlaceCard
              key={post.id}
              post={post}
              isHighlighted={post.id === targetPostId}
              onComment={() => setCommentPost(post)}
              onViewAuthor={(id) => setSelectedUserId(id)}
              onRefresh={() =>
                queryClient.invalidateQueries({ queryKey: ["/api/feed"] })
              }
            />
          ))
        )}
      </div>

      {/* Mobile FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleSuggestClick}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="fixed bottom-24 right-5 md:hidden w-14 h-14 rounded-full bg-primary shadow-xl shadow-primary/30 flex items-center justify-center z-10 cursor-pointer"
      >
        <Plus size={22} strokeWidth={3} className="text-black" />
      </motion.button>

      {/* Modals */}
      <AnimatePresence>
        {showSuggest && (
          <SuggestModal
            onClose={() => setShowSuggest(false)}
            onCreated={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
              setShowSuggest(false);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {commentPost && (
          <CommentDrawer
            post={commentPost}
            onClose={() => setCommentPost(null)}
            onViewAuthor={(id) => setSelectedUserId(id)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedUserId && (
          <UserProfileModal
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Place Card ───────────────────────────────────────────────────────────────
function PlaceCard({
  post,
  onComment,
  onRefresh,
  onViewAuthor,
  isHighlighted = false,
}: {
  post: any;
  onComment: () => void;
  onRefresh: () => void;
  onViewAuthor: (userId: number) => void;
  isHighlighted?: boolean;
}) {
  const [liked, setLiked] = useState(!!post.isLiked);
  const [likes, setLikes] = useState(post.likesCount ?? 0);
  const [liking, setLiking] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const { toast } = useToast();

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

  const handleLike = async () => {
    const token =
      localStorage.getItem("motohippi_token") ||
      sessionStorage.getItem("motohippi_token");
    if (!token) {
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
    setLikes((l: number) => l + (next ? 1 : -1));
    try {
      await authFetch(`/api/posts/${post.id}/like`, { method: "POST" });
    } catch {
      /* optimistic — UI already updated */
    }
    setLiking(false);
    onRefresh();
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/feed?post=${post.id}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: placeName || "MotoHippi Spot",
          url: postUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
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

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl overflow-hidden border bg-card/40 backdrop-blur-sm transition-all duration-300 ${
        isHighlighted
          ? "border-primary ring-2 ring-primary/40 shadow-xl shadow-primary/20"
          : "border-white/8"
      }`}
    >
      {/* Image section */}
      {images.length > 0 && (
        <div className="relative h-60 bg-black overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={imgIdx}
              src={images[imgIdx]}
              alt={placeName}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Category badge & Rating badge */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border backdrop-blur-md"
              style={{
                color: cat.color,
                background: cat.bg,
                borderColor: cat.border,
              }}
            >
              <cat.Icon size={10} strokeWidth={2.5} />
              {cat.label}
            </div>

            {ratingVal && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-black/60 border border-[#FBBF24]/40 text-[#FBBF24] backdrop-blur-md shadow-md">
                <Star size={11} className="fill-[#FBBF24]" />
                <span>{ratingVal.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Image navigation */}
          {images.length > 1 && (
            <>
              <button
                disabled={imgIdx === 0}
                onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/20 flex items-center justify-center backdrop-blur-sm disabled:opacity-20 transition-opacity"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                disabled={imgIdx === images.length - 1}
                onClick={() =>
                  setImgIdx((i) => Math.min(images.length - 1, i + 1))
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/20 flex items-center justify-center backdrop-blur-sm disabled:opacity-20 transition-opacity"
              >
                <ChevronRight size={15} />
              </button>
              <div className="absolute bottom-[4.5rem] left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`h-1 rounded-full transition-all ${i === imgIdx ? "w-5 bg-primary" : "w-1 bg-white/40"}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Place name overlay */}
          {placeName && (
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-black text-xl leading-tight drop-shadow-lg line-clamp-1">
                {placeName}
              </h3>
              {placeCity && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={11} className="text-primary" />
                  <span className="text-xs text-white/75 font-medium">
                    {placeCity}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className="px-4 pt-4 pb-1">
        {/* Place info (no-image fallback) */}
        {images.length === 0 && (
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black border"
                  style={{
                    color: cat.color,
                    background: cat.bg,
                    borderColor: cat.border,
                  }}
                >
                  <cat.Icon size={10} /> {cat.label}
                </div>
                {ratingVal && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FBBF24]/15 border border-[#FBBF24]/30 text-[#FBBF24]">
                    <Star size={10} className="fill-[#FBBF24]" />
                    <span>{ratingVal.toFixed(1)}</span>
                  </div>
                )}
              </div>
              {placeName && (
                <h3 className="text-white font-black text-lg leading-tight">
                  {placeName}
                </h3>
              )}
              {placeCity && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={11} className="text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {placeCity}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {post.content && (
          <p className="text-white/75 text-sm leading-relaxed mb-3 line-clamp-3">
            {post.content}
          </p>
        )}

        {/* Extra tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((t: string) => (
              <span
                key={t}
                className="text-[11px] text-primary/80 bg-primary/8 px-2 py-0.5 rounded-full border border-primary/15"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-white/5">
        <div
          onClick={() => {
            const authorId = post.author?.id || post.userId;
            if (authorId) onViewAuthor(authorId);
          }}
          className="flex items-center gap-2 cursor-pointer group hover:opacity-90 transition-opacity"
          title="View rider profile"
        >
          <Avatar className="w-7 h-7 ring-1 ring-white/10 group-hover:ring-primary/40 transition-all">
            <AvatarImage src={post.author?.avatarUrl} />
            <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
              {post.author?.name?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-bold text-white/90 leading-none group-hover:text-primary transition-colors">
              {post.author?.name}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <motion.button
            whileTap={{ scale: 0.82 }}
            onClick={handleLike}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              liked
                ? "text-primary bg-primary/12"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <Heart size={14} className={liked ? "fill-primary" : ""} />
            {likes > 0 && <span>{likes}</span>}
          </motion.button>

          <button
            onClick={onComment}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs text-muted-foreground hover:text-white font-bold transition-colors"
          >
            <MessageCircle size={14} />
            {post.commentsCount > 0 && <span>{post.commentsCount}</span>}
          </button>

          <motion.button
            whileTap={{ scale: 0.82 }}
            onClick={handleShare}
            className="p-1.5 rounded-full text-muted-foreground hover:text-white transition-colors cursor-pointer"
            title="Share post"
          >
            <Share2 size={14} />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden border border-white/8 bg-card/40">
      <Skeleton className="w-full h-56 rounded-none" />
      <div className="px-4 py-4 space-y-2.5">
        <Skeleton className="h-3.5 w-1/3 rounded-full" />
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-2/3 rounded-full" />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function Empty({
  cat: catId,
  onSuggest,
}: {
  cat: string;
  onSuggest: () => void;
}) {
  const cat = getCat(catId);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 py-20 text-center px-6"
    >
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center border-2"
        style={{ background: cat.bg, borderColor: cat.border }}
      >
        <cat.Icon size={32} style={{ color: cat.color }} />
      </div>
      <div>
        <p className="text-white font-black text-lg">
          No {catId === "all" ? "places" : cat.label + "s"} yet
        </p>
        <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed max-w-xs">
          Be the first to share a hidden gem for the riding community!
        </p>
      </div>
      <button
        onClick={onSuggest}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-black font-black text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
      >
        <Plus size={15} strokeWidth={3} /> Suggest a Place
      </button>
    </motion.div>
  );
}

// ─── Comment Drawer ───────────────────────────────────────────────────────────
function CommentDrawer({
  post,
  onClose,
  onViewAuthor,
}: {
  post: any;
  onClose: () => void;
  onViewAuthor: (userId: number) => void;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const placeName = decodeName(post.location) || "this place";

  useEffect(() => {
    authFetch(`/api/posts/${post.id}/comments`)
      .then((r) => r.json())
      .then((d) => {
        setComments(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [post.id]);

  const send = async () => {
    if (!text.trim() || sending) return;
    if (!getToken()) {
      toast({
        title: "Sign in required",
        description: "Join or log in to MotoHippi to post community tips!",
      });
      return;
    }
    setSending(true);
    try {
      const res = await authFetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: text.trim() }),
      });
      if (res.ok) {
        const c = await res.json();
        setComments((p) => [c, ...p]);
        setText("");
      }
    } catch {
      /* network error — silently ignore */
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="fixed bottom-0 left-0 right-0 sm:max-w-lg sm:mx-auto z-[70] bg-[#0d0f10] border-t border-white/10 rounded-t-3xl max-h-[75vh] flex flex-col"
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/6 shrink-0">
          <div>
            <h3 className="text-sm font-black text-white">Community Tips</h3>
            <p className="text-[10px] text-muted-foreground">{placeName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <MessageCircle size={26} className="opacity-25" />
              <p className="text-sm">No tips yet — be the first!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar
                  onClick={() => {
                    const authorId = c.author?.id || c.userId;
                    if (authorId) onViewAuthor(authorId);
                  }}
                  className="w-8 h-8 shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
                  title="View rider profile"
                >
                  <AvatarImage src={c.author?.avatarUrl} />
                  <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                    {c.author?.name?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-white/4 rounded-2xl px-3 py-2.5">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <p
                      onClick={() => {
                        const authorId = c.author?.id || c.userId;
                        if (authorId) onViewAuthor(authorId);
                      }}
                      className="text-xs font-black text-white hover:text-primary transition-colors cursor-pointer"
                    >
                      {c.author?.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {timeAgo(c.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {c.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-3 border-t border-white/6 flex gap-2 shrink-0 bg-[#0d0f10] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Add a tip or ask something…"
            className="flex-1 px-4 py-2.5 rounded-2xl bg-white/6 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/40"
          />
          <button
            onClick={send}
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-black disabled:opacity-40 shrink-0 cursor-pointer"
          >
            {sending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
}
