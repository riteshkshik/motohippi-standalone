import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TravelLottieAnimation,
  TravelAnimation,
  FriendsAnimation,
} from "@/components/PartnerOffersCarousel";

// ─── Lottie Hero — Make Friends * Travel * Chill ──────────────────────────────
const LOTTIE_PHASES = [
  {
    id: "friends",
    keyword: "Make Friends",
    tagline: "Connect with riders who share your road and your vibe.",
    animation: <FriendsAnimation />,
    accent: "#0abbe3",
  },
  {
    id: "travel",
    keyword: "Travel",
    tagline: "Every road leads somewhere extraordinary. Ride it.",
    animation: <TravelLottieAnimation />,
    accent: "#4d64ad",
  },
  {
    id: "chill",
    keyword: "Chill",
    tagline: "Park it. Breathe in. Enjoy the horizon.",
    animation: <TravelAnimation />,
    accent: "#d6ff2f",
  },
];

// ─── Event Ad data ─────────────────────────────────────────────────────────────
const EVENT_ADS = [
  {
    id: 1,
    title: "Himalayan Odyssey 2026",
    organizer: "Royal Enfield",
    dates: "27 June – 9 July 2026",
    duration: "13 Days",
    location: "Himalayas, India",
    description:
      "India's most iconic motorcycle expedition. Ride through the world's highest motorable passes.",
    price: "₹75,000",
    status: "Registrations Open",
    statusColor: "green",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
    registrationUrl: "https://www.royalenfield.com/in/en/rides-calendar/",
    tags: ["Expedition", "Himalayas", "High Altitude"],
  },
  {
    id: 3,
    title: "Moto Himalaya Ladakh 2026",
    organizer: "Royal Enfield",
    dates: "4 – 14 September 2026",
    duration: "10 Days",
    location: "Leh–Ladakh Circuit",
    description:
      "Ten days through the trans-Himalayan region — remote valleys, high-altitude deserts, and breathtaking passes.",
    price: "₹1,10,000",
    status: "Upcoming",
    statusColor: "blue",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
    registrationUrl:
      "https://www.royalenfield.com/uk/en/rides/marquee-rides/moto-himalaya-ladakh-2026",
    tags: ["Ladakh", "Trans-Himalayan", "10 Days"],
  },
  {
    id: 2,
    title: "Himalayan Basecamp Ladakh 2026",
    organizer: "Royal Enfield",
    dates: "4 – 6 September 2026",
    duration: "3 Days",
    location: "Leh, Ladakh",
    description:
      "Triple-pass expedition through Khardung La, Wari La & Tanglang La plus rafting, kayaking, and paragliding.",
    price: "On Registration",
    status: "Registrations Open",
    statusColor: "green",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    registrationUrl: "https://www.royalenfield.com/in/en/home",
    tags: ["Ladakh", "Off-road", "Basecamp"],
  },
  {
    id: 4,
    title: "Moroccan Odyssey 2026",
    organizer: "Royal Enfield",
    dates: "25 Sep – 6 Oct 2026",
    duration: "12 Days",
    location: "Morocco",
    description:
      "High Atlas Mountains to the Sahara Desert — 12 extraordinary days through Morocco.",
    price: "₹3,50,000",
    status: "Upcoming",
    statusColor: "blue",
    image:
      "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=1200&q=80",
    registrationUrl:
      "https://www.royalenfield.com/uk/en/rides/marquee-rides/moroccan-odyssey-2026/",
    tags: ["International", "Morocco", "Desert"],
  },
  {
    id: 5,
    title: "India Bike Week 2025",
    organizer: "India Bike Week",
    dates: "12 – 13 December 2025",
    duration: "2 Days",
    location: "Vagator, Goa",
    description:
      "Asia's largest motorcycle festival — 30,000+ riders, live music, stunt shows, and custom bike exhibitions.",
    price: "₹1,499 onwards",
    status: "Tickets Available",
    statusColor: "yellow",
    image:
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&q=80",
    registrationUrl:
      "https://auto.hindustantimes.com/auto/two-wheelers/india-bike-week-2025-to-be-held-on-december-12-13-returns-to-vagator-goa-41759576859797.html",
    tags: ["Festival", "Goa", "Music"],
  },
  {
    id: 8,
    title: "PETRONAS TVS India One Make Championship 2026",
    organizer: "TVS Racing",
    dates: "Jan – Oct 2026",
    duration: "Season-long",
    location: "Bengaluru · Pune · Delhi · Kolkata · Chennai",
    description:
      "India's premier one-make motorcycle racing championship on race-prepped Apache machines.",
    price: "₹50,000",
    status: "Season Ongoing",
    statusColor: "green",
    image:
      "https://images.unsplash.com/photo-1558981285-6f0c68d7e1e3?w=1200&q=80",
    registrationUrl:
      "https://www.bikewale.com/news/training-and-selection-dates-announced-for-petronas-tvs-india-omc-2026-229437/",
    tags: ["Racing", "TVS Apache", "Track"],
  },
];

