import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  sendShareInvitationSignupEmail,
  sendShareInvitationNotificationEmail,
  sendShareAcceptedEmail,
  sendShareDeclinedEmail,
} from "@/lib/email";
import {
  lunarToGregorian,
  gregorianToLunar,
  formatLunarDate,
} from "@/lib/lunar-calendar";

export const eventSharingRouter = createTRPCRouter({
  /**
   * Send a share invitation to an email address
   * Handles both registered and non-registered users
   */
  sendShareInvitation: protectedProcedure
    .input(
      z.object({
        recipientEmail: z.string().email("Invalid email address"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const ownerId = ctx.session.user.id;
      const ownerEmail = ctx.session.user.email;

      // Cannot share with yourself
      if (input.recipientEmail.toLowerCase() === ownerEmail?.toLowerCase()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bạn không thể chia sẻ với chính mình",
        });
      }

      // Check if share already exists
      const existingShare = await ctx.db.eventShare.findUnique({
        where: {
          ownerId_recipientEmail: {
            ownerId,
            recipientEmail: input.recipientEmail.toLowerCase(),
          },
        },
      });

      if (existingShare) {
        if (existingShare.status === "PENDING") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Đã gửi lời mời cho địa chỉ email này",
          });
        }
        if (existingShare.status === "ACCEPTED") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Đã chia sẻ sự kiện với người này",
          });
        }
        // For DECLINED or CANCELLED, we can update the status
      }

      // Check if recipient is a registered user
      const recipientUser = await ctx.db.user.findUnique({
        where: { email: input.recipientEmail.toLowerCase() },
      });

      const owner = await ctx.db.user.findUnique({
        where: { id: ownerId },
        select: { name: true, email: true },
      });

      if (!owner) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy thông tin người dùng",
        });
      }

      const ownerName = owner.name || owner.email || "Someone";

      // Create or update the share
      const eventShare = existingShare
        ? await ctx.db.eventShare.update({
            where: { id: existingShare.id },
            data: {
              status: "PENDING",
              recipientId: recipientUser?.id || null,
              cancelledAt: null,
              declinedAt: null,
            },
          })
        : await ctx.db.eventShare.create({
            data: {
              ownerId,
              recipientId: recipientUser?.id || null,
              recipientEmail: input.recipientEmail.toLowerCase(),
              status: "PENDING",
            },
          });

      // Create invitation token for non-registered users
      if (!recipientUser) {
        // Delete any existing invitation
        await ctx.db.eventShareInvitation.deleteMany({
          where: { eventShareId: eventShare.id },
        });

        // Create new invitation with 7-day expiry
        const invitation = await ctx.db.eventShareInvitation.create({
          data: {
            eventShareId: eventShare.id,
            email: input.recipientEmail.toLowerCase(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });

        // Send signup invitation email
        await sendShareInvitationSignupEmail(
          input.recipientEmail,
          ownerName,
          invitation.token,
        );
      } else {
        // Send notification to registered user
        await sendShareInvitationNotificationEmail(
          input.recipientEmail,
          recipientUser.name || input.recipientEmail,
          ownerName,
        );
      }

      return { success: true, isNewUser: !recipientUser };
    }),

  /**
   * Get all shares I've sent (as owner)
   */
  getMyShares: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["PENDING", "ACCEPTED", "DECLINED", "CANCELLED"])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const ownerId = ctx.session.user.id;

      const shares = await ctx.db.eventShare.findMany({
        where: {
          ownerId,
          ...(input.status && { status: input.status }),
        },
        include: {
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          invitation: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return shares;
    }),

  /**
   * Get all shares I've received (as recipient)
   */
  getSharedWithMe: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["PENDING", "ACCEPTED", "DECLINED", "CANCELLED"])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userEmail = ctx.session.user.email?.toLowerCase();

      const shares = await ctx.db.eventShare.findMany({
        where: {
          OR: [
            { recipientId: userId },
            { recipientEmail: userEmail, recipientId: null },
          ],
          ...(input.status && { status: input.status }),
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return shares;
    }),

  /**
   * Respond to a share invitation (accept or decline)
   */
  respondToShare: protectedProcedure
    .input(
      z.object({
        shareId: z.string(),
        action: z.enum(["accept", "decline"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userEmail = ctx.session.user.email?.toLowerCase();

      // Find the share
      const share = await ctx.db.eventShare.findFirst({
        where: {
          id: input.shareId,
          status: "PENDING",
          OR: [
            { recipientId: userId },
            { recipientEmail: userEmail, recipientId: null },
          ],
        },
        include: {
          owner: {
            select: { name: true, email: true },
          },
        },
      });

      if (!share) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy lời mời hoặc lời mời đã hết hạn",
        });
      }

      const now = new Date();
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      const recipientName =
        user?.name || user?.email || share.recipientEmail || "Someone";
      const ownerName = share.owner.name || share.owner.email || "Someone";

      // Update the share status
      await ctx.db.eventShare.update({
        where: { id: input.shareId },
        data: {
          status: input.action === "accept" ? "ACCEPTED" : "DECLINED",
          recipientId: userId,
          acceptedAt: input.action === "accept" ? now : null,
          declinedAt: input.action === "decline" ? now : null,
        },
      });

      // Delete the invitation token if exists
      await ctx.db.eventShareInvitation.deleteMany({
        where: { eventShareId: input.shareId },
      });

      // Notify the owner
      if (share.owner.email) {
        if (input.action === "accept") {
          await sendShareAcceptedEmail(
            share.owner.email,
            ownerName,
            recipientName,
          );
        } else {
          await sendShareDeclinedEmail(
            share.owner.email,
            ownerName,
            recipientName,
          );
        }
      }

      return { success: true };
    }),

  /**
   * Cancel a share (owner only)
   */
  cancelShare: protectedProcedure
    .input(z.object({ shareId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const ownerId = ctx.session.user.id;

      const share = await ctx.db.eventShare.findFirst({
        where: {
          id: input.shareId,
          ownerId,
          status: { in: ["PENDING", "ACCEPTED"] },
        },
      });

      if (!share) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy chia sẻ",
        });
      }

      await ctx.db.eventShare.update({
        where: { id: input.shareId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });

      // Delete invitation if exists
      await ctx.db.eventShareInvitation.deleteMany({
        where: { eventShareId: input.shareId },
      });

      return { success: true };
    }),

  /**
   * Unsubscribe from a share (recipient only)
   */
  unsubscribeFromShare: protectedProcedure
    .input(z.object({ shareId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const share = await ctx.db.eventShare.findFirst({
        where: {
          id: input.shareId,
          recipientId: userId,
          status: "ACCEPTED",
        },
      });

      if (!share) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy chia sẻ",
        });
      }

      // Instead of deleting, we change status to DECLINED so user can't be re-added
      await ctx.db.eventShare.update({
        where: { id: input.shareId },
        data: {
          status: "DECLINED",
          declinedAt: new Date(),
        },
      });

      return { success: true };
    }),

  /**
   * Get all events from people who shared with me
   */
  getSharedEvents: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userEmail = ctx.session.user.email?.toLowerCase();

      // Get all accepted shares
      const acceptedShares = await ctx.db.eventShare.findMany({
        where: {
          status: "ACCEPTED",
          OR: [
            { recipientId: userId },
            { recipientEmail: userEmail, recipientId: null },
          ],
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      if (acceptedShares.length === 0) {
        return [];
      }

      // Get all events from all owners
      const ownerIds = acceptedShares.map((share) => share.ownerId);

      const events = await ctx.db.lunarEvent.findMany({
        where: {
          userId: { in: ownerIds },
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: [
          { lunarYear: "asc" },
          { lunarMonth: "asc" },
          { lunarDay: "asc" },
        ],
      });

      // Process events with date calculation
      const processedEvents = events.map((event) => {
        let gregorianDate: Date | null = null;
        let lunarDateFormatted = "";

        try {
          gregorianDate = lunarToGregorian(
            event.lunarYear,
            event.lunarMonth,
            event.lunarDay,
          );
          const lunarInfo = gregorianToLunar(gregorianDate);
          lunarDateFormatted = formatLunarDate(lunarInfo);
        } catch (error) {
          console.warn(`Error calculating dates for event ${event.id}:`, error);
          lunarDateFormatted = `Âm lịch năm ${event.lunarYear} tháng ${event.lunarMonth} ngày ${event.lunarDay}`;
        }

        return {
          ...event,
          gregorianDate,
          lunarDateFormatted,
          isShared: true,
          sharedBy: event.user,
        };
      });

      // Filter by date range if provided
      if (input.startDate || input.endDate) {
        const startDate = input.startDate || new Date(0);
        const endDate = input.endDate || new Date(9999, 11, 31);

        const filteredEvents = [];
        for (const event of processedEvents) {
          if (event.isRecurring) {
            // For recurring events, check if any occurrence falls in range
            const startYear = startDate.getFullYear();
            const endYear = endDate.getFullYear();

            for (let year = startYear - 1; year <= endYear; year++) {
              try {
                const gregorianDate = lunarToGregorian(
                  year,
                  event.lunarMonth,
                  event.lunarDay,
                );

                if (gregorianDate >= startDate && gregorianDate <= endDate) {
                  const lunarInfo = gregorianToLunar(gregorianDate);
                  filteredEvents.push({
                    ...event,
                    gregorianDate,
                    lunarDateFormatted: formatLunarDate(lunarInfo),
                    isRecurringInstance: year !== event.lunarYear,
                  });
                }
              } catch {
                // Skip invalid dates
                continue;
              }
            }
          } else if (event.gregorianDate) {
            if (
              event.gregorianDate >= startDate &&
              event.gregorianDate <= endDate
            ) {
              filteredEvents.push(event);
            }
          }
        }

        return filteredEvents;
      }

      return processedEvents;
    }),

  /**
   * Validate invitation token for signup flow (public)
   */
  validateInvitationToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const invitation = await ctx.db.eventShareInvitation.findUnique({
        where: { token: input.token },
        include: {
          eventShare: {
            include: {
              owner: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!invitation) {
        return { valid: false, error: "Mã mời không hợp lệ" };
      }

      if (invitation.expiresAt < new Date()) {
        return { valid: false, error: "Mã mời đã hết hạn" };
      }

      if (invitation.eventShare.status !== "PENDING") {
        return { valid: false, error: "Lời mời này đã được xử lý" };
      }

      const ownerName =
        invitation.eventShare.owner.name ||
        invitation.eventShare.owner.email ||
        "Someone";

      return {
        valid: true,
        email: invitation.email,
        ownerName,
        shareId: invitation.eventShare.id,
      };
    }),

  /**
   * Get shared events for calendar display (grouped by owner)
   */
  getSharedEventsForCalendar: protectedProcedure
    .input(
      z.object({
        year: z.number(),
        month: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userEmail = ctx.session.user.email?.toLowerCase();

      // Get all accepted shares
      const acceptedShares = await ctx.db.eventShare.findMany({
        where: {
          status: "ACCEPTED",
          OR: [
            { recipientId: userId },
            { recipientEmail: userEmail, recipientId: null },
          ],
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      if (acceptedShares.length === 0) {
        return [];
      }

      const ownerIds = acceptedShares.map((share) => share.ownerId);

      // Calculate date range for the month
      const startDate = new Date(input.year, input.month, 1);
      const endDate = new Date(input.year, input.month + 1, 0);

      // Get all events from owners
      const events = await ctx.db.lunarEvent.findMany({
        where: {
          userId: { in: ownerIds },
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      // Process events and filter by date range
      const eventsInRange: Array<{
        id: string;
        title: string;
        description: string | null;
        lunarYear: number;
        lunarMonth: number;
        lunarDay: number;
        isRecurring: boolean;
        reminderDays: number;
        eventType: string;
        ancestorName: string | null;
        ancestorPrecall: string | null;
        gregorianDate: Date;
        lunarDateFormatted: string;
        isShared: boolean;
        sharedBy: {
          id: string;
          name: string | null;
          email: string | null;
          image: string | null;
        };
        isRecurringInstance?: boolean;
      }> = [];

      for (const event of events) {
        try {
          if (event.isRecurring) {
            // For recurring events, check occurrences in range
            const startYear = startDate.getFullYear();
            const endYear = endDate.getFullYear();

            for (let year = startYear - 1; year <= endYear; year++) {
              try {
                const gregorianDate = lunarToGregorian(
                  year,
                  event.lunarMonth,
                  event.lunarDay,
                );

                if (gregorianDate >= startDate && gregorianDate <= endDate) {
                  const lunarInfo = gregorianToLunar(gregorianDate);
                  eventsInRange.push({
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    lunarYear: event.lunarYear,
                    lunarMonth: event.lunarMonth,
                    lunarDay: event.lunarDay,
                    isRecurring: event.isRecurring,
                    reminderDays: event.reminderDays,
                    eventType: event.eventType,
                    ancestorName: event.ancestorName,
                    ancestorPrecall: event.ancestorPrecall,
                    gregorianDate,
                    lunarDateFormatted: formatLunarDate(lunarInfo),
                    isShared: true,
                    sharedBy: event.user,
                    isRecurringInstance: year !== event.lunarYear,
                  });
                }
              } catch {
                // Skip invalid dates
                continue;
              }
            }
          } else {
            try {
              const gregorianDate = lunarToGregorian(
                event.lunarYear,
                event.lunarMonth,
                event.lunarDay,
              );

              if (gregorianDate >= startDate && gregorianDate <= endDate) {
                const lunarInfo = gregorianToLunar(gregorianDate);
                eventsInRange.push({
                  id: event.id,
                  title: event.title,
                  description: event.description,
                  lunarYear: event.lunarYear,
                  lunarMonth: event.lunarMonth,
                  lunarDay: event.lunarDay,
                  isRecurring: event.isRecurring,
                  reminderDays: event.reminderDays,
                  eventType: event.eventType,
                  ancestorName: event.ancestorName,
                  ancestorPrecall: event.ancestorPrecall,
                  gregorianDate,
                  lunarDateFormatted: formatLunarDate(lunarInfo),
                  isShared: true,
                  sharedBy: event.user,
                });
              }
            } catch {
              // Skip invalid dates
              continue;
            }
          }
        } catch (error) {
          console.warn(`Error processing shared event ${event.id}:`, error);
        }
      }

      return eventsInRange;
    }),
});
