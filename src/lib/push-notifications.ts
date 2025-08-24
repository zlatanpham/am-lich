/**
 * Client-side push notification utilities
 */

import { env } from "@/env.js";

// VAPID public key from environment variables
// Generate keys with: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY =
  env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ??
  "BNXoSw5b7bgJ9WEWJdRaeFJ3mLTq7rG3F5sK4vMKAJn9L1K8j9J1K8j9J1K8j9J1K8j9J1K8j9J1K8j9J1K8j9";

export class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      void this.initializeServiceWorker();
    }
  }

  /**
   * Initialize service worker
   */
  private async initializeServiceWorker(): Promise<void> {
    if ("serviceWorker" in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register("/sw.js");
      } catch {
        // Service worker registration failed - silently ignore
      }
    }
  }

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  }

  /**
   * Get current notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return "denied";
    return Notification.permission;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error("Push notifications are not supported in this browser");
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscription> {
    if (!this.registration) {
      throw new Error("Service Worker not registered");
    }

    const permission = await this.requestPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission not granted");
    }

    // Check if already subscribed
    const existingSubscription =
      await this.registration.pushManager.getSubscription();
    if (existingSubscription) {
      return existingSubscription;
    }

    // Create new subscription
    const subscription = await this.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlB64ToUint8Array(
        VAPID_PUBLIC_KEY,
      ) as BufferSource,
    });

    return subscription;
  }

  /**
   * Get existing subscription
   */
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      return null;
    }

    return await this.registration.pushManager.getSubscription();
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    const subscription = await this.getSubscription();
    if (subscription) {
      return await subscription.unsubscribe();
    }
    return true;
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Show a test notification (doesn't require server)
   */
  async showTestNotification(title: string, body: string): Promise<void> {
    if (!this.registration) {
      throw new Error("Service Worker not registered");
    }

    const permission = this.getPermissionStatus();
    if (permission !== "granted") {
      throw new Error("Notification permission not granted");
    }

    await this.registration.showNotification(title, {
      body,
      icon: "/icon-192x192.png",
      badge: "/icon-96x96.png",
      data: {
        url: "/calendar",
        timestamp: Date.now(),
      },
    } as NotificationOptions & { vibrate?: number[] });
  }
}

// Export a singleton instance
export const pushNotificationService = new PushNotificationService();

/**
 * Utility functions for working with push subscriptions
 */
export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}

/**
 * Convert PushSubscription to data object for API
 */
export function subscriptionToData(
  subscription: PushSubscription,
): PushSubscriptionData {
  const keys = subscription.getKey("p256dh");
  const auth = subscription.getKey("auth");

  if (!keys || !auth) {
    throw new Error("Failed to get subscription keys");
  }

  return {
    endpoint: subscription.endpoint,
    p256dh: arrayBufferToBase64(keys),
    auth: arrayBufferToBase64(auth),
    userAgent: navigator.userAgent,
  };
}

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return window.btoa(binary);
}

/**
 * Hook-like function for managing push notifications in React components
 */
export function usePushNotifications() {
  const isSupported = pushNotificationService.isSupported();
  const permission = pushNotificationService.getPermissionStatus();

  return {
    isSupported,
    permission,
    requestPermission: () => pushNotificationService.requestPermission(),
    subscribe: () => pushNotificationService.subscribe(),
    unsubscribe: () => pushNotificationService.unsubscribe(),
    getSubscription: () => pushNotificationService.getSubscription(),
    showTestNotification: (title: string, body: string) =>
      pushNotificationService.showTestNotification(title, body),
  };
}
