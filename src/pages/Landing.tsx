import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function Landing() {
  const { isLoggedIn } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (isLoggedIn) {
      setLocation('/home');
    }
  }, [isLoggedIn, setLocation]);

  if (isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/25 z-10" />
          <img src="/hero_bg.png" alt="Riders gathered at sunset overlook" className="w-full h-full object-cover object-center" />
        </div>
        
        <div className="container mx-auto px-4 z-20 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 uppercase drop-shadow-2xl">
              Find Your <span className="text-primary">Ride Mate.</span><br />
              Chill Trips <span className="text-primary">Thrills.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 font-medium">
              The ultimate platform for motorcycle riders, car enthusiasts, and overlanders. Connect, discover, and ride into the unknown.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 h-14 rounded-full font-bold">Join Free</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="glass" className="text-lg px-8 h-14 rounded-full font-bold">Log In</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-32 relative z-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need to <span className="text-primary">Ride</span>.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">From finding the perfect travel partner to getting your gear and insurance sorted, MotoHippi has it all.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Discover Riders', desc: 'Swipe through profiles of riders near you. Filter by vehicle type, adventure level, and more.', gradient: 'from-primary/30 to-emerald-500/20', emoji: '🏍️' },
              { title: 'Plan Trips', desc: 'Create detailed itineraries, manage budgets, split costs, and invite friends to join the adventure.', gradient: 'from-blue-500/30 to-purple-500/20', emoji: '🗺️' },
              { title: 'Marketplace', desc: 'Buy and sell premium gear, from helmets to camping equipment. Safe and secure.', gradient: 'from-amber-500/30 to-orange-500/20', emoji: '🪖' }
            ].map((f, i) => (
              <div key={i} className="glass-card overflow-hidden group">
                <div className="h-48 overflow-hidden relative">
                  <div className={`w-full h-full bg-gradient-to-br ${(f as any).gradient} flex items-center justify-center`}>
                    <span className="text-7xl opacity-60 group-hover:scale-110 transition-transform duration-500">{(f as any).emoji}</span>
                  </div>
                </div>
                <div className="p-6 relative z-20">
                  <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-white/5 py-12 relative z-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tighter">MotoHippi</h2>
              <p className="text-muted-foreground text-sm mt-2">The ultimate ecosystem for road travelers.</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2 text-sm text-muted-foreground">
              <p>Contact: <a href="mailto:MotoHippi@yahoo.com" className="text-white hover:text-primary transition-colors">MotoHippi@yahoo.com</a></p>
              <p>WhatsApp: <a href="https://wa.me/919999207570" className="text-white hover:text-primary transition-colors">+91-9999207570</a></p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MotoHippi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
