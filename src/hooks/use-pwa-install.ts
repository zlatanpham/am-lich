"use client";

import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import { useIsMobile } from "./use-mobile";

const STORAGE_KEY = "pwa-install-dismissed";

type Platform = "ios" | "android" | "other";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Helper functions that run only on client
function getIsInstalled(): boolean {
  if (typeof window === "undefined") return true;

  // iOS standalone mode
  const isIosStandalone =
    "standalone" in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true;

  // Android/Others standalone mode
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  return isIosStandalone || isStandalone;
}

function getIsDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function getPlatform(): Platform {
  if (typeof window === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    return "ios";
  }
  if (ua.includes("android")) {
    return "android";
  }
  return "other";
}

// Store for installed state
function subscribeInstalled(callback: () => void) {
  const mediaQuery = window.matchMedia("(display-mode: standalone)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

export function usePwaInstall() {
  const isMobile = useIsMobile();

  // Use useSyncExternalStore to handle SSR correctly
  const isInstalled = useSyncExternalStore(
    subscribeInstalled,
    getIsInstalled,
    () => true, // Server snapshot - assume installed to prevent flash
  );

  const [isDismissed, setIsDismissed] = useState(getIsDismissed);
  const [platform] = useState(getPlatform);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Listen for beforeinstallprompt (Android Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore storage errors
    }
    setIsDismissed(true);
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return outcome === "accepted";
    } catch {
      return false;
    }
  }, [deferredPrompt]);

  const shouldShowBanner = isMobile && !isInstalled && !isDismissed;

  return {
    shouldShowBanner,
    platform,
    dismiss,
    triggerInstall,
    canPromptInstall: !!deferredPrompt,
  };
}
