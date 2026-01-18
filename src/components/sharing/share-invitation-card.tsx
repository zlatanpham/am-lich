"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  Check,
  X,
  Clock,
  UserCheck,
  UserX,
  Ban,
  Trash2,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

type ShareStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";

interface SentShareCardProps {
  share: {
    id: string;
    recipientEmail: string;
    status: ShareStatus;
    createdAt: Date;
    recipient?: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    } | null;
    invitation?: {
      expiresAt: Date;
    } | null;
  };
}

interface ReceivedShareCardProps {
  share: {
    id: string;
    status: ShareStatus;
    createdAt: Date;
    owner: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  };
}

const statusConfig: Record<
  ShareStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ElementType;
  }
> = {
  PENDING: { label: "Đang chờ", variant: "secondary", icon: Clock },
  ACCEPTED: { label: "Đã chấp nhận", variant: "default", icon: UserCheck },
  DECLINED: { label: "Đã từ chối", variant: "destructive", icon: UserX },
  CANCELLED: { label: "Đã hủy", variant: "outline", icon: Ban },
};

export function SentShareCard({ share }: SentShareCardProps) {
  const utils = api.useUtils();

  const cancelShare = api.eventSharing.cancelShare.useMutation({
    onSuccess: () => {
      toast.success("Đã hủy chia sẻ");
      void utils.eventSharing.getMyShares.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Không thể hủy chia sẻ");
    },
  });

  const status = statusConfig[share.status];
  const StatusIcon = status.icon;
  const displayName =
    share.recipient?.name || share.recipient?.email || share.recipientEmail;
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={share.recipient?.image || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{displayName}</p>
            <p className="text-muted-foreground text-sm">
              {formatDistanceToNow(new Date(share.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status.variant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
          {(share.status === "PENDING" || share.status === "ACCEPTED") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => cancelShare.mutate({ shareId: share.id })}
              disabled={cancelShare.status === "pending"}
              title="Hủy chia sẻ"
            >
              {cancelShare.status === "pending" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 text-red-500" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ReceivedShareCard({ share }: ReceivedShareCardProps) {
  const utils = api.useUtils();

  const respondToShare = api.eventSharing.respondToShare.useMutation({
    onSuccess: (_, variables) => {
      if (variables.action === "accept") {
        toast.success("Đã chấp nhận lời mời");
      } else {
        toast.success("Đã từ chối lời mời");
      }
      void utils.eventSharing.getSharedWithMe.invalidate();
      void utils.eventSharing.getSharedEvents.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Không thể xử lý lời mời");
    },
  });

  const unsubscribe = api.eventSharing.unsubscribeFromShare.useMutation({
    onSuccess: () => {
      toast.success("Đã hủy theo dõi");
      void utils.eventSharing.getSharedWithMe.invalidate();
      void utils.eventSharing.getSharedEvents.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Không thể hủy theo dõi");
    },
  });

  const status = statusConfig[share.status];
  const StatusIcon = status.icon;
  const displayName = share.owner.name || share.owner.email || "Ai đó";
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const isPending =
    respondToShare.status === "pending" || unsubscribe.status === "pending";

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={share.owner.image || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{displayName}</p>
            <p className="text-muted-foreground text-sm">
              {formatDistanceToNow(new Date(share.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {share.status === "PENDING" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  respondToShare.mutate({
                    shareId: share.id,
                    action: "decline",
                  })
                }
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <X className="mr-1 h-4 w-4" />
                    Từ chối
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  respondToShare.mutate({
                    shareId: share.id,
                    action: "accept",
                  })
                }
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="mr-1 h-4 w-4" />
                    Chấp nhận
                  </>
                )}
              </Button>
            </>
          )}
          {share.status === "ACCEPTED" && (
            <>
              <Badge
                variant={status.variant}
                className="flex items-center gap-1"
              >
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => unsubscribe.mutate({ shareId: share.id })}
                disabled={isPending}
                title="Hủy theo dõi"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-red-500" />
                )}
              </Button>
            </>
          )}
          {(share.status === "DECLINED" || share.status === "CANCELLED") && (
            <Badge variant={status.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
