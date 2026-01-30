"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { vietnameseText } from "@/lib/vietnamese-localization";
import {
  generateVietnameseCalendarMonth,
  getVietnameseCanChiYear,
  lunarToGregorian,
  type VietnameseCalendarDay,
} from "@/lib/lunar-calendar";
import {
  DateDetailDialog,
  type CalendarDayFromAPI,
} from "./date-detail-dialog";

interface CalendarGridProps {
  className?: string;
  showEvents?: boolean;
  showSharedEvents?: boolean;
}

// Extended day type with events
interface CalendarDayWithEvents extends Omit<VietnameseCalendarDay, "events"> {
  events?: Array<{
    id: string;
    title: string;
    date: Date;
    eventType?: string;
    ancestorName?: string | null;
    ancestorPrecall?: string | null;
  }>;
}

export function CalendarGrid({
  className,
  showEvents = false,
  showSharedEvents = false,
}: CalendarGridProps) {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDayFromAPI | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Generate calendar client-side (no API call needed!)
  const calendarData = useMemo(() => {
    const calendarMonth = generateVietnameseCalendarMonth(year, month);
    const zodiacYear = getVietnameseCanChiYear(year);

    return {
      ...calendarMonth,
      zodiacYear,
      vietnameseMonthName: calendarMonth.lunarMonthInfo.vietnameseMonthName,
    };
  }, [year, month]);

  // Fetch user lunar events separately (only when needed)
  const { data: userEvents, isLoading: isLoadingEvents } =
    api.lunarEvents.getAll.useQuery(
      { includeInactive: false },
      {
        enabled: showEvents && !!session?.user,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      },
    );

  // Fetch shared events for the calendar (only when user is signed in)
  const { data: sharedEventsData } =
    api.eventSharing.getSharedEventsForCalendar.useQuery(
      { year, month },
      { enabled: showSharedEvents && !!session?.user },
    );

  // Convert lunar events to gregorian dates and merge with calendar days
  const daysWithEvents = useMemo(() => {
    if (!userEvents || userEvents.length === 0) {
      return calendarData.days.map((day) => ({
        ...day,
        events: undefined,
      })) as CalendarDayWithEvents[];
    }

    // Get start and end of the month to filter events
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Convert lunar events to gregorian dates and filter for this month
    const lunarEventsForMonth: Array<{
      id: string;
      title: string;
      date: Date;
      eventType?: string;
      ancestorName?: string | null;
      ancestorPrecall?: string | null;
    }> = [];

    for (const lunarEvent of userEvents) {
      try {
        if (lunarEvent.isRecurring) {
          // For recurring events, check both current year and previous year
          // because lunar months can span across Gregorian years
          const yearsToCheck = [year - 1, year, year + 1];

          for (const eventYear of yearsToCheck) {
            try {
              const gregorianDate = lunarToGregorian(
                eventYear,
                lunarEvent.lunarMonth,
                lunarEvent.lunarDay,
              );

              // Check if the event falls within the current month
              if (
                gregorianDate >= startOfMonth &&
                gregorianDate <= endOfMonth
              ) {
                // Avoid duplicates by checking if we already added this event for this date
                const existingEvent = lunarEventsForMonth.find(
                  (e) =>
                    e.id === lunarEvent.id &&
                    e.date.toDateString() === gregorianDate.toDateString(),
                );

                if (!existingEvent) {
                  lunarEventsForMonth.push({
                    id: lunarEvent.id,
                    title: lunarEvent.title,
                    date: gregorianDate,
                    eventType: lunarEvent.eventType,
                    ancestorName: lunarEvent.ancestorName,
                    ancestorPrecall: lunarEvent.ancestorPrecall,
                  });
                }
              }
            } catch {
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
          if (gregorianDate >= startOfMonth && gregorianDate <= endOfMonth) {
            lunarEventsForMonth.push({
              id: lunarEvent.id,
              title: lunarEvent.title,
              date: gregorianDate,
              eventType: lunarEvent.eventType,
              ancestorName: lunarEvent.ancestorName,
              ancestorPrecall: lunarEvent.ancestorPrecall,
            });
          }
        }
      } catch {
        // Skip invalid lunar dates
        continue;
      }
    }

    // Sort events by date
    lunarEventsForMonth.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Merge events into calendar days
    return calendarData.days.map((day) => {
      const dayEvents = lunarEventsForMonth.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === day.gregorianDate.toDateString();
      });

      return {
        ...day,
        events: dayEvents.length > 0 ? dayEvents : undefined,
      };
    });
  }, [calendarData.days, userEvents, year, month]);

  // Group shared events by date
  const sharedEventsByDate = useMemo(() => {
    const map = new Map<string, typeof sharedEventsData>();
    if (sharedEventsData) {
      for (const event of sharedEventsData) {
        const dateKey = event.gregorianDate.toISOString().split("T")[0];
        if (!map.has(dateKey!)) {
          map.set(dateKey!, []);
        }
        map.get(dateKey!)!.push(event);
      }
    }
    return map;
  }, [sharedEventsData]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(new Date(year, month + (direction === "next" ? 1 : -1), 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: CalendarDayWithEvents) => {
    // Convert to the format expected by DateDetailDialog
    const dialogDay: CalendarDayFromAPI = {
      gregorianDate: day.gregorianDate,
      lunarDate: day.lunarDate,
      isToday: day.isToday,
      isCurrentMonth: day.isCurrentMonth,
      isImportant: day.isImportant,
      events: day.events,
      vietnameseHoliday: day.vietnameseHoliday,
    };
    setSelectedDay(dialogDay);
    setIsDialogOpen(true);
  };

  const handleDayKeyDown = (
    e: React.KeyboardEvent,
    day: CalendarDayWithEvents,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleDayClick(day);
    }
  };

  const { zodiacYear } = calendarData;
  const weekDays = vietnameseText.weekdaysShort;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <span className="hidden sm:inline">
              {vietnameseText.months[month]} năm {year}
            </span>
            <span className="sm:hidden">
              {vietnameseText.months[month]} {year}
            </span>
            {isLoadingEvents && (
              <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
            )}
          </CardTitle>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("prev")}
              className="p-1.5 sm:px-3"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("next")}
              className="p-1.5 sm:px-3"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={goToToday}
              className="hidden sm:inline-flex"
            >
              {vietnameseText.today}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={goToToday}
              className="p-1.5 px-2 text-xs sm:hidden"
            >
              Hôm nay
            </Button>
          </div>
        </div>
        <div className="text-muted-foreground space-y-1 text-xs sm:text-sm">
          <p className="truncate">
            Âm lịch:{" "}
            {calendarData.lunarMonthInfo?.vietnameseMonthName || "Đang tải..."}{" "}
            năm {calendarData.lunarMonthInfo?.lunarYear || year}
          </p>
          <p className="truncate">Năm: {zodiacYear || "Đang tải..."}</p>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week header */}
        <div className="mb-1 grid grid-cols-7 gap-1 sm:mb-2 sm:gap-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-muted-foreground flex h-6 items-center justify-center text-xs font-medium sm:h-8 sm:text-sm"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {daysWithEvents.map((day, index) => (
            <div
              key={`day-${day.gregorianDate.getTime()}-${index}`}
              role="button"
              tabIndex={0}
              onClick={() => handleDayClick(day)}
              onKeyDown={(e) => handleDayKeyDown(e, day)}
              className={cn(
                "min-h-12 cursor-pointer rounded-md border p-1 transition-colors sm:min-h-20 sm:rounded-lg sm:p-2",
                "hover:bg-muted/50 hover:ring-primary/20 hover:ring-1",
                "focus:ring-primary focus:ring-2 focus:ring-offset-1 focus:outline-none",
                day.isCurrentMonth
                  ? "bg-background border-border"
                  : "bg-muted/30 border-muted text-muted-foreground",
                day.isToday &&
                  "ring-primary ring-1 ring-offset-1 sm:ring-2 sm:ring-offset-2",
                day.isImportant &&
                  day.isCurrentMonth &&
                  (day.importantDayType === "ram15"
                    ? "border-purple-400 bg-purple-50"
                    : "border-amber-400 bg-amber-50"),
              )}
            >
              {/* Gregorian date */}
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "text-xs font-medium sm:text-sm",
                    day.isToday && "text-primary font-bold",
                  )}
                >
                  {day.gregorianDate.getDate()}
                </span>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-1">
                  {day.isImportant && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "h-3 px-0.5 py-0 text-[10px] sm:h-4 sm:px-1 sm:text-xs",
                        day.importantDayType === "ram15"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-amber-100 text-amber-700",
                      )}
                    >
                      {day.lunarDate.day === 1 ? "M1" : "R"}
                    </Badge>
                  )}
                  {day.vietnameseHoliday && (
                    <Badge
                      variant="default"
                      className="h-3 bg-red-500 px-0.5 py-0 text-[10px] sm:h-4 sm:px-1 sm:text-xs"
                      title={day.vietnameseHoliday}
                    >
                      Lễ
                    </Badge>
                  )}
                </div>
              </div>

              {/* Vietnamese Lunar date */}
              <div className="mt-0.5 sm:mt-1">
                <div className="text-muted-foreground text-[10px] sm:text-xs">
                  {day.lunarDate.dayName}
                </div>
                {day.lunarDate.day === 1 && (
                  <div className="text-primary text-[10px] font-medium sm:text-xs">
                    {day.lunarDate.monthName}
                  </div>
                )}
                {day.vietnameseHoliday && (
                  <div
                    className="truncate text-[10px] font-medium text-red-600 sm:text-xs"
                    title={day.vietnameseHoliday}
                  >
                    <span className="sm:hidden">
                      {day.vietnameseHoliday.length > 6
                        ? day.vietnameseHoliday.substring(0, 6) + "..."
                        : day.vietnameseHoliday}
                    </span>
                    <span className="hidden sm:inline">
                      {day.vietnameseHoliday.length > 8
                        ? day.vietnameseHoliday.substring(0, 8) + "..."
                        : day.vietnameseHoliday}
                    </span>
                  </div>
                )}
              </div>

              {/* Personal Events (if enabled) */}
              {showEvents && day.events && day.events.length > 0 && (
                <div className="mt-1 space-y-0.5 sm:mt-2 sm:space-y-1">
                  {day.events.slice(0, 1).map((event, eventIndex) => (
                    <div
                      key={`${index}-event-${eventIndex}`}
                      className="truncate rounded border border-blue-200 bg-blue-100 px-1 py-0.5 text-[10px] text-blue-700 sm:text-xs"
                      title={event?.title || "Sự kiện cá nhân"}
                    >
                      {event?.title || "Sự kiện"}
                    </div>
                  ))}
                  {day.events.length > 1 && (
                    <div className="text-[10px] font-medium text-blue-600 sm:text-xs">
                      +{day.events.length - 1}
                    </div>
                  )}
                </div>
              )}

              {/* Shared Events (if enabled) */}
              {showSharedEvents &&
                (() => {
                  const dateKey = day.gregorianDate.toISOString().split("T")[0];
                  const daySharedEvents =
                    sharedEventsByDate.get(dateKey!) || [];
                  if (daySharedEvents.length === 0) return null;
                  return (
                    <div className="mt-1 space-y-0.5 sm:mt-2 sm:space-y-1">
                      {daySharedEvents.slice(0, 1).map((event, eventIndex) => (
                        <div
                          key={`${index}-shared-${eventIndex}`}
                          className="truncate rounded border border-purple-200 bg-purple-100 px-1 py-0.5 text-[10px] text-purple-700 sm:text-xs"
                          title={`${event.title} (${event.sharedBy?.name || event.sharedBy?.email})`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {daySharedEvents.length > 1 && (
                        <div className="text-[10px] font-medium text-purple-600 sm:text-xs">
                          +{daySharedEvents.length - 1}
                        </div>
                      )}
                    </div>
                  );
                })()}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="text-muted-foreground mt-3 border-t pt-3 text-[10px] sm:mt-4 sm:pt-4 sm:text-xs">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="border-primary h-2 w-2 rounded border-2 sm:h-3 sm:w-3"></div>
              <span className="truncate">{vietnameseText.today}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="h-2 w-2 rounded border border-amber-400 bg-amber-50 sm:h-3 sm:w-3"></div>
              <span className="truncate">Ngày quan trọng</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="h-2 w-2 rounded bg-red-500 sm:h-3 sm:w-3"></div>
              <span className="truncate">Lễ hội</span>
            </div>
            {showEvents && (
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="h-2 w-2 rounded border border-blue-200 bg-blue-100 sm:h-3 sm:w-3"></div>
                <span className="truncate">Sự kiện</span>
              </div>
            )}
            {showSharedEvents && (
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="h-2 w-2 rounded border border-purple-200 bg-purple-100 sm:h-3 sm:w-3"></div>
                <span className="truncate">Được chia sẻ</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Date Detail Dialog */}
      <DateDetailDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        day={selectedDay}
      />
    </Card>
  );
}
