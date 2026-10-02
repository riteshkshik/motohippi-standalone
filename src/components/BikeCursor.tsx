import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DustParticle {
  id: number;
  x: number;
  y: number;
  direction: number; // 1 = right, -1 = left
}

export function BikeCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = facing right, -1 = facing left
  const [isMoving, setIsMoving] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [particles, setParticles] = useState<DustParticle[]>([]);

  const prevX = useRef(0);
  const moveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particleId = useRef(0);
  const lastParticleTime = useRef(0);

  useEffect(() => {
    // Only enable on desktop pointer/mouse devices
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsDesktop(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  // Manage hiding the default system cursor on desktop when active
  useEffect(() => {
    if (isDesktop && isVisible) {
      document.documentElement.classList.add("bike-cursor-active");
    } else {
      document.documentElement.classList.remove("bike-cursor-active");
    }
    return () => {
      document.documentElement.classList.remove("bike-cursor-active");
    };
  }, [isDesktop, isVisible]);

  useEffect(() => {
    if (!isDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      const { clientX: x, clientY: y } = e;

      // Determine movement direction
      const dx = x - prevX.current;
      if (Math.abs(dx) > 1.5) {
        setDirection(dx > 0 ? 1 : -1);
      }
      prevX.current = x;

      setPos({ x, y });
      setIsMoving(true);

      // Check if hovering over clickable elements
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest("button") ||
          target.closest("a") ||
          target.closest("[role='button']") ||
          target.style.cursor === "pointer")
      ) {
        setIsHoveringClickable(true);
      } else {
        setIsHoveringClickable(false);
      }

      // Spawn dust/exhaust particles when running
      const now = Date.now();
      if (now - lastParticleTime.current > 70) {
        lastParticleTime.current = now;
        const currentDir = dx >= 0 ? 1 : -1;
        setParticles((prev) => [
          ...prev.slice(-10),
          {
            id: particleId.current++,
            x: x + (currentDir === 1 ? -18 : 18),
            y: y + 8,
            direction: currentDir,
          },
        ]);
      }

      // Reset moving state when mouse stops
      if (moveTimer.current) clearTimeout(moveTimer.current);
      moveTimer.current = setTimeout(() => {
        setIsMoving(false);
      }, 120);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (moveTimer.current) clearTimeout(moveTimer.current);
    };
  }, [isDesktop]);

  if (!isDesktop || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden">
      {/* Dynamic Cursor Hiding & Animation Styles */}
      <style>{`
        html.bike-cursor-active,
        html.bike-cursor-active * {
          cursor: none !important;
        }
        @keyframes bike-wheel-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bike-engine-vibrate {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-1.2px); }
          100% { transform: translateY(0.8px); }
        }
      `}</style>

      {/* ── Exhaust Dust & Smoke Trail ── */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.7, scale: 0.6, x: p.x, y: p.y }}
            animate={{
              opacity: 0,
              scale: 2,
              x: p.x + (p.direction === 1 ? -18 : 18),
              y: p.y - 8,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{
              width: 8,
              height: 8,
              background:
                "radial-gradient(circle, rgba(214,255,47,0.85) 0%, rgba(245,158,11,0.5) 50%, rgba(255,255,255,0) 100%)",
              filter: "blur(1px)",
            }}
          />
        ))}
      </AnimatePresence>

      {/* ── The Motorcycle Cursor ── */}
      <motion.div
        className="absolute pointer-events-none"
        animate={{
          x: pos.x - 22,
          y: pos.y - 18,
          scaleX: direction,
          rotate: isClicking ? (direction === 1 ? -16 : 16) : isMoving ? 3 : 0,
          scale: isClicking ? 1.18 : isHoveringClickable ? 1.12 : 1,
        }}
        transition={{
          x: { type: "spring", stiffness: 1000, damping: 50, mass: 0.15 },
          y: { type: "spring", stiffness: 1000, damping: 50, mass: 0.15 },
          scaleX: { duration: 0.14 },
          rotate: { type: "spring", stiffness: 450, damping: 22 },
          scale: { duration: 0.12 },
        }}
        style={{
          width: 48,
          height: 36,
          transformOrigin: "center center",
          filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.85)) drop-shadow(0 0 8px rgba(214,255,47,0.45))",
        }}
      >
        {/* Headlight Beam Cone (visible when running) */}
        {isMoving && (
          <div
            className="absolute top-2.5 left-10 w-14 h-7 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at left, rgba(214,255,47,0.65) 0%, rgba(255,255,255,0.25) 35%, rgba(0,0,0,0) 80%)",
              transformOrigin: "left center",
              transform: "rotate(-4deg)",
              filter: "blur(1.5px)",
            }}
          />
        )}

        <svg
          viewBox="0 0 54 38"
          width="48"
          height="34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            animation: isMoving ? "bike-engine-vibrate 0.12s infinite alternate ease-in-out" : "none",
          }}
        >
          {/* Rider Silhouette with Helmet */}
          <circle cx="27" cy="9" r="4.5" fill="#FFFFFF" />
          <path
            d="M27 7 C29 7 31 8 31 9.5 C31 10.5 29 11 27 11 Z"
            fill="#D6FF2F"
          />
          {/* Rider Body & Arms reaching for handlebars */}
          <path
            d="M24 13 L31 17 L36 17"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M25 13 L22 21 L28 24"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Motorcycle Frame & Fuel Tank (MotoHippi Neon Lime) */}
          <path
            d="M16 26 L23 20 L33 19 L37 26 Z"
            fill="#D6FF2F"
            stroke="#000000"
            strokeWidth="1"
          />
          {/* Exhaust Pipe */}
          <path
            d="M25 25 L15 28 L11 28"
            stroke="#94A3B8"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Front Fork & Windshield */}
          <path
            d="M33 19 L36 14"
            stroke="#38BDF8"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M35 18 L41 30"
            stroke="#CBD5E1"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* ── Rear Wheel (Rotating around local 0,0) ── */}
          <g transform="translate(14, 29)">
            <g
              style={{
                animation: isMoving ? "bike-wheel-spin 0.2s linear infinite" : "none",
              }}
            >
              <circle cx="0" cy="0" r="7" stroke="#1E293B" strokeWidth="2.5" fill="#020617" />
              <circle cx="0" cy="0" r="4.8" stroke="#D6FF2F" strokeWidth="1" />
              <line x1="0" y1="-6" x2="0" y2="6" stroke="#94A3B8" strokeWidth="1.2" />
              <line x1="-6" y1="0" x2="6" y2="0" stroke="#94A3B8" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="1.6" fill="#FFFFFF" />
            </g>
          </g>

          {/* ── Front Wheel (Rotating around local 0,0) ── */}
          <g transform="translate(41, 29)">
            <g
              style={{
                animation: isMoving ? "bike-wheel-spin 0.2s linear infinite" : "none",
              }}
            >
              <circle cx="0" cy="0" r="7" stroke="#1E293B" strokeWidth="2.5" fill="#020617" />
              <circle cx="0" cy="0" r="4.8" stroke="#D6FF2F" strokeWidth="1" />
              <line x1="0" y1="-6" x2="0" y2="6" stroke="#94A3B8" strokeWidth="1.2" />
              <line x1="-6" y1="0" x2="6" y2="0" stroke="#94A3B8" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="1.6" fill="#FFFFFF" />
            </g>
          </g>

          {/* Headlight Bulb */}
          <circle cx="41.5" cy="18.5" r="2" fill="#D6FF2F" />
        </svg>
      </motion.div>
    </div>
  );
}
