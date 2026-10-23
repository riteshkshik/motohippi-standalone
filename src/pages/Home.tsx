import React from "react";
import { QuickActions } from "@/components/home/QuickActions";
import { Footer } from "@/components/layout/Footer";

// ─── Connect & Discover Hero Banner ───────────────────────────────────────────
function ConnectDiscoverBanner() {
  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-black/15 shadow-xl bg-[#101214]">
      <img
        src="/connect_discover.jpeg?v=2"
        alt="MotoHippi - Connect & Discover"
        className="w-full h-auto object-cover object-center select-none"
        loading="eager"
      />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#FFDB58] text-foreground font-sans overflow-x-hidden flex flex-col justify-between">
      {/* ── Page Content ── */}
      <div className="relative z-10 px-3 py-5 sm:px-4 md:px-6 md:py-8 max-w-5xl mx-auto w-full space-y-5 sm:space-y-6 animate-in fade-in duration-500">
        {/* First image comes separately */}
        <ConnectDiscoverBanner />

        {/* Three cards show vertically */}
        <QuickActions />
      </div>

      {/* Footer from the landing page */}
      <Footer className="mt-12 sm:mt-16" />
    </div>
  );
}
