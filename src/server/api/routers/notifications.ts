import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  sendPushNotification,
  NotificationTemplates,
  isSubscriptionExpired,
} from "@/lib/push-notification-sender";

export const notificationsRouter = createTRPCRouter({
  /**
   * Get user's notification preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    let preferences = await ctx.db.notificationPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if they don't exist
    preferences ??= await ctx.db.notificationPreference.create({
      data: {
        userId,
        enablePushNotifications: false,
        enableEmailNotifications: true,
        defaultReminderDays: 3,
        remindFor15thDay: true,
        remindFor1stDay: true,
      },
    });

    return preferences;
  }),

  /**
   * Update user's notification preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        enablePushNotifications: z.boolean().optional(),
        enableEmailNotifications: z.boolean().optional(),
        defaultReminderDays: z.number().min(1).max(30).optional(),
        remindFor15thDay: z.boolean().optional(),
        remindFor1stDay: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const preferences = await ctx.db.notificationPreference.upsert({
        where: { userId },
        update: input,
        create: {
          userId,
          enablePushNotifications: input.enablePushNotifications ?? false,
          enableEmailNotifications: input.enableEmailNotifications ?? true,
          defaultReminderDays: input.defaultReminderDays ?? 3,
          remindFor15thDay: input.remindFor15thDay ?? true,
          remindFor1stDay: input.remindFor1stDay ?? true,
        },
      });

      return preferences;
    }),

  /**
   * Subscribe to push notifications
   */
  subscribeToPush: protectedProcedure
    .input(
      z.object({
        endpoint: z.string().url("Invalid endpoint URL"),
        p256dh: z.string().min(1, "p256dh key is required"),
        auth: z.string().min(1, "auth key is required"),
        userAgent: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Create or update push subscription
      const subscription = await ctx.db.pushSubscription.upsert({
        where: {
          userId_endpoint: {
            userId,
            endpoint: input.endpoint,
          },
        },
        update: {
          p256dh: input.p256dh,
          auth: input.auth,
          userAgent: input.userAgent,
        },
        create: {
          userId,
          endpoint: input.endpoint,
          p256dh: input.p256dh,
          auth: input.auth,
          userAgent: input.userAgent,
        },
      });

      // Enable push notifications in preferences
      await ctx.db.notificationPreference.upsert({
        where: { userId },
        update: { enablePushNotifications: true },
        create: {
          userId,
          enablePushNotifications: true,
          enableEmailNotifications: true,
          defaultReminderDays: 3,
          remindFor15thDay: true,
          remindFor1stDay: true,
        },
      });

      return subscription;
    }),

  /**
   * Unsubscribe from push notifications
   */
  unsubscribeFromPush: protectedProcedure
    .input(
      z.object({
        endpoint: z.string().url("Invalid endpoint URL").optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (input.endpoint) {
        // Remove specific subscription
        await ctx.db.pushSubscription.deleteMany({
          where: {
            userId,
            endpoint: input.endpoint,
          },
        });
      } else {
        // Remove all subscriptions for user
        await ctx.db.pushSubscription.deleteMany({
          where: { userId },
        });
      }

      // Check if user has any remaining push subscriptions
      const remainingSubscriptions = await ctx.db.pushSubscription.count({
        where: { userId },
      });

      // If no subscriptions remain, disable push notifications in preferences
      if (remainingSubscriptions === 0) {
        await ctx.db.notificationPreference.upsert({
          where: { userId },
          update: { enablePushNotifications: false },
          create: {
            userId,
            enablePushNotifications: false,
            enableEmailNotifications: true,
            defaultReminderDays: 3,
            remindFor15thDay: true,
            remindFor1stDay: true,
          },
        });
      }

      return { success: true };
    }),

  /**
   * Get user's push subscriptions
   */
  getPushSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const subscriptions = await ctx.db.pushSubscription.findMany({
      where: { userId },
      select: {
        id: true,
        endpoint: true,
        userAgent: true,
        createdAt: true,
      },
    });

    return subscriptions;
  }),

  /**
   * Test notification (for development/testing purposes)
   */
  testNotification: protectedProcedure
    .input(
      z.object({
        type: z.enum(["push", "email", "both"]),
        message: z.string().min(1, "Message is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get user preferences
      const preferences = await ctx.db.notificationPreference.findUnique({
        where: { userId },
      });

      const results: { push?: boolean; email?: boolean; error?: string } = {};

      if (
        (input.type === "push" || input.type === "both") &&
        preferences?.enablePushNotifications
      ) {
        // Get user's push subscriptions
        const subscriptions = await ctx.db.pushSubscription.findMany({
          where: { userId },
        });

        if (subscriptions.length > 0) {
          try {
            // Send test notification to all user's subscriptions
            const payload = NotificationTemplates.testNotification(
              input.message,
            );
            let successCount = 0;
            const failedSubscriptions: string[] = [];

            for (const subscription of subscriptions) {
              const result = await sendPushNotification(subscription, payload);
              if (result.success) {
                successCount++;
              } else {
                failedSubscriptions.push(subscription.id);

                // Check if subscription is expired and clean it up
                if (
                  result.error &&
                  isSubscriptionExpired(new Error(result.error))
                ) {
                  await ctx.db.pushSubscription.delete({
                    where: { id: subscription.id },
                  });
                }
              }
            }

            if (successCount > 0) {
              results.push = true;
            } else {
              results.error = `Failed to send push notifications to all ${subscriptions.length} subscriptions`;
            }
          } catch (error) {
            console.error("Error sending test push notification:", error);
            results.error =
              error instanceof Error ? error.message : "Unknown error";
          }
        } else {
          results.error = "No push subscriptions found";
        }
      }

      if (
        (input.type === "email" || input.type === "both") &&
        preferences?.enableEmailNotifications
      ) {
        // TODO: Implement actual email sending using Resend
        // For now, just mark as success
        results.email = true;
      }

      return results;
    }),

  /**
   * Force delete all push subscriptions (nuclear option)
   */
  deleteAllSubscriptions: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const deletedCount = await ctx.db.pushSubscription.deleteMany({
      where: { userId },
    });

    return {
      deletedCount: deletedCount.count,
      message: `Deleted all ${deletedCount.count} subscriptions. You can now subscribe fresh.`,
    };
  }),

  /**
   * Clean up expired push subscriptions
   */
  cleanupExpiredSubscriptions: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get all subscriptions for this user
    const subscriptions = await ctx.db.pushSubscription.findMany({
      where: { userId },
    });

    let cleanedCount = 0;
    const results: Array<{
      id: string;
      endpoint: string;
      status: "valid" | "expired" | "error";
    }> = [];

    for (const subscription of subscriptions) {
      try {
        // Try to send a test payload to check if subscription is valid
        const testResult = await sendPushNotification(subscription, {
          title: "Connection Test",
          body: "Testing subscription validity",
          requireInteraction: false,
        });

        if (testResult.success) {
          results.push({
            id: subscription.id,
            endpoint: subscription.endpoint,
            status: "valid",
          });
        } else {
          if (
            testResult.error &&
            isSubscriptionExpired(new Error(testResult.error))
          ) {
            await ctx.db.pushSubscription.delete({
              where: { id: subscription.id },
            });
            cleanedCount++;
            results.push({
              id: subscription.id,
              endpoint: subscription.endpoint,
              status: "expired",
            });
          } else {
            results.push({
              id: subscription.id,
              endpoint: subscription.endpoint,
              status: "error",
            });
          }
        }
      } catch (error) {
        console.error(`Error checking subscription ${subscription.id}:`, error);
        results.push({
          id: subscription.id,
          endpoint: subscription.endpoint,
          status: "error",
        });
      }
    }

    return {
      totalChecked: subscriptions.length,
      cleanedCount,
      results,
    };
  }),

  /**
   * Get notification settings summary
   */
  getSettingsSummary: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get preferences directly
    let preferences = await ctx.db.notificationPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if they don't exist
    preferences ??= await ctx.db.notificationPreference.create({
      data: {
        userId,
        enablePushNotifications: false,
        enableEmailNotifications: true,
        defaultReminderDays: 3,
        remindFor15thDay: true,
        remindFor1stDay: true,
      },
    });

    // Get push subscriptions directly
    const pushSubscriptions = await ctx.db.pushSubscription.findMany({
      where: { userId },
      select: {
        id: true,
        endpoint: true,
        userAgent: true,
        createdAt: true,
      },
    });

    return {
      preferences,
      pushSubscriptionsCount: pushSubscriptions.length,
      hasActivePushSubscriptions: pushSubscriptions.length > 0,
      notificationChannels: {
        push:
          preferences.enablePushNotifications && pushSubscriptions.length > 0,
        email: preferences.enableEmailNotifications,
      },
    };
  }),
});
