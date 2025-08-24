import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { lunarToGregorian } from "@/lib/lunar-calendar";

/**
 * Generate iCalendar (ICS) format content
 */
function generateICalendarContent(
  events: Array<{
    id: string;
    title: string;
    description?: string | null;
    date: Date;
    eventType: "lunar" | "personal";
  }>,
): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, "").split(".")[0]! + "Z";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Vietnamese Lunar Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  events.forEach((event) => {
    // Use local date to avoid timezone conversion issues
    const year = event.date.getFullYear();
    const month = String(event.date.getMonth() + 1).padStart(2, "0");
    const day = String(event.date.getDate()).padStart(2, "0");
    const startDate = `${year}${month}${day}`;
    const eventId = `${event.id}@vietnamese-lunar-calendar.local`;

    ics.push(
      "BEGIN:VEVENT",
      `UID:${eventId}`,
      `DTSTART;VALUE=DATE:${startDate}`,
      `DTEND;VALUE=DATE:${startDate}`,
      `DTSTAMP:${timestamp}`,
      `SUMMARY:${event.title}`,
      event.description ? `DESCRIPTION:${event.description}` : "",
      `CATEGORIES:${event.eventType === "lunar" ? "Vietnamese Lunar Calendar" : "Personal Event"}`,
      "END:VEVENT",
    );
  });

  ics.push("END:VCALENDAR");

  return ics.filter((line) => line !== "").join("\r\n");
}

export const calendarExportRouter = createTRPCRouter({
  /**
   * Export calendar events for a specific year
   */
  exportYear: protectedProcedure
    .input(
      z.object({
        year: z.number().min(1900).max(2100).default(new Date().getFullYear()),
        includeLunarEvents: z.boolean().default(true),
        includePersonalEvents: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const events: Array<{
        id: string;
        title: string;
        description?: string | null;
        date: Date;
        eventType: "lunar" | "personal";
      }> = [];

      // Get lunar calendar events (important dates like Mồng 1, Rằm)
      if (input.includeLunarEvents) {
        // Add traditional Vietnamese lunar calendar important dates
        for (let month = 1; month <= 12; month++) {
          try {
            // Mồng 1 (1st day) - New Moon
            const mong1Date = lunarToGregorian(input.year, month, 1);
            if (mong1Date.getFullYear() === input.year) {
              events.push({
                id: `lunar-mong1-${input.year}-${month}`,
                title: `Mồng 1 tháng ${month} âm lịch`,
                description: `Ngày đầu tháng âm lịch - Mồng một tháng ${month} năm ${input.year}`,
                date: mong1Date,
                eventType: "lunar",
              });
            }

            // Rằm (15th day) - Full Moon
            const ramDate = lunarToGregorian(input.year, month, 15);
            if (ramDate.getFullYear() === input.year) {
              events.push({
                id: `lunar-ram-${input.year}-${month}`,
                title: `Rằm tháng ${month} âm lịch`,
                description: `Ngày rằm tháng âm lịch - Rằm tháng ${month} năm ${input.year}`,
                date: ramDate,
                eventType: "lunar",
              });
            }
          } catch {
            // Skip invalid dates
            continue;
          }
        }
      }

      // Get personal events from both tables
      if (input.includePersonalEvents) {
        // Get events from LunarEvent table
        const lunarEvents = await ctx.db.lunarEvent.findMany({
          where: {
            userId,
            isActive: true,
          },
        });

        // Get events from VietnameseLunarEvent table
        const vietnameseLunarEvents =
          await ctx.db.vietnameseLunarEvent.findMany({
            where: {
              userId,
              isActive: true,
            },
          });

        // Process LunarEvent entries
        for (const event of lunarEvents) {
          try {
            if (event.isRecurring) {
              // For recurring events, add instance for the specified year
              const gregorianDate = lunarToGregorian(
                input.year,
                event.lunarMonth,
                event.lunarDay,
              );

              if (gregorianDate.getFullYear() === input.year) {
                events.push({
                  id: `lunar-event-${event.id}-${input.year}`,
                  title: event.title,
                  description: event.description,
                  date: gregorianDate,
                  eventType: "personal",
                });
              }
            } else {
              // For non-recurring events, only add if it's for the specified year
              if (event.lunarYear === input.year) {
                const gregorianDate = lunarToGregorian(
                  event.lunarYear,
                  event.lunarMonth,
                  event.lunarDay,
                );

                events.push({
                  id: `lunar-event-${event.id}`,
                  title: event.title,
                  description: event.description,
                  date: gregorianDate,
                  eventType: "personal",
                });
              }
            }
          } catch {
            // Skip invalid dates
            continue;
          }
        }

        // Process VietnameseLunarEvent entries
        for (const event of vietnameseLunarEvents) {
          try {
            if (event.isRecurring) {
              // For recurring events, add instance for the specified year
              const gregorianDate = lunarToGregorian(
                input.year,
                event.lunarMonth,
                event.lunarDay,
              );

              if (gregorianDate.getFullYear() === input.year) {
                events.push({
                  id: `vietnamese-event-${event.id}-${input.year}`,
                  title: event.title,
                  description: event.description,
                  date: gregorianDate,
                  eventType: "personal",
                });
              }
            } else {
              // For non-recurring events, only add if it's for the specified year
              if (event.lunarYear === input.year) {
                const gregorianDate = lunarToGregorian(
                  event.lunarYear,
                  event.lunarMonth,
                  event.lunarDay,
                );

                events.push({
                  id: `vietnamese-event-${event.id}`,
                  title: event.title,
                  description: event.description,
                  date: gregorianDate,
                  eventType: "personal",
                });
              }
            }
          } catch {
            // Skip invalid dates
            continue;
          }
        }
      }

      // Sort events by date
      events.sort((a, b) => a.date.getTime() - b.date.getTime());

      // Generate ICS content
      const icsContent = generateICalendarContent(events);

      return {
        filename: `vietnamese-calendar-${input.year}.ics`,
        content: icsContent,
        eventCount: events.length,
        year: input.year,
      };
    }),
});
