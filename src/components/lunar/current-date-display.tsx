"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { vietnameseText } from "@/lib/vietnamese-localization";
import { useSession } from "next-auth/react";
import { Calendar, Flower, Share2, Sparkles } from "lucide-react";
import {
  DateDetailDialog,
  type CalendarDayFromAPI,
} from "./date-detail-dialog";
import { gregorianToLunar } from "@/lib/lunar-calendar";

export function CurrentDateDisplay() {
  const { data: session } = useSession();
  const [selectedDay, setSelectedDay] = useState<CalendarDayFromAPI | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading, error } =
    api.lunarCalendar.getCurrentVietnameseLunarDate.useQuery();

  // Get today's date range for fetching events
  const todayDateRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, []);

  // Fetch today's personal events
  const { data: todaysEvents } = api.lunarEvents.getByDateRange.useQuery(
    {
      startDate: todayDateRange.start,
      endDate: todayDateRange.end,
    },
    {
      enabled: !!session?.user,
    },
  );

  // Fetch today's shared events
  const { data: todaysSharedEvents } =
    api.eventSharing.getSharedEvents.useQuery(
      {
        startDate: todayDateRange.start,
        endDate: todayDateRange.end,
      },
      {
        enabled: !!session?.user,
      },
    );

  // Combine personal and shared events for today
  const allTodaysEvents = useMemo(() => {
    const personal = (todaysEvents || []).map((event) => ({
      ...event,
      isShared: false as const,
      sharedByName: null as string | null,
    }));

    const shared = (todaysSharedEvents || [])
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
  }, [todaysEvents, todaysSharedEvents]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{vietnameseText.currentLunarDate}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{vietnameseText.currentLunarDate}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Lỗi khi tải thông tin âm lịch</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const {
    lunarDate,
    formattedDate,
    culturalAssessment,
    zodiacYear,
    vietnameseDate,
  } = data;

  const handleEventClick = (event: (typeof allTodaysEvents)[number]) => {
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
      isToday: true,
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
          {vietnameseText.currentLunarDate}
          {(lunarDate.day === 1 || lunarDate.day === 15) && (
            <Badge variant="secondary">
              {lunarDate.day === 1 ? vietnameseText.mong1 : vietnameseText.ram}
            </Badge>
          )}
          {culturalAssessment && (
            <Badge
              variant={
                culturalAssessment.type === "auspicious"
                  ? "default"
                  : culturalAssessment.type === "inauspicious"
                    ? "destructive"
                    : "secondary"
              }
              className="text-xs"
            >
              {culturalAssessment.type === "auspicious"
                ? "Ngày tốt"
                : culturalAssessment.type === "inauspicious"
                  ? "Ngày xấu"
                  : "Bình thường"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-primary text-2xl font-bold">{formattedDate}</h3>
          <p className="text-muted-foreground">{vietnameseDate}</p>
          {lunarDate.culturalSignificance && (
            <p className="mt-1 text-sm text-blue-600">
              {lunarDate.culturalSignificance}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Pha trăng:</span>
            <p className="font-medium">{lunarDate.lunarPhase}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Năm:</span>
            <p className="font-medium">{zodiacYear}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-muted-foreground text-xs">
            <p>
              Can Chi: {lunarDate.zodiacYear} năm {lunarDate.zodiacMonth} tháng{" "}
              {lunarDate.zodiacDay} ngày
            </p>
          </div>

          {culturalAssessment && (
            <div className="border-t pt-2">
              <h4 className="mb-1 text-sm font-medium">
                {culturalAssessment.title}
              </h4>
              <p className="text-muted-foreground text-xs">
                {culturalAssessment.description}
              </p>
            </div>
          )}

          {/* Today's Events Section */}
          {allTodaysEvents.length > 0 && (
            <div className="pt-2">
              <div className="space-y-2">
                {allTodaysEvents.map((event) => {
                  const isShared = event.isShared;
                  const eventType = (event as { eventType?: string }).eventType;
                  const isAncestorWorship = eventType === "ancestor_worship";

                  // Get icon based on event type
                  const getEventIcon = () => {
                    if (isShared) {
                      return (
                        <Share2 className="h-3 w-3 text-pink-600 sm:h-3.5 sm:w-3.5" />
                      );
                    }
                    if (isAncestorWorship) {
                      return (
                        <Flower className="h-3 w-3 text-blue-600 sm:h-3.5 sm:w-3.5" />
                      );
                    }
                    // Default personal event icon
                    return (
                      <Calendar className="h-3 w-3 text-blue-600 sm:h-3.5 sm:w-3.5" />
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
                      className="group bg-card flex cursor-pointer items-center gap-2 rounded-lg border p-1.5 transition-all hover:border-slate-200 sm:gap-2 sm:p-2"
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
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full sm:h-7 sm:w-7 ${getIconBgColor()}`}
                      >
                        {getEventIcon()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-900 sm:text-sm">
                          {event.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <DateDetailDialog
        day={selectedDay}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </Card>
  );
}
