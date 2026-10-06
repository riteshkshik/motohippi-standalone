import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("motohippi_pwa_installed") === "true";
  });
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const isStandaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    return isStandaloneMedia || isIOSStandalone;
  });
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState<boolean>(false);

  useEffect(() => {
    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check display mode
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const standalone = isStandaloneMedia || isIOSStandalone;
      setIsStandalone(standalone);
      if (standalone) {
        setIsInstalled(true);
        localStorage.setItem("motohippi_pwa_installed", "true");
      }
    };
    checkStandalone();

    // Listen for beforeinstallprompt (Chromium, Android Chrome, Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      localStorage.setItem("motohippi_pwa_installed", "true");
      sessionStorage.removeItem("motohippi_just_authenticated");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<"accepted" | "dismissed" | "ios_guide" | "unavailable"> => {
    if (isStandalone || isInstalled) {
      return "unavailable";
    }

    if (isIOS) {
      setShowIOSInstructions(true);
      return "ios_guide";
    }

    if (!deferredPrompt) {
      // Fallback: If browser doesn't support beforeinstallprompt (e.g. desktop safari or firefox)
      // or event hasn't fired yet, show iOS/general guide
      setShowIOSInstructions(true);
      return "ios_guide";
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
        localStorage.setItem("motohippi_pwa_installed", "true");
        setDeferredPrompt(null);
        return "accepted";
      } else {
        return "dismissed";
      }
    } catch (err) {
      console.warn("PWA install error:", err);
      return "unavailable";
    }
  }, [deferredPrompt, isIOS, isInstalled, isStandalone]);

  const dismiss = useCallback(() => {
    // Dismiss for 7 days
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("motohippi_pwa_dismissed_until", nextWeek.toString());
    sessionStorage.removeItem("motohippi_just_authenticated");
    setShowIOSInstructions(false);
  }, []);

  const isDismissed = useCallback(() => {
    const dismissedUntil = localStorage.getItem("motohippi_pwa_dismissed_until");
    if (!dismissedUntil) return false;
    return Date.now() < parseInt(dismissedUntil, 10);
  }, []);

  return {
    canInstall: !isStandalone && !isInstalled,
    isInstalled,
    isStandalone,
    isIOS,
    showIOSInstructions,
    setShowIOSInstructions,
    hasNativePrompt: !!deferredPrompt,
    promptInstall,
    dismiss,
    isDismissed,
  };
}
