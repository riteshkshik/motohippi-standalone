import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type GuideType = "ios" | "android" | null;

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

  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<GuideType>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    const isAndroidDevice = /android/.test(userAgent);
    const hasTouch = window.matchMedia("(pointer: coarse)").matches;
    const mobileScreen = window.innerWidth < 1024;
    const isMobileDevice = isIOSDevice || isAndroidDevice || /mobile/.test(userAgent) || (hasTouch && mobileScreen);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsMobile(isMobileDevice);

    // Check if already in standalone app mode
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

    // Listen for beforeinstallprompt (Chromium on Android / Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowGuide(null);
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

  const promptInstall = useCallback(async (): Promise<"accepted" | "dismissed" | "guide" | "unavailable"> => {
    if (isStandalone || isInstalled) {
      return "unavailable";
    }

    // 1. If on iOS Safari: show iOS specific guide
    if (isIOS) {
      setShowGuide("ios");
      return "guide";
    }

    // 2. If Android / Chromium and native prompt is ready: trigger native prompt
    if (deferredPrompt) {
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
      }
    }

    // 3. If native prompt is not ready on Android or other mobile browser:
    // show Android-specific 3-dots menu guide (NEVER Safari instructions)
    if (isAndroid) {
      setShowGuide("android");
      return "guide";
    }

    // Default mobile fallback
    setShowGuide("android");
    return "guide";
  }, [deferredPrompt, isIOS, isAndroid, isInstalled, isStandalone]);

  const dismiss = useCallback(() => {
    // Dismiss for 7 days
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("motohippi_pwa_dismissed_until", nextWeek.toString());
    sessionStorage.removeItem("motohippi_just_authenticated");
    setShowGuide(null);
  }, []);

  const isDismissed = useCallback(() => {
    const dismissedUntil = localStorage.getItem("motohippi_pwa_dismissed_until");
    if (!dismissedUntil) return false;
    return Date.now() < parseInt(dismissedUntil, 10);
  }, []);

  return {
    // Only allow install on MOBILE devices that are NOT already installed or standalone
    canInstall: isMobile && !isStandalone && !isInstalled,
    isInstalled,
    isStandalone,
    isMobile,
    isIOS,
    isAndroid,
    showGuide,
    setShowGuide,
    hasNativePrompt: !!deferredPrompt,
    promptInstall,
    dismiss,
    isDismissed,
  };
}
