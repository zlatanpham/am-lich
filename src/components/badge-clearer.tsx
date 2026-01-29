"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";

/**
 * Component that automatically clears the notification badge count
 * when the app initializes. This runs on every page load for authenticated users.
 */
export function BadgeClearer() {
  const session = useSession();
  const status = session?.status;
  const clearBadgeMutation =
    api.notificationPreferences.clearBadge.useMutation();

  useEffect(() => {
    // Only clear badge if user is authenticated
    if (status !== "authenticated") {
      return;
    }

    const clearBadge = async () => {
      try {
        // Clear badge in database
        await clearBadgeMutation.mutateAsync();

        // Clear native app badge if supported
        if ("clearAppBadge" in navigator) {
          await navigator.clearAppBadge();
        }
      } catch (error) {
        // Silently fail - badge clearing is not critical
        console.log("Failed to clear badge:", error);
      }
    };

    void clearBadge();
  }, [status, clearBadgeMutation]);

  // This component doesn't render anything
  return null;
}
