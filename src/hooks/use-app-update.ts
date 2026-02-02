"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const UPDATE_DISMISSED_KEY = "app-update-dismissed";
const UPDATE_DISMISSED_TIME_KEY = "app-update-dismissed-time";
const UPDATE_REMINDER_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

type UpdateStatus = "checking" | "available" | "not-available" | "dismissed";

interface UpdateInfo {
  version: string;
  currentVersion: string;
}

interface UseAppUpdateReturn {
  status: UpdateStatus;
  updateInfo: UpdateInfo | null;
  checkForUpdates: () => void;
  applyUpdate: () => void;
  dismissUpdate: () => void;
  isUpdateDismissed: boolean;
}

export function useAppUpdate(): UseAppUpdateReturn {
  const [status, setStatus] = useState<UpdateStatus>("checking");
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const hasCheckedOnMount = useRef(false);

  // Check if update was previously dismissed and if enough time has passed
  const isUpdateDismissed = useCallback((): boolean => {
    if (typeof window === "undefined") return false;

    try {
      const dismissed = localStorage.getItem(UPDATE_DISMISSED_KEY) === "true";
      const dismissedTime = localStorage.getItem(UPDATE_DISMISSED_TIME_KEY);

      if (dismissed && dismissedTime) {
        const timeSinceDismissed = Date.now() - parseInt(dismissedTime, 10);
        // Only consider it dismissed if within the reminder interval
        if (timeSinceDismissed < UPDATE_REMINDER_INTERVAL) {
          return true;
        }
      }
    } catch {
      // Ignore localStorage errors
    }

    return false;
  }, []);

  // Check for updates by comparing client bundle version with server version
  // This always fetches version.json directly and compares with NEXT_PUBLIC_APP_VERSION
  // baked into the JS bundle, ensuring accurate detection even when SW updates transparently
  const checkForUpdates = useCallback(() => {
    if (typeof window === "undefined") return;

    setStatus("checking");

    const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION;
    console.log(
      "[AppUpdate] Visibility check - Client version:",
      currentVersion,
    );

    // Always fetch version.json directly and compare with client bundle version
    void fetch("/version.json", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { version?: string }) => {
        console.log(
          "[AppUpdate] Visibility check - Server version.json:",
          data,
        );

        if (data.version && data.version !== currentVersion) {
          console.log(
            `[AppUpdate] Version mismatch: ${currentVersion} -> ${data.version}`,
          );
          const info: UpdateInfo = {
            version: data.version,
            currentVersion: currentVersion || "unknown",
          };
          setUpdateInfo(info);

          if (!isUpdateDismissed()) {
            console.log("[AppUpdate] Update available, showing notification");
            setStatus("available");
          } else {
            console.log("[AppUpdate] Update available but dismissed by user");
            setStatus("dismissed");
          }
        } else {
          console.log("[AppUpdate] Versions match, no update needed");
          setStatus("not-available");
        }
      })
      .catch((error) => {
        console.error("[AppUpdate] Failed to fetch version.json:", error);
        setStatus("not-available");
      });
  }, [isUpdateDismissed]);

  // Get service worker registration on mount and check for updates
  // On version mismatch, automatically clear caches and reload to prevent stale JS errors
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasCheckedOnMount.current) return;

    hasCheckedOnMount.current = true;

    // Get SW registration for applyUpdate functionality
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
      });
    }

    // Check for updates on mount by fetching version.json directly
    const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION;
    console.log("[AppUpdate] Mount check - Client version:", currentVersion);

    void fetch("/version.json", { cache: "no-store" })
      .then((res) => res.json())
      .then(async (data: { version?: string }) => {
        console.log("[AppUpdate] Server version.json:", data);

        if (data.version && data.version !== currentVersion) {
          // Version mismatch - clear all caches and reload immediately
          // This prevents stale cached JS from causing runtime errors
          console.log(
            `[AppUpdate] Version mismatch detected: ${currentVersion} -> ${data.version}, clearing caches...`,
          );

          try {
            // Clear all caches to ensure fresh assets
            const cacheNames = await caches.keys();
            console.log("[AppUpdate] Caches to clear:", cacheNames);
            await Promise.all(cacheNames.map((name) => caches.delete(name)));
            console.log("[AppUpdate] All caches cleared successfully");
          } catch (e) {
            console.error("[AppUpdate] Failed to clear caches:", e);
          }

          // Hard reload to get fresh assets
          console.log("[AppUpdate] Reloading page...");
          window.location.reload();
          return;
        }
        console.log("[AppUpdate] Versions match, no update needed");
        setStatus("not-available");
      })
      .catch((error) => {
        console.error("[AppUpdate] Failed to fetch version.json:", error);
        setStatus("not-available");
      });
  }, []);

  // Check for updates when app comes back from background
  useEffect(() => {
    if (typeof window === "undefined") return;

    let visibilityTimeout: NodeJS.Timeout | null = null;
    let lastCheckTime = Date.now();
    const MIN_CHECK_INTERVAL = 30 * 1000; // 30 seconds minimum between checks
    const VISIBILITY_DELAY = 1000; // 1 second delay before checking

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Clear any existing timeout
        if (visibilityTimeout) {
          clearTimeout(visibilityTimeout);
        }

        // Check if enough time has passed since last check
        const timeSinceLastCheck = Date.now() - lastCheckTime;
        if (timeSinceLastCheck < MIN_CHECK_INTERVAL) {
          return;
        }

        // Delay the check to avoid spamming when user is quickly switching apps
        visibilityTimeout = setTimeout(() => {
          console.log(
            "[AppUpdate] App returned from background, checking for updates...",
          );
          lastCheckTime = Date.now();
          checkForUpdates();
        }, VISIBILITY_DELAY);
      } else {
        // Clear timeout if app goes to background before check runs
        if (visibilityTimeout) {
          clearTimeout(visibilityTimeout);
          visibilityTimeout = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (visibilityTimeout) {
        clearTimeout(visibilityTimeout);
      }
    };
  }, [checkForUpdates]);

  // Apply update - skip waiting and reload
  const applyUpdate = useCallback(() => {
    if (typeof window === "undefined") return;

    // Clear dismissed state
    try {
      localStorage.removeItem(UPDATE_DISMISSED_KEY);
      localStorage.removeItem(UPDATE_DISMISSED_TIME_KEY);
    } catch {
      // Ignore localStorage errors
    }

    // Tell service worker to skip waiting
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }

    // Listen for controller change and reload
    const handleControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker?.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    // Reload after a short delay if controller doesn't change
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }, [registration]);

  // Dismiss update notification
  const dismissUpdate = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(UPDATE_DISMISSED_KEY, "true");
      localStorage.setItem(UPDATE_DISMISSED_TIME_KEY, Date.now().toString());
    } catch {
      // Ignore localStorage errors
    }

    setStatus("dismissed");
  }, []);

  return {
    status,
    updateInfo,
    checkForUpdates,
    applyUpdate,
    dismissUpdate,
    isUpdateDismissed: status === "dismissed",
  };
}
