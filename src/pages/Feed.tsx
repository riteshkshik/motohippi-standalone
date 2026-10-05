import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useGetFeed } from '@workspace/api-client-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MapPin, Plus, Globe, Heart, MessageCircle, Share2,
  X, Coffee, BedDouble, Eye, Navigation2, Gem, Tent, UtensilsCrossed,
  LocateFixed, Loader2, ChevronLeft, ChevronRight, Send, Bookmark,
  Upload, CheckCircle2, Camera, Image as ImageIcon, Star, Sparkles,
} from 'lucide-react';

import { uploadImage } from '@/lib/upload';

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',       label: 'All',        Icon: Globe,           color: '#D6FF2F', bg: 'rgba(214,255,47,0.12)',  border: 'rgba(214,255,47,0.25)' },
  { id: 'cafe',      label: 'Café',       Icon: Coffee,          color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.30)' },
  { id: 'stay',      label: 'Stay',       Icon: BedDouble,       color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.30)' },
  { id: 'viewpoint', label: 'Viewpoint',  Icon: Eye,             color: '#C084FC', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.30)' },
  { id: 'route',     label: 'Route',      Icon: Navigation2,     color: '#34D399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.30)' },
  { id: 'hidden',    label: 'Hidden Gem', Icon: Gem,             color: '#FBBF24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.30)' },
  { id: 'camping',   label: 'Camping',    Icon: Tent,            color: '#4ADE80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.30)' },
  { id: 'food',      label: 'Food Spot',  Icon: UtensilsCrossed, color: '#F87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.30)' },
];
const getCat = (id: string) => CATEGORIES.find(c => c.id === id) ?? CATEGORIES[0];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('motohippi_token') || '';
const getApiBase = () => {
  const base = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';
  return base.replace(/\/api\/?$/, '').replace(/\/+$/, '');
};
const authFetch = (url: string, opts: RequestInit = {}) => {
  const cleanBase = getApiBase();
  const fullUrl = url.startsWith('http') ? url : `${cleanBase}${url.startsWith('/api') ? url : `/api${url}`}`;
  return fetch(fullUrl, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...(opts.headers ?? {}) },
  });
};

