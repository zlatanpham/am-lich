"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { api } from "@/trpc/react";
import {
  Calendar,
  Clock,
  Sparkles,
  Moon,
  Share2,
  Flower,
  PartyPopper,
  Star,
} from "lucide-react";
import { vietnameseText } from "@/lib/vietnamese-localization";
import { useSession } from "next-auth/react";
import {
  DateDetailDialog,
  type CalendarDayFromAPI,
} from "./date-detail-dialog";
import {
  gregorianToLunar,
  getNextImportantVietnameseLunarDate,
  daysUntilVietnam,
  getVietnameseCulturalSignificanceText,
  type VietnameseLunarDate,
} from "@/lib/lunar-calendar";
import { formatVietnameseDate } from "@/lib/vietnamese-localization";

export function UpcomingImportantDates() {
  const { data: session } = useSession();
  const [selectedDay, setSelectedDay] = useState<CalendarDayFromAPI | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Calculate next important dates client-side - no loading needed!
  const importantDates = useMemo(() => {
    const nextDates = getNextImportantVietnameseLunarDate();

    const mong1Data = {
      type: "mong1" as const,
      date: nextDates.mong1,
      daysUntil: daysUntilVietnam(nextDates.mong1),
      lunarInfo: nextDates.mong1Info,
      formattedDate: formatVietnameseDate(nextDates.mong1),
      culturalSignificance: getVietnameseCulturalSignificanceText(1),
    };

    const ramData = {
      type: "ram" as const,
      date: nextDates.ram,
      daysUntil: daysUntilVietnam(nextDates.ram),
      lunarInfo: nextDates.ramInfo,
      formattedDate: formatVietnameseDate(nextDates.ram),
      culturalSignificance: getVietnameseCulturalSignificanceText(15),
    };

    // Sort by date (earliest first)
    const sortedDates = [mong1Data, ramData].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );

    return {
      dates: sortedDates,
      nextMong1: mong1Data,
      nextRam: ramData,
    };
  }, []);
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

  // Use the sorted dates array calculated client-side
  const sortedDates = importantDates.dates;

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

  const handleEventClick = (event: (typeof allUpcomingEvents)[number]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.gregorianDate);
    eventDate.setHours(0, 0, 0, 0);

    const lunarInfo = gregorianToLunar(eventDate);

    // Build the events array for the dialog
    const eventForDialog = event.isShared
      ? undefined // Shared events are fetched by the dialog itself
      : [
          {
            id: event.id,
            title: event.title,
            date: eventDate,
            eventType: (event as { eventType?: string }).eventType,
            ancestorName: (event as { ancestorName?: string | null })
              .ancestorName,
            ancestorPrecall: (event as { ancestorPrecall?: string | null })
              .ancestorPrecall,
          },
        ];

    setSelectedDay({
      gregorianDate: eventDate,
      lunarDate: lunarInfo,
      isToday: eventDate.getTime() === today.getTime(),
      isCurrentMonth: true,
      isImportant: lunarInfo.day === 1 || lunarInfo.day === 15,
      events: eventForDialog,
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
      <CardContent className="space-y-5">
        {/* Section: Upcoming Events */}
        {allUpcomingEvents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Sự kiện sắp tới</span>
            </div>
            <div className="space-y-2">
              {allUpcomingEvents.slice(0, 5).map((event) => {
                const daysUntil = Math.ceil(
                  (new Date(event.gregorianDate).getTime() -
                    new Date().getTime()) /
                    (1000 * 60 * 60 * 24),
                );
                const isShared = event.isShared;
                const eventType = (event as { eventType?: string }).eventType;
                const isAncestorWorship = eventType === "ancestor_worship";

                // Get icon based on event type
                const getEventIcon = () => {
                  if (isShared) {
                    return (
                      <Share2 className="h-3.5 w-3.5 text-pink-600 sm:h-4 sm:w-4" />
                    );
                  }
                  if (isAncestorWorship) {
                    return (
                      <Flower className="h-3.5 w-3.5 text-blue-600 sm:h-4 sm:w-4" />
                    );
                  }
                  // Default personal event icon
                  return (
                    <PartyPopper className="h-3.5 w-3.5 text-blue-600 sm:h-4 sm:w-4" />
                  );
                };

                // Get background color based on event type
                const getIconBgColor = () => {
                  if (isShared) return "bg-pink-100";
                  return "bg-blue-100";
                };

                return (
                  <div
                    key={`${isShared ? "shared" : "personal"}-${event.id}`}
                    className="group flex cursor-pointer items-center justify-between rounded-lg border bg-white p-2 transition-all hover:border-slate-200 sm:p-3"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleEventClick(event)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleEventClick(event);
                      }
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${getIconBgColor()}`}
                      >
                        {getEventIcon()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 sm:text-base">
                          {event.title}
                        </p>
                        <p className="text-xs text-slate-500 sm:text-sm">
                          {event.lunarDateFormatted}
                          {isShared && event.sharedByName && (
                            <span className="ml-1 text-pink-600">
                              · từ {event.sharedByName}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 sm:gap-1.5 sm:px-2.5 sm:py-1">
                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span>
                        {daysUntil === 0
                          ? "Hôm nay"
                          : daysUntil === 1
                            ? "Ngày mai"
                            : `${daysUntil} ngày`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section: Important Lunar Dates */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Moon className="h-4 w-4 text-indigo-500" />
            <span>Ngày âm lịch quan trọng</span>
          </div>
          <div className="space-y-2">
            {sortedDates.map((lunarDate: (typeof sortedDates)[number]) => {
              const isRam = lunarDate.type === "ram";
              return (
                <div
                  key={lunarDate.type}
                  className={`group flex cursor-pointer items-center justify-between rounded-lg border bg-white p-2 transition-all sm:p-3 ${
                    isRam ? "hover:border-purple-200" : "hover:border-amber-200"
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    handleDateClick(lunarDate.date, lunarDate.lunarInfo)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleDateClick(lunarDate.date, lunarDate.lunarInfo);
                    }
                  }}
                >
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${
                        isRam ? "bg-purple-100" : "bg-amber-100"
                      }`}
                    >
                      {lunarDate.type === "mong1" ? (
                        <Star
                          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                            isRam ? "text-purple-600" : "text-amber-600"
                          }`}
                        />
                      ) : (
                        <Moon
                          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                            isRam ? "text-purple-600" : "text-amber-600"
                          }`}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 sm:text-base">
                        {lunarDate.type === "mong1" ? "Mồng 1" : "Rằm"}{" "}
                        {lunarDate.lunarInfo.monthName}
                      </p>
                      <p className="text-xs text-slate-500 sm:text-sm">
                        {lunarDate.formattedDate}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium sm:gap-1.5 sm:px-2.5 sm:py-1 ${
                      isRam
                        ? "bg-purple-50 text-purple-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span>
                      {lunarDate.daysUntil === 0
                        ? vietnameseText.today
                        : lunarDate.daysUntil === 1
                          ? vietnameseText.tomorrow
                          : `${lunarDate.daysUntil} ngày`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-xs text-slate-600">
            <span className="font-medium text-amber-700">Mồng 1</span> là ngày
            trăng non, <span className="font-medium text-amber-700">Rằm</span>{" "}
            là ngày trăng tròn
          </p>
          <p className="mt-1 text-xs text-slate-500">
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
