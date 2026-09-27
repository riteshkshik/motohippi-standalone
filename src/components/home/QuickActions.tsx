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
    image: "/quick-actions/meet-friends.jpg",
    icon: Users,
  },
  {
    id: "shop",
    title: "Action Camera DJI & Helmet Shop",
    subtitle: "Gear up for your next ride",
    href: "/marketplace",
    image: "/quick-actions/camera-helmet.jpg",
    icon: Camera,
  },
  {
    id: "insurance",
    title: "Motor Insurance",
    subtitle: "Best rates. Guaranteed cashback.",
    href: "/insurance",
    image: "/quick-actions/motor-insurance.jpg",
    icon: Shield,
  },
];

export function QuickActions() {
  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2.5">
        <span className="w-5 h-1.5 rounded-full bg-[#D6FF2F] inline-block shadow-[0_0_10px_rgba(214,255,47,0.5)]" />
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Quick Actions
        </h2>
      </div>

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
                <div className="relative overflow-hidden rounded-[26px] bg-[#101214] border border-white/10 group-hover:border-[#D6FF2F]/40 transition-all duration-300 group-hover:shadow-[0_12px_36px_rgba(0,0,0,0.6)] flex flex-col h-full">
                  {/* Top Image Banner */}
                  <div className="relative h-44 sm:h-48 md:h-52 w-full overflow-hidden bg-black/40">
                    <img
                      src={action.image}
                      alt={action.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    {/* Gradient overlay seamlessly blending into card background */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101214] via-[#101214]/50 to-transparent" />
                  </div>

                  {/* Card Content */}
                  <div className="p-5 pt-1 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Neon Lime Green Icon */}
                      <div className="mb-3 text-[#D6FF2F] drop-shadow-[0_0_8px_rgba(214,255,47,0.3)]">
                        <Icon size={26} strokeWidth={2.2} />
                      </div>

                      {/* Title */}
                      <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-[#D6FF2F] transition-colors leading-snug min-h-[3rem]">
                        {action.title}
                      </h3>
                    </div>

                    {/* Subtitle & Bottom-Right Arrow */}
                    <div className="mt-3 flex items-end justify-between gap-3">
                      <p className="text-xs md:text-sm text-white/50 group-hover:text-white/70 transition-colors leading-relaxed">
                        {action.subtitle}
                      </p>

                      <div className="shrink-0 w-10 h-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white/80 group-hover:border-[#D6FF2F] group-hover:bg-[#D6FF2F] group-hover:text-black transition-all duration-300 shadow-md">
                        <ArrowRight
                          size={18}
                          strokeWidth={2.2}
                          className="transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                      </div>
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
