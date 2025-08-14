"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { vietnameseText, formatVietnameseDate, getVietnamTime } from "@/lib/vietnamese-localization";

export function CurrentDateDisplay() {
  const { data, isLoading, error } = api.lunarCalendar.getCurrentVietnameseLunarDate.useQuery();

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

  const { lunarDate, formattedDate, culturalAssessment, zodiacYear, vietnameseDate, nextImportantDates, daysToMong1, daysToRam } = data;

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
              variant={culturalAssessment.type === 'auspicious' ? 'default' : 
                     culturalAssessment.type === 'inauspicious' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {culturalAssessment.type === 'auspicious' ? 'Ngày tốt' : 
               culturalAssessment.type === 'inauspicious' ? 'Ngày xấu' : 'Bình thường'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-primary">{formattedDate}</h3>
          <p className="text-muted-foreground">
            {vietnameseDate}
          </p>
          {lunarDate.culturalSignificance && (
            <p className="text-sm text-blue-600 mt-1">
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
          <div className="text-xs text-muted-foreground">
            <p>Can Chi: {lunarDate.zodiacYear} năm {lunarDate.zodiacMonth} tháng {lunarDate.zodiacDay} ngày</p>
          </div>
          
          {/* Next Important Dates */}
          <div className="border-t pt-2 mt-4">
            <h4 className="text-sm font-medium mb-2">Ngày quan trọng sắp tới:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-muted/50 rounded">
                <p className="font-medium">{vietnameseText.mong1}</p>
                <p className="text-muted-foreground">còn {daysToMong1} ngày</p>
              </div>
              <div className="p-2 bg-muted/50 rounded">
                <p className="font-medium">{vietnameseText.ram}</p>
                <p className="text-muted-foreground">còn {daysToRam} ngày</p>
              </div>
            </div>
          </div>
          
          {culturalAssessment && (
            <div className="border-t pt-2">
              <h4 className="text-sm font-medium mb-1">{culturalAssessment.title}</h4>
              <p className="text-xs text-muted-foreground">{culturalAssessment.description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}