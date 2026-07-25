/**
 * PartnerOffersCarousel
 * ---------------------
 * Reusable "Exclusive Partner Offers" carousel card.
 *
 * Props per slide:
 *   title        — heading text
 *   subtitle     — sub-heading text
 *   animation    — React node (SVG / DotLottie / anything)
 *   cta          — button label (default "Coming Soon")
 *   link         — optional href; renders a disabled button when absent
 *   isComingSoon — renders the button disabled (default true)
 *
 * Palette sourced from Friends.lottie:
 *   #191247  deep indigo (bg)
 *   #27235e  indigo mid
 *   #0abbe3  bright cyan
 *   #37c4ee  sky blue
 *   #4d64ad  blue-purple
 *   #f15e5f  coral / red-pink
 *   #f7a6a8  soft pink
 *   #ffffff  white
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// ─── Slide type ───────────────────────────────────────────────────────────────
export interface PartnerSlide {
  id: string;
  title: string;
  subtitle: string;
  animation: React.ReactNode;
  cta?: string;
  link?: string;
  isComingSoon?: boolean;
}

interface PartnerOffersCarouselProps {
  slides: PartnerSlide[];
  /** Milliseconds each slide is shown (default 4000) */
  interval?: number;
}

// ─── Colour palette (from Friends.lottie) ────────────────────────────────────
const C = {
  indigoDark: '#191247',
  indigoMid:  '#27235e',
  purple:     '#4d64ad',
  cyan:       '#0abbe3',
  sky:        '#37c4ee',
  coral:      '#f15e5f',
  pink:       '#f7a6a8',
  white:      '#ffffff',
};

// ─── 1. Travel Packages ───────────────────────────────────────────────────────
export function TravelAnimation() {
  return (
    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full" aria-hidden>
      {/* Sky gradient wash */}
      <rect width="200" height="200" rx="20" fill={C.indigoDark} fillOpacity="0.45" />

      {/* Mountain range */}
      <motion.polygon points="20,155 65,90 110,155" fill={C.indigoMid} fillOpacity="0.9"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }} />
      <motion.polygon points="80,155 130,75 180,155" fill={C.purple} fillOpacity="0.8"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35 }} />
      {/* Snow cap */}
      <motion.polygon points="130,75 143,102 117,102" fill={C.sky} fillOpacity="0.85"
        initial={{ opacity: 0 }} animate={{ opacity: [0, 0.85, 0.85, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, delay: 0.7 }} />

      {/* Road curve */}
      <motion.path d="M15 158 Q100 100 185 158" stroke={C.cyan}
        strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray="220"
        initial={{ strokeDashoffset: 220 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }} />

      {/* Rider dot travelling the road */}
      <motion.circle r="6" fill={C.coral}
        animate={{ offsetDistance: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
        style={{ offsetPath: "path('M15 158 Q100 100 185 158')" } as React.CSSProperties}
        transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' }} />

      {/* Start pin */}
      <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 280 }}>
        <circle cx="15" cy="158" r="5" fill={C.cyan} />
        <line x1="15" y1="153" x2="15" y2="141" stroke={C.cyan} strokeWidth="2" />
        <circle cx="15" cy="139" r="3.5" fill={C.cyan} fillOpacity="0.4" />
      </motion.g>
      {/* End pin */}
      <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.85, type: 'spring', stiffness: 280 }}>
        <circle cx="185" cy="158" r="5" fill={C.coral} />
        <line x1="185" y1="153" x2="185" y2="141" stroke={C.coral} strokeWidth="2" />
        <circle cx="185" cy="139" r="3.5" fill={C.coral} fillOpacity="0.4" />
      </motion.g>

      {/* Stars */}
      {[{cx:35,cy:40,d:0},{cx:155,cy:38,d:0.5},{cx:98,cy:28,d:1}].map((s,i) => (
        <motion.circle key={i} cx={s.cx} cy={s.cy} r="2" fill={C.sky}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.4, 0.8] }}
          transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: s.d }} />
      ))}
    </svg>
  );
}

