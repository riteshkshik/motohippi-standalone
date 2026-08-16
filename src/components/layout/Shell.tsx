import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useGetCart } from '@workspace/api-client-react';
import {
  Home, Compass, Users, Globe, ShoppingBag, Shield,
  MessageSquare, User, Bell, Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useUnreadCount } from '@/hooks/useUnreadCount';

// ─── YouTube icon (SVG — not in lucide-react) ─────────────────────────────────
const YouTubeIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="5" width="20" height="14" rx="4" ry="4" />
    <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none" />
  </svg>
);

// ─── Instagram icon (SVG — not in lucide-react) ───────────────────────────────
const InstagramIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

// ─── Find Partner animated radar icon — primary feature highlight ─────────────
const FindPartnerIcon = ({ size = 22, active = false }: { size?: number; active?: boolean }) => (
  <span className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
    {[0, 1].map(i => (
      <motion.span
        key={i}
        className="absolute inset-0 rounded-full"
        style={{ border: `1.5px solid ${active ? '#D6FF2F' : 'rgba(214,255,47,0.55)'}` }}
        initial={{ scale: 0.5, opacity: 0.8 }}
        animate={{ scale: 2.4 + i * 0.8, opacity: 0 }}
        transition={{ duration: 2, delay: i * 0.9, repeat: Infinity, ease: 'easeOut' }}
      />
    ))}
    <Compass
      size={size * 0.88}
      strokeWidth={active ? 2.4 : 1.9}
      className="relative z-10"
      style={{ color: active ? '#D6FF2F' : 'currentColor' }}
    />
  </span>
);

// ─── Nav items — sidebar order ─────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/home',        icon: Home,          label: 'Home' },
  { href: '/discover',    icon: Compass,       label: 'Meet' },
  { href: '/feed',        icon: Globe,         label: 'Explore' },
  { href: '/marketplace', icon: ShoppingBag,   label: 'Shop',     upcoming: true },
  { href: '/insurance',   icon: Shield,        label: 'Insurance', cashback: true },
  { href: '/messages',    icon: MessageSquare, label: "DM's" },
  { href: '/groups',      icon: Users,         label: 'Groups' },
];

// Mobile bottom bar — primary 5 tabs
const MOBILE_MAIN = [
  { href: '/messages',  icon: MessageSquare, label: "DM's" },
  { href: '/insurance', icon: Shield,        label: 'Insurance' },
  { href: '/discover',  icon: Compass,       label: 'Find' },
  { href: '/groups',    icon: Users,         label: 'Groups' },
  { href: '/feed',      icon: Globe,         label: 'Explore' },
];


