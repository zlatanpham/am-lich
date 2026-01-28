import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { clearBadgeCount } from "@/lib/notifications";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const notificationPreferencesRouter = createTRPCRouter({
  /**
   * Get notification preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const preferences = await ctx.db.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Return default preferences
      return {
        enabled: false,
        notificationTime: "08:00",
        personalEvents: true,
        sharedEvents: true,
        systemEvents: true,
        ancestorWorshipEvents: true,
        badgeCount: 0,
      };
    }

    return {
      enabled: preferences.enabled,
      notificationTime: preferences.notificationTime,
      personalEvents: preferences.personalEvents,
      sharedEvents: preferences.sharedEvents,
      systemEvents: preferences.systemEvents,
      ancestorWorshipEvents: preferences.ancestorWorshipEvents,
      badgeCount: preferences.badgeCount,
    };
  }),

  /**
   * Update notification preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        enabled: z.boolean().optional(),
        notificationTime: z
          .string()
          .regex(timeRegex, "Invalid time format. Use HH:mm")
          .optional(),
        personalEvents: z.boolean().optional(),
        sharedEvents: z.boolean().optional(),
        systemEvents: z.boolean().optional(),
        ancestorWorshipEvents: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        const preferences = await ctx.db.notificationPreference.upsert({
          where: { userId },
          update: {
            ...input,
            updatedAt: new Date(),
          },
          create: {
            userId,
            enabled: input.enabled ?? true,
            notificationTime: input.notificationTime ?? "08:00",
            personalEvents: input.personalEvents ?? true,
            sharedEvents: input.sharedEvents ?? true,
            systemEvents: input.systemEvents ?? true,
            ancestorWorshipEvents: input.ancestorWorshipEvents ?? true,
          },
        });

        return {
          success: true,
          preferences: {
            enabled: preferences.enabled,
            notificationTime: preferences.notificationTime,
            personalEvents: preferences.personalEvents,
            sharedEvents: preferences.sharedEvents,
            systemEvents: preferences.systemEvents,
            ancestorWorshipEvents: preferences.ancestorWorshipEvents,
            badgeCount: preferences.badgeCount,
          },
        };
      } catch (error) {
        console.error("Error updating notification preferences:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update notification preferences",
        });
      }
    }),

  /**
   * Update notification time only
   */
  updateNotificationTime: protectedProcedure
    .input(
      z.object({
        time: z.string().regex(timeRegex, "Invalid time format. Use HH:mm"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await ctx.db.notificationPreference.upsert({
          where: { userId },
          update: {
            notificationTime: input.time,
            updatedAt: new Date(),
          },
          create: {
            userId,
            enabled: true,
            notificationTime: input.time,
          },
        });

        return { success: true, time: input.time };
      } catch (error) {
        console.error("Error updating notification time:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update notification time",
        });
      }
    }),

  /**
   * Clear badge count
   */
  clearBadge: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    try {
      await clearBadgeCount(userId);
      return { success: true };
    } catch (error) {
      console.error("Error clearing badge:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to clear badge",
      });
    }
  }),

  /**
   * Get notification history
   */
  getNotificationHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const [notifications, total] = await Promise.all([
        ctx.db.notificationLog.findMany({
          where: { userId },
          orderBy: { sentAt: "desc" },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.db.notificationLog.count({
          where: { userId },
        }),
      ]);

      return {
        notifications,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  /**
   * Mark notifications as read
   */
  markAsRead: protectedProcedure
    .input(
      z.object({
        notificationIds: z.array(z.string()).optional(),
        markAll: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        if (input.markAll) {
          await ctx.db.notificationLog.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
          });
        } else if (input.notificationIds && input.notificationIds.length > 0) {
          await ctx.db.notificationLog.updateMany({
            where: {
              userId,
              id: { in: input.notificationIds },
            },
            data: { isRead: true },
          });
        }

        // Update badge count
        const unreadCount = await ctx.db.notificationLog.count({
          where: { userId, isRead: false },
        });

        await ctx.db.notificationPreference.updateMany({
          where: { userId },
          data: { badgeCount: unreadCount },
        });

        return { success: true };
      } catch (error) {
        console.error("Error marking notifications as read:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark notifications as read",
        });
      }
    }),
});
