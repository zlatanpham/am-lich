"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { Calendar, Clock } from "lucide-react";
import {
  vietnameseText,
  formatVietnameseDate,
} from "@/lib/vietnamese-localization";

export function UpcomingImportantDates() {
  const { data, isLoading, error } =
    api.lunarCalendar.getNextImportantVietnameseDates.useQuery();
  const { data: upcomingEvents } = api.lunarEvents.getUpcoming.useQuery({
    days: 30,
  });

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {vietnameseText.nextImportantDates}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upcoming Custom Events */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <div className="space-y-3">
            {upcomingEvents.slice(0, 3).map((event) => {
              const daysUntil = Math.ceil(
                (event.gregorianDate.getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg bg-blue-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Badge
                        variant="outline"
                        className="border-blue-300 bg-blue-100 text-blue-800"
                      >
                        Sự kiện
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">{event.title}</p>
                      <p className="text-sm text-blue-600">
                        {event.lunarDateFormatted}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-blue-700">
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
        <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Badge
                variant="outline"
                className="border-blue-200 bg-blue-50 text-blue-700"
              >
                {vietnameseText.mong1}
              </Badge>
            </div>
            <div>
              <p className="font-medium">
                {nextMong1.lunarInfo.monthName} {nextMong1.lunarInfo.dayName}
              </p>
              <p className="text-muted-foreground text-sm">
                {nextMong1.formattedDate}
              </p>
            </div>
          </div>
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4" />
            <span>
              {nextMong1.daysUntil === 0
                ? vietnameseText.today
                : nextMong1.daysUntil === 1
                  ? vietnameseText.tomorrow
                  : `còn ${nextMong1.daysUntil} ngày`}
            </span>
          </div>
        </div>

        {/* Next Rằm */}
        <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Badge
                variant="outline"
                className="border-orange-200 bg-orange-50 text-orange-700"
              >
                {vietnameseText.ram}
              </Badge>
            </div>
            <div>
              <p className="font-medium">
                {nextRam.lunarInfo.monthName} {nextRam.lunarInfo.dayName}
              </p>
              <p className="text-muted-foreground text-sm">
                {nextRam.formattedDate}
              </p>
            </div>
          </div>
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4" />
            <span>
              {nextRam.daysUntil === 0
                ? vietnameseText.today
                : nextRam.daysUntil === 1
                  ? vietnameseText.tomorrow
                  : `còn ${nextRam.daysUntil} ngày`}
            </span>
          </div>
        </div>

        <div className="text-muted-foreground space-y-1 border-t pt-2 text-center text-xs">
          <p>Mồng 1 là ngày trăng non, Rằm là ngày trăng tròn</p>
          <p className="text-blue-600">
            Cả hai ngày đều quan trọng trong văn hóa Việt Nam
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
