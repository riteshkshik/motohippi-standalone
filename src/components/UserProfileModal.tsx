import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  MapPin,
  CheckCircle2,
  Lock,
  Bike,
  Compass,
  Sparkles,
  Loader2,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
  const base = getApiBase();
  const full = url.startsWith("http")
    ? url
    : `${base}${url.startsWith("/api") ? url : `/api${url}`}`;
  const token = getToken();
  return fetch(full, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  });
};

interface UserProfileModalProps {
  userId: number | null;
  onClose: () => void;
}

export function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const { user: currentUser } = useAuth();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["/api/users", userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await authFetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    },
    enabled: !!userId,
  });

  if (!userId) return null;

  const isSelf = currentUser?.id === userId;
  const isHidden = !!profile?.hideProfileDetails && !isSelf;

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="w-full max-w-md bg-[#111315] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground font-medium">
                Loading rider profile…
              </p>
            </div>
          ) : error || !profile ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm font-bold text-white">Profile unavailable</p>
              <p className="text-xs text-muted-foreground">
                Could not load details for this rider.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-white/10 text-xs font-bold hover:bg-white/20 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Cover Photo / Background Image */}
              <div className="h-44 relative bg-muted shrink-0 overflow-hidden">
                {profile.coverUrl ? (
                  <img
                    src={profile.coverUrl}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url(https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80)",
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111315] via-transparent to-black/35" />
              </div>

              {/* Profile Card Body */}
              <div className="px-6 pb-6 pt-0 -mt-14 relative z-10 flex-1 overflow-y-auto no-scrollbar space-y-4">
                {/* Avatar & Badges */}
                <div className="flex items-end justify-between">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-[#111315] shadow-2xl bg-card">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-black text-2xl">
                          {profile.name?.charAt(0) ?? "R"}
                        </div>
                      )}
                    </div>
                    {profile.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-primary text-black p-1 rounded-full border-2 border-[#111315]">
                        <CheckCircle2
                          size={14}
                          className="fill-black text-primary"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions / Privacy Pill */}
                  {isHidden ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground text-[11px] font-bold">
                      <Lock size={12} className="text-amber-400" />
                      <span>Details Hidden</span>
                    </div>
                  ) : isSelf ? (
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      You
                    </span>
                  ) : null}
                </div>

                {/* Name & Username */}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">
                      {profile.name}
                    </h2>
                    {profile.isVerified && (
                      <Sparkles size={14} className="text-primary shrink-0" />
                    )}
                  </div>
                  {profile.username && (
                    <p className="text-xs text-muted-foreground font-medium">
                      @{profile.username}
                    </p>
                  )}
                </div>

                {/* ─── HIDDEN STATE: Only show Name, Cover, and Avatar ─── */}
                {isHidden ? (
                  <div className="py-6 px-4 rounded-2xl bg-white/3 border border-white/8 text-center space-y-2 mt-2">
                    <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto">
                      <EyeOff size={18} />
                    </div>
                    <p className="text-xs font-bold text-white">
                      Profile details are private
                    </p>
                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                      This rider has enabled privacy mode. Only their name and photos
                      are visible.
                    </p>
                  </div>
                ) : (
                  /* ─── VISIBLE STATE: Show all user information ─── */
                  <div className="space-y-4 pt-1">
                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-xs text-white/80 leading-relaxed bg-white/4 p-3.5 rounded-2xl border border-white/6">
                        {profile.bio}
                      </p>
                    )}

                    {/* Location & Ride info */}
                    <div className="grid grid-cols-2 gap-2">
                      {(profile.city || profile.country) && (
                        <div className="p-3 bg-white/5 border border-white/8 rounded-2xl">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                            <MapPin size={11} className="text-primary" /> Location
                          </p>
                          <p className="text-xs font-bold text-white mt-0.5 truncate">
                            {profile.city || ""}
                            {profile.country ? `, ${profile.country}` : ""}
                          </p>
                        </div>
                      )}

                      {profile.vehicleType && (
                        <div className="p-3 bg-white/5 border border-white/8 rounded-2xl">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                            <Bike size={11} className="text-primary" /> Ride
                          </p>
                          <p className="text-xs font-bold text-white mt-0.5 truncate">
                            {profile.vehicleType}
                          </p>
                        </div>
                      )}

                      {profile.adventureLevel && (
                        <div className="p-3 bg-white/5 border border-white/8 rounded-2xl">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                            <Compass size={11} className="text-primary" /> Level
                          </p>
                          <p className="text-xs font-bold text-white mt-0.5 truncate">
                            {profile.adventureLevel}
                          </p>
                        </div>
                      )}

                      {profile.travelStyle && (
                        <div className="p-3 bg-white/5 border border-white/8 rounded-2xl">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            Style
                          </p>
                          <p className="text-xs font-bold text-white mt-0.5 truncate">
                            {profile.travelStyle}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Interests tags */}
                    {Array.isArray(profile.interests) &&
                      profile.interests.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">
                            Interests & Passions
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.interests.map((tag: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-[11px] font-bold text-white/80"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Looking for tags */}
                    {Array.isArray(profile.lookingFor) &&
                      profile.lookingFor.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">
                            Looking For
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.lookingFor.map((tag: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Stats strip */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-white/4 border border-white/8 rounded-2xl text-center">
                      <div>
                        <p className="text-xs font-black text-white">
                          {profile.followersCount ?? 0}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Followers</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">
                          {profile.followingCount ?? 0}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Following</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">
                          {profile.tripsCount ?? 0}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Trips</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