// ─── 2. Find Partner — real .lottie file ─────────────────────────────────────
export function FriendsAnimation() {
  return (
    <DotLottieReact
      src="/friends.lottie"
      autoplay
      loop
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// ─── Bag-Pack-Go — real .lottie file ─────────────────────────────────────────
export function TravelLottieAnimation() {
  return (
    <DotLottieReact
      src="/travel.lottie"
      autoplay
      loop
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// ─── 3. Exclusive Deals ───────────────────────────────────────────────────────
export function SaleAnimation() {
  return (
    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full" aria-hidden>
      {/* Background circle */}
      <motion.circle cx="100" cy="100" r="68" fill={C.indigoDark} fillOpacity="0.55"
        initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }} />

      {/* Outer pulse ring */}
      <motion.circle cx="100" cy="100" r="68" stroke={C.cyan} strokeWidth="1.2" fill="none"
        animate={{ r: [64, 78, 64], opacity: [0.5, 0.05, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }} />

      {/* Badge star */}
      <motion.path
        d="M100 30 L113 54 L140 56 L120 76 L126 103 L100 90 L74 103 L80 76 L60 56 L87 54 Z"
        fill={C.indigoMid} stroke={C.cyan} strokeWidth="1.8"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, delay: 0.2 }} />

      {/* Inner ribbon */}
      <motion.path d="M72 108 Q100 118 128 108 L132 128 Q100 140 68 128 Z"
        fill={C.purple} fillOpacity="0.7"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }} />

      {/* % sign */}
      <motion.text x="100" y="87" textAnchor="middle" fontSize="30" fontWeight="900"
        fill={C.sky}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 260 }}>
        %
      </motion.text>

      {/* Label */}
      <motion.text x="100" y="122" textAnchor="middle" fontSize="10" fontWeight="700"
        letterSpacing="2.5" fill={C.white} fillOpacity="0.85"
        initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ delay: 0.8 }}>
        DEALS
      </motion.text>

      {/* Corner sparkles */}
      {[{x:50,y:50,d:0},{x:152,y:48,d:0.35},{x:150,y:152,d:0.65},{x:48,y:154,d:1}].map((s,i) => (
        <motion.g key={i} transform={`translate(${s.x},${s.y})`}>
          <motion.line x1="0" y1="-7" x2="0" y2="7" stroke={C.coral} strokeWidth="1.5"
            animate={{ opacity: [0,1,0], scaleY: [0.5,1,0.5] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: s.d }} />
          <motion.line x1="-7" y1="0" x2="7" y2="0" stroke={C.coral} strokeWidth="1.5"
            animate={{ opacity: [0,1,0], scaleX: [0.5,1,0.5] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: s.d }} />
        </motion.g>
      ))}
    </svg>
  );
}

