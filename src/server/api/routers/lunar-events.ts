import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  lunarToGregorian,
  gregorianToLunar,
  isValidLunarDate,
  formatLunarDate,
} from "@/lib/lunar-calendar";

export const lunarEventsRouter = createTRPCRouter({
  /**
   * Create a new lunar event
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z
          .string()
          .min(1, "Title is required")
          .max(255, "Title too long"),
        description: z.string().optional(),
        lunarYear: z.number().min(1900).max(2100),
        lunarMonth: z.number().min(1).max(12),
        lunarDay: z.number().min(1).max(30),
        isRecurring: z.boolean().default(false),
        reminderDays: z.number().min(1).max(30).default(3),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Validate lunar date
      if (
        !isValidLunarDate(input.lunarYear, input.lunarMonth, input.lunarDay)
      ) {
        throw new Error("Invalid lunar date");
      }

      const event = await ctx.db.lunarEvent.create({
        data: {
          userId,
          title: input.title,
          description: input.description,
          lunarYear: input.lunarYear,
          lunarMonth: input.lunarMonth,
          lunarDay: input.lunarDay,
          isRecurring: input.isRecurring,
          reminderDays: input.reminderDays,
        },
      });

      return event;
    }),

  /**
   * Update an existing lunar event
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z
          .string()
          .min(1, "Title is required")
          .max(255, "Title too long")
          .optional(),
        description: z.string().optional(),
        lunarYear: z.number().min(1900).max(2100).optional(),
        lunarMonth: z.number().min(1).max(12).optional(),
        lunarDay: z.number().min(1).max(30).optional(),
        isRecurring: z.boolean().optional(),
        reminderDays: z.number().min(1).max(30).optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ...updateData } = input;

      // Check if event exists and belongs to user
      const existingEvent = await ctx.db.lunarEvent.findFirst({
        where: { id, userId },
      });

      if (!existingEvent) {
        throw new Error("Event not found or access denied");
      }

      // If lunar date is being updated, validate it
      const lunarYear = updateData.lunarYear ?? existingEvent.lunarYear;
      const lunarMonth = updateData.lunarMonth ?? existingEvent.lunarMonth;
      const lunarDay = updateData.lunarDay ?? existingEvent.lunarDay;

      if (
        updateData.lunarYear ||
        updateData.lunarMonth ||
        updateData.lunarDay
      ) {
        if (!isValidLunarDate(lunarYear, lunarMonth, lunarDay)) {
          throw new Error("Invalid lunar date");
        }
      }

      const updatedEvent = await ctx.db.lunarEvent.update({
        where: { id },
        data: updateData,
      });

      return updatedEvent;
    }),

  /**
   * Delete a lunar event
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if event exists and belongs to user
      const existingEvent = await ctx.db.lunarEvent.findFirst({
        where: { id: input.id, userId },
      });

      if (!existingEvent) {
        throw new Error("Event not found or access denied");
      }

      await ctx.db.lunarEvent.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Get all events for the current user
   */
  getAll: protectedProcedure
    .input(
      z.object({
        includeInactive: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const events = await ctx.db.lunarEvent.findMany({
        where: {
          userId,
          isActive: input.includeInactive ? undefined : true,
        },
        orderBy: [
          { lunarYear: "asc" },
          { lunarMonth: "asc" },
          { lunarDay: "asc" },
        ],
      });

      return events.map((event) => ({
        ...event,
        lunarDateFormatted: formatLunarDate({
          year: event.lunarYear,
          month: event.lunarMonth,
          day: event.lunarDay,
          monthName: "", // Will be filled by formatLunarDate
          dayName: "", // Will be filled by formatLunarDate
          isLeapMonth: false, // TODO: Add leap month support to database
          lunarPhase: "",
          zodiacYear: "",
          zodiacMonth: "",
          zodiacDay: "",
          vietnameseAnimal: "", // Will be filled by formatLunarDate
        }),
      }));
    }),

  /**
   * Get events for a specific lunar month/year
   */
  getByLunarMonth: protectedProcedure
    .input(
      z.object({
        lunarYear: z.number().min(1900).max(2100),
        lunarMonth: z.number().min(1).max(12).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const whereClause = {
        userId,
        isActive: true,
        lunarYear: input.lunarYear,
        ...(input.lunarMonth && { lunarMonth: input.lunarMonth }),
      };

      const events = await ctx.db.lunarEvent.findMany({
        where: whereClause,
        orderBy: [{ lunarMonth: "asc" }, { lunarDay: "asc" }],
      });

      return events;
    }),

  /**
   * Get events for a specific date range (Gregorian)
   */
  getByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        includeRecurring: z.boolean().default(true),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const allUserEvents = await ctx.db.lunarEvent.findMany({
        where: {
          userId,
          isActive: true,
        },
      });

      const eventsInRange: Array<{
        id: string;
        title: string;
        description: string | null;
        lunarYear: number;
        lunarMonth: number;
        lunarDay: number;
        isRecurring: boolean;
        reminderDays: number;
        gregorianDate: Date;
        lunarDateFormatted: string;
        isRecurringInstance?: boolean;
      }> = [];

      for (const event of allUserEvents) {
        try {
          if (event.isRecurring && input.includeRecurring) {
            // For recurring events, calculate occurrences in the date range
            const startYear = input.startDate.getFullYear();
            const endYear = input.endDate.getFullYear();

            for (let year = startYear; year <= endYear; year++) {
              try {
                const gregorianDate = lunarToGregorian(
                  year,
                  event.lunarMonth,
                  event.lunarDay,
                );

                if (
                  gregorianDate >= input.startDate &&
                  gregorianDate <= input.endDate
                ) {
                  const lunarInfo = gregorianToLunar(gregorianDate);

                  eventsInRange.push({
                    ...event,
                    gregorianDate,
                    lunarDateFormatted: formatLunarDate(lunarInfo),
                    isRecurringInstance: year !== event.lunarYear,
                  });
                }
              } catch {
                // Skip invalid dates for this year
                continue;
              }
            }
          } else {
            // For non-recurring events, just check the specific date
            try {
              const gregorianDate = lunarToGregorian(
                event.lunarYear,
                event.lunarMonth,
                event.lunarDay,
              );

              if (
                gregorianDate >= input.startDate &&
                gregorianDate <= input.endDate
              ) {
                const lunarInfo = gregorianToLunar(gregorianDate);

                eventsInRange.push({
                  ...event,
                  gregorianDate,
                  lunarDateFormatted: formatLunarDate(lunarInfo),
                });
              }
            } catch {
              // Skip invalid dates
              continue;
            }
          }
        } catch (error) {
          console.warn(`Error processing event ${event.id}:`, error);
        }
      }

      // Sort by Gregorian date
      eventsInRange.sort(
        (a, b) => a.gregorianDate.getTime() - b.gregorianDate.getTime(),
      );

      return eventsInRange;
    }),

  /**
   * Get upcoming events (next 30 days by default)
   */
  getUpcoming: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + input.days);

      // Reuse the logic from getByDateRange
      const allUserEvents = await ctx.db.lunarEvent.findMany({
        where: {
          userId,
          isActive: true,
        },
      });

      const eventsInRange: Array<{
        id: string;
        title: string;
        description: string | null;
        lunarYear: number;
        lunarMonth: number;
        lunarDay: number;
        isRecurring: boolean;
        reminderDays: number;
        gregorianDate: Date;
        lunarDateFormatted: string;
        isRecurringInstance?: boolean;
      }> = [];

      for (const event of allUserEvents) {
        try {
          if (event.isRecurring) {
            // For recurring events, calculate occurrences in the date range
            const startYear = startDate.getFullYear();
            const endYear = endDate.getFullYear();

            for (let year = startYear; year <= endYear; year++) {
              try {
                const gregorianDate = lunarToGregorian(
                  year,
                  event.lunarMonth,
                  event.lunarDay,
                );

                if (gregorianDate >= startDate && gregorianDate <= endDate) {
                  const lunarInfo = gregorianToLunar(gregorianDate);

                  eventsInRange.push({
                    ...event,
                    gregorianDate,
                    lunarDateFormatted: formatLunarDate(lunarInfo),
                    isRecurringInstance: year !== event.lunarYear,
                  });
                }
              } catch {
                // Skip invalid dates for this year
                continue;
              }
            }
          } else {
            // For non-recurring events, just check the specific date
            try {
              const gregorianDate = lunarToGregorian(
                event.lunarYear,
                event.lunarMonth,
                event.lunarDay,
              );

              if (gregorianDate >= startDate && gregorianDate <= endDate) {
                const lunarInfo = gregorianToLunar(gregorianDate);

                eventsInRange.push({
                  ...event,
                  gregorianDate,
                  lunarDateFormatted: formatLunarDate(lunarInfo),
                });
              }
            } catch {
              // Skip invalid dates
              continue;
            }
          }
        } catch (error) {
          console.warn(`Error processing event ${event.id}:`, error);
        }
      }

      // Sort by Gregorian date
      eventsInRange.sort(
        (a, b) => a.gregorianDate.getTime() - b.gregorianDate.getTime(),
      );

      return eventsInRange;
    }),

  /**
   * Get a single event by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const event = await ctx.db.lunarEvent.findFirst({
        where: { id: input.id, userId },
      });

      if (!event) {
        throw new Error("Event not found or access denied");
      }

      // Calculate Gregorian date for this event
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
      }

      return {
        ...event,
        gregorianDate,
        lunarDateFormatted,
      };
    }),
});
