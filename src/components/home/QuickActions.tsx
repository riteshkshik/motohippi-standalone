import React from "react";
import { Link } from "wouter";
import { Users, Camera, Shield, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface QuickActionItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: "meet",
    title: "Meet New Friends",
    subtitle: "Connect with riders near you",
    href: "/discover",
    image: "/quick-actions/meet-friends.jpg?v=2",
    icon: Users,
  },
  {
    id: "shop",
    title: "Action Camera DJI & Helmet Shop",
    subtitle: "Gear up for your next ride",
    href: "/marketplace",
    image: "/quick-actions/camera-helmet.jpg?v=2",
    icon: Camera,
  },
  {
    id: "insurance",
    title: "Motor Insurance",
    subtitle: "Best rates. Guaranteed cashback.",
    href: "/insurance",
    image: "/quick-actions/motor-insurance.jpg?v=2",
    icon: Shield,
  },
];

export function QuickActions() {
  return (
    <section className="relative z-20 w-full max-w-5xl mx-auto px-2 sm:px-4">
      {/* Vertical Stack of 3 Cards */}
      <div className="flex flex-col gap-4 sm:gap-6">
        {QUICK_ACTIONS.map((action, idx) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="w-full"
            >
              <Link href={action.href} className="group block w-full focus:outline-none">
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-black/15 dark:border-white/15 group-hover:border-[#D6FF2F]/70 transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.35)] group-hover:shadow-[0_18px_44px_rgba(0,0,0,0.5)] h-[180px] sm:h-[220px] md:h-[250px] flex flex-col justify-between p-4 sm:p-6 bg-[#101214]">
                  {/* Full-bleed Background Image */}
                  <img
                    src={action.image}
                    alt={action.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Gradient overlay for clear text readability across the wide card */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 pointer-events-none" />

                  {/* Top-Left: Floating Glassmorphic Icon Badge */}
                  <div className="relative z-10 self-start">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#D6FF2F] shadow-lg group-hover:border-[#D6FF2F]/60 group-hover:bg-black/70 transition-all duration-300">
                      <Icon size={22} strokeWidth={2.2} className="drop-shadow-[0_0_6px_rgba(214,255,47,0.4)]" />
                    </div>
                  </div>

                  {/* Bottom Content: Title, Subtitle & Arrow Button */}
                  <div className="relative z-10 mt-auto pt-2 flex items-end justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-2xl font-black text-white group-hover:text-[#D6FF2F] transition-colors leading-tight drop-shadow-md">
                        {action.title}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-white/80 group-hover:text-white transition-colors leading-relaxed line-clamp-1 drop-shadow">
                        {action.subtitle}
                      </p>
                    </div>

                    {/* Arrow Button */}
                    <div className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-white/20 bg-black/50 backdrop-blur-md flex items-center justify-center text-white/90 group-hover:border-[#D6FF2F] group-hover:bg-[#D6FF2F] group-hover:text-black transition-all duration-300 shadow-md">
                      <ArrowRight
                        size={18}
                        strokeWidth={2.2}
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
export default QuickActions;
