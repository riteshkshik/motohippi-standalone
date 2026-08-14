import React, { useState, useEffect, useCallback } from 'react';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { useGetDashboard } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageSquare, Activity, MapPin, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TravelLottieAnimation,
  TravelAnimation,
  FriendsAnimation,
} from '@/components/PartnerOffersCarousel';

// ─── Lottie Hero — Make Friends * Travel * Chill ──────────────────────────────
const LOTTIE_PHASES = [
  {
    id: 'friends',
    keyword: 'Make Friends',
    tagline: 'Connect with riders who share your road and your vibe.',
    animation: <FriendsAnimation />,
    accent: '#0abbe3',
  },
  {
    id: 'travel',
    keyword: 'Travel',
    tagline: 'Every road leads somewhere extraordinary. Ride it.',
    animation: <TravelLottieAnimation />,
    accent: '#4d64ad',
  },
  {
    id: 'chill',
    keyword: 'Chill',
    tagline: 'Park it. Breathe in. Enjoy the horizon.',
    animation: <TravelAnimation />,
    accent: '#d6ff2f',
  },
];

// ─── Event Ad data ─────────────────────────────────────────────────────────────
const EVENT_ADS = [
  {
    id: 1,
    title: 'Himalayan Odyssey 2026',
    organizer: 'Royal Enfield',
    dates: '27 June – 9 July 2026',
    duration: '13 Days',
    location: 'Himalayas, India',
    description: "India's most iconic motorcycle expedition. Ride through the world's highest motorable passes.",
    price: '₹75,000',
    status: 'Registrations Open',
    statusColor: 'green',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    registrationUrl: 'https://www.royalenfield.com/in/en/rides-calendar/',
    tags: ['Expedition', 'Himalayas', 'High Altitude'],
  },
  {
    id: 3,
    title: 'Moto Himalaya Ladakh 2026',
    organizer: 'Royal Enfield',
    dates: '4 – 14 September 2026',
    duration: '10 Days',
    location: 'Leh–Ladakh Circuit',
    description: 'Ten days through the trans-Himalayan region — remote valleys, high-altitude deserts, and breathtaking passes.',
    price: '₹1,10,000',
    status: 'Upcoming',
    statusColor: 'blue',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
    registrationUrl: 'https://www.royalenfield.com/uk/en/rides/marquee-rides/moto-himalaya-ladakh-2026',
    tags: ['Ladakh', 'Trans-Himalayan', '10 Days'],
  },
  {
    id: 2,
    title: 'Himalayan Basecamp Ladakh 2026',
    organizer: 'Royal Enfield',
    dates: '4 – 6 September 2026',
    duration: '3 Days',
    location: 'Leh, Ladakh',
    description: 'Triple-pass expedition through Khardung La, Wari La & Tanglang La plus rafting, kayaking, and paragliding.',
    price: 'On Registration',
    status: 'Registrations Open',
    statusColor: 'green',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    registrationUrl: 'https://www.royalenfield.com/in/en/home',
    tags: ['Ladakh', 'Off-road', 'Basecamp'],
  },
  {
    id: 4,
    title: 'Moroccan Odyssey 2026',
    organizer: 'Royal Enfield',
    dates: '25 Sep – 6 Oct 2026',
    duration: '12 Days',
    location: 'Morocco',
    description: 'High Atlas Mountains to the Sahara Desert — 12 extraordinary days through Morocco.',
    price: '₹3,50,000',
    status: 'Upcoming',
    statusColor: 'blue',
    image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=1200&q=80',
    registrationUrl: 'https://www.royalenfield.com/uk/en/rides/marquee-rides/moroccan-odyssey-2026/',
    tags: ['International', 'Morocco', 'Desert'],
  },
  {
    id: 5,
    title: 'India Bike Week 2025',
    organizer: 'India Bike Week',
    dates: '12 – 13 December 2025',
    duration: '2 Days',
    location: 'Vagator, Goa',
    description: "Asia's largest motorcycle festival — 30,000+ riders, live music, stunt shows, and custom bike exhibitions.",
    price: '₹1,499 onwards',
    status: 'Tickets Available',
    statusColor: 'yellow',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&q=80',
    registrationUrl: 'https://auto.hindustantimes.com/auto/two-wheelers/india-bike-week-2025-to-be-held-on-december-12-13-returns-to-vagator-goa-41759576859797.html',
    tags: ['Festival', 'Goa', 'Music'],
  },
  {
    id: 8,
    title: 'PETRONAS TVS India One Make Championship 2026',
    organizer: 'TVS Racing',
    dates: 'Jan – Oct 2026',
    duration: 'Season-long',
    location: 'Bengaluru · Pune · Delhi · Kolkata · Chennai',
    description: "India's premier one-make motorcycle racing championship on race-prepped Apache machines.",
    price: '₹50,000',
    status: 'Season Ongoing',
    statusColor: 'green',
    image: 'https://images.unsplash.com/photo-1558981285-6f0c68d7e1e3?w=1200&q=80',
    registrationUrl: 'https://www.bikewale.com/news/training-and-selection-dates-announced-for-petronas-tvs-india-omc-2026-229437/',
    tags: ['Racing', 'TVS Apache', 'Track'],
  },
];

