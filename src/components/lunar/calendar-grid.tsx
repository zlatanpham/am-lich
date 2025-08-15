"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { vietnameseText, formatVietnameseDate, getVietnameseMonth, getVietnameseWeekday } from "@/lib/vietnamese-localization";

interface CalendarGridProps {
  className?: string;
  showEvents?: boolean;
}

export function CalendarGrid({ className, showEvents = false }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data, isLoading, error } = api.lunarCalendar.getVietnameseCalendarMonth.useQuery({
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1));
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
          <CardTitle className="text-xl flex items-center gap-2">
            {vietnameseText.months[month]} năm {year}
            {isLoading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={goToToday}
            >
              {vietnameseText.today}
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Âm lịch: {data.lunarMonthInfo?.vietnameseMonthName || 'Đang tải...'} năm {data.lunarMonthInfo?.lunarYear || year}</p>
          <p>Năm: {zodiacYear || 'Đang tải...'}</p>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground"
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
                "min-h-20 p-2 rounded-lg border transition-colors",
                day.isCurrentMonth
                  ? "bg-background border-border"
                  : "bg-muted/30 border-muted text-muted-foreground",
                day.isToday && "ring-2 ring-primary ring-offset-2",
                day.isImportant && day.isCurrentMonth && "bg-accent/50 border-accent"
              )}
            >
              {/* Gregorian date */}
              <div className="flex items-start justify-between">
                <span className={cn(
                  "text-sm font-medium",
                  day.isToday && "text-primary font-bold"
                )}>
                  {day.gregorianDate.getDate()}
                </span>
                {day.isImportant && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-1 py-0 h-4"
                  >
                    {day.lunarDate.day === 1 ? "M1" : "R"}
                  </Badge>
                )}
                {day.vietnameseHoliday && (
                  <Badge
                    variant="default"
                    className="text-xs px-1 py-0 h-4 bg-red-500"
                    title={day.vietnameseHoliday}
                  >
                    Lễ
                  </Badge>
                )}
              </div>

              {/* Vietnamese Lunar date */}
              <div className="mt-1">
                <div className="text-xs text-muted-foreground">
                  {day.lunarDate.dayName}
                </div>
                {day.lunarDate.day === 1 && (
                  <div className="text-xs font-medium text-primary">
                    {day.lunarDate.monthName}
                  </div>
                )}
                {day.vietnameseHoliday && (
                  <div className="text-xs font-medium text-red-600 truncate" title={day.vietnameseHoliday}>
                    {day.vietnameseHoliday.length > 8 ? day.vietnameseHoliday.substring(0, 8) + '...' : day.vietnameseHoliday}
                  </div>
                )}
              </div>

              {/* Personal Events (if enabled) */}
              {showEvents && day.events && day.events.length > 0 && (
                <div className="mt-2 space-y-1">
                  {day.events.slice(0, 2).map((event, eventIndex) => (
                    <div
                      key={`${index}-event-${eventIndex}`}
                      className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-md truncate border border-blue-200"
                      title={event?.title || 'Sự kiện cá nhân'}
                    >
                      📅 {event?.title || 'Sự kiện'}
                    </div>
                  ))}
                  {day.events.length > 2 && (
                    <div className="text-xs text-blue-600 font-medium">
                      +{day.events.length - 2} sự kiện khác
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-primary"></div>
            <span>{vietnameseText.today}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-accent/50"></div>
            <span>Ngày quan trọng (Mồng 1/Rằm)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span>Lễ hội truyền thống</span>
          </div>
          {showEvents && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
              <span>Sự kiện âm lịch</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}