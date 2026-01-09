"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Edit,
  Trash2,
  Repeat,
  Flower2,
  ScrollText,
} from "lucide-react";
import {
  daysUntilVietnam,
  formatVietnameseLunarDate,
  gregorianToLunar,
  lunarToGregorian,
} from "@/lib/lunar-calendar";
import { useState } from "react";
import { PrayerPreviewDialog } from "@/components/prayers/prayer-preview-dialog";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string | null;
    lunarYear: number;
    lunarMonth: number;
    lunarDay: number;
    isRecurring: boolean;
    reminderDays: number;
    gregorianDate?: Date | null;
    lunarDateFormatted?: string;
    eventType?: string;
    ancestorName?: string | null;
    ancestorPrecall?: string | null;
  };
  onEdit?: (event: EventCardProps["event"]) => void;
  onDelete?: (eventId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function EventCard({
  event,
  onEdit,
  onDelete,
  showActions = true,
  compact = false,
}: EventCardProps) {
  const [showPrayerDialog, setShowPrayerDialog] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  const getReminderText = (days: number) => {
    switch (days) {
      case 1:
        return "Trước 1 ngày";
      case 3:
        return "Trước 3 ngày";
      case 7:
        return "Trước 1 tuần";
      default:
        return `Trước ${days} ngày`;
    }
  };

  const getDaysUntilEvent = () => {
    let targetDate = event.gregorianDate;

    if (event.isRecurring && targetDate) {
      const now = new Date();
      const today = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
      );
      today.setHours(0, 0, 0, 0);

      const targetDateObj = new Date(targetDate);
      targetDateObj.setHours(0, 0, 0, 0);

      if (targetDateObj < today) {
        const currentYear = today.getFullYear();
        let foundDate: Date | null = null;

        for (let y = currentYear - 1; y <= currentYear + 2; y++) {
          try {
            const solarDate = lunarToGregorian(
              y,
              event.lunarMonth,
              event.lunarDay,
            );
            const solarDateNormalized = new Date(solarDate);
            solarDateNormalized.setHours(0, 0, 0, 0);

            if (solarDateNormalized >= today) {
              foundDate = solarDate;
              break;
            }
          } catch {
            continue;
          }
        }

        if (foundDate) {
          targetDate = foundDate;
        }
      }
    }

    if (!targetDate) return null;

    const days = daysUntilVietnam(targetDate);
    if (days === 0) return "Hôm nay";
    if (days === 1) return "Ngày mai";
    if (days < 0) return `${Math.abs(days)} ngày trước`;
    return `${days} ngày nữa`;
  };

  const getLunarDateFormatted = () => {
    if (event.lunarDateFormatted) return event.lunarDateFormatted;
    if (event.gregorianDate) {
      const lunarDate = gregorianToLunar(event.gregorianDate);
      return formatVietnameseLunarDate(lunarDate);
    }
    return `Âm lịch năm ${event.lunarYear} tháng ${event.lunarMonth} ngày ${event.lunarDay}`;
  };

  const getDisplayTitle = () => {
    if (
      event.eventType === "ancestor_worship" &&
      event.ancestorPrecall &&
      event.ancestorName
    ) {
      return `Giỗ ${event.ancestorPrecall} ${event.ancestorName}`;
    }
    return event.title;
  };

  const isAncestorWorship = event.eventType === "ancestor_worship";
  const isImportantDate = event.lunarDay === 1 || event.lunarDay === 15;
  const showPrayerButton = isAncestorWorship || isImportantDate;

  const handleShowPrayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPrayerDialog(true);
  };

  const getLunarInfo = () => {
    let targetSolarDate = event.gregorianDate || new Date();

    if (event.isRecurring) {
      const today = new Date();
      const currentYear = today.getFullYear();
      for (let y = currentYear - 1; y <= currentYear + 1; y++) {
        try {
          const solar = lunarToGregorian(y, event.lunarMonth, event.lunarDay);
          const solarNorm = new Date(solar);
          solarNorm.setHours(0, 0, 0, 0);
          const todayNorm = new Date(today);
          todayNorm.setHours(0, 0, 0, 0);
          if (solarNorm >= todayNorm) {
            targetSolarDate = solar;
            break;
          }
        } catch {
          continue;
        }
      }
    }

    const lunar = gregorianToLunar(targetSolarDate);
    return {
      day: event.lunarDay,
      month: event.lunarMonth,
      year: lunar.year,
      dayName: lunar.dayName,
      monthName: lunar.monthName,
      yearName: lunar.zodiacYear,
      solarDate: targetSolarDate,
    };
  };

  const prayerType = isAncestorWorship
    ? "ancestor"
    : event.lunarDay === 1
      ? "mong1"
      : "ram15";

  if (compact) {
    return (
      <div className="bg-card rounded-lg border p-2 sm:p-4 md:p-2">
        <div className="flex flex-col gap-3 sm:hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                {event.isRecurring && (
                  <Repeat className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                )}
                {isAncestorWorship && (
                  <Flower2 className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                )}
                <h4 className="text-base leading-relaxed font-semibold">
                  {getDisplayTitle()}
                </h4>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isAncestorWorship && (
                  <Badge variant="secondary" className="text-xs">
                    Cúng giỗ
                  </Badge>
                )}
                {getDaysUntilEvent() && (
                  <Badge variant="outline" className="px-3 py-1 text-sm">
                    {getDaysUntilEvent()}
                  </Badge>
                )}
                {showPrayerButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={handleShowPrayer}
                  >
                    <ScrollText className="h-3 w-3" />
                    Xem sớ
                  </Button>
                )}
              </div>
            </div>
            {showActions && (
              <div className="flex flex-shrink-0 items-start gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onEdit(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                    onClick={() => onDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="min-w-0 flex-1">{getLunarDateFormatted()}</span>
            </div>
            {event.gregorianDate && (
              <div className="text-muted-foreground flex items-center gap-2 pl-6 text-sm">
                <span className="min-w-0 flex-1">
                  {formatDate(event.gregorianDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="hidden items-center justify-between sm:flex">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {event.isRecurring && (
                <Repeat className="text-muted-foreground h-3 w-3" />
              )}
              {isAncestorWorship && (
                <Flower2 className="text-muted-foreground h-3 w-3" />
              )}
              <Calendar className="text-muted-foreground h-3 w-3" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-sm font-medium">
                  {getDisplayTitle()}
                </h4>
                {isAncestorWorship && (
                  <Badge variant="secondary" className="h-5 px-1 py-0 text-xs">
                    Cúng giỗ
                  </Badge>
                )}
                {getDaysUntilEvent() && (
                  <Badge variant="outline" className="h-5 px-1 py-0 text-xs">
                    {getDaysUntilEvent()}
                  </Badge>
                )}
                {showPrayerButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 gap-1 px-1.5 text-[10px]"
                    onClick={handleShowPrayer}
                  >
                    <ScrollText className="h-3 w-3" />
                    Xem sớ
                  </Button>
                )}
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <span className="truncate">{getLunarDateFormatted()}</span>
                {event.gregorianDate && (
                  <>
                    <span>•</span>
                    <span className="truncate">
                      {formatDate(event.gregorianDate)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          {showActions && (
            <div className="flex flex-shrink-0 items-center gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onEdit(event)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive h-6 w-6 p-0"
                  onClick={() => onDelete(event.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        <PrayerPreviewDialog
          open={showPrayerDialog}
          onOpenChange={setShowPrayerDialog}
          type={prayerType}
          lunarDate={getLunarInfo()}
          ancestorName={event.ancestorName || undefined}
          ancestorPrecall={event.ancestorPrecall || undefined}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                {event.isRecurring && (
                  <Repeat className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                )}
                {isAncestorWorship && (
                  <Flower2 className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                )}
                <h3 className="text-lg leading-relaxed font-semibold">
                  {getDisplayTitle()}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isAncestorWorship && (
                  <Badge variant="secondary" className="text-xs">
                    <Flower2 className="mr-1 h-3 w-3" />
                    Cúng giỗ
                  </Badge>
                )}
                {event.isRecurring && (
                  <Badge variant="secondary" className="text-xs">
                    Lặp lại hàng năm
                  </Badge>
                )}
                {getDaysUntilEvent() && (
                  <Badge variant="outline" className="px-3 py-1 text-sm">
                    {getDaysUntilEvent()}
                  </Badge>
                )}
                {showPrayerButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={handleShowPrayer}
                  >
                    <ScrollText className="h-3 w-3" />
                    Xem sớ
                  </Button>
                )}
              </div>
            </div>
            {showActions && (
              <div className="ml-2 flex items-start gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(event.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="hidden items-start justify-between sm:flex">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{getDisplayTitle()}</h3>
            {isAncestorWorship && (
              <Badge variant="secondary" className="text-xs">
                <Flower2 className="mr-1 h-3 w-3" />
                Cúng giỗ
              </Badge>
            )}
            {event.isRecurring && (
              <Badge variant="secondary" className="text-xs">
                <Repeat className="mr-1 h-3 w-3" />
                Lặp lại hàng năm
              </Badge>
            )}
            {getDaysUntilEvent() && (
              <Badge variant="outline" className="text-xs">
                {getDaysUntilEvent()}
              </Badge>
            )}
            {showPrayerButton && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
                onClick={handleShowPrayer}
              >
                <ScrollText className="h-3 w-3" />
                Xem sớ
              </Button>
            )}
          </div>
          {showActions && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={() => onEdit(event)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(event.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {event.description && (
          <p className="text-muted-foreground text-sm">{event.description}</p>
        )}
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <span>{getLunarDateFormatted()}</span>
          </div>
          {event.gregorianDate && (
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <span>{formatDate(event.gregorianDate)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="text-muted-foreground h-4 w-4" />
            <span>Nhắc nhở {getReminderText(event.reminderDays)}</span>
          </div>
        </div>
      </CardContent>

      <PrayerPreviewDialog
        open={showPrayerDialog}
        onOpenChange={setShowPrayerDialog}
        type={prayerType}
        lunarDate={getLunarInfo()}
        ancestorName={event.ancestorName || undefined}
        ancestorPrecall={event.ancestorPrecall || undefined}
      />
    </Card>
  );
}
