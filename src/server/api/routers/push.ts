import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const pushRouter = createTRPCRouter({
  /**
   * Subscribe to push notifications
   */
  subscribe: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
        p256dh: z.string(),
        auth: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        // Upsert subscription (create or update)
        await ctx.db.pushSubscription.upsert({
          where: { userId },
          update: {
            endpoint: input.endpoint,
            p256dh: input.p256dh,
            auth: input.auth,
            updatedAt: new Date(),
          },
          create: {
            userId,
            endpoint: input.endpoint,
            p256dh: input.p256dh,
            auth: input.auth,
          },
        });

        // Ensure notification preferences exist and are enabled
        await ctx.db.notificationPreference.upsert({
          where: { userId },
          update: {
            enabled: true,
            updatedAt: new Date(),
          },
          create: {
            userId,
            enabled: true,
            notificationTime: "08:00",
            personalEvents: true,
            sharedEvents: true,
            systemEvents: true,
            ancestorWorshipEvents: true,
          },
        });

        return { success: true };
      } catch (error) {
        console.error("Error subscribing to push notifications:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to subscribe to push notifications",
        });
      }
    }),

  /**
   * Unsubscribe from push notifications
   */
  unsubscribe: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    try {
      await ctx.db.pushSubscription.deleteMany({
        where: { userId },
      });

      // Disable notifications but keep preferences
      await ctx.db.notificationPreference.updateMany({
        where: { userId },
        data: { enabled: false },
      });

      return { success: true };
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to unsubscribe from push notifications",
      });
    }
  }),

  /**
   * Get subscription status
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const subscription = await ctx.db.pushSubscription.findUnique({
      where: { userId },
    });

    const preferences = await ctx.db.notificationPreference.findUnique({
      where: { userId },
    });

    return {
      isSubscribed: !!subscription,
      preferences: preferences
        ? {
            enabled: preferences.enabled,
            notificationTime: preferences.notificationTime,
            personalEvents: preferences.personalEvents,
            sharedEvents: preferences.sharedEvents,
            systemEvents: preferences.systemEvents,
            ancestorWorshipEvents: preferences.ancestorWorshipEvents,
            badgeCount: preferences.badgeCount,
          }
        : null,
    };
  }),

  /**
   * Get VAPID public key (public endpoint)
   */
  getVapidPublicKey: publicProcedure.query(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "VAPID public key not configured",
      });
    }
    return { publicKey };
  }),
});
