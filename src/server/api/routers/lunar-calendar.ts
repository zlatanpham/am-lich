import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import {
  gregorianToLunar,
  lunarToGregorian,
  getCurrentLunarDate,
  getCurrentVietnameseLunarDate,
  getNextImportantLunarDate,
  getNextImportantVietnameseLunarDate,
  generateCalendarMonth,
  generateVietnameseCalendarMonth,
  daysUntil,
  daysUntilVietnam,
  formatLunarDate,
  formatVietnameseLunarDate,
  isValidLunarDate,
  isValidVietnameseLunarDate,
  getLunarMonthLength,
  getVietnameseLunarMonthLength,
  getTodayVietnameseLunarInfo,
  getVietnameseCulturalSignificanceText,
  getVietnameseCanChiYear,
  type LunarDate,
  type VietnameseLunarDate,
  type VietnameseCalendarMonth,
} from "@/lib/lunar-calendar";
import {
  vietnameseText,
  formatVietnameseDate,
  getVietnamTime,
  getVietnameseDayAssessment,
} from "@/lib/vietnamese-localization";

export const lunarCalendarRouter = createTRPCRouter({
  /**
   * Get current Vietnamese lunar date information
   */
  getCurrentVietnameseLunarDate: publicProcedure.query(() => {
    const info = getTodayVietnameseLunarInfo();
    const culturalAssessment = getVietnameseDayAssessment(info.lunarDate.day);
    const zodiacYear = getVietnameseCanChiYear(info.lunarDate.year);

    return {
      lunarDate: info.lunarDate,
      formattedDate: info.formattedDate,
      nextImportantDates: info.nextImportantDates,
      daysToMong1: info.daysToMong1,
      daysToRam: info.daysToRam,
      culturalSignificance: info.lunarDate.culturalSignificance,
      culturalAssessment,
      zodiacYear,
      vietnameseDate: formatVietnameseDate(getVietnamTime()),
    };
  }),

  /**
   * Get current lunar date information (legacy)
   */
  getCurrentLunarDate: publicProcedure.query(() => {
    const lunarDate = getCurrentLunarDate();
    return {
      lunarDate,
      formattedDate: formatLunarDate(lunarDate),
      formattedDateWithZodiac: formatLunarDate(lunarDate, true),
    };
  }),

  /**
   * Convert Gregorian date to lunar date
   */
  gregorianToLunar: publicProcedure
    .input(
      z.object({
        year: z.number().min(1900).max(2100),
        month: z.number().min(1).max(12),
        day: z.number().min(1).max(31),
      }),
    )
    .query(({ input }) => {
      const date = new Date(input.year, input.month - 1, input.day);
      const lunarDate = gregorianToLunar(date);
      return {
        lunarDate,
        formattedDate: formatLunarDate(lunarDate),
        formattedDateWithZodiac: formatLunarDate(lunarDate, true),
      };
    }),

  /**
   * Convert lunar date to Gregorian date
   */
  lunarToGregorian: publicProcedure
    .input(
      z.object({
        lunarYear: z.number().min(1900).max(2100),
        lunarMonth: z.number().min(1).max(12),
        lunarDay: z.number().min(1).max(30),
        isLeapMonth: z.boolean().optional().default(false),
      }),
    )
    .query(({ input }) => {
      if (
        !isValidLunarDate(
          input.lunarYear,
          input.lunarMonth,
          input.lunarDay,
          input.isLeapMonth,
        )
      ) {
        throw new Error("Invalid lunar date");
      }

      const gregorianDate = lunarToGregorian(
        input.lunarYear,
        input.lunarMonth,
        input.lunarDay,
        input.isLeapMonth,
      );

      return {
        gregorianDate,
        year: gregorianDate.getFullYear(),
        month: gregorianDate.getMonth() + 1,
        day: gregorianDate.getDate(),
      };
    }),

  /**
   * Get next important lunar dates (1st and 15th)
   */
  getNextImportantDates: publicProcedure.query(() => {
    const nextDates = getNextImportantLunarDate();

    return {
      nextFirst: {
        date: nextDates.first,
        daysUntil: daysUntil(nextDates.first),
        lunarInfo: gregorianToLunar(nextDates.first),
      },
      nextFifteenth: {
        date: nextDates.fifteenth,
        daysUntil: daysUntil(nextDates.fifteenth),
        lunarInfo: gregorianToLunar(nextDates.fifteenth),
      },
    };
  }),

  /**
   * Generate calendar month with lunar information
   */
  getCalendarMonth: publicProcedure
    .input(
      z.object({
        year: z.number().min(1900).max(2100),
        month: z.number().min(0).max(11), // 0-based month for JavaScript Date
      }),
    )
    .query(({ input }) => {
      const calendarMonth = generateCalendarMonth(input.year, input.month);
      return calendarMonth;
    }),

  /**
   * Validate a lunar date
   */
  validateLunarDate: publicProcedure
    .input(
      z.object({
        lunarYear: z.number().min(1900).max(2100),
        lunarMonth: z.number().min(1).max(12),
        lunarDay: z.number().min(1).max(30),
        isLeapMonth: z.boolean().optional().default(false),
      }),
    )
    .query(({ input }) => {
      const isValid = isValidLunarDate(
        input.lunarYear,
        input.lunarMonth,
        input.lunarDay,
        input.isLeapMonth,
      );

      return {
        isValid,
        monthLength: isValid
          ? getLunarMonthLength(
              input.lunarYear,
              input.lunarMonth,
              input.isLeapMonth,
            )
          : null,
      };
    }),

  /**
   * Get lunar month information
   */
  getLunarMonthInfo: publicProcedure
    .input(
      z.object({
        lunarYear: z.number().min(1900).max(2100),
        lunarMonth: z.number().min(1).max(12),
        isLeapMonth: z.boolean().optional().default(false),
      }),
    )
    .query(({ input }) => {
      const monthLength = getLunarMonthLength(
        input.lunarYear,
        input.lunarMonth,
        input.isLeapMonth,
      );

      // Get first and last day of lunar month in Gregorian calendar
      const firstDay = lunarToGregorian(
        input.lunarYear,
        input.lunarMonth,
        1,
        input.isLeapMonth,
      );
      const lastDay = lunarToGregorian(
        input.lunarYear,
        input.lunarMonth,
        monthLength,
        input.isLeapMonth,
      );

      return {
        monthLength,
        firstDay,
        lastDay,
        lunarYear: input.lunarYear,
        lunarMonth: input.lunarMonth,
        isLeapMonth: input.isLeapMonth,
      };
    }),

  /**
   * Get important lunar dates for a given year
   */
  getImportantDatesForYear: publicProcedure
    .input(
      z.object({
        year: z.number().min(1900).max(2100),
      }),
    )
    .query(({ input }) => {
      const importantDates: Array<{
        date: Date;
        lunarDate: LunarDate;
        type: "first" | "fifteenth";
        description: string;
      }> = [];

      // Get all 1st and 15th days for the year
      for (let month = 1; month <= 12; month++) {
        try {
          // Get 1st day of each lunar month
          const firstDayLunar = {
            year: input.year,
            month,
            day: 1,
            isLeapMonth: false,
          };
          const firstDayGregorian = lunarToGregorian(input.year, month, 1);
          const firstDayLunarInfo = gregorianToLunar(firstDayGregorian);

          importantDates.push({
            date: firstDayGregorian,
            lunarDate: firstDayLunarInfo,
            type: "first",
            description: `${formatLunarDate(firstDayLunarInfo)} (trăng mới)`,
          });

          // Get 15th day of each lunar month
          const fifteenthDayGregorian = lunarToGregorian(input.year, month, 15);
          const fifteenthDayLunarInfo = gregorianToLunar(fifteenthDayGregorian);

          importantDates.push({
            date: fifteenthDayGregorian,
            lunarDate: fifteenthDayLunarInfo,
            type: "fifteenth",
            description: `${formatLunarDate(fifteenthDayLunarInfo)} (trăng tròn)`,
          });
        } catch (error) {
          // Skip invalid dates
          console.warn(
            `Skipping lunar month ${month} for year ${input.year}:`,
            error,
          );
        }
      }

      // Sort by Gregorian date
      importantDates.sort((a, b) => a.date.getTime() - b.date.getTime());

      return importantDates;
    }),

  /**
   * Get next important Vietnamese lunar dates (Mồng 1 and Rằm)
   */
  getNextImportantVietnameseDates: publicProcedure.query(() => {
    const nextDates = getNextImportantVietnameseLunarDate();

    return {
      nextMong1: {
        date: nextDates.mong1,
        daysUntil: daysUntilVietnam(nextDates.mong1),
        lunarInfo: nextDates.mong1Info,
        formattedDate: formatVietnameseDate(nextDates.mong1),
        culturalSignificance: getVietnameseCulturalSignificanceText(1),
      },
      nextRam: {
        date: nextDates.ram,
        daysUntil: daysUntilVietnam(nextDates.ram),
        lunarInfo: nextDates.ramInfo,
        formattedDate: formatVietnameseDate(nextDates.ram),
        culturalSignificance: getVietnameseCulturalSignificanceText(15),
      },
    };
  }),

  /**
   * Generate Vietnamese calendar month with lunar information
   */
  getVietnameseCalendarMonth: publicProcedure
    .input(
      z.object({
        year: z.number().min(1900).max(2100),
        month: z.number().min(0).max(11), // 0-based month for JavaScript Date
      }),
    )
    .query(async ({ input, ctx }) => {
      const calendarMonth = generateVietnameseCalendarMonth(
        input.year,
        input.month,
      );

      // If user is authenticated, fetch their events for this month
      let userEvents: Array<{ id: string; title: string; date: Date }> = [];
      if (ctx.session?.user?.id) {
        // Get start and end of the month to filter events
        const startOfMonth = new Date(input.year, input.month, 1);
        const endOfMonth = new Date(
          input.year,
          input.month + 1,
          0,
          23,
          59,
          59,
          999,
        );

        // Fetch lunar calendar events
        const lunarEvents = await ctx.db.lunarEvent.findMany({
          where: {
            userId: ctx.session.user.id,
            isActive: true,
          },
          select: {
            id: true,
            title: true,
            lunarYear: true,
            lunarMonth: true,
            lunarDay: true,
            isRecurring: true,
          },
        });

        // Convert lunar events to gregorian dates and filter for this month
        const lunarEventsForMonth: Array<{
          id: string;
          title: string;
          date: Date;
        }> = [];

        for (const lunarEvent of lunarEvents) {
          try {
            if (lunarEvent.isRecurring) {
              // For recurring events, check both the original year and current year
              const years = [lunarEvent.lunarYear, input.year];
              for (const year of years) {
                try {
                  const gregorianDate = lunarToGregorian(
                    year,
                    lunarEvent.lunarMonth,
                    lunarEvent.lunarDay,
                  );

                  // Check if the event falls within the current month
                  if (
                    gregorianDate >= startOfMonth &&
                    gregorianDate <= endOfMonth
                  ) {
                    lunarEventsForMonth.push({
                      id: lunarEvent.id,
                      title: lunarEvent.title,
                      date: gregorianDate,
                    });
                  }
                } catch (error) {
                  // Skip invalid dates for this year
                  continue;
                }
              }
            } else {
              // For non-recurring events, only check the specific year
              const gregorianDate = lunarToGregorian(
                lunarEvent.lunarYear,
                lunarEvent.lunarMonth,
                lunarEvent.lunarDay,
              );

              // Check if the event falls within the current month
              if (
                gregorianDate >= startOfMonth &&
                gregorianDate <= endOfMonth
              ) {
                lunarEventsForMonth.push({
                  id: lunarEvent.id,
                  title: lunarEvent.title,
                  date: gregorianDate,
                });
              }
            }
          } catch (error) {
            // Skip invalid lunar dates
            continue;
          }
        }

        // Use only lunar events
        userEvents = lunarEventsForMonth;

        // Sort events by date
        userEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
      }

      // Add user events to the appropriate days
      const enhancedDays = calendarMonth.days.map((day) => {
        const dayEvents = userEvents.filter((event) => {
          const eventDate = new Date(event.date);
          return eventDate.toDateString() === day.gregorianDate.toDateString();
        });

        return {
          ...day,
          events: dayEvents.length > 0 ? dayEvents : undefined,
        };
      });

      return {
        ...calendarMonth,
        days: enhancedDays,
        vietnameseMonthName: vietnameseText.months[input.month],
        zodiacYear: getVietnameseCanChiYear(input.year),
      };
    }),

  /**
   * Get Vietnamese cultural assessment for a specific date
   */
  getVietnameseCulturalAssessment: publicProcedure
    .input(
      z.object({
        year: z.number().min(1900).max(2100),
        month: z.number().min(1).max(12),
        day: z.number().min(1).max(31),
      }),
    )
    .query(({ input }) => {
      const date = new Date(input.year, input.month - 1, input.day);
      const lunarDate = gregorianToLunar(date);
      const assessment = getVietnameseDayAssessment(lunarDate.day);
      const zodiacYear = getVietnameseCanChiYear(lunarDate.year);

      return {
        lunarDate,
        assessment,
        zodiacYear,
        culturalSignificance: lunarDate.culturalSignificance,
        formattedLunarDate: formatVietnameseLunarDate(lunarDate),
        formattedGregorianDate: formatVietnameseDate(date),
      };
    }),

  /**
   * Get Vietnamese zodiac information for a year
   */
  getVietnameseZodiacInfo: publicProcedure
    .input(
      z.object({
        year: z.number().min(1900).max(2100),
      }),
    )
    .query(({ input }) => {
      const zodiacYear = getVietnameseCanChiYear(input.year);
      const lunarDate = gregorianToLunar(new Date(input.year, 0, 1));

      return {
        year: input.year,
        zodiacYear,
        vietnameseAnimal: lunarDate.vietnameseAnimal,
        canChi: zodiacYear,
        description: `Năm ${zodiacYear} - ${lunarDate.vietnameseAnimal}`,
      };
    }),
});
