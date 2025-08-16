"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Edit, Trash2, Repeat } from "lucide-react";

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
    gregorianDate?: Date;
    lunarDateFormatted?: string;
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

  if (compact) {
    return (
      <div className="bg-card flex items-center justify-between rounded-lg border p-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {event.isRecurring && (
              <Repeat className="text-muted-foreground h-4 w-4" />
            )}
            <Calendar className="text-muted-foreground h-4 w-4" />
          </div>
          <div>
            <h4 className="font-medium">{event.title}</h4>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>
                {event.lunarDateFormatted ??
                  `Âm lịch năm ${event.lunarYear} tháng ${event.lunarMonth} ngày ${event.lunarDay}`}
              </span>
              {event.gregorianDate && (
                <>
                  <span>•</span>
                  <span>{formatDate(event.gregorianDate)}</span>
                </>
              )}
            </div>
          </div>
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
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{event.title}</h3>
            {event.isRecurring && (
              <Badge variant="secondary" className="text-xs">
                <Repeat className="mr-1 h-3 w-3" />
                Lặp lại hàng năm
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
      <CardContent className="space-y-3">
        {event.description && (
          <p className="text-muted-foreground text-sm">{event.description}</p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <span>
              {event.lunarDateFormatted ??
                `Âm lịch năm ${event.lunarYear} tháng ${event.lunarMonth} ngày ${event.lunarDay}`}
            </span>
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
