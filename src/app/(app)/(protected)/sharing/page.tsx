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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Chia sẻ sự kiện</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Quản lý việc chia sẻ sự kiện âm lịch với người khác
          </p>
        </div>
        <Button
          onClick={() => setShowInviteDialog(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Mời chia sẻ
        </Button>
      </div>

      <Tabs defaultValue="received" className="space-y-6">
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger
            value="received"
            className="flex items-center gap-1 sm:gap-2"
          >
            <Inbox className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Nhận được</span>
            {pendingReceived && pendingReceived.length > 0 && (
              <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                {pendingReceived.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="sent"
            className="flex items-center gap-1 sm:gap-2"
          >
            <Send className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Đã gửi</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col items-center gap-1 text-center">
                  <Users className="text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
                  <p className="text-muted-foreground text-xs leading-tight">
                    Đang theo dõi
                  </p>
                  <p className="text-lg font-bold sm:text-2xl">
                    {acceptedReceived?.length ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col items-center gap-1 text-center">
                  <Inbox className="text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
                  <p className="text-muted-foreground text-xs leading-tight">
                    Lời mời chờ xử lý
                  </p>
                  <p className="text-lg font-bold sm:text-2xl">
                    {pendingReceived?.length ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending invitations */}
          {pendingReceived && pendingReceived.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Inbox className="h-4 w-4" />
                  Lời mời chờ xử lý
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y px-4 pb-2">
                {pendingReceived.map((share) => (
                  <ReceivedShareCard key={share.id} share={share} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Accepted shares */}
          {acceptedReceived && acceptedReceived.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  Đang theo dõi
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y px-4 pb-2">
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
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Send className="h-4 w-4" />
                  Lời mời đã gửi ({sentShares.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y px-4 pb-2">
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
