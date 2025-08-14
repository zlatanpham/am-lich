"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/lunar/event-card";
import { CalendarGrid } from "@/components/lunar/calendar-grid";
import { api } from "@/trpc/react";
import { Plus, Search, Calendar, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { 
    data: events, 
    isLoading: eventsLoading, 
    refetch: refetchEvents 
  } = api.lunarEvents.getAll.useQuery({ includeInactive: false });

  const { 
    data: upcomingEvents, 
    isLoading: upcomingLoading 
  } = api.lunarEvents.getUpcoming.useQuery({ days: 60 });

  const filteredEvents = events?.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleEventAction = async (action: 'edit' | 'delete', eventId?: string) => {
    if (action === 'delete' && eventId) {
      // Handle delete - would show confirmation dialog in real implementation
      console.log('Delete event:', eventId);
    } else if (action === 'edit') {
      // Handle edit - would open edit dialog in real implementation
      console.log('Edit event');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sự kiện âm lịch của tôi</h1>
          <p className="text-muted-foreground">
            Quản lý các sự kiện âm lịch và nhắc nhở của bạn
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
Tạo sự kiện mới
        </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
Hiển thị danh sách
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
Hiển thị lịch
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Search and filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sự kiện..."
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
                  upcomingEvents.slice(0, 5).map((event) => (
                    <EventCard
                      key={`${event.id}-${event.gregorianDate?.getTime()}`}
                      event={event}
                      onEdit={(event) => handleEventAction('edit')}
                      onDelete={(eventId) => handleEventAction('delete', eventId)}
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
                  onEdit={(event) => handleEventAction('edit')}
                  onDelete={(eventId) => handleEventAction('delete', eventId)}
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
Tạo sự kiện đầu tiên
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <CalendarGrid showEvents={true} />
        </TabsContent>
      </Tabs>

      {/* Statistics cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Tổng số sự kiện</p>
                <p className="text-2xl font-bold">{events?.length || 0}</p>
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
                  {events?.filter(e => e.isRecurring).length || 0}
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
                <p className="text-sm text-muted-foreground">Sự kiện gần đây</p>
                <p className="text-2xl font-bold">
                  {upcomingEvents?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}