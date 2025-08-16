"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { vietnameseText } from "@/lib/vietnamese-localization";

interface CalendarGridProps {
  className?: string;
  showEvents?: boolean;
}

export function CalendarGrid({
  className,
  showEvents = false,
}: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data, isLoading, error } =
    api.lunarCalendar.getVietnameseCalendarMonth.useQuery({
      year,
      month,
    });

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
          <CardTitle className="flex items-center gap-2 text-xl">
            {vietnameseText.months[month]} năm {year}
            {isLoading && (
              <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="default" size="sm" onClick={goToToday}>
              {vietnameseText.today}
            </Button>
          </div>
        </div>
        <div className="text-muted-foreground space-y-1 text-sm">
          <p>
            Âm lịch: {data.lunarMonthInfo?.vietnameseMonthName || "Đang tải..."}{" "}
            năm {data.lunarMonthInfo?.lunarYear || year}
          </p>
          <p>Năm: {zodiacYear || "Đang tải..."}</p>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week header */}
        <div className="mb-2 grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-muted-foreground flex h-8 items-center justify-center text-sm font-medium"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {data.days.map((day, index) => (
            <div
              key={`day-${day.gregorianDate.getTime()}-${index}`}
              className={cn(
                "min-h-20 rounded-lg border p-2 transition-colors",
                day.isCurrentMonth
                  ? "bg-background border-border"
                  : "bg-muted/30 border-muted text-muted-foreground",
                day.isToday && "ring-primary ring-2 ring-offset-2",
                day.isImportant &&
                  day.isCurrentMonth &&
                  "bg-accent/50 border-accent",
              )}
            >
              {/* Gregorian date */}
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "text-sm font-medium",
                    day.isToday && "text-primary font-bold",
                  )}
                >
                  {day.gregorianDate.getDate()}
                </span>
                {day.isImportant && (
                  <Badge variant="secondary" className="h-4 px-1 py-0 text-xs">
                    {day.lunarDate.day === 1 ? "M1" : "R"}
                  </Badge>
                )}
                {day.vietnameseHoliday && (
                  <Badge
                    variant="default"
                    className="h-4 bg-red-500 px-1 py-0 text-xs"
                    title={day.vietnameseHoliday}
                  >
                    Lễ
                  </Badge>
                )}
              </div>

              {/* Vietnamese Lunar date */}
              <div className="mt-1">
                <div className="text-muted-foreground text-xs">
                  {day.lunarDate.dayName}
                </div>
                {day.lunarDate.day === 1 && (
                  <div className="text-primary text-xs font-medium">
                    {day.lunarDate.monthName}
                  </div>
                )}
                {day.vietnameseHoliday && (
                  <div
                    className="truncate text-xs font-medium text-red-600"
                    title={day.vietnameseHoliday}
                  >
                    {day.vietnameseHoliday.length > 8
                      ? day.vietnameseHoliday.substring(0, 8) + "..."
                      : day.vietnameseHoliday}
                  </div>
                )}
              </div>

              {/* Personal Events (if enabled) */}
              {showEvents && day.events && day.events.length > 0 && (
                <div className="mt-2 space-y-1">
                  {day.events.slice(0, 2).map((event, eventIndex) => (
                    <div
                      key={`${index}-event-${eventIndex}`}
                      className="truncate rounded-md border border-blue-200 bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700"
                      title={event?.title || "Sự kiện cá nhân"}
                    >
                      📅 {event?.title || "Sự kiện"}
                    </div>
                  ))}
                  {day.events.length > 2 && (
                    <div className="text-xs font-medium text-blue-600">
                      +{day.events.length - 2} sự kiện khác
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="text-muted-foreground mt-4 flex items-center gap-4 border-t pt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="border-primary h-3 w-3 rounded border-2"></div>
            <span>{vietnameseText.today}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-accent/50 h-3 w-3 rounded"></div>
            <span>Ngày quan trọng (Mồng 1/Rằm)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-500"></div>
            <span>Lễ hội truyền thống</span>
          </div>
          {showEvents && (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border border-blue-200 bg-blue-100"></div>
              <span>Sự kiện âm lịch</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
