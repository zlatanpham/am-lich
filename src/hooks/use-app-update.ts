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

  // Check for updates
  const checkForUpdates = useCallback(() => {
    if (typeof window === "undefined") return;

    setStatus("checking");

    if (registration?.active) {
      // Send message to service worker to check for updates
      registration.active.postMessage({ type: "CHECK_FOR_UPDATES" });
    } else {
      // Fallback: manually check version.json
      void fetch("/version.json", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION;
          if (data.version && data.version !== currentVersion) {
            const info: UpdateInfo = {
              version: data.version,
              currentVersion: currentVersion || "unknown",
            };
            setUpdateInfo(info);

            if (!isUpdateDismissed()) {
              setStatus("available");
            } else {
              setStatus("dismissed");
            }
          } else {
            setStatus("not-available");
          }
        })
        .catch(() => {
          setStatus("not-available");
        });
    }
  }, [registration, isUpdateDismissed]);

  // Listen for service worker messages
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "UPDATE_AVAILABLE") {
        const info: UpdateInfo = {
          version: event.data.version,
          currentVersion: event.data.currentVersion,
        };
        setUpdateInfo(info);

        // Only show as available if not dismissed
        if (!isUpdateDismissed()) {
          setStatus("available");
        } else {
          setStatus("dismissed");
        }
      } else if (event.data?.type === "NO_UPDATE_AVAILABLE") {
        setStatus("not-available");
        setUpdateInfo(null);
      }
    };

    navigator.serviceWorker?.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, [isUpdateDismissed]);

  // Get service worker registration on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasCheckedOnMount.current) return;

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        hasCheckedOnMount.current = true;

        // Check for updates on mount
        setStatus("checking");

        if (reg.active) {
          // Send message to service worker to check for updates
          reg.active.postMessage({ type: "CHECK_FOR_UPDATES" });
        } else {
          // Fallback: manually check version.json
          void fetch("/version.json", { cache: "no-store" })
            .then((res) => res.json())
            .then((data) => {
              const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION;
              if (data.version && data.version !== currentVersion) {
                const info: UpdateInfo = {
                  version: data.version,
                  currentVersion: currentVersion || "unknown",
                };
                setUpdateInfo(info);

                if (!isUpdateDismissed()) {
                  setStatus("available");
                } else {
                  setStatus("dismissed");
                }
              } else {
                setStatus("not-available");
              }
            })
            .catch(() => {
              setStatus("not-available");
            });
        }
      });
    }
  }, [isUpdateDismissed]);

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