const STATUS_CFG: Record<string, { bg: string; text: string; dot: string }> = {
  green:  { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  blue:   { bg: 'bg-sky-500/15',     text: 'text-sky-400',     dot: 'bg-sky-400' },
  yellow: { bg: 'bg-amber-500/15',   text: 'text-amber-400',   dot: 'bg-amber-400' },
  gray:   { bg: 'bg-white/8',        text: 'text-muted-foreground', dot: 'bg-white/30' },
};

// ─── Lottie Hero Banner ────────────────────────────────────────────────────────
function LottieHeroBanner() {
  const [active, setActive] = useState(0);
  const total = LOTTIE_PHASES.length;

  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % total), 3500);
    return () => clearInterval(t);
  }, [total]);

  const phase = LOTTIE_PHASES[active];

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        background: '#0d0d0d',
        border: '1px solid rgba(255,255,255,0.06)',
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
                  background: i === active ? phase.accent : 'rgba(255,255,255,0.06)',
                  color: i === active ? '#0d0d0d' : 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.18em',
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
                  fontSize: 'clamp(28px, 5vw, 52px)',
                  color: phase.accent,
                  textShadow: `0 0 40px ${phase.accent}55`,
                }}
              >
                {phase.keyword}
              </h2>
              <p className="text-sm md:text-base text-white/50 max-w-md">{phase.tagline}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5">
          <motion.div
            className="h-full"
            style={{ background: phase.accent }}
            key={`bar-${active}`}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3.5, ease: 'linear' }}
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
    setActive(i => (i + 1) % total);
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
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
          Upcoming Events
        </span>
        <div className="h-px flex-1 bg-white/6" />
      </div>

      {/* Ad card */}
      <div className="relative rounded-2xl overflow-hidden" style={{ height: 'clamp(220px, 35vw, 320px)' }}>
        {/* Background image */}
        <AnimatePresence mode="wait">
          <motion.img
            key={`img-${active}`}
            src={ad.image}
            alt={ad.title}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${active}`}
            className="absolute inset-0 flex flex-col justify-end p-5 md:p-7"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.35 }}
          >
            {/* Status + organizer */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm border border-current/20 ${sc.bg} ${sc.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} animate-pulse`} />
                {ad.status}
              </span>
              <span className="px-2.5 py-1 bg-black/50 backdrop-blur-sm border border-white/15 rounded-full text-[10px] font-bold text-white/80">
                {ad.organizer}
              </span>
            </div>

            {/* Title */}
            <h3
              className="font-black text-white leading-tight mb-1"
              style={{ fontSize: 'clamp(18px, 2.8vw, 28px)' }}
            >
              {ad.title}
            </h3>

            {/* Meta row */}
            <div className="flex items-center gap-4 text-xs text-white/65 mb-3 flex-wrap">
              <span className="flex items-center gap-1"><Calendar size={11} /> {ad.dates}</span>
              <span className="flex items-center gap-1"><MapPin size={11} className="text-primary/80" /> {ad.location}</span>
              <span className="flex items-center gap-1"><Clock size={11} /> {ad.duration}</span>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3">
              <a
                href={ad.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-black text-xs font-black hover:bg-primary/90 transition-colors"
              >
                Register <ArrowUpRight size={11} />
              </a>
              <span className="text-sm font-black text-white/90">{ad.price}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className="absolute top-4 right-4 flex gap-1.5">
          {EVENT_ADS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="rounded-full transition-all"
              style={{
                width: i === active ? 20 : 6,
                height: 6,
                background: i === active ? '#d6ff2f' : 'rgba(255,255,255,0.25)',
              }}
              aria-label={`Event ${i + 1}`}
            />
          ))}
        </div>

        {/* Bottom progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <motion.div
            className="h-full bg-primary"
            key={`prog-${active}`}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'linear' }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { data: dashboard, isLoading } = useGetDashboard();
  const { unreadCount } = useUnreadCount();

  if (isLoading || !dashboard || !dashboard.stats) {
    return (
      <div className="px-4 py-5 md:px-6 md:py-8 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="px-4 py-5 md:px-6 md:py-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Make Friends * Travel * Chill — Lottie Hero */}
      <LottieHeroBanner />

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <StatsCard icon={Users} title="New Matches" value={dashboard?.stats?.totalMatches ?? 0} href="/discover" />
        <StatsCard icon={Activity} title="Active Groups" value={dashboard?.stats?.groupsCount ?? 0} href="/groups" />
        <StatsCard icon={MessageSquare} title="Unread Messages" value={unreadCount ?? dashboard?.stats?.unreadMessages ?? 0} href="/messages" />
      </div>

      {/* Upcoming Events — Advertisement Carousel */}
      <EventAdCarousel />
    </div>
  );
}

function StatsCard({ icon: Icon, title, value, href }: { icon: any; title: string; value: number; href: string }) {
  return (
    <Link href={href}>
      <Card className="glass-card border-none bg-card/30 hover:bg-card/50 transition-colors cursor-pointer group">
        <CardContent className="p-3 md:p-6 flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <div className="h-9 w-9 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
            <Icon size={18} className="md:hidden" />
            <Icon size={24} className="hidden md:block" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-xl md:text-2xl font-bold leading-none">{value}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mt-0.5 leading-tight">{title}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