const STATUS_CFG: Record<string, { bg: string; text: string; dot: string }> = {
  green: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  blue: { bg: "bg-sky-500/15", text: "text-sky-400", dot: "bg-sky-400" },
  yellow: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  gray: { bg: "bg-white/8", text: "text-muted-foreground", dot: "bg-white/30" },
};

// ─── Lottie Hero Banner ────────────────────────────────────────────────────────
function LottieHeroBanner() {
  const [active, setActive] = useState(0);
  const total = LOTTIE_PHASES.length;

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % total), 3500);
    return () => clearInterval(t);
  }, [total]);

  const phase = LOTTIE_PHASES[active];

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        background: "#0d0d0d",
        border: "1px solid rgba(255,255,255,0.06)",
        minHeight: 200,
      }}
    >
      {/* Ambient glow behind animation */}
      <AnimatePresence>
        <motion.div
          key={`glow-${active}`}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 55% 55% at 15% 50%, ${phase.accent}18 0%, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>

      <div className="relative flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
        {/* Animation */}
        <div className="shrink-0 w-36 h-36 md:w-44 md:h-44">
          <AnimatePresence mode="wait">
            <motion.div
              key={`anim-${active}`}
              className="w-full h-full"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.35 }}
            >
              {phase.animation}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Text */}
        <div className="flex-1 text-center md:text-left">
          {/* Phase label strip */}
          <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
            {LOTTIE_PHASES.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setActive(i)}
                className="text-[10px] font-black uppercase tracking-widest transition-all px-3 py-1 rounded-full"
                style={{
                  background:
                    i === active ? phase.accent : "rgba(255,255,255,0.06)",
                  color: i === active ? "#0d0d0d" : "rgba(255,255,255,0.3)",
                  letterSpacing: "0.18em",
                }}
              >
                {p.keyword}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${active}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              <h2
                className="font-black leading-none mb-2"
                style={{
                  fontSize: "clamp(28px, 5vw, 52px)",
                  color: phase.accent,
                  textShadow: `0 0 40px ${phase.accent}55`,
                }}
              >
                {phase.keyword}
              </h2>
              <p className="text-sm md:text-base text-white/50 max-w-md">
                {phase.tagline}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5">
          <motion.div
            className="h-full"
            style={{ background: phase.accent }}
            key={`bar-${active}`}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.5, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Event Ad Carousel ─────────────────────────────────────────────────────────
function EventAdCarousel() {
  const [active, setActive] = useState(0);
  const total = EVENT_ADS.length;

  const advance = useCallback(() => {
    setActive((i) => (i + 1) % total);
  }, [total]);

  useEffect(() => {
    const t = setInterval(advance, 2000);
    return () => clearInterval(t);
  }, [advance]);

  const ad = EVENT_ADS[active];
  const sc = STATUS_CFG[ad.statusColor] ?? STATUS_CFG.gray;

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-white/6" />
        {/* <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
          Upcoming Events
        </span> */}
        <div className="h-px flex-1 bg-white/6" />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="px-4 py-5 md:px-6 md:py-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Make Friends * Travel * Chill — Lottie Hero */}
      <LottieHeroBanner />

      {/* Upcoming Events — Advertisement Carousel */}
      <EventAdCarousel />
    </div>
  );
}
