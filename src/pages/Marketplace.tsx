import React, { useState } from 'react';
import { useGetProducts, useGetCart } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { ShoppingBag, ShoppingCart, Bell, Check, Sparkles, Compass, ShieldCheck, ArrowRight, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const UPCOMING_CATEGORIES = [
  {
    icon: '🎧',
    name: 'SENA Mesh Intercoms',
    tag: '50S, 50R & Spider Series',
    desc: 'Crystal-clear group audio and multi-channel open mesh for uninterrupted rides.',
  },
  {
    icon: '🎥',
    name: 'Action Cameras & Mounts',
    tag: 'GoPro & Insta360 Gear',
    desc: 'Ultra-stable 4K & 360° moto recording with chin mounts and wind-noise mic adapters.',
  },
  {
    icon: '🛸',
    name: 'Touring & Aerial Drones',
    tag: 'DJI Mini & Avata Kits',
    desc: 'Compact fly-cams to capture stunning highway landscapes and twisty mountain routes.',
  },
];

export default function Marketplace() {
  const { data: cart } = useGetCart();
  const { data: products } = useGetProducts();
  const { toast } = useToast();

  const [isNotified, setIsNotified] = useState(() => {
    return localStorage.getItem('motohippi_marketplace_notify') === 'true';
  });

  const cartCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;

  const handleNotifyMe = () => {
    if (!isNotified) {
      localStorage.setItem('motohippi_marketplace_notify', 'true');
      setIsNotified(true);
      toast({
        title: '🎉 You are on the VIP List!',
        description: 'We will notify you the moment the first gear drop goes live.',
      });
    } else {
      localStorage.removeItem('motohippi_marketplace_notify');
      setIsNotified(false);
      toast({
        title: 'Notification removed',
        description: 'You will not receive marketplace launch alerts.',
      });
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] md:min-h-screen overflow-hidden text-white flex flex-col justify-between">
      {/* ── Background Atmosphere with the provided image ── */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-110 pointer-events-none"
        style={{ backgroundImage: "url('/marketplace-coming-soon.jpg')" }}
      />
      {/* Dark gradient & vignette overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e071e]/85 via-[#0b0816]/92 to-[#07050d] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-400/15 rounded-full blur-[140px] pointer-events-none" />

      {/* ── Content Container ── */}
      <div className="relative z-10 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col flex-1">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-4 mb-6 md:mb-10">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Marketplace</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                Coming Soon
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Curated riding gear, intercoms, and touring tech.
            </p>
          </div>

          <Link href="/cart">
            <button className="relative flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/40 hover:bg-white/10 transition-all text-white font-semibold text-xs md:text-sm">
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">My Cart</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-black text-[10px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </Link>
        </div>

        {/* Main Hero & Teaser Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-2 md:py-6">
          
          {/* Left Column: The "Something Big Is Coming" Image Artwork */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative group max-w-[360px] md:max-w-[420px] w-full">
              {/* Outer Neon Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-yellow-400 to-purple-600 rounded-[28px] opacity-40 blur-xl group-hover:opacity-70 transition duration-1000 group-hover:duration-300 animate-tilt" />

              {/* Framed Image Card */}
              <div className="relative rounded-3xl overflow-hidden border border-purple-500/30 bg-[#160c2b] shadow-[0_20px_50px_rgba(102,16,242,0.35)]">
                <img
                  src="/marketplace-coming-soon.jpg"
                  alt="Something Big Is Coming - MotoHippi Marketplace"
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                />

                {/* Subtle overlay badge */}
                <div className="absolute top-3 right-3 backdrop-blur-md bg-black/60 border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
                  <Sparkles size={13} className="text-yellow-400" />
                  Official Drop
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Copy, Category Sneak-Peek & CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col justify-center space-y-6"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs font-bold mb-3">
                <Radio size={14} className="text-yellow-400 animate-pulse" />
                Items Coming Soon to Buy
              </div>

              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight md:leading-none text-white">
                Something Big <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400">
                  Is In The Works!
                </span>
              </h2>

              <p className="mt-3 text-sm md:text-base text-zinc-300/90 leading-relaxed max-w-xl">
                We are teaming up with authorized distributors to bring verified riding gear directly into the app. Expect rider-exclusive rates, guaranteed authenticity, and doorstep delivery.
              </p>
            </div>

            {/* Category Sneak Peek Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {UPCOMING_CATEGORIES.map((cat) => (
                <div
                  key={cat.name}
                  className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-purple-400/30 hover:bg-white/[0.07] transition-all backdrop-blur-sm"
                >
                  <div className="text-2xl mb-1.5">{cat.icon}</div>
                  <div className="font-bold text-xs md:text-sm text-white line-clamp-1">{cat.name}</div>
                  <div className="text-[10px] text-yellow-400/90 font-semibold mb-1">{cat.tag}</div>
                  <div className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                    {cat.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Guarantee Pills */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-emerald-400" />
                100% Genuine Gear
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={15} className="text-yellow-400" />
                Rider Community Discounts
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShoppingBag size={15} className="text-purple-400" />
                Official Brand Warranties
              </span>
            </div>

            {/* Actions: Notify button & Explore Community */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleNotifyMe}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg ${
                  isNotified
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                    : 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black shadow-yellow-500/20 hover:shadow-yellow-500/40'
                }`}
              >
                {isNotified ? (
                  <>
                    <Check size={18} className="text-emerald-300" />
                    <span>You're on the list! (Click to cancel)</span>
                  </>
                ) : (
                  <>
                    <Bell size={18} />
                    <span>Notify Me When Shop Opens</span>
                  </>
                )}
              </button>

              <Link href="/feed">
                <button className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white font-semibold text-sm transition-all">
                  <Compass size={17} className="text-zinc-400" />
                  <span>Explore Stories</span>
                  <ArrowRight size={15} className="text-zinc-500" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Footer info note */}
        <div className="mt-8 pt-4 border-t border-white/5 text-center text-xs text-zinc-500">
          Want to showcase or list verified gear on MotoHippi? Reach out via our rider support in Settings.
        </div>
      </div>
    </div>
  );
}
