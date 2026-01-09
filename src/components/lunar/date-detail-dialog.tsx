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
import {
  Calendar,
  Moon,
  Star,
  Sparkles,
  CalendarDays,
  Flower2,
} from "lucide-react";
import { formatVietnameseDate } from "@/lib/vietnamese-localization";
import { LoginDialog } from "@/components/login-dialog";
import type { VietnameseLunarDate } from "@/lib/lunar-calendar";

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
        </div>
      </DialogContent>
    </Dialog>
  );
}
