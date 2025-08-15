"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, Clock, Edit, Trash2 } from "lucide-react";
import { EventCreateDialog } from "./event-create-dialog";
import { EventEditDialog } from "./event-edit-dialog";
import { EventDeleteDialog } from "./event-delete-dialog";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface LunarEvent {
  id: string;
  title: string;
  description?: string | null;
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isRecurring: boolean;
  gregorianDate?: Date;
  lunarDateFormatted?: string;
}

export function EventsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LunarEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<LunarEvent | null>(null);

  // Get events for a reasonable date range to include past and future events
  const currentDate = new Date();

  // Use useMemo to prevent date objects from changing on every render
  const dateRange = useMemo(() => {
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 6); // 6 months ago
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 12); // 12 months ahead

    return {
      startDate: pastDate,
      endDate: futureDate,
    };
  }, []);

  const { data: events, isLoading } = api.lunarEvents.getByDateRange.useQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    includeRecurring: true,
  });

  const filteredEvents =
    events?.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) ?? [];

  const upcomingEvents = filteredEvents.filter(
    (event) => event.gregorianDate && event.gregorianDate >= currentDate,
  );

  const pastEvents = filteredEvents.filter(
    (event) => event.gregorianDate && event.gregorianDate < currentDate,
  );

  const handleEdit = (event: LunarEvent) => {
    setEditingEvent(event);
  };

  const handleDelete = (event: LunarEvent) => {
    setDeletingEvent(event);
  };

  const EventItem = ({ event }: { event: LunarEvent }) => (
    <Card key={event.id}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{event.title}</h3>
            {event.description && (
              <p className="text-muted-foreground mt-1 text-sm">
                {event.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-4">
              <div className="text-muted-foreground flex items-center gap-1 text-sm">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">
                  {event.lunarDateFormatted ??
                    `Âm lịch năm ${event.lunarYear} tháng ${event.lunarMonth} ngày ${event.lunarDay}`}
                </span>
              </div>
              {event.gregorianDate && (
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4" />
                  {format(new Date(event.gregorianDate), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="ml-4 flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(event)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(event)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sự kiện của tôi</h2>
          <p className="text-muted-foreground">Quản lý các sự kiện cá nhân</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo sự kiện mới
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm sự kiện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">{filteredEvents.length} sự kiện</Badge>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-gray-200"
            />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">Chưa có sự kiện</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Không tìm thấy sự kiện nào khớp"
                : "Bạn chưa tạo sự kiện nào"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo sự kiện đầu tiên
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sự kiện sắp tới</h3>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <EventItem key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sự kiện đã qua</h3>
              <div className="space-y-3">
                {pastEvents.slice(0, 5).map((event) => (
                  <EventItem key={event.id} event={event} />
                ))}
                {pastEvents.length > 5 && (
                  <p className="text-muted-foreground text-center text-sm">
                    Và {pastEvents.length - 5} sự kiện khác...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-muted-foreground text-sm">Tổng số sự kiện</p>
                <p className="text-2xl font-bold">{events?.length ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-muted-foreground text-sm">Sự kiện sắp tới</p>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-muted-foreground text-sm">Sự kiện đã qua</p>
                <p className="text-2xl font-bold">{pastEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <EventCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <EventEditDialog
        open={!!editingEvent}
        onOpenChange={(open) => !open && setEditingEvent(null)}
        event={editingEvent}
      />

      <EventDeleteDialog
        open={!!deletingEvent}
        onOpenChange={(open) => !open && setDeletingEvent(null)}
        event={deletingEvent}
      />
    </div>
  );
}