// ─── 4. Biking Gear & Accessories ─────────────────────────────────────────────
export function ShoppingAnimation() {
  return (
    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full" aria-hidden>
      {/* Cart body */}
      <motion.path d="M52 72 L64 125 L148 125 L158 72 Z"
        fill={C.indigoMid} fillOpacity="0.7"
        stroke={C.cyan} strokeWidth="1.8"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }} />

      {/* Handle */}
      <motion.path d="M36 57 L52 72 L158 72 L172 57"
        stroke={C.sky} strokeWidth="2.5" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay: 0.3 }} />
      <motion.circle cx="36" cy="52" r="6" fill={C.cyan}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: 'spring' }} />
      <motion.circle cx="172" cy="52" r="6" fill={C.cyan}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: 'spring' }} />

      {/* Wheels */}
      {[82, 126].map((cx, i) => (
        <motion.circle key={i} cx={cx} cy="136" r="11"
          fill={C.indigoDark} stroke={C.purple} strokeWidth="2.5"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.65 + i * 0.1, type: 'spring' }} />
      ))}
      {[82, 126].map((cx, i) => (
        <motion.circle key={`h${i}`} cx={cx} cy="136" r="3.5" fill={C.purple}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.8 + i * 0.1 }} />
      ))}

      {/* Helmet in cart */}
      <motion.path d="M86 98 Q105 78 118 98 L118 112 Q105 118 86 112 Z"
        fill={C.coral} fillOpacity="0.92"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: [null, 0, 2, 0], opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5,
          y: { duration: 1.8, repeat: Infinity, repeatType: 'mirror', delay: 1.3 } }} />
      {/* Visor slit */}
      <motion.path d="M89 105 Q105 102 116 105" stroke={C.indigoDark} strokeWidth="2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} />

      {/* Side gear icons */}
      {[
        { x: 63, y: 96, char: '🧤' },
        { x: 121, y: 98, char: '📷' },
      ].map((item, i) => (
        <motion.text key={i} x={item.x} y={item.y} fontSize="13"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 + i * 0.2, type: 'spring' }}>
          {item.char}
        </motion.text>
      ))}

      {/* Add badge */}
      <motion.circle cx="158" cy="58" r="9" fill={C.sky}
        animate={{ scale: [1, 1.25, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, delay: 1.4 }} />
      <motion.text x="158" y="62" textAnchor="middle" fontSize="11"
        fontWeight="900" fill={C.indigoDark}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
        +
      </motion.text>
    </svg>
  );
}

// ─── Carousel ─────────────────────────────────────────────────────────────────
export default function PartnerOffersCarousel({
  slides,
  interval = 4000,
}: PartnerOffersCarouselProps) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);

  const goTo = useCallback((index: number) => {
    setVisible(false);
    setTimeout(() => {
      setActive(index);
      setVisible(true);
    }, 300);
  }, []);

  const advance = useCallback(() => {
    goTo((active + 1) % slides.length);
  }, [active, slides.length, goTo]);

  useEffect(() => {
    const timer = setInterval(advance, interval);
    return () => clearInterval(timer);
  }, [advance, interval]);

  const slide = slides[active];

  return (
    <motion.div
      className="relative w-full rounded-3xl overflow-hidden cursor-default select-none"
      style={{
        background: '#121212',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: '32px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 12px 52px rgba(10,187,227,0.12), 0 8px 40px rgba(0,0,0,0.45)',
      }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
    >
      {/* Section label */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]"
          style={{ color: C.cyan, opacity: 0.7 }}>
          MAKE FRIENDS * TRAVEL * CHILL
        </span>
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Animation — only the active slide is mounted */}
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={`anim-${active}`}
            className="mx-auto mb-6 flex items-center justify-center"
            style={{
              width:  'clamp(140px, 30vw, 220px)',
              height: 'clamp(140px, 30vw, 220px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {slide.animation}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text */}
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={`text-${active}`}
            className="text-center space-y-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-black text-white leading-tight"
              style={{ fontSize: 'clamp(20px, 3vw, 28px)' }}>
              {slide.title}
            </h3>
            <p className="text-base max-w-sm mx-auto leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.45)' }}>
              {slide.subtitle}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <div className="mt-7 flex justify-center">
        {slide.link && !slide.isComingSoon ? (
          <a href={slide.link}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-black text-sm transition-all"
            style={{ background: C.cyan, color: C.indigoDark }}>
            {slide.cta ?? 'Explore'}
          </a>
        ) : (
          <button disabled
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-black text-sm cursor-not-allowed"
            style={{ background: C.cyan, color: C.indigoDark, opacity: 0.4 }}>
            {slide.cta ?? 'Coming Soon'}
          </button>
        )}
      </div>

      {/* Progress dots */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => goTo(i)}
            className="rounded-full"
            style={{ background: i === active ? C.cyan : 'rgba(255,255,255,0.15)' }}
            animate={{
              width:  i === active ? 24 : 8,
              height: 8,
              scale:  i === active ? 1.1 : 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
