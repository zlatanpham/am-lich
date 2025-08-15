"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export function EventsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [deletingEvent, setDeletingEvent] = useState<any>(null);

  const { data: events, isLoading } = api.event.list.useQuery();

  const filteredEvents = events?.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const upcomingEvents = filteredEvents.filter(event => 
    new Date(event.date) >= new Date()
  );

  const pastEvents = filteredEvents.filter(event => 
    new Date(event.date) < new Date()
  );

  const handleEdit = (event: any) => {
    setEditingEvent(event);
  };

  const handleDelete = (event: any) => {
    setDeletingEvent(event);
  };

  const EventItem = ({ event }: { event: any }) => (
    <Card key={event.id}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            {event.description && (
              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {format(new Date(event.date), "EEEE, dd/MM/yyyy", { locale: vi })}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {format(new Date(event.date), "HH:mm", { locale: vi })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(event)}
            >
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
          <p className="text-muted-foreground">
            Quản lý các sự kiện cá nhân
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo sự kiện mới
        </Button>
      </div>

      {/* Search */}
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

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có sự kiện</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Không tìm thấy sự kiện nào khớp" : "Bạn chưa tạo sự kiện nào"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
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
                {upcomingEvents.map(event => (
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
                {pastEvents.slice(0, 5).map(event => (
                  <EventItem key={event.id} event={event} />
                ))}
                {pastEvents.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
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
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Tổng số sự kiện</p>
                <p className="text-2xl font-bold">{events?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Sự kiện sắp tới</p>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Sự kiện đã qua</p>
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