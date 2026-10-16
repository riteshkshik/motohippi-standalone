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
    <section className="relative z-20 -mt-12 sm:-mt-20 md:-mt-28 lg:-mt-32 px-2 sm:px-4 md:px-6">
      {/* 3-Column Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {QUICK_ACTIONS.map((action, idx) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Link href={action.href} className="group block h-full focus:outline-none">
                <div className="relative overflow-hidden rounded-[26px] border border-white/15 group-hover:border-[#D6FF2F]/50 transition-all duration-300 shadow-[0_16px_40px_rgba(0,0,0,0.6)] group-hover:shadow-[0_20px_48px_rgba(0,0,0,0.85)] h-[320px] sm:h-[350px] md:h-[370px] flex flex-col justify-between p-5">
                  {/* Full-bleed Background Image */}
                  <img
                    src={action.image}
                    alt={action.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Minimal Bottom Gradient solely for text legibility (top 60% remains pure image) */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

                  {/* Top-Left: Floating Glassmorphic Icon Badge */}
                  <div className="relative z-10 self-start">
                    <div className="w-11 h-11 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#D6FF2F] shadow-lg group-hover:border-[#D6FF2F]/50 group-hover:bg-black/60 transition-all duration-300">
                      <Icon size={22} strokeWidth={2.2} className="drop-shadow-[0_0_6px_rgba(214,255,47,0.4)]" />
                    </div>
                  </div>

                  {/* Bottom Content: Title, Subtitle & Arrow Button */}
                  <div className="relative z-10 mt-auto pt-4 flex items-end justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#D6FF2F] transition-colors leading-snug drop-shadow-md line-clamp-2">
                        {action.title}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-white/70 group-hover:text-white/95 transition-colors leading-relaxed line-clamp-1 drop-shadow">
                        {action.subtitle}
                      </p>
                    </div>

                    {/* Arrow Button */}
                    <div className="shrink-0 w-10 h-10 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 group-hover:border-[#D6FF2F] group-hover:bg-[#D6FF2F] group-hover:text-black transition-all duration-300 shadow-md">
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
