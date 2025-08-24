import webpush from "web-push";
import { env } from "@/env.js";
import type { PushSubscription as PrismaSubscription } from "@prisma/client";

// VAPID keys should be stored in environment variables
// Generate keys with: npx web-push generate-vapid-keys
const getVapidSubject = () => {
  const nextAuthUrl = env.NEXTAUTH_URL;
  // Use mailto for localhost or non-https URLs
  if (!nextAuthUrl || nextAuthUrl.startsWith("http://")) {
    return "mailto:admin@example.com";
  }
  return nextAuthUrl;
};

const VAPID_KEYS = {
  subject: getVapidSubject(),
  publicKey:
    env.VAPID_PUBLIC_KEY ??
    "BNXoSw5b7bgJ9WEWJdRaeFJ3mLTq7rG3F5sK4vMKAJn9L1K8j9J1K8j9J1K8j9J1K8j9J1K8j9J1K8j9J1K8j9",
  privateKey: env.VAPID_PRIVATE_KEY ?? "your-private-key-here",
};

// Initialize web-push with VAPID keys
webpush.setVapidDetails(
  VAPID_KEYS.subject,
  VAPID_KEYS.publicKey,
  VAPID_KEYS.privateKey,
);

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  eventId?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
  }>;
  requireInteraction?: boolean;
  vibrate?: number[];
}

export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/**
 * Send push notification to a single subscription
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData | PrismaSubscription,
  payload: NotificationPayload,
): Promise<{ success: boolean; error?: string }> {
  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    const notificationData = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon ?? "/icon-192x192.png",
      badge: payload.badge ?? "/icon-96x96.png",
      data: {
        url: payload.url ?? "/calendar",
        eventId: payload.eventId,
        timestamp: Date.now(),
        ...payload.data,
      },
      actions: payload.actions ?? [
        { action: "view", title: "Xem chi tiết" },
        { action: "dismiss", title: "Nhắc nhở sau" },
      ],
      requireInteraction: payload.requireInteraction ?? false,
      vibrate: payload.vibrate ?? [200, 100, 200],
    };

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(notificationData),
      {
        TTL: 24 * 60 * 60, // 24 hours
        urgency: "normal",
      },
    );

    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);

    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error && typeof error === "object" && "body" in error) {
      // Handle WebPushError specifically
      const webPushError = error as { body?: string; message?: string };
      errorMessage = `${webPushError.body ?? webPushError.message ?? "WebPush error"}`;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Send push notification to multiple subscriptions
 */
export async function sendPushNotificationToMany(
  subscriptions: Array<PushSubscriptionData | PrismaSubscription>,
  payload: NotificationPayload,
): Promise<{
  totalSent: number;
  totalFailed: number;
  results: Array<{ success: boolean; error?: string }>;
}> {
  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      sendPushNotification(subscription, payload),
    ),
  );

  let totalSent = 0;
  let totalFailed = 0;
  const resultData: Array<{ success: boolean; error?: string }> = [];

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      resultData.push(result.value);
      if (result.value.success) {
        totalSent++;
      } else {
        totalFailed++;
      }
    } else {
      resultData.push({ success: false, error: result.reason.message });
      totalFailed++;
    }
  });

  return {
    totalSent,
    totalFailed,
    results: resultData,
  };
}

/**
 * Generate VAPID keys (helper function)
 * This should be run once to generate keys for your application
 */
export function generateVAPIDKeys() {
  return webpush.generateVAPIDKeys();
}

/**
 * Common notification templates
 */
export const NotificationTemplates = {
  lunarDateReminder: (lunarDate: string): NotificationPayload => ({
    title: "Nhắc nhở ngày âm lịch",
    body: `Hôm nay là ${lunarDate} âm lịch`,
    url: "/calendar",
    requireInteraction: true,
  }),

  eventReminder: (
    eventTitle: string,
    daysLeft: number,
  ): NotificationPayload => ({
    title: "Nhắc nhở sự kiện",
    body: `${eventTitle} - còn ${daysLeft} ngày`,
    url: "/calendar",
    requireInteraction: false,
  }),

  firstDayOfMonth: (): NotificationPayload => ({
    title: "Mồng 1 âm lịch",
    body: "Hôm nay là mồng một âm lịch (ngày sóc)",
    url: "/calendar",
    requireInteraction: true,
  }),

  fifteenthDayOfMonth: (): NotificationPayload => ({
    title: "Rằm âm lịch",
    body: "Hôm nay là rằm âm lịch (ngày vọng)",
    url: "/calendar",
    requireInteraction: true,
  }),

  testNotification: (message: string): NotificationPayload => ({
    title: "Thông báo thử nghiệm",
    body: message,
    url: "/notifications",
    requireInteraction: false,
  }),
};

/**
 * Clean up invalid subscriptions
 * Call this function to remove subscriptions that are no longer valid
 */
export function isSubscriptionExpired(error: Error): boolean {
  // Check for specific error codes that indicate expired/invalid subscriptions
  const expiredErrors = [
    "InvalidRegistration",
    "NotRegistered",
    "MismatchSenderId",
    "InvalidPackageName",
    "InvalidParameters",
    "410", // HTTP 410 Gone - subscription expired
    "unsubscribed or expired", // FCM error message
    "Received unexpected response code", // WebPush error for 410
  ];

  const errorString = error.message ?? error.toString();
  return expiredErrors.some((errorType) => errorString.includes(errorType));
}
