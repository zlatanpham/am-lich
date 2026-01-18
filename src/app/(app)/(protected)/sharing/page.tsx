"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShareInviteDialog } from "@/components/sharing/share-invite-dialog";
import {
  SentShareCard,
  ReceivedShareCard,
} from "@/components/sharing/share-invitation-card";
import { api } from "@/trpc/react";
import { Plus, Send, Inbox, Users } from "lucide-react";
import { useSession } from "next-auth/react";

export default function SharingPage() {
  const { data: session } = useSession();
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const { data: sentShares, isLoading: sentLoading } =
    api.eventSharing.getMyShares.useQuery({}, { enabled: !!session?.user });

  const { data: receivedShares, isLoading: receivedLoading } =
    api.eventSharing.getSharedWithMe.useQuery({}, { enabled: !!session?.user });

  const pendingReceived = receivedShares?.filter(
    (share) => share.status === "PENDING",
  );
  const acceptedReceived = receivedShares?.filter(
    (share) => share.status === "ACCEPTED",
  );

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chia sẻ sự kiện</h1>
          <p className="text-muted-foreground">
            Quản lý việc chia sẻ sự kiện âm lịch với người khác
          </p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Mời chia sẻ
        </Button>
      </div>

      <Tabs defaultValue="received" className="space-y-6">
        <TabsList>
          <TabsTrigger value="received" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Nhận được
            {pendingReceived && pendingReceived.length > 0 && (
              <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                {pendingReceived.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Đã gửi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="text-muted-foreground h-8 w-8" />
                  <div>
                    <p className="text-2xl font-bold">
                      {acceptedReceived?.length ?? 0}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Đang theo dõi
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Inbox className="text-muted-foreground h-8 w-8" />
                  <div>
                    <p className="text-2xl font-bold">
                      {pendingReceived?.length ?? 0}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Lời mời chờ xử lý
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending invitations */}
          {pendingReceived && pendingReceived.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Inbox className="h-5 w-5" />
                  Lời mời chờ xử lý
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingReceived.map((share) => (
                  <ReceivedShareCard key={share.id} share={share} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Accepted shares */}
          {acceptedReceived && acceptedReceived.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Đang theo dõi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {acceptedReceived.map((share) => (
                  <ReceivedShareCard key={share.id} share={share} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {receivedLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-muted-foreground">Đang tải...</div>
              </CardContent>
            </Card>
          ) : (
            receivedShares?.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Inbox className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-semibold">
                    Chưa có lời mời nào
                  </h3>
                  <p className="text-muted-foreground">
                    Khi có người chia sẻ sự kiện với bạn, lời mời sẽ xuất hiện ở
                    đây.
                  </p>
                </CardContent>
              </Card>
            )
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setShowInviteDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Mời chia sẻ mới
            </Button>
          </div>

          {sentLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-muted-foreground">Đang tải...</div>
              </CardContent>
            </Card>
          ) : sentShares && sentShares.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Send className="h-5 w-5" />
                  Lời mời đã gửi ({sentShares.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sentShares.map((share) => (
                  <SentShareCard key={share.id} share={share} />
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Send className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-semibold">
                  Chưa gửi lời mời nào
                </h3>
                <p className="text-muted-foreground mb-4">
                  Chia sẻ sự kiện của bạn với người thân và bạn bè.
                </p>
                <Button onClick={() => setShowInviteDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Mời chia sẻ
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <ShareInviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />
    </div>
  );
}
