import React from 'react';
import { Link } from 'wouter';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function NotFound() {
  const { isLoggedIn } = useAuth();
  const homeHref = isLoggedIn ? '/home' : '/';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground px-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto text-center p-8 rounded-3xl bg-[#121316] border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 text-[#D6FF2F] shadow-[0_0_20px_rgba(214,255,47,0.2)]">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <span className="text-[11px] font-black uppercase tracking-widest text-[#D6FF2F] mb-2 block">
          404 Error
        </span>

        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3">
          Lost on the Road?
        </h1>

        <p className="text-sm text-white/50 mb-8 max-w-sm mx-auto leading-relaxed">
          The page or route you are looking for does not exist or has been moved.
        </p>

        <Link href={homeHref}>
          <Button
            size="lg"
            className="w-full bg-[#D6FF2F] hover:bg-[#D6FF2F]/90 text-black font-bold rounded-full py-6 text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(214,255,47,0.25)] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to {isLoggedIn ? 'Home' : 'Homepage'}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