function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// Data encoding — place name + city stored in post.location, images pipe-joined in post.imageUrl
const encodePlace = (name: string, city: string) => `${name}||${city}`;
const decodeName = (loc: string | null) => loc?.split('||')[0] ?? '';
const decodeCity = (loc: string | null) => loc?.split('||')[1] ?? '';
const encodeImgs  = (urls: string[]) => urls.join('|');
const decodeImgs  = (url: string | null): string[] => url ? url.split('|').filter(Boolean) : [];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Feed() {
  const [activeCat, setActiveCat]   = useState('all');
  const [showSuggest, setShowSuggest] = useState(false);
  const [commentPost, setCommentPost] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: feedData, isLoading } = useGetFeed();
  const posts = feedData?.posts ?? [];

  const filtered = activeCat === 'all'
    ? posts
    : posts.filter(p => (p.hashtags as string[])?.[0] === activeCat);

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
              <h1 className="text-[17px] font-black text-white leading-none">New World</h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">Explore · Suggest · Discover</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setShowSuggest(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-black text-[13px] font-black hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <Plus size={14} strokeWidth={3} /> Suggest
          </motion.button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 px-5 pb-3 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => {
            const on = activeCat === cat.id;
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => setActiveCat(cat.id)}
                style={on ? { background: cat.bg, borderColor: cat.border, color: cat.color } : {}}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold border shrink-0 transition-all ${
                  on ? 'border-current' : 'bg-white/5 border-white/8 text-muted-foreground hover:border-white/20 hover:text-white'
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
        {isLoading
          ? [1, 2, 3].map(i => <CardSkeleton key={i} />)
          : filtered.length === 0
            ? <Empty cat={activeCat} onSuggest={() => setShowSuggest(true)} />
            : filtered.map(post => (
              <PlaceCard
                key={post.id}
                post={post}
                onComment={() => setCommentPost(post)}
                onRefresh={() => queryClient.invalidateQueries({ queryKey: ['/api/feed'] })}
              />
            ))
        }
      </div>

      {/* Mobile FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowSuggest(true)}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}
        className="fixed bottom-24 right-5 md:hidden w-14 h-14 rounded-full bg-primary shadow-xl shadow-primary/30 flex items-center justify-center z-10"
      >
        <Plus size={22} strokeWidth={3} className="text-black" />
      </motion.button>

      {/* Modals */}
      <AnimatePresence>
        {showSuggest && (
          <SuggestModal
            onClose={() => setShowSuggest(false)}
            onCreated={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
              setShowSuggest(false);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {commentPost && <CommentDrawer post={commentPost} onClose={() => setCommentPost(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Place Card ───────────────────────────────────────────────────────────────
function PlaceCard({ post, onComment, onRefresh }: { post: any; onComment: () => void; onRefresh: () => void }) {
  const [liked,  setLiked]  = useState(!!post.isLiked);
  const [likes,  setLikes]  = useState(post.likesCount ?? 0);
  const [liking, setLiking] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const images    = decodeImgs(post.imageUrl);
  const placeName = decodeName(post.location);
  const placeCity = decodeCity(post.location);
  const catId     = (post.hashtags as string[])?.[0] ?? 'all';
  const cat       = getCat(catId);
  const ratingTag = ((post.hashtags as string[]) ?? []).find((h: string) => typeof h === 'string' && h.startsWith('rating:'));
  const ratingVal = ratingTag ? Number(ratingTag.split(':')[1]) : null;
  const tags      = ((post.hashtags as string[]) ?? []).slice(1).filter((h: string) => typeof h === 'string' && !h.startsWith('rating:'));

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    const next = !liked;
    setLiked(next);
    setLikes((l: number) => l + (next ? 1 : -1));
    try {
      await authFetch(`/api/posts/${post.id}/like`, { method: 'POST' });
    } catch { /* optimistic — UI already updated */ }
    setLiking(false);
    onRefresh();
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden border border-white/8 bg-card/40 backdrop-blur-sm"
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
              style={{ color: cat.color, background: cat.bg, borderColor: cat.border }}
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
                onClick={() => setImgIdx(i => Math.max(0, i - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/20 flex items-center justify-center backdrop-blur-sm disabled:opacity-20 transition-opacity"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                disabled={imgIdx === images.length - 1}
                onClick={() => setImgIdx(i => Math.min(images.length - 1, i + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/20 flex items-center justify-center backdrop-blur-sm disabled:opacity-20 transition-opacity"
              >
                <ChevronRight size={15} />
              </button>
              <div className="absolute bottom-[4.5rem] left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`h-1 rounded-full transition-all ${i === imgIdx ? 'w-5 bg-primary' : 'w-1 bg-white/40'}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Place name overlay */}
          {placeName && (
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-black text-xl leading-tight drop-shadow-lg line-clamp-1">{placeName}</h3>
              {placeCity && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={11} className="text-primary" />
                  <span className="text-xs text-white/75 font-medium">{placeCity}</span>
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
                  style={{ color: cat.color, background: cat.bg, borderColor: cat.border }}
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
              {placeName && <h3 className="text-white font-black text-lg leading-tight">{placeName}</h3>}
              {placeCity && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={11} className="text-primary" />
                  <span className="text-sm text-muted-foreground">{placeCity}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {post.content && (
          <p className="text-white/75 text-sm leading-relaxed mb-3 line-clamp-3">{post.content}</p>
        )}

        {/* Extra tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((t: string) => (
              <span key={t} className="text-[11px] text-primary/80 bg-primary/8 px-2 py-0.5 rounded-full border border-primary/15">#{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-white/5">
        <div className="flex items-center gap-2">
          <Avatar className="w-7 h-7">
            <AvatarImage src={post.author?.avatarUrl} />
            <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
              {post.author?.name?.charAt(0) ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-bold text-white/90 leading-none">{post.author?.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(post.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <motion.button
            whileTap={{ scale: 0.82 }}
            onClick={handleLike}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              liked ? 'text-primary bg-primary/12' : 'text-muted-foreground hover:text-white'
            }`}
          >
            <Heart size={14} className={liked ? 'fill-primary' : ''} />
            {likes > 0 && <span>{likes}</span>}
          </motion.button>

          <button
            onClick={onComment}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs text-muted-foreground hover:text-white font-bold transition-colors"
          >
            <MessageCircle size={14} />
            {post.commentsCount > 0 && <span>{post.commentsCount}</span>}
          </button>

          <button
            onClick={() => setSaved(s => !s)}
            className={`p-1.5 rounded-full transition-colors ${saved ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
          >
            <Bookmark size={14} className={saved ? 'fill-primary' : ''} />
          </button>

          <button className="p-1.5 rounded-full text-muted-foreground hover:text-white transition-colors">
            <Share2 size={14} />
          </button>
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
function Empty({ cat: catId, onSuggest }: { cat: string; onSuggest: () => void }) {
  const cat = getCat(catId);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 py-20 text-center px-6"
    >
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center border-2"
        style={{ background: cat.bg, borderColor: cat.border }}>
        <cat.Icon size={32} style={{ color: cat.color }} />
      </div>
      <div>
        <p className="text-white font-black text-lg">
          No {catId === 'all' ? 'places' : cat.label + 's'} yet
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

// ─── Interactive Star Rating ──────────────────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const labels: Record<number, string> = {
    1: '1/5 · Poor',
    2: '2/5 · Fair',
    3: '3/5 · Good',
    4: '4/5 · Great',
    5: '5/5 · Exceptional',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-black text-white/60 uppercase tracking-widest flex items-center gap-1.5">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          5-Star Rating *
        </label>
        <span className="text-xs font-bold text-amber-400">
          {labels[hovered ?? value] || `${value}/5 stars`}
        </span>
      </div>
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = (hovered ?? value) >= star;
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onChange(star)}
                className="p-1 transition-transform hover:scale-125 focus:outline-none"
              >
                <Star
                  size={28}
                  className={
                    active
                      ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                      : 'text-white/20 hover:text-white/40'
                  }
                />
              </button>
            );
          })}
        </div>
        <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
          Tap star
        </span>
      </div>
    </div>
  );
}

// ─── Suggest Modal (3-Step Flow: Media -> Category -> Strict Details) ────────
function SuggestModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [step, setStep] = useState<'media' | 'category' | 'details'>('media');
  const [images, setImages] = useState<string[]>([]);
  const [category, setCategory] = useState('cafe');
  const [placeName, setPlaceName] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const cat = getCat(category);

  const addFiles = (files: FileList) => {
    const slots = 4 - images.length;
    Array.from(files).slice(0, slots).forEach(f => {
      const reader = new FileReader();
      reader.onload = e => {
        const src = e.target?.result as string;
        if (src) {
          setImages(prev => prev.length < 4 ? [...prev, src] : prev);
        }
      };
      reader.readAsDataURL(f);
    });
  };

  const submit = async () => {
    if (!placeName.trim()) {
      setError('Place name is required.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide your tip or review.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      let finalImageUrl: string | undefined = undefined;
      if (images.length) {
        const uploadedUrls = await Promise.all(images.map((img) => uploadImage(img, 'stories')));
        const validUrls = uploadedUrls.filter(Boolean);
        if (validUrls.length) finalImageUrl = encodeImgs(validUrls);
      }

      const body = {
        content: description.trim(),
        location: placeName.trim(),
        imageUrl: finalImageUrl,
        hashtags: [category, `rating:${rating}`].filter(Boolean),
      };

      const res = await authFetch('/api/posts', { method: 'POST', body: JSON.stringify(body) });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        setError(errJson?.error || 'Failed to post. Please try again.');
        return;
      }
      onCreated();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const CAT_DESCRIPTIONS: Record<string, string> = {
    cafe:      'Chai spots & roasters',
    stay:      'Resorts & homestays',
    viewpoint: 'Scenic overlooks',
    route:     'Roads & riding paths',
    hidden:    'Off-the-map finds',
    camping:   'Camp sites',
    food:      'Dhabas & eateries',
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0f10] border-t border-white/10 rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-white/5 h-1">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: step === 'media' ? '33.33%' : step === 'category' ? '66.66%' : '100%',
            }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/6 shrink-0">
          <div className="flex items-center gap-2">
            {step !== 'media' && (
              <button
                onClick={() => setStep(step === 'details' ? 'category' : 'media')}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mr-1 text-white hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <div>
              <h2 className="text-[15px] font-black text-white">
                {step === 'media' && 'Share a Story / Suggest Place'}
                {step === 'category' && 'Select Category'}
                {step === 'details' && `About ${placeName || cat.label}`}
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {step === 'media' && 'Step 1 of 3: Add photos from camera or gallery'}
                {step === 'category' && 'Step 2 of 3: Choose what kind of spot this is'}
                {step === 'details' && 'Step 3 of 3: Name, review & 5-star rating'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={e => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <AnimatePresence mode="wait">
            {/* STEP 1: MEDIA FIRST (Camera or Gallery) */}
            {step === 'media' && (
              <motion.div
                key="step-media"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="space-y-5"
              >
                <div className="text-center py-2">
                  <p className="text-sm font-bold text-white">Start with a Photo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click a fresh photo from your camera or pick from your device gallery
                  </p>
                </div>

                {/* Camera & Gallery Trigger Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Camera Option */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-5 rounded-2xl border bg-amber-400/5 border-amber-400/20 hover:border-amber-400/50 hover:bg-amber-400/10 flex flex-col items-center justify-center text-center gap-3 transition-all group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shadow-lg shadow-amber-400/10">
                      <Camera size={26} />
                    </div>
                    <div>
                      <p className="font-black text-sm text-white group-hover:text-amber-300">Click from Camera</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Take photo now</p>
                    </div>
                  </button>

                  {/* Gallery Option */}
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="p-5 rounded-2xl border bg-primary/5 border-primary/20 hover:border-primary/50 hover:bg-primary/10 flex flex-col items-center justify-center text-center gap-3 transition-all group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-lg shadow-primary/10">
                      <ImageIcon size={26} />
                    </div>
                    <div>
                      <p className="font-black text-sm text-white group-hover:text-primary">Choose from Gallery</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Select from device</p>
                    </div>
                  </button>
                </div>

                {/* Previews if any images selected */}
                {images.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">
                        Selected Photos ({images.length}/4)
                      </span>
                      {images.length < 4 && (
                        <span className="text-[10px] text-muted-foreground">Add up to {4 - images.length} more</span>
                      )}
                    </div>

                    <div className="flex gap-2.5 flex-wrap">
                      {images.map((src, i) => (
                        <div
                          key={i}
                          className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/15 shrink-0 group shadow-md"
                        >
                          <img src={src} alt="selected" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}

                      {images.length < 4 && (
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            title="Add with camera"
                            className="w-20 h-20 rounded-2xl border-2 border-dashed border-amber-400/30 hover:border-amber-400 bg-amber-400/5 flex flex-col items-center justify-center gap-1 text-amber-400 transition-colors"
                          >
                            <Camera size={18} />
                            <span className="text-[9px] font-bold">Camera</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            title="Add from gallery"
                            className="w-20 h-20 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary bg-primary/5 flex flex-col items-center justify-center gap-1 text-primary transition-colors"
                          >
                            <ImageIcon size={18} />
                            <span className="text-[9px] font-bold">Gallery</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Continue button or skip */}
                <div className="pt-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => setStep('category')}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-black font-black text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    <span>Next: Select Category</span>
                    <ChevronRight size={16} />
                  </button>
                  {images.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setStep('category')}
                      className="w-full py-2 text-xs text-white/50 hover:text-white transition-colors"
                    >
                      Or continue without photo
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: CATEGORY SELECTION */}
            {step === 'category' && (
              <motion.div
                key="step-category"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="space-y-4"
              >
                <div className="text-center py-1">
                  <p className="text-sm font-bold text-white">What type of place is this?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select a category to help fellow riders discover it easily
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {CATEGORIES.slice(1).map(c => {
                    const isSelected = category === c.id;
                    return (
                      <motion.button
                        key={c.id}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          setCategory(c.id);
                          setStep('details');
                        }}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-white/10 border-primary ring-1 ring-primary/40'
                            : 'bg-white/4 border-white/8 hover:border-white/20'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                          style={{ background: c.bg, borderColor: c.border }}
                        >
                          <c.Icon size={18} style={{ color: c.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-sm text-white truncate">{c.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight truncate">
                            {CAT_DESCRIPTIONS[c.id]}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: STRICTLY 3 FIELDS ONLY (Place Name, Review/Tip, 5-Star Rating) */}
            {step === 'details' && (
              <motion.div
                key="step-details"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="space-y-5 pb-2"
              >
                {/* Selected Category Pill */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/4 border border-white/8">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center border"
                      style={{ background: cat.bg, borderColor: cat.border }}
                    >
                      <cat.Icon size={15} style={{ color: cat.color }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{cat.label}</p>
                      <p className="text-[10px] text-muted-foreground">{CAT_DESCRIPTIONS[cat.id]}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('category')}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Change
                  </button>
                </div>

                {/* 1. Place Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-white/60 uppercase tracking-widest">
                    Place Name *
                  </label>
                  <input
                    autoFocus
                    value={placeName}
                    onChange={e => setPlaceName(e.target.value)}
                    placeholder={
                      category === 'cafe'      ? 'e.g. Third Wave Coffee, Café Arambol' :
                      category === 'stay'      ? 'e.g. Zostel Manali, Forest Homestay' :
                      category === 'viewpoint' ? 'e.g. Tiger Hill, Rohtang Top' :
                      category === 'route'     ? 'e.g. Spiti Valley Loop, Pali Ghat' :
                      category === 'hidden'    ? 'e.g. Secret Waterfall, Ridge Road' :
                      category === 'camping'   ? 'e.g. Chopta Meadow, Bir Billing Site' :
                                                 'e.g. Punjabi Dhaba, Pindi Chicken House'
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-primary/50 text-sm font-semibold"
                  />
                </div>

                {/* 2. Your TIP / REVIEW */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-white/60 uppercase tracking-widest">
                      Your TIP / REVIEW *
                    </label>
                    <span className="text-[10px] text-muted-foreground">{description.length}/500</span>
                  </div>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What makes this place special? Best dish, must-try tip, parking tip, road condition, best time to visit..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-primary/50 text-sm resize-none leading-relaxed"
                  />
                </div>

                {/* 3. 5-Star Rating */}
                <StarRating value={rating} onChange={setRating} />

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    <X size={12} /> {error}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit footer - on step 3 */}
        {step === 'details' && (
          <div className="px-5 py-4 border-t border-white/6 shrink-0">
            <button
              onClick={submit}
              disabled={submitting || !placeName.trim() || !description.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-black font-black text-sm hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {submitting
                ? <><Loader2 size={15} className="animate-spin" /> Sharing with Community…</>
                : <><CheckCircle2 size={15} /> Share with the Community</>
              }
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}

// ─── Comment Drawer ───────────────────────────────────────────────────────────
function CommentDrawer({ post, onClose }: { post: any; onClose: () => void }) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [text,     setText]     = useState('');
  const [sending,  setSending]  = useState(false);
  const placeName = decodeName(post.location) || 'this place';

  useEffect(() => {
    authFetch(`/api/posts/${post.id}/comments`)
      .then(r => r.json())
      .then(d => { setComments(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [post.id]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await authFetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: text.trim() }),
      });
      if (res.ok) {
        const c = await res.json();
        setComments(p => [c, ...p]);
        setText('');
      }
    } catch { /* network error — silently ignore */ }
    finally { setSending(false); }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0f10] border-t border-white/10 rounded-t-3xl max-h-[75vh] flex flex-col"
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/6 shrink-0">
          <div>
            <h3 className="text-sm font-black text-white">Community Tips</h3>
            <p className="text-[10px] text-muted-foreground">{placeName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <MessageCircle size={26} className="opacity-25" />
              <p className="text-sm">No tips yet — be the first!</p>
            </div>
          ) : comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage src={c.author?.avatarUrl} />
                <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                  {c.author?.name?.charAt(0) ?? '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-white/4 rounded-2xl px-3 py-2.5">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <p className="text-xs font-black text-white">{c.author?.name}</p>
                  <p className="text-[10px] text-muted-foreground">{timeAgo(c.createdAt)}</p>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-white/6 flex gap-2 shrink-0">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Add a tip or ask something…"
            className="flex-1 px-4 py-2.5 rounded-2xl bg-white/6 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/40"
          />
          <button
            onClick={send}
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-black disabled:opacity-40 shrink-0"
          >
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </motion.div>
    </>
  );
}
