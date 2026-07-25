/**
 * FloatingLoginIcons
 *
 * Six SVG-animated icons that float around the login/signup card.
 *
 * Visibility tiers (tailwind breakpoints):
 *   < md   → all icons hidden  (mobile: just the clean card)
 *   md–lg  → 4 corner icons    (tablet)
 *   lg+    → all 6 icons       (desktop: + mid-left / mid-right)
 *
 * Float:  translateY 0 ↔ -10px, 5 s ease-in-out alternate, per-icon delay
 * Glow:   drop-shadow(0 0 12px rgba(214,255,47,0.25))
 * Opacity: 0.28
 * Size:   68 × 68 px (fits the icon padding zone on all breakpoints)
 */

import React from 'react';

const LIME      = '#D6FF2F';
const LIME_DIM  = 'rgba(214,255,47,0.45)';
const WHITE_DIM = 'rgba(255,255,255,0.35)';
const SIZE      = 68;

// ─── Wrapper ──────────────────────────────────────────────────────────────────
interface FloatIconProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  delay?: number;
  /** Tailwind visibility class – defaults to hiding on < md */
  vis?: string;
}

function FloatIcon({
  children,
  style = {},
  delay = 0,
  vis = 'hidden md:block',
}: FloatIconProps) {
  return (
    <div
      className={`absolute pointer-events-none select-none ${vis}`}
      style={{
        width: SIZE,
        height: SIZE,
        opacity: 0.28,
        filter: 'drop-shadow(0 0 12px rgba(214,255,47,0.25))',
        animationName: 'mh-float',
        animationDuration: '5s',
        animationTimingFunction: 'ease-in-out',
        animationDelay: `${delay}s`,
        animationIterationCount: 'infinite',
        animationDirection: 'alternate',
        zIndex: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── 1. Compass ───────────────────────────────────────────────────────────────
function CompassIcon() {
  return (
    <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="45" cy="45" r="38" stroke={LIME} strokeWidth="2" />
      <rect x="43.5" y="8"  width="3" height="9" fill={LIME} opacity="0.7" />
      <rect x="43.5" y="73" width="3" height="9" fill={LIME} opacity="0.7" />
      <rect x="8"  y="43.5" width="9" height="3" fill={LIME} opacity="0.7" />
      <rect x="73" y="43.5" width="9" height="3" fill={LIME} opacity="0.7" />
      <g>
        {/* @ts-ignore */}
        <animateTransform attributeName="transform" type="rotate"
          from="0 45 45" to="360 45 45" dur="4s" repeatCount="indefinite" />
        <rect x="43" y="19" width="4" height="26" rx="2" fill={LIME} />
        <rect x="43" y="45" width="4" height="26" rx="2" fill={WHITE_DIM} />
      </g>
      <circle cx="45" cy="45" r="3.5" fill={LIME} />
    </svg>
  );
}

// ─── 2. Motorcycle ────────────────────────────────────────────────────────────
function BikeIcon() {
  return (
    <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* rear wheel */}
      <g>
        {/* @ts-ignore */}
        <animateTransform attributeName="transform" type="rotate"
          from="0 21 60" to="360 21 60" dur="1.8s" repeatCount="indefinite" />
        <circle cx="21" cy="60" r="18" stroke={LIME} strokeWidth="2" />
        <line x1="21" y1="42" x2="21" y2="78" stroke={LIME_DIM} strokeWidth="1.5" />
        <line x1="3"  y1="60" x2="39" y2="60" stroke={LIME_DIM} strokeWidth="1.5" />
        <line x1="8.3"  y1="47.3" x2="33.7" y2="72.7" stroke={LIME_DIM} strokeWidth="1" />
        <line x1="33.7" y1="47.3" x2="8.3"  y2="72.7" stroke={LIME_DIM} strokeWidth="1" />
      </g>
      {/* front wheel */}
      <g>
        {/* @ts-ignore */}
        <animateTransform attributeName="transform" type="rotate"
          from="0 69 60" to="360 69 60" dur="1.8s" repeatCount="indefinite" />
        <circle cx="69" cy="60" r="18" stroke={LIME} strokeWidth="2" />
        <line x1="69" y1="42" x2="69" y2="78" stroke={LIME_DIM} strokeWidth="1.5" />
        <line x1="51" y1="60" x2="87" y2="60" stroke={LIME_DIM} strokeWidth="1.5" />
        <line x1="56.3" y1="47.3" x2="81.7" y2="72.7" stroke={LIME_DIM} strokeWidth="1" />
        <line x1="81.7" y1="47.3" x2="56.3" y2="72.7" stroke={LIME_DIM} strokeWidth="1" />
      </g>
      {/* frame */}
      <polyline points="21,60 37,30 55,44 69,60"
        stroke={LIME} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* handlebars */}
      <line x1="55" y1="44" x2="55" y2="26" stroke={LIME} strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="26" x2="62" y2="26" stroke={LIME} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── 3. Insurance shield ──────────────────────────────────────────────────────
function InsuranceIcon() {
  return (
    <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g style={{
        transformOrigin: '45px 47px',
        transformBox: 'fill-box',
        animation: 'shield-pulse 2.5s ease-in-out infinite',
      } as React.CSSProperties}>
        <path d="M45 10 L76 24 L76 52 Q76 70 45 82 Q14 70 14 52 L14 24 Z"
          stroke={LIME} strokeWidth="2" fill="none" />
        <polyline points="30,47 41,58 62,36"
          stroke={LIME} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

// ─── 4. Community ─────────────────────────────────────────────────────────────
function CommunityIcon() {
  return (
    <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* connecting lines */}
      <line x1="18" y1="18" x2="45" y2="45" stroke={LIME} strokeWidth="1.5">
        {/* @ts-ignore */}
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="72" y1="18" x2="45" y2="45" stroke={LIME} strokeWidth="1.5">
        {/* @ts-ignore */}
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.4s" repeatCount="indefinite" />
      </line>
      <line x1="18" y1="72" x2="45" y2="45" stroke={LIME} strokeWidth="1.5">
        {/* @ts-ignore */}
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" />
      </line>
      <line x1="72" y1="72" x2="45" y2="45" stroke={LIME} strokeWidth="1.5">
        {/* @ts-ignore */}
        <animate attributeName="opacity" values="1;0.4;1" dur="2.2s" repeatCount="indefinite" />
      </line>
      {/* corner nodes */}
      <circle cx="18" cy="18" r="7" fill={LIME}>
        {/* @ts-ignore */}
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="72" cy="18" r="7" fill={LIME}>
        {/* @ts-ignore */}
        <animate attributeName="opacity" values="1;0.5;1" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="18" cy="72" r="7" fill={LIME}>
        {/* @ts-ignore */}
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="72" cy="72" r="7" fill={LIME}>
        {/* @ts-ignore */}
        <animate attributeName="opacity" values="1;0.6;1" dur="2.2s" repeatCount="indefinite" />
      </circle>
      {/* center pulse */}
      <circle cx="45" cy="45" fill={LIME}>
        {/* @ts-ignore */}
        <animate attributeName="r"       values="9;14;9"    dur="2s" repeatCount="indefinite" />
        {/* @ts-ignore */}
        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// ─── 5. Overland 4×4 ─────────────────────────────────────────────────────────
function OverlandIcon() {
  return (
    <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* body */}
      <rect x="6" y="36" width="78" height="22" rx="3" stroke={LIME} strokeWidth="2" />
      {/* roof */}
      <path d="M20 36 L26 18 L64 18 L70 36" stroke={LIME} strokeWidth="2" fill="none" strokeLinejoin="round" />
      {/* rear wheel */}
      <g>
        {/* @ts-ignore */}
        <animateTransform attributeName="transform" type="rotate"
          from="0 20 65" to="360 20 65" dur="2s" repeatCount="indefinite" />
        <circle cx="20" cy="65" r="13" stroke={LIME} strokeWidth="2" />
        <line x1="20" y1="52" x2="20" y2="78" stroke={LIME_DIM} strokeWidth="1.5" />
        <line x1="7"  y1="65" x2="33" y2="65" stroke={LIME_DIM} strokeWidth="1.5" />
      </g>
      {/* front wheel */}
      <g>
        {/* @ts-ignore */}
        <animateTransform attributeName="transform" type="rotate"
          from="0 70 65" to="360 70 65" dur="2s" repeatCount="indefinite" />
        <circle cx="70" cy="65" r="13" stroke={LIME} strokeWidth="2" />
        <line x1="70" y1="52" x2="70" y2="78" stroke={LIME_DIM} strokeWidth="1.5" />
        <line x1="57" y1="65" x2="83" y2="65" stroke={LIME_DIM} strokeWidth="1.5" />
      </g>
    </svg>
  );
}

// ─── 6. Connecting riders ─────────────────────────────────────────────────────
function ConnectingRidersIcon() {
  return (
    <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* dashed line */}
      <line y1="45" y2="45" stroke={LIME} strokeWidth="1.5" strokeDasharray="5 3">
        {/* @ts-ignore */}
        <animate attributeName="x1" values="18;40;40;18"
          keyTimes="0;0.45;0.55;1" dur="3.5s" repeatCount="indefinite" />
        {/* @ts-ignore */}
        <animate attributeName="x2" values="72;50;50;72"
          keyTimes="0;0.45;0.55;1" dur="3.5s" repeatCount="indefinite" />
        {/* @ts-ignore */}
        <animate attributeName="opacity" values="0.4;0.9;0.9;0.4"
          keyTimes="0;0.45;0.55;1" dur="3.5s" repeatCount="indefinite" />
      </line>
      {/* left pin */}
      <circle r="9" fill={LIME}>
        {/* @ts-ignore */}
        <animate attributeName="cx" values="18;40;40;18"
          keyTimes="0;0.45;0.55;1" dur="3.5s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.4 0 0.6 1;0 0 1 1;0.4 0 0.6 1" />
        {/* @ts-ignore */}
        <animate attributeName="cy" values="45;45;45;45" dur="3.5s" repeatCount="indefinite" />
      </circle>
      {/* right pin */}
      <circle r="9" fill={LIME}>
        {/* @ts-ignore */}
        <animate attributeName="cx" values="72;50;50;72"
          keyTimes="0;0.45;0.55;1" dur="3.5s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.4 0 0.6 1;0 0 1 1;0.4 0 0.6 1" />
        {/* @ts-ignore */}
        <animate attributeName="cy" values="45;45;45;45" dur="3.5s" repeatCount="indefinite" />
      </circle>
      {/* center burst */}
      <circle cx="45" cy="45" fill={LIME}>
        {/* @ts-ignore */}
        <animate attributeName="r" values="0;0;20;0"
          keyTimes="0;0.44;0.56;1" dur="3.5s" repeatCount="indefinite" />
        {/* @ts-ignore */}
        <animate attributeName="opacity" values="0;0;0.65;0"
          keyTimes="0;0.44;0.56;1" dur="3.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
/*
  Layout (corner=md+, side=lg+):

        [TL connecting-riders]  CARD  [TR compass]
        [ML bike]──────────────────────[MR insurance]   ← lg+ only
        [BL community]          CARD  [BR overland]
*/
export function FloatingLoginIcons() {
  const CORNER = 'hidden md:block';   // tablet and up
  const SIDE   = 'hidden lg:block';   // desktop only

  return (
    <>
      {/* ── Top-left: connecting riders ── */}
      <FloatIcon delay={0}   vis={CORNER} style={{ top: 10, left: 10 }}>
        <ConnectingRidersIcon />
      </FloatIcon>

      {/* ── Top-right: compass ── */}
      <FloatIcon delay={0.7} vis={CORNER} style={{ top: 10, right: 10 }}>
        <CompassIcon />
      </FloatIcon>

      {/* ── Mid-left: motorcycle (desktop only) ── */}
      <FloatIcon delay={1.2} vis={SIDE}   style={{ top: `calc(50% - ${SIZE / 2}px)`, left: 10 }}>
        <BikeIcon />
      </FloatIcon>

      {/* ── Mid-right: insurance (desktop only) ── */}
      <FloatIcon delay={0.4} vis={SIDE}   style={{ top: `calc(50% - ${SIZE / 2}px)`, right: 10 }}>
        <InsuranceIcon />
      </FloatIcon>

      {/* ── Bottom-left: community ── */}
      <FloatIcon delay={1.8} vis={CORNER} style={{ bottom: 10, left: 10 }}>
        <CommunityIcon />
      </FloatIcon>

      {/* ── Bottom-right: overland 4×4 ── */}
      <FloatIcon delay={0.9} vis={CORNER} style={{ bottom: 10, right: 10 }}>
        <OverlandIcon />
      </FloatIcon>
    </>
  );
}
