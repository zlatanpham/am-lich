import webpush from "web-push";
import { db } from "@/server/db";
import {
  lunarToGregorian,
  gregorianToLunar,
  formatLunarDate,
} from "@/lib/lunar-calendar";
import type { NotificationPreference } from "@prisma/client";

// Initialize web-push with VAPID keys
if (
  process.env.VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_SUBJECT
) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

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
 * Process notifications for all users at their preferred time
 */
export async function processScheduledNotifications(
  currentHour: number,
  currentMinute: number,
): Promise<{
  processed: number;
  notificationsSent: number;
  errors: number;
}> {
  const currentTime = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get users whose notification time matches current time and haven't been notified today
  const users = await db.notificationPreference.findMany({
    where: {
      enabled: true,
      notificationTime: currentTime,
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

  let notificationsSent = 0;
  let errors = 0;

  for (const pref of users) {
    if (!pref.user.pushSubscription) continue;

    try {
      const notifications = await getNotificationsForUser(pref.userId, pref);

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
        `Error processing notifications for user ${pref.userId}:`,
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
