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
import { ExportCalendarDialog } from "@/components/lunar/export-calendar-dialog";
import { api } from "@/trpc/react";
import {
  Plus,
  Search,
  Calendar,
  Moon,
  Download,
  Users,
  Share2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { ShareInviteDialog } from "@/components/sharing/share-invite-dialog";
import { SharedEventCard } from "@/components/sharing/shared-event-card";
import Link from "next/link";

type LunarEvent = {
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
};

export default function EventsPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<LunarEvent | null>(null);

  const { data: events, isLoading: eventsLoading } =
    api.lunarEvents.getAll.useQuery(
      { includeInactive: false },
      {
        enabled: !!session?.user,
      },
    );

  const { data: upcomingEvents, isLoading: upcomingLoading } =
    api.lunarEvents.getUpcoming.useQuery(
      { days: 60 },
      {
        enabled: !!session?.user,
      },
    );

  const { data: sharedEvents, isLoading: sharedLoading } =
    api.eventSharing.getSharedEvents.useQuery({}, { enabled: !!session?.user });

  const sharedEventCount = sharedEvents?.length ?? 0;

  const filteredEvents =
    events?.filter((event: LunarEvent) => {
      const titleMatch = event.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const descriptionMatch =
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false;
      return titleMatch || descriptionMatch;
    }) ?? [];

  const handleEventAction = useCallback(
    async (action: "edit" | "delete", eventOrId: string | LunarEvent) => {
      if (action === "delete") {
        // Find the event by ID for delete action
        const event =
          typeof eventOrId === "string"
            ? events?.find((e: LunarEvent) => e.id === eventOrId)
            : eventOrId;
        if (event) {
          setSelectedEvent(event);
          setShowDeleteDialog(true);
        }
      } else if (action === "edit") {
        // Use the event object directly for edit action
        setSelectedEvent(eventOrId as LunarEvent);
        setShowEditDialog(true);
      }
    },
    [events],
  );

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
      setShowExportDialog(false);
      setShowShareDialog(false);
    };
  }, []);

  return (
    <div className="space-y-6 py-6">
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
          <TabsTrigger value="shared" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Được chia sẻ
            {sharedEventCount > 0 && (
              <span className="ml-1 rounded-full bg-purple-500 px-1.5 py-0.5 text-xs text-white">
                {sharedEventCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Xem lịch
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lunar" className="space-y-6">
          {/* Statistics cards for lunar events */}
          <div className="grid grid-cols-3 gap-2">
            <Card>
              <CardContent className="p-3">
                <div className="flex flex-col items-center gap-1 text-center">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <p className="text-muted-foreground text-xs leading-tight">
                    Tổng số sự kiện âm lịch
                  </p>
                  <p className="text-lg font-bold">{events?.length ?? 0}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <div className="flex flex-col items-center gap-1 text-center">
                  <Plus className="text-muted-foreground h-4 w-4" />
                  <p className="text-muted-foreground text-xs leading-tight">
                    Sự kiện lặp lại hàng năm
                  </p>
                  <p className="text-lg font-bold">
                    {events?.filter((e: LunarEvent) => e.isRecurring).length ??
                      0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <div className="flex flex-col items-center gap-1 text-center">
                  <Badge className="text-muted-foreground h-4 w-4" />
                  <p className="text-muted-foreground text-xs leading-tight">
                    Sự kiện sắp tới
                  </p>
                  <p className="text-lg font-bold">
                    {upcomingEvents?.length ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo sự kiện âm lịch
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowShareDialog(true)}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Chia sẻ
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(true)}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Xuất lịch
              </Button>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex items-center gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm sự kiện âm lịch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">{filteredEvents.length} sự kiện</Badge>
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
                      <div
                        key={i}
                        className="bg-muted h-16 animate-pulse rounded"
                      />
                    ))}
                  </div>
                ) : (
                  upcomingEvents
                    .slice(0, 5)
                    .map((event, index) => (
                      <EventCard
                        key={`upcoming-${event.id}-${index}`}
                        event={event}
                        onEdit={(event: LunarEvent) =>
                          handleEventAction("edit", event)
                        }
                        onDelete={(eventId: string) =>
                          handleEventAction("delete", eventId)
                        }
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
                <div
                  key={i}
                  className="bg-muted h-32 animate-pulse rounded-lg"
                />
              ))
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={(event: LunarEvent) =>
                    handleEventAction("edit", event)
                  }
                  onDelete={(eventId: string) =>
                    handleEventAction("delete", eventId)
                  }
                  compact={true}
                />
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-semibold">
                    Chưa có sự kiện
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? "Không tìm thấy sự kiện nào khớp"
                      : "Bạn chưa tạo sự kiện âm lịch nào"}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Tạo sự kiện âm lịch đầu tiên
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="shared" className="space-y-6">
          {sharedLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-muted-foreground">Đang tải...</div>
              </CardContent>
            </Card>
          ) : sharedEvents && sharedEvents.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {sharedEvents.length} sự kiện được chia sẻ
                </h3>
                <Button variant="outline" asChild>
                  <Link href="/events/shared">Xem tất cả</Link>
                </Button>
              </div>
              {sharedEvents.slice(0, 10).map((event) => (
                <SharedEventCard key={event.id} event={event} compact />
              ))}
              {sharedEvents.length > 10 && (
                <div className="text-center">
                  <Button variant="outline" asChild>
                    <Link href="/events/shared">
                      Xem thêm {sharedEvents.length - 10} sự kiện
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-semibold">
                  Chưa có sự kiện được chia sẻ
                </h3>
                <p className="text-muted-foreground mb-4">
                  Khi có người chia sẻ sự kiện với bạn và bạn chấp nhận, các sự
                  kiện sẽ xuất hiện ở đây.
                </p>
                <Button asChild>
                  <Link href="/sharing">
                    <Users className="mr-2 h-4 w-4" />
                    Xem lời mời chia sẻ
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <CalendarGrid showEvents={true} showSharedEvents={true} />
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

      <ExportCalendarDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
      />

      <ShareInviteDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />
    </div>
  );
}
