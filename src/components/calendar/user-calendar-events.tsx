"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock } from "lucide-react";
import { EventCreateDialog } from "./event-create-dialog";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function UserCalendarEvents() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: events, isLoading } = api.event.list.useQuery();

  const upcomingEvents = events?.filter(event => 
    new Date(event.date) >= new Date()
  ).slice(0, 3) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sự kiện của tôi
            </CardTitle>
            <CardDescription>
              Quản lý các sự kiện cá nhân theo âm lịch
            </CardDescription>
          </div>
          <Button 
            size="sm" 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-2 p-2 rounded-lg border">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.date), "dd/MM/yyyy", { locale: vi })}
                  </p>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {events && events.length > 3 && (
              <Button variant="ghost" size="sm" className="w-full">
                Xem tất cả ({events.length} sự kiện)
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có sự kiện nào</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsCreateDialogOpen(true)}
              className="mt-2"
            >
              Tạo sự kiện đầu tiên
            </Button>
          </div>
        )}
      </CardContent>

      <EventCreateDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </Card>
  );
}