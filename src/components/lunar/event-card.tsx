"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Edit, Trash2, Repeat, Flower2 } from "lucide-react";
import {
  daysUntilVietnam,
  formatVietnameseLunarDate,
  gregorianToLunar,
  lunarToGregorian,
} from "@/lib/lunar-calendar";

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

    // For recurring events, find the next occurrence if the original date is in the past
    if (event.isRecurring && targetDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (targetDate < today) {
        // Find next occurrence by checking current year and next year
        const currentYear = today.getFullYear();
        try {
          // Try current year first
          const thisYearDate = lunarToGregorian(
            currentYear,
            event.lunarMonth,
            event.lunarDay,
          );
          if (thisYearDate >= today) {
            targetDate = thisYearDate;
          } else {
            // Try next year
            const nextYearDate = lunarToGregorian(
              currentYear + 1,
              event.lunarMonth,
              event.lunarDay,
            );
            targetDate = nextYearDate;
          }
        } catch {
          // If date doesn't exist this year or next year, try the year after
          try {
            targetDate = lunarToGregorian(
              currentYear + 2,
              event.lunarMonth,
              event.lunarDay,
            );
          } catch {
            return null; // Give up if we can't find a valid date
          }
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

  if (compact) {
    return (
      <div className="bg-card rounded-lg border p-2 sm:p-4 md:p-2">
        {/* Mobile layout */}
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

        {/* Desktop layout (original) */}
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
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        {/* Mobile layout */}
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

        {/* Desktop layout (original) */}
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
    </Card>
  );
}
