import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { BikeCursor } from "@/components/BikeCursor";

// ─── Social Icons ─────────────────────────────────────────────────────────────
const InstagramIcon = ({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const FacebookIcon = ({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YouTubeIcon = ({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="5" width="20" height="14" rx="4" ry="4" />
    <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none" />
  </svg>
);

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/motohippi?utm_source=qr",
    icon: InstagramIcon,
    hoverClass:
      "hover:text-pink-400 hover:border-pink-500/40 hover:bg-pink-500/10",
    textHoverClass: "group-hover:text-pink-400",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/groups/1746306876591034",
    icon: FacebookIcon,
    hoverClass:
      "hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10",
    textHoverClass: "group-hover:text-blue-400",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@Motohippi_Official",
    icon: YouTubeIcon,
    hoverClass:
      "hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10",
    textHoverClass: "group-hover:text-red-400",
  },
];

// ─── Hero Carousel Slides ─────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    desktop: "/hero_bg.png",
    mobile: "/hero_bg_mobile.png",
    alt: "Overland riders and sunset campsite",
  },
  {
    desktop: "/hero_bg_2.jpeg",
    mobile: "/hero_bg_2_mobile.png",
    alt: "Adventure journey into the open road",
  },
];

export default function Landing() {
  const { isLoggedIn } = useAuth();
  const [_, setLocation] = useLocation();

  // 3D parallax on cursor move across the full image
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  // Carousel slide index (3-second auto-rotation)
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      setLocation("/home");
    }
  }, [isLoggedIn, setLocation]);

  // Preload carousel images for instant transitions
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const imgDesktop = new Image();
      imgDesktop.src = slide.desktop;
      const imgMobile = new Image();
      imgMobile.src = slide.mobile;
    });
  }, []);

  // Auto-advance carousel every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const normY = (e.clientY - innerHeight / 2) / (innerHeight / 2);

      // Subtle, elegant 3D tilt tracking the cursor
      const maxTilt = 7;
      setRotateX(-normY * maxTilt);
      setRotateY(normX * maxTilt);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Interactive Running Bike Cursor */}
      <BikeCursor />

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src="/logo.png"
              alt="MotoHippi"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-cover shadow-sm shrink-0"
            />
            <div className="leading-tight shrink-0">
              <span className="text-lg sm:text-xl font-bold tracking-tighter text-white block">
                MotoHippi
              </span>
              <span className="text-[10px] text-primary tracking-widest uppercase hidden sm:block">
                motohippi.com
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Social Links in Header */}
            <div className="hidden md:flex items-center gap-1.5 border-r border-white/10 pr-3">
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.name}
                  aria-label={item.name}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white/70 border border-white/10 transition-all ${item.hoverClass}`}
                >
                  <item.icon size={16} />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-primary transition-colors text-xs sm:text-sm font-medium px-2.5 sm:px-3 h-8 sm:h-9"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="rounded-full px-3.5 sm:px-5 h-8 sm:h-9 font-bold bg-primary text-black hover:bg-primary/90 text-xs sm:text-sm shrink-0"
                >
                  Join Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with FULL Image Carousel and 3D Cursor Parallax */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32 overflow-hidden"
        style={{ perspective: 1200 }}
      >
        {/* Full Image Background with 3D cursor tilt */}
        <motion.div
          className="absolute inset-0 z-0 origin-center pointer-events-none"
          animate={{
            rotateX: rotateX,
            rotateY: rotateY,
            scale: 1.08,
          }}
          transition={{
            type: "spring",
            stiffness: 160,
            damping: 24,
            mass: 0.5,
          }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-0 bg-black/30 z-10" />

          {/* 3-Second Crossfading Carousel */}
          <AnimatePresence>
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <picture className="w-full h-full block">
                <source
                  media="(max-width: 767px)"
                  srcSet={HERO_SLIDES[activeSlide].mobile}
                />
                <img
                  src={HERO_SLIDES[activeSlide].desktop}
                  alt={HERO_SLIDES[activeSlide].alt}
                  className="w-full h-full object-cover object-center"
                />
              </picture>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 z-20 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 uppercase drop-shadow-2xl">
              Find Your <span className="text-primary">Ride Mate.</span>
              <br />
              Meet Travel <span className="text-primary">Nirvana.</span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="text-lg px-8 h-14 rounded-full font-bold"
                >
                  Join Free
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="glass"
                  className="text-lg px-8 h-14 rounded-full font-bold"
                >
                  Log In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-white/5 py-12 relative z-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <img
                  src="/logo.png"
                  alt="MotoHippi"
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <h2 className="text-2xl font-bold tracking-tighter">
                  MotoHippi
                </h2>
              </div>
              <p className="text-muted-foreground text-sm max-w-sm">
                The ultimate ecosystem for road travelers. Connect, discover,
                and ride into the unknown.
              </p>
            </div>

            {/* Social Links Section */}
            <div className="flex flex-col items-start sm:items-center lg:items-start gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Follow Us
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 transition-all text-muted-foreground ${item.hoverClass}`}
                  >
                    <item.icon
                      size={18}
                      className="transition-transform group-hover:scale-110"
                    />
                    <span
                      className={`text-xs font-medium transition-colors ${item.textHoverClass}`}
                    >
                      {item.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col items-start lg:items-end gap-2 text-sm text-muted-foreground">
              <p>
                Contact:{" "}
                <a
                  href="mailto:MotoHippi@yahoo.com"
                  className="text-white hover:text-primary transition-colors"
                >
                  MotoHippi@yahoo.com
                </a>
              </p>
              <p>
                WhatsApp:{" "}
                <a
                  href="https://wa.me/919999207570"
                  className="text-white hover:text-primary transition-colors"
                >
                  +91-9999207570
                </a>
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div>
              &copy; {new Date().getFullYear()} MotoHippi. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <Link
                href="/terms"
                className="hover:text-primary transition-colors"
              >
                Terms &amp; Conditions
              </Link>
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/refund-policy"
                className="hover:text-primary transition-colors"
              >
                Refund &amp; Return Policy
              </Link>
              <Link
                href="/shipping-policy"
                className="hover:text-primary transition-colors"
              >
                Shipping Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
