"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Repeat, Flower2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface SharedEventCardProps {
  event: {
    id: string;
    title: string;
    description?: string | null;
    lunarMonth: number;
    lunarDay: number;
    isRecurring: boolean;
    eventType?: string;
    ancestorName?: string | null;
    ancestorPrecall?: string | null;
    gregorianDate?: Date | null;
    lunarDateFormatted?: string;
    sharedBy?: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  };
  compact?: boolean;
}

export function SharedEventCard({
  event,
  compact = false,
}: SharedEventCardProps) {
  const sharerName = event.sharedBy?.name || event.sharedBy?.email || "Ai đó";
  const initials =
    sharerName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";
  const isAncestorWorship = event.eventType === "ancestor_worship";
  const displayTitle =
    isAncestorWorship && event.ancestorPrecall && event.ancestorName
      ? `Giỗ ${event.ancestorPrecall} ${event.ancestorName}`
      : event.title;

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isAncestorWorship && (
              <Flower2 className="h-4 w-4 flex-shrink-0 text-purple-600 dark:text-purple-400" />
            )}
            <span className="font-medium text-purple-900 dark:text-purple-100">
              {displayTitle}
            </span>
            {event.isRecurring && (
              <Repeat className="h-3 w-3 text-purple-600 dark:text-purple-400" />
            )}
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Calendar className="h-3 w-3" />
            {event.gregorianDate
              ? format(new Date(event.gregorianDate), "dd/MM/yyyy", {
                  locale: vi,
                })
              : event.lunarDateFormatted}
          </div>
        </div>
        {event.sharedBy && (
          <div className="flex items-center gap-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={event.sharedBy.image || undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {isAncestorWorship && (
                <Flower2 className="h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
              )}
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                {displayTitle}
              </h3>
              {event.isRecurring && (
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                >
                  <Repeat className="mr-1 h-3 w-3" />
                  Hàng năm
                </Badge>
              )}
            </div>

            {event.description && (
              <p className="text-muted-foreground text-sm">
                {event.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-purple-700 dark:text-purple-300">
                <Calendar className="h-4 w-4" />
                {event.gregorianDate ? (
                  <span>
                    {format(
                      new Date(event.gregorianDate),
                      "EEEE, dd MMMM yyyy",
                      {
                        locale: vi,
                      },
                    )}
                  </span>
                ) : (
                  <span>{event.lunarDateFormatted}</span>
                )}
              </div>
            </div>

            {event.sharedBy && (
              <div className="flex items-center gap-2 border-t border-purple-200 pt-2 dark:border-purple-800">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={event.sharedBy.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground text-xs">
                  Chia sẻ bởi {sharerName}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
