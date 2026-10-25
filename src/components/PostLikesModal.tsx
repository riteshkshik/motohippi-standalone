import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, X, ChevronRight, Bike, MapPin, Users } from "lucide-react";

const getApiBase = () => {
  const base =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:3001";
  return base.replace(/\/api\/?$/, "").replace(/\/+$/, "");
};

const getToken = () =>
  localStorage.getItem("motohippi_token") ||
  sessionStorage.getItem("motohippi_token") ||
  "";

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

function timeAgo(iso?: string) {
  if (!iso) return "";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (isNaN(s)) return "";
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

interface LikeUser {
  id: number;
  name?: string;
  username?: string;
  avatarUrl?: string;
  city?: string;
  motorcycleModel?: string;
  vehicleType?: string;
  isVerified?: boolean;
}

interface LikeItem {
  id: number;
  createdAt?: string;
  user: LikeUser;
}

interface PostLikesModalProps {
  post: {
    id: number;
    likesCount?: number;
    location?: string;
    content?: string;
  };
  onClose: () => void;
  onViewAuthor: (userId: number) => void;
}

export function PostLikesModal({ post, onClose, onViewAuthor }: PostLikesModalProps) {
  const [likes, setLikes] = useState<LikeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    authFetch(`/api/posts/${post.id}/likes`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load likes");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setLikes(Array.isArray(data?.likes) ? data.likes : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching likes:", err);
        if (isMounted) {
          setLikes([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [post.id]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-md z-[80]"
        onClick={onClose}
      />

      {/* Modal / Bottom Sheet */}
      <motion.div
        initial={{ y: "100%", opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed bottom-0 inset-x-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-md bg-[#13151A] border-t sm:border border-white/12 rounded-t-3xl sm:rounded-3xl shadow-2xl z-[85] max-h-[82vh] sm:max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle indicator */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center text-red-500 shadow-sm">
              <Heart size={16} className="fill-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white tracking-tight">Liked By</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/90">
                  {loading ? "..." : likes.length}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Riders who liked this spot
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content List */}
        <div className="p-3 overflow-y-auto min-h-[160px] max-h-[60vh] space-y-1 divide-y divide-white/[0.04]">
          {loading ? (
            <div className="space-y-3 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-28 bg-white/10 rounded" />
                    <Skeleton className="h-2.5 w-40 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : likes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground mb-3">
                <Users size={22} className="opacity-40" />
              </div>
              <p className="text-sm font-bold text-white mb-1">No likes yet</p>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Be the first to like this post and connect with the author!
              </p>
            </div>
          ) : (
            likes.map((like) => {
              const u = like.user;
              if (!u) return null;
              const bikeOrVehicle = u.motorcycleModel || u.vehicleType;
              return (
                <div
                  key={like.id}
                  onClick={() => onViewAuthor(u.id)}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/[0.06] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-10 h-10 border border-white/15 group-hover:border-primary/50 transition-colors shrink-0">
                      <AvatarImage src={u.avatarUrl} className="object-cover" />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-black">
                        {u.name?.charAt(0) || "R"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                          {u.name || "Rider"}
                        </p>
                        {u.username && (
                          <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                            @{u.username}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        {bikeOrVehicle && (
                          <span className="flex items-center gap-0.5 truncate text-white/70">
                            <Bike size={10} className="text-primary shrink-0" />
                            {bikeOrVehicle}
                          </span>
                        )}
                        {bikeOrVehicle && u.city && <span>•</span>}
                        {u.city && (
                          <span className="flex items-center gap-0.5 truncate">
                            <MapPin size={9} className="shrink-0" />
                            {u.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {like.createdAt && (
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(like.createdAt)}
                      </span>
                    )}
                    <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground group-hover:text-white group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
                      <ChevronRight size={13} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </>
  );
}
