"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { Calendar, Clock } from "lucide-react";
import { vietnameseText } from "@/lib/vietnamese-localization";
import { useSession } from "next-auth/react";
import {
  DateDetailDialog,
  type CalendarDayFromAPI,
} from "./date-detail-dialog";
import type { VietnameseLunarDate } from "@/lib/lunar-calendar";

export function UpcomingImportantDates() {
  const { data: session } = useSession();
  const [selectedDay, setSelectedDay] = useState<CalendarDayFromAPI | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading, error } =
    api.lunarCalendar.getNextImportantVietnameseDates.useQuery();
  const { data: upcomingEvents } = api.lunarEvents.getUpcoming.useQuery(
    {
      days: 30,
    },
    {
      enabled: !!session?.user,
    },
  );
  const thirtyDaysFromNow = useMemo(() => {
    const now = new Date();
    const future = new Date(now);
    future.setDate(future.getDate() + 30);
    return { start: now, end: future };
  }, []);

  const { data: upcomingSharedEvents } =
    api.eventSharing.getSharedEvents.useQuery(
      {
        startDate: thirtyDaysFromNow.start,
        endDate: thirtyDaysFromNow.end,
      },
      {
        enabled: !!session?.user,
      },
    );

  // Combine personal and shared events, sorted by date
  const allUpcomingEvents = useMemo(() => {
    const personal = (upcomingEvents || []).map((event) => ({
      ...event,
      isShared: false as const,
      sharedByName: null as string | null,
    }));

    const shared = (upcomingSharedEvents || [])
      .filter((event) => event.gregorianDate !== null)
      .map((event) => ({
        ...event,
        gregorianDate: event.gregorianDate!,
        isShared: true as const,
        sharedByName: event.sharedBy.name || event.sharedBy.email || null,
      }));

    return [...personal, ...shared].sort((a, b) => {
      const dateA = a.gregorianDate ? new Date(a.gregorianDate).getTime() : 0;
      const dateB = b.gregorianDate ? new Date(b.gregorianDate).getTime() : 0;
      return dateA - dateB;
    });
  }, [upcomingEvents, upcomingSharedEvents]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{vietnameseText.nextImportantDates}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{vietnameseText.nextImportantDates}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Lỗi khi tải ngày quan trọng</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { nextMong1, nextRam } = data;

  const handleDateClick = (
    date: Date,
    lunarInfo: VietnameseLunarDate,
    vietnameseHoliday?: string,
  ) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);

    setSelectedDay({
      gregorianDate: date,
      lunarDate: lunarInfo,
      isToday: clickedDate.getTime() === today.getTime(),
      isCurrentMonth: true,
      isImportant: lunarInfo.day === 1 || lunarInfo.day === 15,
      vietnameseHoliday,
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {vietnameseText.nextImportantDates}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upcoming Custom Events (Personal + Shared) */}
        {allUpcomingEvents.length > 0 && (
          <div className="space-y-3">
            {allUpcomingEvents.slice(0, 5).map((event) => {
              const daysUntil = Math.ceil(
                (new Date(event.gregorianDate).getTime() -
                  new Date().getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              const isShared = event.isShared;
              return (
                <div
                  key={`${isShared ? "shared" : "personal"}-${event.id}`}
                  className={`flex items-center justify-between rounded-lg p-3 ${
                    isShared ? "bg-purple-50" : "bg-blue-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-shrink-0 gap-1">
                      <Badge
                        variant="outline"
                        className={
                          isShared
                            ? "border-purple-300 bg-purple-100 text-purple-800"
                            : "border-blue-300 bg-blue-100 text-blue-800"
                        }
                      >
                        {isShared ? "Chia sẻ" : "Sự kiện"}
                      </Badge>
                    </div>
                    <div>
                      <p
                        className={`font-medium ${isShared ? "text-purple-900" : "text-blue-900"}`}
                      >
                        {event.title}
                      </p>
                      <p
                        className={`text-sm ${isShared ? "text-purple-600" : "text-blue-600"}`}
                      >
                        {event.lunarDateFormatted}
                        {isShared && event.sharedByName && (
                          <span className="ml-1 text-purple-500">
                            · từ {event.sharedByName}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${isShared ? "text-purple-700" : "text-blue-700"}`}
                  >
                    <Clock className="h-4 w-4" />
                    <span>
                      {daysUntil === 0
                        ? "Hôm nay"
                        : daysUntil === 1
                          ? "Ngày mai"
                          : `còn ${daysUntil} ngày`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Next Mồng 1 */}
        <div
          className="hover:bg-muted bg-muted/50 cursor-pointer rounded-lg p-3 transition-colors"
          role="button"
          tabIndex={0}
          onClick={() => handleDateClick(nextMong1.date, nextMong1.lunarInfo)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleDateClick(nextMong1.date, nextMong1.lunarInfo);
            }
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              <Badge
                variant="outline"
                className="mt-0.5 shrink-0 border-blue-200 bg-blue-50 text-blue-700"
              >
                {vietnameseText.mong1}
              </Badge>
              <div className="min-w-0">
                <p className="leading-tight font-medium">
                  {nextMong1.lunarInfo.monthName}
                </p>
                <p className="text-muted-foreground text-sm">
                  {nextMong1.formattedDate}
                </p>
              </div>
            </div>
            <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-sm">
              <Clock className="h-4 w-4" />
              <span>
                {nextMong1.daysUntil === 0
                  ? vietnameseText.today
                  : nextMong1.daysUntil === 1
                    ? vietnameseText.tomorrow
                    : `${nextMong1.daysUntil} ngày`}
              </span>
            </div>
          </div>
        </div>

        {/* Next Rằm */}
        <div
          className="hover:bg-muted bg-muted/50 cursor-pointer rounded-lg p-3 transition-colors"
          role="button"
          tabIndex={0}
          onClick={() => handleDateClick(nextRam.date, nextRam.lunarInfo)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleDateClick(nextRam.date, nextRam.lunarInfo);
            }
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              <Badge
                variant="outline"
                className="mt-0.5 shrink-0 border-orange-200 bg-orange-50 text-orange-700"
              >
                {vietnameseText.ram}
              </Badge>
              <div className="min-w-0">
                <p className="leading-tight font-medium">
                  {nextRam.lunarInfo.monthName}
                </p>
                <p className="text-muted-foreground text-sm">
                  {nextRam.formattedDate}
                </p>
              </div>
            </div>
            <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-sm">
              <Clock className="h-4 w-4" />
              <span>
                {nextRam.daysUntil === 0
                  ? vietnameseText.today
                  : nextRam.daysUntil === 1
                    ? vietnameseText.tomorrow
                    : `${nextRam.daysUntil} ngày`}
              </span>
            </div>
          </div>
        </div>

        <div className="text-muted-foreground space-y-1 border-t pt-2 text-center text-xs">
          <p>Mồng 1 là ngày trăng non, Rằm là ngày trăng tròn</p>
          <p className="text-blue-600">
            Cả hai ngày đều quan trọng trong văn hóa Việt Nam
          </p>
        </div>
      </CardContent>

      <DateDetailDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        day={selectedDay}
      />
    </Card>
  );
}
