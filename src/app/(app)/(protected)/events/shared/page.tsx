"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SharerGroup } from "@/components/sharing/sharer-group";
import { api } from "@/trpc/react";
import { Users, ArrowLeft, Calendar } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function SharedEventsPage() {
  const { data: session } = useSession();

  const { data: sharedEvents, isLoading } =
    api.eventSharing.getSharedEvents.useQuery({}, { enabled: !!session?.user });

  // Group events by sharer
  const eventsBySharer = useMemo(() => {
    if (!sharedEvents) return new Map();

    const grouped = new Map<
      string,
      {
        sharer: {
          id: string;
          name: string | null;
          email: string | null;
          image: string | null;
        };
        events: typeof sharedEvents;
      }
    >();

    for (const event of sharedEvents) {
      if (!event.sharedBy) continue;

      const sharerId = event.sharedBy.id;
      if (!grouped.has(sharerId)) {
        grouped.set(sharerId, {
          sharer: event.sharedBy,
          events: [],
        });
      }
      grouped.get(sharerId)!.events.push(event);
    }

    return grouped;
  }, [sharedEvents]);

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/events">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Sự kiện được chia sẻ</h1>
            <p className="text-muted-foreground">
              Xem các sự kiện âm lịch được chia sẻ bởi người khác
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/sharing">
            <Users className="mr-2 h-4 w-4" />
            Quản lý chia sẻ
          </Link>
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="text-muted-foreground h-8 w-8" />
              <div>
                <p className="text-2xl font-bold">{eventsBySharer.size}</p>
                <p className="text-muted-foreground text-sm">Người chia sẻ</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-muted-foreground h-8 w-8" />
              <div>
                <p className="text-2xl font-bold">
                  {sharedEvents?.length ?? 0}
                </p>
                <p className="text-muted-foreground text-sm">Tổng sự kiện</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events grouped by sharer */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">Đang tải...</div>
          </CardContent>
        </Card>
      ) : eventsBySharer.size > 0 ? (
        <div className="space-y-4">
          {Array.from(eventsBySharer.values()).map(({ sharer, events }) => (
            <SharerGroup key={sharer.id} sharer={sharer} events={events} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">
              Chưa có sự kiện được chia sẻ
            </h3>
            <p className="text-muted-foreground mb-4">
              Khi có người chia sẻ sự kiện với bạn và bạn chấp nhận, các sự kiện
              sẽ xuất hiện ở đây.
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
    </div>
  );
}
