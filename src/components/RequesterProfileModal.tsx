import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Shield, CheckCircle2, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface RequesterUser {
  id: number;
  name: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  city?: string | null;
  country?: string | null;
  vehicleType?: string | null;
  adventureLevel?: string | null;
  travelStyle?: string | null;
  bio?: string | null;
  interests?: string[];
  lookingFor?: string[];
  isVerified?: boolean;
  age?: number;
}

interface RequesterProfileModalProps {
  requester: RequesterUser | null;
  requestId: number | null;
  onClose: () => void;
  onAccept: (reqId: number) => void;
  onDecline: (reqId: number) => void;
}

export function RequesterProfileModal({
  requester,
  requestId,
  onClose,
  onAccept,
  onDecline,
}: RequesterProfileModalProps) {
  if (!requester || !requestId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
          >
            <X size={18} />
          </button>

          {/* Cover Photo Banner */}
          <div className="h-40 relative bg-muted shrink-0 overflow-hidden">
            {requester.coverUrl ? (
              <img
                src={requester.coverUrl}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80)',
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/30" />
          </div>

          {/* Content Body */}
          <div className="px-6 pb-6 pt-0 -mt-14 relative z-10 flex-1 overflow-y-auto no-scrollbar space-y-5">
            {/* Avatar & Badges */}
            <div className="flex items-end justify-between">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-[#121212] shadow-2xl bg-card">
                  {requester.avatarUrl ? (
                    <img
                      src={requester.avatarUrl}
                      alt={requester.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-black text-2xl">
                      {requester.name?.charAt(0) ?? 'R'}
                    </div>
                  )}
                </div>
                {requester.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-black p-1 rounded-full border-2 border-[#121212]">
                    <CheckCircle2 size={14} className="fill-black text-primary" />
                  </div>
                )}
              </div>

              {/* Status Pill */}
              <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold flex items-center gap-1.5 mb-1">
                <Sparkles size={12} /> Liked your profile
              </div>
            </div>

            {/* Name, Age, Location */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">{requester.name}</h2>
                {requester.age && (
                  <span className="text-xl font-medium text-white/50">{requester.age}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin size={13} className="text-primary" />
                {requester.city || 'India'}
                {requester.country ? `, ${requester.country}` : ''}
              </p>
            </div>

            {/* Rider Badges & Specs */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-white/5 border border-white/8 rounded-2xl">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Vehicle</p>
                <p className="text-xs font-bold text-white mt-0.5 truncate">
                  🏍️ {requester.vehicleType || 'Motorcycle'}
                </p>
              </div>

              <div className="p-3 bg-white/5 border border-white/8 rounded-2xl">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Travel Style</p>
                <p className="text-xs font-bold text-white mt-0.5 truncate">
                  🛣️ {requester.travelStyle || 'Solo & Group'}
                </p>
              </div>
            </div>

            {/* Bio */}
            {requester.bio && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">About Rider</p>
                <p className="text-xs text-white/80 leading-relaxed bg-white/5 border border-white/5 p-3.5 rounded-2xl">
                  {requester.bio}
                </p>
              </div>
            )}

            {/* Interests & Looking For */}
            {requester.interests && requester.interests.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {requester.interests.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] font-semibold text-white/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-[#0a0a0a] border-t border-white/10 flex gap-3 shrink-0">
            <Button
              onClick={() => {
                onAccept(requestId);
                onClose();
              }}
              className="flex-1 h-12 bg-primary text-black font-black text-sm hover:bg-primary/90 rounded-2xl shadow-[0_0_20px_rgba(214,255,47,0.2)]"
            >
              <Check size={16} className="mr-1.5" /> Accept Request
            </Button>
            <Button
              onClick={() => {
                onDecline(requestId);
                onClose();
              }}
              variant="outline"
              className="flex-1 h-12 border-white/10 text-white/70 text-sm hover:border-red-500/30 hover:text-red-400 rounded-2xl"
            >
              <X size={16} className="mr-1.5" /> Decline
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
