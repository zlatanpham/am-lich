"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  const { data: status, refetch: refetchStatus } =
    api.push.getStatus.useQuery();
  const { data: vapidKey } = api.push.getVapidPublicKey.useQuery();

  const subscribeMutation = api.push.subscribe.useMutation({
    onSuccess: () => {
      toast.success("Đăng ký nhận thông báo thành công!");
      void refetchStatus();
    },
    onError: (error: { message: string }) => {
      toast.error("Lỗi đăng ký: " + error.message);
    },
  });

  const unsubscribeMutation = api.push.unsubscribe.useMutation({
    onSuccess: () => {
      toast.success("Đã hủy đăng ký nhận thông báo");
      void refetchStatus();
    },
    onError: (error: { message: string }) => {
      toast.error("Lỗi hủy đăng ký: " + error.message);
    },
  });

  useEffect(() => {
    // Check if push notifications are supported
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = useCallback(async () => {
    if (!vapidKey?.publicKey) {
      toast.error("Không tìm thấy khóa VAPID");
      return;
    }

    setIsSubscribing(true);

    try {
      // Request permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        toast.error("Vui lòng cho phép thông báo trong cài đặt trình duyệt");
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          vapidKey.publicKey,
        ) as unknown as BufferSource,
      });

      // Send subscription to server
      const subJson = subscription.toJSON();
      if (subJson.keys?.p256dh && subJson.keys?.auth) {
        await subscribeMutation.mutateAsync({
          endpoint: subscription.endpoint,
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        });
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Không thể đăng ký nhận thông báo");
    } finally {
      setIsSubscribing(false);
    }
  }, [vapidKey, subscribeMutation]);

  const unsubscribeFromPush = useCallback(async () => {
    setIsUnsubscribing(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      await unsubscribeMutation.mutateAsync();
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast.error("Không thể hủy đăng ký");
    } finally {
      setIsUnsubscribing(false);
    }
  }, [unsubscribeMutation]);

  if (!isSupported) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <AlertCircle className="h-4 w-4" />
        <span>Trình duyệt không hỗ trợ thông báo đẩy</span>
      </div>
    );
  }

  const isSubscribed = status?.isSubscribed ?? false;

  if (permission === "denied") {
    return (
      <div className="text-destructive flex items-center gap-2 text-sm">
        <AlertCircle className="h-4 w-4" />
        <span>Thông báo bị chặn. Vui lòng bật trong cài đặt trình duyệt.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isSubscribed
                ? "bg-green-100 text-green-600"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isSubscribed ? (
              <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="font-medium">
              {isSubscribed ? "Đã bật thông báo" : "Thông báo đẩy"}
            </p>
            <p className="text-muted-foreground text-sm">
              {isSubscribed
                ? "Bạn sẽ nhận thông báo về sự kiện sắp tới"
                : "Nhận thông báo về sự kiện âm lịch quan trọng"}
            </p>
          </div>
        </div>

        {isSubscribed ? (
          <Button
            variant="outline"
            size="sm"
            onClick={unsubscribeFromPush}
            disabled={isUnsubscribing}
          >
            {isUnsubscribing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang hủy...
              </>
            ) : (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                Tắt thông báo
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={subscribeToPush}
            disabled={isSubscribing || !vapidKey}
          >
            {isSubscribing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang đăng ký...
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Bật thông báo
              </>
            )}
          </Button>
        )}
      </div>

      {isSubscribed && status?.preferences?.enabled && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>Thông báo sẽ gửi vào khoảng 09:00 hàng ngày</span>
        </div>
      )}
    </div>
  );
}