// ─── Shell ────────────────────────────────────────────────────────────────────
export function Shell({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user } = useAuth();
  const [location, navigate] = useLocation();
  const { unreadCount } = useUnreadCount();
  const { data: cart } = useGetCart({ query: { enabled: isLoggedIn, queryKey: ['/api/cart'] } });
  const cartCount = cart?.items?.reduce((s: number, i: any) => s + i.quantity, 0) ?? 0;

  // ── Logged-out layout ───────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-50 glass-panel">
          <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="MotoHippi" className="h-8 w-8 md:h-9 md:w-9 rounded-xl object-cover" />
              <div className="leading-tight">
                <span className="text-lg md:text-xl font-bold tracking-tighter text-white block">MotoHippi</span>
                <span className="text-[9px] md:text-[10px] text-primary tracking-widest uppercase hidden sm:block">motohippi.com</span>
              </div>
            </Link>
            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white hidden sm:inline-flex h-9">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-black rounded-full px-4 md:px-6 h-9 md:h-10 text-sm font-bold">Join Free</Button>
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 pt-14 md:pt-16">{children}</main>
      </div>
    );
  }

  const isActive = (href: string) => location.startsWith(href);

  // ── Logged-in layout ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-x-hidden">

      {/* ── Full sidebar — desktop lg+ ────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-card/30 backdrop-blur-xl sticky top-0 h-screen shrink-0">
        <div className="p-5 pb-3">
          <Link href="/home" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="MotoHippi" className="h-10 w-10 rounded-xl object-cover" />
            <div className="leading-tight">
              <span className="text-xl font-bold tracking-tighter text-white block">MotoHippi</span>
              <span className="text-[10px] text-primary tracking-widest uppercase">motohippi.com</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href}>
              <span className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group ${
                isActive(item.href)
                  ? 'bg-primary/12 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}>
                {item.href === '/discover'
                  ? <FindPartnerIcon size={20} active={isActive(item.href)} />
                  : <item.icon size={20} strokeWidth={isActive(item.href) ? 2.2 : 1.8} />}
                <span className="font-medium text-sm">{item.label}</span>
                {item.href === '/messages' && unreadCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-[10px] font-black rounded-full bg-primary text-black shadow-[0_0_12px_rgba(214,255,47,0.4)]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                {item.upcoming && (
                  <span className="ml-auto text-[8px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full leading-none">
                    Soon
                  </span>
                )}
                {(item as any).cashback && (
                  <span className="ml-auto relative inline-flex items-center">
                    <motion.span
                      className="absolute inset-0 rounded-full bg-emerald-400/40"
                      animate={{ scale: [1, 1.7, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.span
                      className="absolute inset-0 rounded-full bg-emerald-400/25"
                      animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                    />
                    <span className="relative text-[8px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 px-1.5 py-0.5 rounded-full leading-none">
                      Cashback
                    </span>
                  </span>
                )}
                {isActive(item.href) && (
                  <motion.div layoutId="sidebar-pill"
                    className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }} />
                )}
              </span>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-0.5">
          <Link href="/cart">
            <span className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              location === '/cart' ? 'bg-primary/12 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}>
              <ShoppingBag size={20} strokeWidth={1.8} />
              <span className="font-medium text-sm">Cart</span>
              {cartCount > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-primary text-black text-[10px] font-black flex items-center justify-center">{cartCount}</span>
              )}
            </span>
          </Link>
          <Link href="/profile">
            <span className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all cursor-pointer">
              <User size={20} strokeWidth={1.8} />
              <span className="font-medium text-sm">Profile</span>
            </span>
          </Link>
          <a href="https://www.instagram.com/motohippi?utm_source=qr" target="_blank" rel="noopener noreferrer">
            <span className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-pink-400 hover:bg-pink-500/8 transition-all cursor-pointer group">
              <InstagramIcon size={20} className="group-hover:text-pink-400 transition-colors" />
              <span className="font-medium text-sm">Instagram</span>
            </span>
          </a>
          <a href="https://www.youtube.com/@Motohippi_Official" target="_blank" rel="noopener noreferrer">
            <span className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/8 transition-all cursor-pointer group">
              <YouTubeIcon size={20} className="group-hover:text-red-500 transition-colors" />
              <span className="font-medium text-sm">YouTube</span>
            </span>
          </a>
          <a href="mailto:motohippi@yahoo.com">
            <span className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-sky-400 hover:bg-sky-500/8 transition-all cursor-pointer group">
              <Mail size={20} strokeWidth={1.8} className="group-hover:text-sky-400 transition-colors" />
              <span className="font-medium text-sm">motohippi@yahoo.com</span>
            </span>
          </a>
        </div>
      </aside>

      {/* ── Icon-only sidebar — tablet md–lg ─────────────────────────────────── */}
      <aside className="hidden md:flex lg:hidden flex-col w-16 border-r border-white/5 bg-card/30 backdrop-blur-xl sticky top-0 h-screen shrink-0">
        <div className="p-3 pb-2 flex justify-center">
          <Link href="/home">
            <img src="/logo.png" alt="MotoHippi" className="h-9 w-9 rounded-xl object-cover" />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto flex flex-col items-center py-2 gap-1">
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href}>
              <span title={item.label}
                className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                  isActive(item.href)
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/8'
                }`}>
                {item.href === '/discover'
                  ? <FindPartnerIcon size={20} active={isActive(item.href)} />
                  : <item.icon size={20} strokeWidth={isActive(item.href) ? 2.2 : 1.8} />}
                {item.upcoming && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
                {(item as any).cashback && (
                  <span className="absolute top-1 right-1">
                    <motion.span
                      className="absolute inset-0 rounded-full bg-emerald-400/50"
                      animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <span className="relative block w-2 h-2 rounded-full bg-emerald-400" />
                  </span>
                )}
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-center p-2 border-t border-white/5 gap-1 pb-3">
          <Link href="/cart" title="Cart">
            <span className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
              location === '/cart' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-white/8'
            }`}>
              <ShoppingBag size={20} strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-black text-[9px] font-black flex items-center justify-center">{cartCount}</span>
              )}
            </span>
          </Link>
          <Link href="/profile" title="Profile">
            <span className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all cursor-pointer">
              <User size={20} strokeWidth={1.8} />
            </span>
          </Link>
          <a href="https://www.instagram.com/motohippi?utm_source=qr" target="_blank" rel="noopener noreferrer" title="Instagram">
            <span className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-pink-400 hover:bg-pink-500/8 transition-all cursor-pointer">
              <InstagramIcon size={20} />
            </span>
          </a>
          <a href="https://www.youtube.com/@Motohippi_Official" target="_blank" rel="noopener noreferrer" title="YouTube">
            <span className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/8 transition-all cursor-pointer">
              <YouTubeIcon size={20} />
            </span>
          </a>
          <a href="mailto:motohippi@yahoo.com" title="motohippi@yahoo.com">
            <span className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-sky-400 hover:bg-sky-500/8 transition-all cursor-pointer">
              <Mail size={20} strokeWidth={1.8} />
            </span>
          </a>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 pb-[env(safe-area-inset-bottom)] md:pb-0">

        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-white/5 px-4 h-14 flex items-center justify-between shrink-0">
          <Link href="/home" className="flex items-center gap-2">
            <img src="/logo.png" alt="MotoHippi" className="h-8 w-8 rounded-xl object-cover" />
            <span className="text-base font-bold tracking-tighter text-white">MotoHippi</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/cart">
              <button className="relative w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-white transition-colors">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-black text-[9px] font-black flex items-center justify-center">{cartCount}</span>
                )}
              </button>
            </Link>
            <Link href="/profile">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-white/20" />
              ) : (
                <button className="w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-white transition-colors">
                  <User size={20} />
                </button>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden min-h-0 pb-24 md:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ────────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-3 mb-2 bg-[#111]/90 backdrop-blur-2xl border border-white/10 rounded-2xl px-1 py-1 flex items-center justify-around shadow-2xl shadow-black/60">
          {MOBILE_MAIN.map(item => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <button className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl min-w-[52px] min-h-[48px] justify-center transition-all ${
                  active ? 'text-primary' : 'text-white/40 hover:text-white/70'
                }`}>
                  {active && (
                    <motion.div layoutId="mobile-pill"
                      className="absolute inset-0 bg-primary/10 rounded-xl"
                      transition={{ type: 'spring', stiffness: 400, damping: 36 }} />
                  )}
                  {item.href === '/discover'
                    ? <FindPartnerIcon size={24} active={active} />
                    : <item.icon size={22} strokeWidth={active ? 2.2 : 1.8} className="relative" />}
                  {item.href === '/messages' && unreadCount > 0 && (
                    <span className="absolute top-1 right-2 min-w-[16px] h-[16px] px-0.5 rounded-full bg-primary text-black text-[9px] font-black flex items-center justify-center shadow-md">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                  <span className="text-[10px] font-semibold relative">{item.label}</span>
                </button>
              </Link>
            );
          })}

        </div>
      </nav>

    </div>
  );
}
