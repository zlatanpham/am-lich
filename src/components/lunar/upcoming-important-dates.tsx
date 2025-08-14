"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { Calendar, Clock } from "lucide-react";
import { vietnameseText, formatVietnameseDate } from "@/lib/vietnamese-localization";

export function UpcomingImportantDates() {
  const { data, isLoading, error } = api.lunarCalendar.getNextImportantVietnameseDates.useQuery();

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
        {/* Next Mồng 1 */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {vietnameseText.mong1}
              </Badge>
            </div>
            <div>
              <p className="font-medium">{nextMong1.lunarInfo.monthName} {nextMong1.lunarInfo.dayName}</p>
              <p className="text-sm text-muted-foreground">
                {nextMong1.formattedDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {nextMong1.daysUntil === 0 ? vietnameseText.today : 
               nextMong1.daysUntil === 1 ? vietnameseText.tomorrow : 
               `còn ${nextMong1.daysUntil} ngày`}
            </span>
          </div>
        </div>

        {/* Next Rằm */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {vietnameseText.ram}
              </Badge>
            </div>
            <div>
              <p className="font-medium">{nextRam.lunarInfo.monthName} {nextRam.lunarInfo.dayName}</p>
              <p className="text-sm text-muted-foreground">
                {nextRam.formattedDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {nextRam.daysUntil === 0 ? vietnameseText.today : 
               nextRam.daysUntil === 1 ? vietnameseText.tomorrow : 
               `còn ${nextRam.daysUntil} ngày`}
            </span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t space-y-1">
          <p>Mồng 1 là ngày trăng non, Rằm là ngày trăng tròn</p>
          <p className="text-blue-600">Cả hai ngày đều quan trọng trong văn hóa Việt Nam</p>
        </div>
      </CardContent>
    </Card>
  );
}