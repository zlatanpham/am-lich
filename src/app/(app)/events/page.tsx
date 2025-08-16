"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/lunar/event-card";
import { CalendarGrid } from "@/components/lunar/calendar-grid";
import { CreateEventDialog } from "@/components/lunar/create-event-dialog";
import { EditEventDialog } from "@/components/lunar/edit-event-dialog";
import { DeleteEventDialog } from "@/components/lunar/delete-event-dialog";
import { api } from "@/trpc/react";
import { Plus, Search, Calendar, Moon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    id: string;
    title: string;
    description?: string | null | undefined;
    lunarYear: number;
    lunarMonth: number;
    lunarDay: number;
    isRecurring: boolean;
    reminderDays: number;
    gregorianDate?: Date;
    lunarDateFormatted?: string;
  } | null>(null);

  const { 
    data: events, 
    isLoading: eventsLoading
  } = api.lunarEvents.getAll.useQuery({ includeInactive: false });

  const { 
    data: upcomingEvents, 
    isLoading: upcomingLoading 
  } = api.lunarEvents.getUpcoming.useQuery({ days: 60 });

  const filteredEvents = events?.filter((event: any) => {
    const titleMatch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const descriptionMatch = event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    return titleMatch || descriptionMatch;
  }) ?? [];

  const handleEventAction = useCallback(async (action: 'edit' | 'delete', eventOrId: string | any) => {
    if (action === 'delete') {
      // Find the event by ID for delete action
      const event = typeof eventOrId === 'string' 
        ? events?.find((e: any) => e.id === eventOrId)
        : eventOrId;
      if (event) {
        setSelectedEvent(event);
        setShowDeleteDialog(true);
      }
    } else if (action === 'edit') {
      // Use the event object directly for edit action
      setSelectedEvent(eventOrId);
      setShowEditDialog(true);
    }
  }, [events]);

  const handleCloseCreateDialog = useCallback((open: boolean) => {
    setShowCreateDialog(open);
    if (!open) {
      // Clean up any pending state
    }
  }, []);

  const handleCloseEditDialog = useCallback((open: boolean) => {
    setShowEditDialog(open);
    if (!open) {
      setSelectedEvent(null);
    }
  }, []);

  const handleCloseDeleteDialog = useCallback((open: boolean) => {
    setShowDeleteDialog(open);
    if (!open) {
      setSelectedEvent(null);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setSelectedEvent(null);
      setShowCreateDialog(false);
      setShowEditDialog(false);
      setShowDeleteDialog(false);
    };
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý sự kiện âm lịch</h1>
          <p className="text-muted-foreground">
            Quản lý các sự kiện âm lịch và nhắc nhở truyền thống
          </p>
        </div>
      </div>

      <Tabs defaultValue="lunar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="lunar" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Sự kiện âm lịch
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Xem lịch
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lunar" className="space-y-6">
          <div className="flex items-center justify-between">
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo sự kiện âm lịch
            </Button>
          </div>

          {/* Search and filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sự kiện âm lịch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">
              {filteredEvents.length} sự kiện
            </Badge>
          </div>

          {/* Upcoming events section */}
          {upcomingEvents && upcomingEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
Sự kiện sắp tới
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : (
                  upcomingEvents.slice(0, 5).map((event, index) => (
                    <EventCard
                      key={`upcoming-${event.id}-${index}`}
                      event={event}
                      onEdit={(event: any) => handleEventAction('edit', event)}
                      onDelete={(eventId: string) => handleEventAction('delete', eventId)}
                      compact={true}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* All events list */}
          <div className="space-y-4">
            {eventsLoading ? (
              Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={(event: any) => handleEventAction('edit', event)}
                  onDelete={(eventId: string) => handleEventAction('delete', eventId)}
                />
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Chưa có sự kiện</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "Không tìm thấy sự kiện nào khớp" : "Bạn chưa tạo sự kiện âm lịch nào"}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tạo sự kiện âm lịch đầu tiên
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Statistics cards for lunar events */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng số sự kiện âm lịch</p>
                    <p className="text-2xl font-bold">{events?.length ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sự kiện lặp lại hàng năm</p>
                    <p className="text-2xl font-bold">
                      {events?.filter((e: any) => e.isRecurring).length ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Badge className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sự kiện sắp tới</p>
                    <p className="text-2xl font-bold">
                      {upcomingEvents?.length ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <CalendarGrid showEvents={true} />
        </TabsContent>
      </Tabs>

      <CreateEventDialog 
        open={showCreateDialog} 
        onOpenChange={handleCloseCreateDialog}
      />

      <EditEventDialog
        open={showEditDialog}
        onOpenChange={handleCloseEditDialog}
        event={selectedEvent}
      />

      <DeleteEventDialog
        open={showDeleteDialog}
        onOpenChange={handleCloseDeleteDialog}
        event={selectedEvent}
      />
    </div>
  );
}