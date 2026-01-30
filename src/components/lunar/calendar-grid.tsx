"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { vietnameseText } from "@/lib/vietnamese-localization";
import {
  DateDetailDialog,
  type CalendarDayFromAPI,
} from "./date-detail-dialog";

interface CalendarGridProps {
  className?: string;
  showEvents?: boolean;
  showSharedEvents?: boolean;
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

  const { data, isLoading, error } =
    api.lunarCalendar.getVietnameseCalendarMonth.useQuery({
      year,
      month,
    });

  // Fetch shared events for the calendar (only when user is signed in)
  const { data: sharedEventsData } =
    api.eventSharing.getSharedEventsForCalendar.useQuery(
      { year, month },
      { enabled: showSharedEvents && !!session?.user },
    );

  // Group shared events by date
  const sharedEventsByDate = new Map<string, typeof sharedEventsData>();
  if (sharedEventsData) {
    for (const event of sharedEventsData) {
      const dateKey = event.gregorianDate.toISOString().split("T")[0];
      if (!sharedEventsByDate.has(dateKey!)) {
        sharedEventsByDate.set(dateKey!, []);
      }
      sharedEventsByDate.get(dateKey!)!.push(event);
    }
  }

  // Prefetch adjacent months for smooth navigation
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  api.lunarCalendar.getVietnameseCalendarMonth.useQuery({
    year: prevYear,
    month: prevMonth,
  });

  api.lunarCalendar.getVietnameseCalendarMonth.useQuery({
    year: nextYear,
    month: nextMonth,
  });

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(new Date(year, month + (direction === "next" ? 1 : -1), 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: CalendarDayFromAPI) => {
    setSelectedDay(day);
    setIsDialogOpen(true);
  };

  const handleDayKeyDown = (
    e: React.KeyboardEvent,
    day: CalendarDayFromAPI,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleDayClick(day);
    }
  };

  if (isLoading && !data) {
    // Only show full skeleton on initial load, not on navigation
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-16 w-16" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 42 }, (_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{vietnameseText.lunarCalendar}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Lỗi khi tải lịch âm</p>
        </CardContent>
      </Card>
    );
  }

  if (!data?.days || !data.lunarMonthInfo) return null;

  const { zodiacYear } = data;
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
            {isLoading && (
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
            Âm lịch: {data.lunarMonthInfo?.vietnameseMonthName || "Đang tải..."}{" "}
            năm {data.lunarMonthInfo?.lunarYear || year}
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
          {data.days.map((day, index) => (
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
                  "border-amber-400 bg-amber-50",
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
                      className="h-3 px-0.5 py-0 text-[10px] sm:h-4 sm:px-1 sm:text-xs"
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
