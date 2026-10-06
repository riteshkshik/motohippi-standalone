import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  X,
  Share2,
  PlusSquare,
  Sparkles,
  CheckCircle2,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { useAuth } from "@/contexts/AuthContext";

export function InstallAppPrompt() {
  const { isLoggedIn } = useAuth();
  const {
    canInstall,
    isInstalled,
    isIOS,
    showIOSInstructions,
    setShowIOSInstructions,
    promptInstall,
    dismiss,
    isDismissed,
  } = usePwaInstall();

  const [visible, setVisible] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Only prompt authenticated users
    if (!isLoggedIn || !canInstall) {
      setVisible(false);
      return;
    }

    // Check if user just authenticated in this session
    const justAuth = sessionStorage.getItem("motohippi_just_authenticated") === "true";
    const dismissed = isDismissed();

    if (justAuth || !dismissed) {
      // Gentle delay so user sees the page load before the prompt slides in
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, canInstall, isDismissed]);

  const handleInstallClick = async () => {
    const result = await promptInstall();
    if (result === "accepted") {
      setInstallSuccess(true);
      sessionStorage.removeItem("motohippi_just_authenticated");
      setTimeout(() => {
        setVisible(false);
      }, 3500);
    }
  };

  const handleDismiss = () => {
    dismiss();
    setVisible(false);
  };

  if (!visible || !canInstall) return null;

  return (
    <>
      {/* ── Main Install Floating Card ── */}
      <AnimatePresence>
        {visible && !showIOSInstructions && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 max-w-sm w-[calc(100%-2rem)] md:w-96 shadow-[0_20px_60px_rgba(0,0,0,0.85)] rounded-2xl border border-white/15 backdrop-blur-2xl bg-[#0B0E14]/95 overflow-hidden"
          >
            {/* Top accent glow line */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#D6FF2F] to-transparent" />

            <div className="p-4 sm:p-5 relative">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3.5 right-3.5 text-white/40 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close install prompt"
              >
                <X size={18} />
              </button>

              {installSuccess ? (
                /* Success celebration state */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-2 space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-[#D6FF2F]/20 text-[#D6FF2F] flex items-center justify-center shadow-[0_0_20px_rgba(214,255,47,0.4)]">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="text-lg font-bold text-white">App Installed!</h4>
                  <p className="text-xs text-white/70">
                    Welcome to the full MotoHippi experience. You can now launch it directly from your home screen.
                  </p>
                </motion.div>
              ) : (
                /* Prompt state */
                <div>
                  <div className="flex items-start gap-3.5">
                    {/* App icon badge */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20 bg-black/60 shadow-md">
                        <img
                          src="/logo.png"
                          alt="MotoHippi"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#D6FF2F] text-black flex items-center justify-center shadow-md">
                        <Sparkles size={11} strokeWidth={2.5} />
                      </span>
                    </div>

                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#D6FF2F] bg-[#D6FF2F]/10 px-2 py-0.5 rounded-full border border-[#D6FF2F]/20">
                          Web App
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white leading-tight">
                        Install MotoHippi
                      </h4>
                      <p className="text-xs text-white/60 mt-1 leading-snug">
                        Add to your home screen for quick access, full-screen ride tracking, and offline support.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-2.5">
                    <Button
                      onClick={handleInstallClick}
                      className="flex-1 bg-[#D6FF2F] hover:bg-[#bce425] text-black font-bold h-10 rounded-xl gap-2 shadow-[0_0_15px_rgba(214,255,47,0.3)] hover:shadow-[0_0_25px_rgba(214,255,47,0.5)] transition-all text-xs sm:text-sm"
                    >
                      <Download size={16} strokeWidth={2.4} />
                      Install App
                    </Button>
                    <button
                      onClick={handleDismiss}
                      className="px-3.5 h-10 text-xs font-semibold text-white/50 hover:text-white transition-colors rounded-xl hover:bg-white/5"
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── iOS Safari Step-by-Step Modal Guide ── */}
      <AnimatePresence>
        {showIOSInstructions && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full max-w-sm rounded-3xl bg-[#0E121A] border border-white/15 p-5 shadow-2xl relative text-white"
            >
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl overflow-hidden border border-white/20 bg-black">
                  <img src="/logo.png" alt="MotoHippi" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Install on iPhone / iPad</h3>
                  <p className="text-xs text-white/50">Follow these 2 simple steps:</p>
                </div>
              </div>

              <div className="space-y-3 bg-white/5 rounded-2xl p-4 border border-white/5 text-xs text-white/80">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    Tap the <strong className="text-white">Share</strong> button{" "}
                    <Share2 size={14} className="inline text-sky-400 align-text-bottom" /> in your Safari menu bar (bottom of screen).
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#D6FF2F]/20 text-[#D6FF2F] font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    Scroll down and tap <strong className="text-white">Add to Home Screen</strong>{" "}
                    <PlusSquare size={14} className="inline text-[#D6FF2F] align-text-bottom" />.
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    Tap <strong className="text-white">Add</strong> in the top right corner to finish!
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  setShowIOSInstructions(false);
                  dismiss();
                }}
                className="w-full mt-4 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl h-10 text-xs"
              >
                Got It
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
export default InstallAppPrompt;
