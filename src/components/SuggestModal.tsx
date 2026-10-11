import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Coffee, BedDouble, Eye, Navigation2, Gem, Tent, UtensilsCrossed,
  Globe, Loader2, ChevronLeft, ChevronRight, CheckCircle2,
  Camera, Image as ImageIcon, Star,
} from 'lucide-react';
import { uploadImage } from '@/lib/upload';

// ─── Category config ──────────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: 'all',       label: 'All',        Icon: Globe,           color: '#D6FF2F', bg: 'rgba(214,255,47,0.12)',  border: 'rgba(214,255,47,0.25)' },
  { id: 'cafe',      label: 'Café',       Icon: Coffee,          color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.30)' },
  { id: 'stay',      label: 'Stay',       Icon: BedDouble,       color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.30)' },
  { id: 'viewpoint', label: 'Viewpoint',  Icon: Eye,             color: '#C084FC', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.30)' },
  { id: 'route',     label: 'Route',      Icon: Navigation2,     color: '#34D399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.30)' },
  { id: 'hidden',    label: 'Hidden Gem', Icon: Gem,             color: '#FBBF24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.30)' },
  { id: 'camping',   label: 'Camping',    Icon: Tent,            color: '#4ADE80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.30)' },
  { id: 'food',      label: 'Food Spot',  Icon: UtensilsCrossed, color: '#F87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.30)' },
];

export const getCat = (id: string) => CATEGORIES.find(c => c.id === id) ?? CATEGORIES[0];

export const encodePlace = (name: string, city: string) => `${name}||${city}`;
export const decodeName = (loc: string | null) => loc?.split('||')[0] ?? '';
export const decodeCity = (loc: string | null) => loc?.split('||')[1] ?? '';
export const encodeImgs = (urls: string[]) => urls.join('|');
export const decodeImgs = (url: string | null): string[] => url ? url.split('|').filter(Boolean) : [];

const getToken = () => localStorage.getItem('motohippi_token') || sessionStorage.getItem('motohippi_token') || '';
const getApiBase = () => {
  const base = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';
  return base.replace(/\/api\/?$/, '').replace(/\/+$/, '');
};

const authFetch = (url: string, opts: RequestInit = {}) => {
  const cleanBase = getApiBase();
  const fullUrl = url.startsWith('http') ? url : `${cleanBase}${url.startsWith('/api') ? url : `/api${url}`}`;
  return fetch(fullUrl, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(opts.headers ?? {}),
    },
  });
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

// ─── 5-Star Rating Component ──────────────────────────────────────────────────
export function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const labels: Record<number, string> = {
    1: '1/5 · Terrible',
    2: '2/5 · Mediocre',
    3: '3/5 · Decent spot',
    4: '4/5 · Great ride destination',
    5: '5/5 · Absolute must-visit!',
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
                className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
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
export function SuggestModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed bottom-0 left-0 right-0 sm:max-w-lg sm:mx-auto z-[70] bg-[#0d0f10] border-t border-white/10 rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl"
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
                type="button"
                onClick={() => setStep(step === 'details' ? 'category' : 'media')}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mr-1 text-white hover:bg-white/10 transition-colors cursor-pointer"
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
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
                            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-red-500 transition-colors cursor-pointer"
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
                            className="w-20 h-20 rounded-2xl border-2 border-dashed border-amber-400/30 hover:border-amber-400 bg-amber-400/5 flex flex-col items-center justify-center gap-1 text-amber-400 transition-colors cursor-pointer"
                          >
                            <Camera size={18} />
                            <span className="text-[9px] font-bold">Camera</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            title="Add from gallery"
                            className="w-20 h-20 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary bg-primary/5 flex flex-col items-center justify-center gap-1 text-primary transition-colors cursor-pointer"
                          >
                            <ImageIcon size={18} />
                            <span className="text-[9px] font-bold">Gallery</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
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
                    className="text-xs text-primary font-bold hover:underline cursor-pointer"
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

        {/* Action footer - on step 1 */}
        {step === 'media' && (
          <div className="px-5 py-3.5 border-t border-white/6 shrink-0 bg-[#0d0f10] pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            <button
              type="button"
              onClick={() => setStep('category')}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-black font-black text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              <span>Next: Select Category</span>
              <ChevronRight size={16} />
            </button>
            {images.length === 0 && (
              <button
                type="button"
                onClick={() => setStep('category')}
                className="w-full pt-2 pb-0.5 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                Or continue without photo
              </button>
            )}
          </div>
        )}

        {/* Submit footer - on step 3 */}
        {step === 'details' && (
          <div className="px-5 py-4 border-t border-white/6 shrink-0 bg-[#0d0f10] pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            <button
              onClick={submit}
              disabled={submitting || !placeName.trim() || !description.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-black font-black text-sm hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20 cursor-pointer"
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
