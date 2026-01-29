import webpush from "web-push";
import { db } from "@/server/db";
import {
  lunarToGregorian,
  gregorianToLunar,
  formatLunarDate,
} from "@/lib/lunar-calendar";
import type { NotificationPreference } from "@prisma/client";

// Initialize web-push with VAPID keys
function initializeWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  let subject = process.env.VAPID_SUBJECT;

  if (!publicKey) {
    console.error("[WEBPUSH] VAPID_PUBLIC_KEY is not set");
    return false;
  }
  if (!privateKey) {
    console.error("[WEBPUSH] VAPID_PRIVATE_KEY is not set");
    return false;
  }

  // Use default subject if not provided
  if (!subject) {
    subject = "mailto:admin@am-lich.app";
    console.log("[WEBPUSH] Using default VAPID_SUBJECT");
  }

  // Auto-add mailto: prefix if subject looks like an email address
  if (
    subject.includes("@") &&
    !subject.startsWith("mailto:") &&
    !subject.startsWith("http")
  ) {
    subject = `mailto:${subject}`;
    console.log("[WEBPUSH] Auto-added mailto: prefix to VAPID_SUBJECT");
  }

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    console.log("[WEBPUSH] VAPID keys initialized successfully");
    return true;
  } catch (error) {
    console.error("[WEBPUSH] Failed to initialize VAPID keys:", error);
    return false;
  }
}

const isWebPushInitialized = initializeWebPush();

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  eventId?: string;
  requireInteraction?: boolean;
}

export interface NotificationItem {
  title: string;
  body: string;
  eventId?: string;
  eventType: "personal" | "shared" | "system" | "ancestor";
  url: string;
}

/**
 * Send a push notification to a subscription
 */
export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: PushNotificationPayload,
): Promise<{ success: boolean; error?: string }> {
  if (!isWebPushInitialized) {
    return {
      success: false,
      error: "WebPush not initialized. Check VAPID keys configuration.",
    };
  }

  try {
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon ?? "/icon-192x192.png",
      badge: payload.badge ?? "/badge-72x72.png",
      tag: payload.tag ?? "lunar-event",
      requireInteraction: payload.requireInteraction ?? true,
      data: {
        url: payload.url ?? "/",
        eventId: payload.eventId,
      },
    });

    await webpush.sendNotification(subscription, notificationPayload);
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all notifications for a user based on their preferences
 */
