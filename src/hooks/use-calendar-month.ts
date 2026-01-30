"use client";

import { useMemo } from "react";
import {
  generateVietnameseCalendarMonth,
  getVietnameseCanChiYear,
  type VietnameseCalendarDay,
  type VietnameseCalendarMonth,
} from "@/lib/lunar-calendar";

interface UseCalendarMonthOptions {
  year: number;
  month: number;
}

interface UseCalendarMonthReturn {
  data: VietnameseCalendarMonth & {
    zodiacYear: string;
    vietnameseMonthName: string;
  };
  isLoading: false;
  error: null;
}

/**
 * Client-side hook to generate Vietnamese calendar month data
 * This eliminates API calls since lunar calendar calculations are deterministic
 */
export function useCalendarMonth({
  year,
  month,
}: UseCalendarMonthOptions): UseCalendarMonthReturn {
  const data = useMemo(() => {
    const calendarMonth = generateVietnameseCalendarMonth(year, month);
    const zodiacYear = getVietnameseCanChiYear(year);

    return {
      ...calendarMonth,
      zodiacYear,
      vietnameseMonthName: calendarMonth.lunarMonthInfo.vietnameseMonthName,
    };
  }, [year, month]);

  return {
    data,
    isLoading: false,
    error: null,
  };
}

/**
 * Type for calendar day with optional events
 */
export interface CalendarDayWithEvents extends Omit<
  VietnameseCalendarDay,
  "events"
> {
  events?: Array<{
    id: string;
    title: string;
    date: Date;
    eventType?: string;
    ancestorName?: string | null;
    ancestorPrecall?: string | null;
  }>;
}

/**
 * Merge user events into calendar days
 */
export function mergeEventsIntoCalendar(
  days: VietnameseCalendarDay[],
  events: Array<{
    id: string;
    title: string;
    date: Date;
    eventType?: string;
    ancestorName?: string | null;
    ancestorPrecall?: string | null;
  }>,
): CalendarDayWithEvents[] {
  return days.map((day) => {
    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === day.gregorianDate.toDateString();
    });

    return {
      ...day,
      events: dayEvents.length > 0 ? dayEvents : undefined,
    };
  });
}
