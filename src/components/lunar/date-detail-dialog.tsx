"use client";

import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Moon,
  Star,
  Sparkles,
  CalendarDays,
  Flower2,
  ScrollText,
  Users,
} from "lucide-react";
import { formatVietnameseDate } from "@/lib/vietnamese-localization";
import { LoginDialog } from "@/components/login-dialog";
import type { VietnameseLunarDate } from "@/lib/lunar-calendar";
import { useState, useMemo } from "react";
import { PrayerPreviewDialog } from "@/components/prayers/prayer-preview-dialog";
import { api } from "@/trpc/react";

// Type for the calendar day from API (events can be undefined or simplified array)
export interface CalendarDayFromAPI {
  gregorianDate: Date;
  lunarDate: VietnameseLunarDate;
  isToday: boolean;
  isCurrentMonth: boolean;
  isImportant: boolean;
  events?: Array<{
    id: string;
    title: string;
    date: Date;
    eventType?: string;
    ancestorName?: string | null;
    ancestorPrecall?: string | null;
  }>;
  vietnameseHoliday?: string;
}

interface DateDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: CalendarDayFromAPI | null;
}

export function DateDetailDialog({
  open,
  onOpenChange,
  day,
}: DateDetailDialogProps) {
  const { data: session } = useSession();
  const [prayerEvent, setPrayerEvent] = useState<{
    type: "mong1" | "ram15" | "ancestor";
    ancestorName?: string | null;
    ancestorPrecall?: string | null;
    ownerUserId?: string;
  } | null>(null);

  // Check if this is an important lunar date (1st or 15th)
  const isImportantLunarDay =
    day?.lunarDate.day === 1 || day?.lunarDate.day === 15;
  const prayerTypeForDay = day?.lunarDate.day === 1 ? "mong1" : "ram15";

  // Fetch shared events for the month containing this day
  const year = day?.gregorianDate.getFullYear() ?? new Date().getFullYear();
  const month = day?.gregorianDate.getMonth() ?? new Date().getMonth();

  const { data: sharedEventsData } =
    api.eventSharing.getSharedEventsForCalendar.useQuery(
      { year, month },
      { enabled: !!session?.user && !!day },
    );

  // Filter shared events for this specific day
  const sharedEventsForDay = useMemo(() => {
    if (!sharedEventsData || !day) return [];
    const dateKey = day.gregorianDate.toISOString().split("T")[0];
    return sharedEventsData.filter(
      (event) => event.gregorianDate.toISOString().split("T")[0] === dateKey,
    );
  }, [sharedEventsData, day]);

  if (!day) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {formatVietnameseDate(day.gregorianDate, "full")}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>
              {day.lunarDate.dayName} {day.lunarDate.monthName} năm{" "}
              {day.lunarDate.year}
            </span>
            {day.lunarDate.isLeapMonth && (
              <Badge variant="outline" className="text-xs">
                Tháng nhuận
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Holiday Section */}
          {day.vietnameseHoliday && (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
              <Sparkles className="h-5 w-5 flex-shrink-0 text-red-500" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">
                  {day.vietnameseHoliday}
                </p>
                <p className="text-sm text-red-600 dark:text-red-500">
                  Ngày lễ truyền thống
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Lunar Date Details & Can Chi - 2 Columns */}
          <div className="grid grid-cols-2 gap-6">
            {/* Lunar Date Details */}
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-medium">
                <Moon className="h-4 w-4" />
                Thông tin âm lịch
              </h4>
              <div className="space-y-1.5 text-sm">
                <div>
                  <span className="text-muted-foreground">Ngày: </span>
                  <span className="font-medium">{day.lunarDate.dayName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tháng: </span>
                  <span className="font-medium">{day.lunarDate.monthName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Năm: </span>
                  <span className="font-medium">{day.lunarDate.year}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Pha trăng: </span>
                  <span className="font-medium">
                    {day.lunarDate.lunarPhase}
                  </span>
                </div>
              </div>
            </div>

            {/* Zodiac/Can Chi Section */}
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-medium">
                <Star className="h-4 w-4" />
                Can Chi
              </h4>
              <div className="space-y-1.5 text-sm">
                <div>
                  <span className="text-muted-foreground">Năm: </span>
                  <span className="font-medium">
                    {day.lunarDate.zodiacYear}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tháng: </span>
                  <span className="font-medium">
                    {day.lunarDate.zodiacMonth}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày: </span>
                  <span className="font-medium">{day.lunarDate.zodiacDay}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Con giáp: </span>
                  <span className="font-medium">
                    {day.lunarDate.vietnameseAnimal}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cultural Significance */}
          {day.lunarDate.culturalSignificance && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-amber-800 dark:text-amber-400">
                      Ý nghĩa văn hóa
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-500">
                      {day.lunarDate.culturalSignificance}
                    </p>
                  </div>
                  {session?.user && isImportantLunarDay && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1.5 border-amber-300 px-2 text-xs text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-300"
                      onClick={() =>
                        setPrayerEvent({
                          type: prayerTypeForDay,
                        })
                      }
                    >
                      <ScrollText className="h-3.5 w-3.5" />
                      Xem sớ
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Events Section */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-medium">
              <CalendarDays className="h-4 w-4" />
              Sự kiện của bạn
            </h4>

            {session?.user ? (
              day.events && day.events.length > 0 ? (
                <div className="space-y-2">
                  {day.events.map((event) => {
                    const isAncestorWorship =
                      event.eventType === "ancestor_worship";
                    const displayTitle =
                      isAncestorWorship &&
                      event.ancestorPrecall &&
                      event.ancestorName
                        ? `Giỗ ${event.ancestorPrecall} ${event.ancestorName}`
                        : event.title;

                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2 dark:border-blue-900 dark:bg-blue-950"
                      >
                        {isAncestorWorship ? (
                          <Flower2 className="h-4 w-4 flex-shrink-0 text-blue-500" />
                        ) : (
                          <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                        )}
                        <span className="flex-1 text-sm font-medium text-blue-700 dark:text-blue-400">
                          {displayTitle}
                        </span>
                        {isAncestorWorship && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 gap-1 border-blue-300 px-2 text-xs text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900 dark:hover:text-blue-300"
                            onClick={() =>
                              setPrayerEvent({
                                type: "ancestor",
                                ancestorName: event.ancestorName,
                                ancestorPrecall: event.ancestorPrecall,
                              })
                            }
                          >
                            <ScrollText className="h-3 w-3" />
                            Xem sớ
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Không có sự kiện nào trong ngày này.
                </p>
              )
            ) : (
              <div className="bg-muted/50 rounded-lg py-4 text-center">
                <p className="text-muted-foreground mb-3 text-sm">
                  Đăng nhập để xem sự kiện cá nhân
                </p>
                <LoginDialog>
                  <Button variant="outline" size="sm">
                    Đăng nhập
                  </Button>
                </LoginDialog>
              </div>
            )}
          </div>

          {/* Shared Events Section */}
          {session?.user && sharedEventsForDay.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-medium">
                  <Users className="h-4 w-4" />
                  Sự kiện được chia sẻ
                </h4>
                <div className="space-y-2">
                  {sharedEventsForDay.map((event) => {
                    const sharerName =
                      event.sharedBy?.name || event.sharedBy?.email || "Ai đó";
                    const initials =
                      sharerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "?";
                    const isAncestorWorship =
                      event.eventType === "ancestor_worship";
                    const displayTitle =
                      isAncestorWorship &&
                      event.ancestorPrecall &&
                      event.ancestorName
                        ? `Giỗ ${event.ancestorPrecall} ${event.ancestorName}`
                        : event.title;

                    return (
                      <div
                        key={`shared-${event.id}`}
                        className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 p-2 dark:border-purple-900 dark:bg-purple-950"
                      >
                        {isAncestorWorship ? (
                          <Flower2 className="h-4 w-4 flex-shrink-0 text-purple-500" />
                        ) : (
                          <div className="h-2 w-2 flex-shrink-0 rounded-full bg-purple-500" />
                        )}
                        <span className="flex-1 text-sm font-medium text-purple-700 dark:text-purple-400">
                          {displayTitle}
                        </span>
                        <div
                          className="flex items-center gap-1"
                          title={sharerName}
                        >
                          <Avatar className="h-5 w-5">
                            <AvatarImage
                              src={event.sharedBy?.image || undefined}
                            />
                            <AvatarFallback className="text-[10px]">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground hidden text-xs sm:inline">
                            {sharerName}
                          </span>
                        </div>
                        {isAncestorWorship && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 gap-1 border-purple-300 px-2 text-xs text-purple-600 hover:bg-purple-100 hover:text-purple-700 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900 dark:hover:text-purple-300"
                            onClick={() =>
                              setPrayerEvent({
                                type: "ancestor",
                                ancestorName: event.ancestorName,
                                ancestorPrecall: event.ancestorPrecall,
                                ownerUserId: event.sharedBy?.id,
                              })
                            }
                          >
                            <ScrollText className="h-3 w-3" />
                            Xem sớ
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <PrayerPreviewDialog
          open={!!prayerEvent}
          onOpenChange={(open) => !open && setPrayerEvent(null)}
          type={prayerEvent?.type ?? "ancestor"}
          lunarDate={{
            day: day.lunarDate.day,
            month: day.lunarDate.month,
            year: day.lunarDate.year,
            dayName: day.lunarDate.dayName,
            monthName: day.lunarDate.monthName,
            yearName: day.lunarDate.zodiacYear,
            solarDate: day.gregorianDate,
          }}
          ancestorName={prayerEvent?.ancestorName ?? undefined}
          ancestorPrecall={prayerEvent?.ancestorPrecall ?? undefined}
          ownerUserId={prayerEvent?.ownerUserId}
        />
      </DialogContent>
    </Dialog>
  );
}