export async function getNotificationsForUser(
  userId: string,
  preferences: NotificationPreference,
): Promise<NotificationItem[]> {
  const notifications: NotificationItem[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Personal Events
  if (preferences.personalEvents) {
    const personalEvents = await db.lunarEvent.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    for (const event of personalEvents) {
      try {
        const gregorianDate = lunarToGregorian(
          event.lunarYear,
          event.lunarMonth,
          event.lunarDay,
        );
        const daysUntil = Math.ceil(
          (gregorianDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );

        console.log(
          `[CRON DEBUG] Event "${event.title}": lunar=${event.lunarYear}-${event.lunarMonth}-${event.lunarDay}, gregorian=${gregorianDate.toISOString()}, daysUntil=${daysUntil}, reminderDays=${event.reminderDays}, today=${today.toISOString()}`,
        );

        // Check if today is the reminder day
        if (daysUntil === event.reminderDays && daysUntil > 0) {
          const lunarInfo = gregorianToLunar(gregorianDate);
          notifications.push({
            title: `📅 ${event.title}`,
            body: `Sự kiện sẽ diễn ra sau ${daysUntil} ngày (${formatLunarDate(lunarInfo)})`,
            eventId: event.id,
            eventType:
              event.eventType === "ancestor_worship" ? "ancestor" : "personal",
            url: "/events",
          });
        }
      } catch {
        // Skip invalid dates
        continue;
      }
    }
  }

  // 2. Shared Events
  if (preferences.sharedEvents) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (user?.email) {
      const acceptedShares = await db.eventShare.findMany({
        where: {
          status: "ACCEPTED",
          OR: [
            { recipientId: userId },
            { recipientEmail: user.email.toLowerCase(), recipientId: null },
          ],
        },
        include: {
          owner: {
            select: { name: true, email: true },
          },
        },
      });

      if (acceptedShares.length > 0) {
        const ownerIds = acceptedShares.map((share) => share.ownerId);
        const sharedEvents = await db.lunarEvent.findMany({
          where: {
            userId: { in: ownerIds },
            isActive: true,
          },
        });

        for (const event of sharedEvents) {
          try {
            const gregorianDate = lunarToGregorian(
              event.lunarYear,
              event.lunarMonth,
              event.lunarDay,
            );
            const daysUntil = Math.ceil(
              (gregorianDate.getTime() - today.getTime()) /
                (1000 * 60 * 60 * 24),
            );

            if (daysUntil === event.reminderDays && daysUntil > 0) {
              const ownerName =
                acceptedShares.find((s) => s.ownerId === event.userId)?.owner
                  .name ?? "Someone";
              notifications.push({
                title: `🤝 ${event.title}`,
                body: `Từ ${ownerName}: Sự kiện sau ${daysUntil} ngày`,
                eventId: event.id,
                eventType: "shared",
                url: "/events/shared",
              });
            }
          } catch {
            continue;
          }
        }
      }
    }
  }

  // 3. System Events (Mồng 1, Rằm)
  if (preferences.systemEvents) {
    const systemNotifications = await getSystemEventNotifications(today);
    notifications.push(...systemNotifications);
  }

  return notifications;
}

/**
 * Get system event notifications (Mồng 1, Rằm)
 */
async function getSystemEventNotifications(
  today: Date,
): Promise<NotificationItem[]> {
  const notifications: NotificationItem[] = [];

  // Find next Mồng 1 and Rằm
  const nextMong1 = await findNextMong1(today);
  const nextRam = await findNextRam(today);

  // Check Mồng 1 (notify 1 day before)
  if (nextMong1) {
    const daysUntil = Math.ceil(
      (nextMong1.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysUntil === 1) {
      notifications.push({
        title: "🌑 Mồng 1 sắp tới",
        body: `Ngày mai là Mồng 1 tháng ${nextMong1.lunarMonth} Âm lịch`,
        eventType: "system",
        url: "/calendar",
      });
    }
  }

  // Check Rằm (notify 1 day before)
  if (nextRam) {
    const daysUntil = Math.ceil(
      (nextRam.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysUntil === 1) {
      notifications.push({
        title: "🌕 Rằm sắp tới",
        body: `Ngày mai là Rằm tháng ${nextRam.lunarMonth} Âm lịch`,
        eventType: "system",
        url: "/calendar",
      });
    }
  }

  return notifications;
}

/**
 * Find the next Mồng 1 (lunar day 1)
 */
async function findNextMong1(
  fromDate: Date,
): Promise<{ date: Date; lunarMonth: number } | null> {
  const currentLunar = gregorianToLunar(fromDate);
  const currentYear = fromDate.getFullYear();

  // Check remaining months of current year
  for (let month = currentLunar.month; month <= 12; month++) {
    try {
      const gregorianDate = lunarToGregorian(currentYear, month, 1);
      if (gregorianDate >= fromDate) {
        return { date: gregorianDate, lunarMonth: month };
      }
    } catch {
      continue;
    }
  }

  // Check first few months of next year
  for (let month = 1; month <= 3; month++) {
    try {
      const gregorianDate = lunarToGregorian(currentYear + 1, month, 1);
      if (gregorianDate >= fromDate) {
        return { date: gregorianDate, lunarMonth: month };
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Find the next Rằm (lunar day 15)
 */
async function findNextRam(
  fromDate: Date,
): Promise<{ date: Date; lunarMonth: number } | null> {
  const currentLunar = gregorianToLunar(fromDate);
  const currentYear = fromDate.getFullYear();

  // Check remaining months of current year
  for (let month = currentLunar.month; month <= 12; month++) {
    try {
      const gregorianDate = lunarToGregorian(currentYear, month, 15);
      if (gregorianDate >= fromDate) {
        return { date: gregorianDate, lunarMonth: month };
      }
    } catch {
      continue;
    }
  }

  // Check first few months of next year
  for (let month = 1; month <= 3; month++) {
    try {
      const gregorianDate = lunarToGregorian(currentYear + 1, month, 15);
      if (gregorianDate >= fromDate) {
        return { date: gregorianDate, lunarMonth: month };
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Process notifications for all enabled users
 * Simplified version: processes all users with enabled notifications and push subscriptions
 * regardless of notification time. Only skips users who were already notified today.
 */
export async function processScheduledNotifications(): Promise<{
  processed: number;
  notificationsSent: number;
  errors: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log(
    `[CRON DEBUG] Looking for users with enabled=true and lastNotifiedAt < ${today.toISOString()} or null`,
  );

  // First, let's see how many total enabled users exist
  const allEnabled = await db.notificationPreference.count({
    where: { enabled: true },
  });
  console.log(`[CRON DEBUG] Total enabled users: ${allEnabled}`);

  // Check how many were notified today
  const notifiedToday = await db.notificationPreference.count({
    where: {
      enabled: true,
      lastNotifiedAt: {
        gte: today,
      },
    },
  });
  console.log(`[CRON DEBUG] Users notified today: ${notifiedToday}`);

  // Get all enabled users who haven't been notified today
  const users = await db.notificationPreference.findMany({
    where: {
      enabled: true,
      OR: [
        { lastNotifiedAt: null },
        {
          lastNotifiedAt: {
            lt: today,
          },
        },
      ],
    },
    include: {
      user: {
        include: {
          pushSubscription: true,
        },
      },
    },
  });

  console.log(`[CRON] Found ${users.length} users to process`);

  let notificationsSent = 0;
  let errors = 0;

  for (const pref of users) {
    if (!pref.user.pushSubscription) {
      console.log(
        `[CRON] User ${pref.userId} has no push subscription, skipping`,
      );
      continue;
    }

    try {
      const notifications = await getNotificationsForUser(pref.userId, pref);

      console.log(
        `[CRON] User ${pref.userId}: found ${notifications.length} notifications`,
      );

      for (const notification of notifications) {
        const subscription: webpush.PushSubscription = {
          endpoint: pref.user.pushSubscription.endpoint,
          keys: {
            p256dh: pref.user.pushSubscription.p256dh,
            auth: pref.user.pushSubscription.auth,
          },
        };

        const result = await sendPushNotification(subscription, {
          title: notification.title,
          body: notification.body,
          eventId: notification.eventId,
          url: notification.url,
        });

        // Log the notification
        await db.notificationLog.create({
          data: {
            userId: pref.userId,
            eventId: notification.eventId,
            eventType: notification.eventType,
            title: notification.title,
            body: notification.body,
            success: result.success,
            error: result.error ?? null,
          },
        });

        if (result.success) {
          notificationsSent++;
        } else {
          errors++;
        }
      }

      // Update badge count
      const unreadCount = await db.notificationLog.count({
        where: {
          userId: pref.userId,
          isRead: false,
        },
      });

      await db.notificationPreference.update({
        where: { userId: pref.userId },
        data: {
          lastNotifiedAt: new Date(),
          badgeCount: unreadCount + notifications.length,
        },
      });
    } catch (error) {
      console.error(
        `[CRON] Error processing notifications for user ${pref.userId}:`,
        error,
      );
      errors++;
    }
  }

  return {
    processed: users.length,
    notificationsSent,
    errors,
  };
}

/**
 * Clear badge count for a user
 */
export async function clearBadgeCount(userId: string): Promise<void> {
  await db.notificationPreference.update({
    where: { userId },
    data: { badgeCount: 0 },
  });

  await db.notificationLog.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
