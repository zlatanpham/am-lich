"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SharedEventCard } from "./shared-event-card";
import { ChevronDown, ChevronUp, Calendar } from "lucide-react";

interface SharedEvent {
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
}

interface SharerGroupProps {
  sharer: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  events: SharedEvent[];
  defaultExpanded?: boolean;
}

export function SharerGroup({
  sharer,
  events,
  defaultExpanded = true,
}: SharerGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const sharerName = sharer.name || sharer.email || "Ai đó";
  const initials =
    sharerName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <Card>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={sharer.image || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{sharerName}</CardTitle>
              <p className="text-muted-foreground text-sm">
                {events.length} sự kiện được chia sẻ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Calendar className="mr-1 h-3 w-3" />
              {events.length}
            </Badge>
            <Button variant="ghost" size="icon">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-3 pt-0">
          {events.map((event) => (
            <SharedEventCard key={event.id} event={event} compact />
          ))}
        </CardContent>
      )}
    </Card>
  );
}
