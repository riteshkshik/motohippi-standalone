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
  Users,
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
    <div className="min-h-screen bg-[#FFDB58] text-foreground pb-20">
      {/* ── Sticky header + filters ── */}
      <div className="sticky top-0 z-20 bg-[#070A0F]/90 backdrop-blur-xl border-b border-black/10">
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Users size={16} className="text-primary" />
            </div>
            <h1 className="text-[17px] font-black text-white leading-none">
              Stories
            </h1>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 px-4 sm:px-5 pb-2.5 overflow-x-auto no-scrollbar">
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

      {/* ── Feed (Pinterest-style Masonry) ── */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-4 pb-28">
        {/* Guest invitation banner */}
        {!isLoggedIn && (
          <div className="mb-4 flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-primary/15 via-white/5 to-transparent border border-primary/25 text-white shadow-lg">
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
          <div className="mb-4 flex items-center justify-between p-3.5 rounded-2xl bg-primary/10 border border-primary/30 text-white shadow-md">
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
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-2.5 sm:gap-3.5">
            {["h-52", "h-72", "h-44", "h-64", "h-56", "h-80", "h-48", "h-60"].map(
              (h, i) => (
                <CardSkeleton key={i} heightClass={h} />
              )
            )}
          </div>
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
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-2.5 sm:gap-3.5">
            {displayedPosts.map((post) => (
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
            ))}
          </div>
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

  const handleLike = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  const handleShare = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`break-inside-avoid mb-2.5 sm:mb-3.5 w-full inline-block rounded-2xl sm:rounded-3xl overflow-hidden border bg-[#111317] transition-all duration-300 group hover:border-white/25 hover:shadow-2xl hover:shadow-black/60 relative ${
        isHighlighted
          ? "border-primary ring-2 ring-primary/40 shadow-xl shadow-primary/20"
          : "border-white/10"
      }`}
    >
      {images.length > 0 ? (
        /* ── Full-Bleed Image Card (Maximum Image Visibility / Zero Gray Area) ── */
        <div
          className="relative w-full overflow-hidden cursor-pointer bg-black/50"
          onClick={onComment}
        >
          {/* Natural Height Image */}
          <AnimatePresence mode="wait">
            <motion.img
              key={imgIdx}
              src={images[imgIdx]}
              alt={placeName || "MotoHippi story"}
              loading="lazy"
              className="w-full h-auto object-cover max-h-[500px] min-h-[170px] block transition-transform duration-500 group-hover:scale-[1.02]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
          </AnimatePresence>

          {/* ── Top Overlay (Directly On Top Of Image) ── */}
          <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/85 via-black/45 to-transparent p-2.5 sm:p-3 pb-8 pointer-events-none z-10">
            {/* Badges Row */}
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <div
                className="pointer-events-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border backdrop-blur-md shadow-md"
                style={{
                  color: cat.color,
                  background: cat.bg,
                  borderColor: cat.border,
                }}
              >
                <cat.Icon size={10} strokeWidth={2.5} />
                <span>{cat.label}</span>
              </div>

              {ratingVal && (
                <div className="pointer-events-auto inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-black/70 border border-[#FBBF24]/40 text-[#FBBF24] backdrop-blur-md shadow-md">
                  <Star size={9} className="fill-[#FBBF24]" />
                  <span>{ratingVal.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Place Title */}
            {placeName ? (
              <h3
                onClick={(e) => {
                  e.stopPropagation();
                  onComment();
                }}
                className="pointer-events-auto text-white font-bold text-sm leading-snug line-clamp-1 drop-shadow-md hover:text-primary transition-colors cursor-pointer"
                title={placeName}
              >
                {placeName}
              </h3>
            ) : null}

            {/* City Location / Short Caption */}
            {placeCity ? (
              <div className="pointer-events-auto flex items-center gap-1 mt-0.5 text-[11px] text-white/85 drop-shadow">
                <MapPin size={10} className="text-primary shrink-0" />
                <span className="truncate">{placeCity}</span>
              </div>
            ) : post.content ? (
              <p
                onClick={(e) => {
                  e.stopPropagation();
                  onComment();
                }}
                className="pointer-events-auto text-white/80 text-[11px] leading-snug line-clamp-1 drop-shadow mt-0.5 cursor-pointer hover:text-white"
              >
                {post.content}
              </p>
            ) : null}
          </div>

          {/* Multi-image navigation */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                disabled={imgIdx === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  setImgIdx((i) => Math.max(0, i - 1));
                }}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm disabled:opacity-0 opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-20"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                type="button"
                disabled={imgIdx === images.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  setImgIdx((i) => Math.min(images.length - 1, i + 1));
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm disabled:opacity-0 opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-20"
              >
                <ChevronRight size={13} />
              </button>
              <div className="absolute bottom-11 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1 rounded-full transition-all ${
                      i === imgIdx ? "w-3 bg-primary" : "w-1 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* ── Bottom Overlay (Directly On Bottom Of Image) ── */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-2.5 sm:p-3 pt-8 pointer-events-none z-10 flex items-center justify-between">
            <div
              onClick={(e) => {
                e.stopPropagation();
                const authorId = post.author?.id || post.userId;
                if (authorId) onViewAuthor(authorId);
              }}
              className="pointer-events-auto flex items-center gap-1.5 cursor-pointer group/author hover:opacity-95 transition-opacity min-w-0"
              title="View rider profile"
            >
              <Avatar className="w-5 h-5 shrink-0 ring-1 ring-white/25 group-hover/author:ring-primary/60 transition-all">
                <AvatarImage src={post.author?.avatarUrl} />
                <AvatarFallback className="text-[9px] bg-primary/20 text-primary">
                  {post.author?.name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-white leading-none truncate drop-shadow group-hover/author:text-primary transition-colors">
                  {post.author?.name?.split(" ")[0] || post.author?.name || "Rider"}
                </p>
                <p className="text-[9px] text-white/70 drop-shadow mt-0.5">
                  {timeAgo(post.createdAt)}
                </p>
              </div>
            </div>

            <div className="pointer-events-auto flex items-center gap-1 shrink-0">
              <motion.button
                whileTap={{ scale: 0.82 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(e);
                }}
                className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-[11px] font-bold backdrop-blur-md transition-all ${
                  liked
                    ? "text-primary bg-primary/20 border border-primary/30"
                    : "text-white/90 hover:text-white bg-black/40 hover:bg-black/60 border border-white/10"
                }`}
              >
                <Heart size={13} className={liked ? "fill-primary" : ""} />
                {likes > 0 && <span>{likes}</span>}
              </motion.button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onComment();
                }}
                className="flex items-center gap-1 px-1.5 py-1 rounded-md text-[11px] text-white/90 hover:text-white font-bold bg-black/40 hover:bg-black/60 border border-white/10 backdrop-blur-md transition-colors cursor-pointer"
              >
                <MessageCircle size={13} />
                {post.commentsCount > 0 && <span>{post.commentsCount}</span>}
              </button>

              <motion.button
                whileTap={{ scale: 0.82 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(e);
                }}
                className="p-1 rounded-md text-white/90 hover:text-white bg-black/40 hover:bg-black/60 border border-white/10 backdrop-blur-md transition-colors cursor-pointer"
                title="Share post"
              >
                <Share2 size={13} />
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Text-only Fallback Card (when no photo exists) ── */
        <div className="p-3.5 space-y-2 bg-[#111317]">
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <div
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border"
              style={{
                color: cat.color,
                background: cat.bg,
                borderColor: cat.border,
              }}
            >
              <cat.Icon size={10} strokeWidth={2.5} />
              <span>{cat.label}</span>
            </div>
            {ratingVal && (
              <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-[#FBBF24]/15 border border-[#FBBF24]/30 text-[#FBBF24]">
                <Star size={9} className="fill-[#FBBF24]" />
                <span>{ratingVal.toFixed(1)}</span>
              </div>
            )}
          </div>

          {placeName && (
            <h3
              onClick={onComment}
              className="text-white font-bold text-sm leading-snug line-clamp-1 cursor-pointer hover:text-primary transition-colors"
            >
              {placeName}
            </h3>
          )}

          {placeCity && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin size={11} className="text-primary shrink-0" />
              <span className="truncate">{placeCity}</span>
            </div>
          )}

          {post.content && (
            <p
              onClick={onComment}
              className="text-white/70 text-xs leading-relaxed line-clamp-3 cursor-pointer hover:text-white/90"
            >
              {post.content}
            </p>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {tags.slice(0, 2).map((t: string) => (
                <span
                  key={t}
                  className="text-[10px] text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/15"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Text card footer */}
          <div className="pt-2 flex items-center justify-between border-t border-white/5">
            <div
              onClick={(e) => {
                e.stopPropagation();
                const authorId = post.author?.id || post.userId;
                if (authorId) onViewAuthor(authorId);
              }}
              className="flex items-center gap-1.5 cursor-pointer group hover:opacity-90 transition-opacity min-w-0"
            >
              <Avatar className="w-5 h-5 shrink-0 ring-1 ring-white/10 group-hover:ring-primary/40 transition-all">
                <AvatarImage src={post.author?.avatarUrl} />
                <AvatarFallback className="text-[9px] bg-primary/20 text-primary">
                  {post.author?.name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] font-semibold text-white/85 truncate group-hover:text-primary">
                {post.author?.name?.split(" ")[0] || post.author?.name || "Rider"}
              </span>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <motion.button
                whileTap={{ scale: 0.82 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(e);
                }}
                className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  liked
                    ? "text-primary bg-primary/12"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <Heart size={13} className={liked ? "fill-primary" : ""} />
                {likes > 0 && <span>{likes}</span>}
              </motion.button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onComment();
                }}
                className="flex items-center gap-1 px-1.5 py-1 rounded-md text-[11px] text-muted-foreground hover:text-white font-bold transition-colors"
              >
                <MessageCircle size={13} />
                {post.commentsCount > 0 && <span>{post.commentsCount}</span>}
              </button>
              <motion.button
                whileTap={{ scale: 0.82 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(e);
                }}
                className="p-1 rounded-md text-muted-foreground hover:text-white transition-colors cursor-pointer"
              >
                <Share2 size={13} />
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </motion.article>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton({ heightClass = "h-64" }: { heightClass?: string }) {
  return (
    <div className="break-inside-avoid mb-2.5 sm:mb-3.5 w-full inline-block rounded-2xl sm:rounded-3xl overflow-hidden border border-white/8 bg-[#111317] relative">
      <Skeleton className={`w-full ${heightClass} rounded-none`} />
      {/* Top overlay skeleton */}
      <div className="absolute top-2.5 left-2.5 right-2.5 space-y-2 pointer-events-none">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16 rounded-full bg-white/10" />
          <Skeleton className="h-4 w-10 rounded-full bg-white/10" />
        </div>
        <Skeleton className="h-4 w-3/4 rounded-full bg-white/10" />
        <Skeleton className="h-3 w-1/2 rounded-full bg-white/10" />
      </div>
      {/* Bottom overlay skeleton */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-5 w-5 rounded-full bg-white/10" />
          <Skeleton className="h-2.5 w-14 rounded-full bg-white/10" />
        </div>
        <Skeleton className="h-4 w-16 rounded-full bg-white/10" />
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
