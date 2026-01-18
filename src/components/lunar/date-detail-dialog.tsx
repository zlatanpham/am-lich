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
  const [showPrayerDialog, setShowPrayerDialog] = useState(false);

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

  const isImportantDate = day.lunarDate.day === 1 || day.lunarDate.day === 15;
  const ancestorEvent = day.events?.find(
    (e) => e.eventType === "ancestor_worship",
  );
  const showPrayerButton =
    session?.user && (isImportantDate || !!ancestorEvent);

  const prayerType = ancestorEvent
    ? "ancestor"
    : day.lunarDate.day === 1
      ? "mong1"
      : "ram15";

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
                <h4 className="font-medium text-amber-800 dark:text-amber-400">
                  Ý nghĩa văn hóa
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-500">
                  {day.lunarDate.culturalSignificance}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Events Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-medium">
                <CalendarDays className="h-4 w-4" />
                Sự kiện của bạn
              </h4>
              {showPrayerButton && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 px-2 text-xs"
                  onClick={() => setShowPrayerDialog(true)}
                >
                  <ScrollText className="h-3.5 w-3.5" />
                  Xem sớ khấn
                </Button>
              )}
            </div>

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
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                          {displayTitle}
                        </span>
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

                    return (
                      <div
                        key={`shared-${event.id}`}
                        className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 p-2 dark:border-purple-900 dark:bg-purple-950"
                      >
                        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-purple-500" />
                        <span className="flex-1 text-sm font-medium text-purple-700 dark:text-purple-400">
                          {event.title}
                        </span>
                        <div className="flex items-center gap-1">
                          <Avatar className="h-5 w-5">
                            <AvatarImage
                              src={event.sharedBy?.image || undefined}
                            />
                            <AvatarFallback className="text-[10px]">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground text-xs">
                            {sharerName}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <PrayerPreviewDialog
          open={showPrayerDialog}
          onOpenChange={setShowPrayerDialog}
          type={prayerType}
          lunarDate={{
            day: day.lunarDate.day,
            month: day.lunarDate.month,
            year: day.lunarDate.year,
            dayName: day.lunarDate.dayName,
            monthName: day.lunarDate.monthName,
            yearName: day.lunarDate.zodiacYear,
            solarDate: day.gregorianDate,
          }}
          ancestorName={ancestorEvent?.ancestorName || undefined}
          ancestorPrecall={ancestorEvent?.ancestorPrecall || undefined}
        />
      </DialogContent>
    </Dialog>
  );
}
