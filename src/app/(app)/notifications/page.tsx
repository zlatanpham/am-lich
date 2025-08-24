"use client";

import { useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import {
  Bell,
  Mail,
  Smartphone,
  Check,
  X,
  Settings,
  AlertCircle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  pushNotificationService,
  subscriptionToData,
} from "@/lib/push-notifications";

export default function NotificationsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  // Check notification permission on mount
  React.useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = api.user.getUser.useQuery();

  const {
    data: preferences,
    isLoading: preferencesLoading,
    refetch: refetchPreferences,
  } = api.notifications.getPreferences.useQuery();

  const { data: settingsSummary, refetch: refetchSummary } =
    api.notifications.getSettingsSummary.useQuery();

  const subscribeToPush = api.notifications.subscribeToPush.useMutation({
    onSuccess: () => {
      toast.success("Đã đăng ký thông báo đẩy thành công");
      void refetchSummary();
    },
    onError: (error) => {
      toast.error("Lỗi khi đăng ký thông báo đẩy: " + error.message);
    },
  });

  const unsubscribeFromPush = api.notifications.unsubscribeFromPush.useMutation(
    {
      onSuccess: () => {
        toast.success("Đã hủy đăng ký thông báo đẩy");
        void refetchSummary();
      },
      onError: (error) => {
        toast.error("Lỗi khi hủy đăng ký: " + error.message);
      },
    },
  );

  const updatePreferences = api.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Cài đặt thông báo đã được lưu");
      void refetchPreferences();
      void refetchSummary();
    },
    onError: (error) => {
      toast.error("Lỗi khi lưu cài đặt: " + error.message);
    },
  });

  const testNotification = api.notifications.testNotification.useMutation({
    onSuccess: (result) => {
      if (result.push || result.email) {
        toast.success("Thông báo thử nghiệm đã được gửi");
      } else {
        toast.error(result.error ?? "Gửi thông báo thử nghiệm thất bại");
      }
    },
    onError: (error) => {
      toast.error("Lỗi khi gửi thông báo thử nghiệm: " + error.message);
    },
  });

  const handlePreferenceChange = async (
    field: string,
    value: boolean | number,
  ) => {
    setIsLoading(true);
    try {
      // Special handling for push notifications
      if (field === "enablePushNotifications") {
        if (value) {
          await handleSubscribeToPush();
        } else {
          await handleUnsubscribeFromPush();
        }
      } else {
        await updatePreferences.mutateAsync({ [field]: value });
      }
    } catch {
      // Error is handled by mutation onError
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribeToPush = async () => {
    if (!pushNotificationService.isSupported()) {
      toast.error("Trình duyệt không hỗ trợ thông báo đẩy");
      return;
    }

    try {
      const subscription = await pushNotificationService.subscribe();
      const subscriptionData = subscriptionToData(subscription);

      await subscribeToPush.mutateAsync(subscriptionData);
      await updatePreferences.mutateAsync({ enablePushNotifications: true });
    } catch (error) {
      console.error("Push subscription error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Không thể đăng ký thông báo đẩy");
      }
    }
  };

  const handleUnsubscribeFromPush = async () => {
    try {
      const subscription = await pushNotificationService.getSubscription();
      if (subscription) {
        await pushNotificationService.unsubscribe();
        await unsubscribeFromPush.mutateAsync({
          endpoint: subscription.endpoint,
        });
      }
      await updatePreferences.mutateAsync({ enablePushNotifications: false });
    } catch (error) {
      console.error("Push unsubscribe error:", error);
      toast.error("Không thể hủy đăng ký thông báo đẩy");
    }
  };

  const handleTestNotification = async (type: "push" | "email" | "both") => {
    await testNotification.mutateAsync({
      type,
      message:
        "Đây là thông báo thử nghiệm để xác minh cài đặt thông báo của bạn có hoạt động bình thường không.",
    });
  };

  if (!userLoading && (userError || !user)) {
    router.push("/login");
    return null;
  }

  if (preferencesLoading || userLoading) {
    return (
      <div className="space-y-6 py-6">
        <div className="space-y-2">
          <div className="bg-muted h-8 w-1/3 animate-pulse rounded" />
          <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
        </div>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="bg-muted h-48 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">Cài đặt thông báo</h1>
        <p className="text-muted-foreground">
          Quản lý nhắc nhở sự kiện âm lịch và tùy chọn thông báo của bạn
        </p>
      </div>

      {/* Notification Permission Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            {notificationPermission === "granted" ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : notificationPermission === "denied" ? (
              <X className="h-5 w-5 text-red-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
            <div>
              <p className="font-medium">Browser Permission</p>
              <p className="text-muted-foreground text-sm">
                {notificationPermission === "granted"
                  ? "Notifications allowed"
                  : notificationPermission === "denied"
                    ? "Notifications blocked - please enable in browser settings"
                    : "Permission not requested yet"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Summary */}
      {settingsSummary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                {settingsSummary.notificationChannels.email ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="text-muted-foreground h-5 w-5" />
                )}
                <div>
                  <p className="font-medium">Thông báo email</p>
                  <p className="text-muted-foreground text-sm">
                    {settingsSummary.notificationChannels.email
                      ? "Đã bật"
                      : "Đã tắt"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                {settingsSummary.notificationChannels.push ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="text-muted-foreground h-5 w-5" />
                )}
                <div>
                  <p className="font-medium">Thông báo đẩy</p>
                  <p className="text-muted-foreground text-sm">
                    {settingsSummary.hasActivePushSubscriptions
                      ? `${settingsSummary.pushSubscriptionsCount} thiết bị`
                      : "Chưa đăng ký"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Nhắc nhở mặc định</p>
                  <p className="text-muted-foreground text-sm">
                    Trước {preferences?.defaultReminderDays} ngày
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Thông báo email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="email-notifications">Bật thông báo email</Label>
              <p className="text-muted-foreground text-sm">
                Nhận nhắc nhở sự kiện âm lịch qua email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences?.enableEmailNotifications ?? false}
              onCheckedChange={(checked) =>
                handlePreferenceChange("enableEmailNotifications", checked)
              }
              disabled={isLoading}
            />
          </div>

          {preferences?.enableEmailNotifications && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestNotification("email")}
                disabled={testNotification.isPending}
              >
                Gửi email thử nghiệm
              </Button>
              <Badge variant="secondary">Đang phát triển</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Thông báo đẩy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="push-notifications">Bật thông báo đẩy</Label>
              <p className="text-muted-foreground text-sm">
                Nhận nhắc nhở thời gian thực trên thiết bị
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={preferences?.enablePushNotifications ?? false}
              onCheckedChange={(checked) =>
                handlePreferenceChange("enablePushNotifications", checked)
              }
              disabled={isLoading}
            />
          </div>

          {preferences?.enablePushNotifications && (
            <>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">
                    Trạng thái đăng ký
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  {settingsSummary?.hasActivePushSubscriptions
                    ? `Bạn đã đăng ký thông báo đẩy trên ${settingsSummary.pushSubscriptionsCount} thiết bị`
                    : "Bạn chưa đăng ký thông báo đẩy. Nhấp vào nút bên dưới để bắt đầu đăng ký."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!settingsSummary?.hasActivePushSubscriptions && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSubscribeToPush}
                    disabled={isLoading || subscribeToPush.isPending}
                  >
                    {subscribeToPush.isPending
                      ? "Đang đăng ký..."
                      : "Đăng ký ngay"}
                  </Button>
                )}

                {settingsSummary?.hasActivePushSubscriptions && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestNotification("push")}
                      disabled={testNotification.isPending}
                    >
                      Gửi thông báo thử nghiệm
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUnsubscribeFromPush}
                      disabled={isLoading || unsubscribeFromPush.isPending}
                    >
                      Hủy đăng ký
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Reminder Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cài đặt nhắc nhở
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Thời gian nhắc nhở mặc định</Label>
                <p className="text-muted-foreground text-sm">
                  Thời gian nhắc nhở mặc định cho sự kiện mới tạo
                </p>
              </div>
              <Select
                value={preferences?.defaultReminderDays?.toString() ?? "3"}
                onValueChange={(value) =>
                  handlePreferenceChange("defaultReminderDays", parseInt(value))
                }
                disabled={isLoading}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 ngày trước</SelectItem>
                  <SelectItem value="3">3 ngày trước</SelectItem>
                  <SelectItem value="7">1 tuần trước</SelectItem>
                  <SelectItem value="14">2 tuần trước</SelectItem>
                  <SelectItem value="30">1 tháng trước</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-base">
                Nhắc nhở ngày âm lịch quan trọng
              </Label>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="remind-1st">Nhắc nhở mồng 1 âm lịch</Label>
                  <p className="text-muted-foreground text-sm">
                    Nhắc nhở mồng 1 âm lịch hàng tháng (ngày sóc)
                  </p>
                </div>
                <Switch
                  id="remind-1st"
                  checked={preferences?.remindFor1stDay ?? false}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("remindFor1stDay", checked)
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="remind-15th">Nhắc nhở rằm âm lịch</Label>
                  <p className="text-muted-foreground text-sm">
                    Nhắc nhở rằm âm lịch hàng tháng (ngày vọng)
                  </p>
                </div>
                <Switch
                  id="remind-15th"
                  checked={preferences?.remindFor15thDay ?? false}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("remindFor15thDay", checked)
                  }
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Cài đặt nâng cao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="mb-2 font-medium">Kiểm soát tần suất thông báo</h4>
              <p className="text-muted-foreground mb-3 text-sm">
                Tránh thông báo quá thường xuyên, duy trì trải nghiệm sử dụng
                tốt.
              </p>
              <Badge variant="secondary">Sắp ra mắt</Badge>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="mb-2 font-medium">Chế độ không làm phiền</h4>
              <p className="text-muted-foreground mb-3 text-sm">
                Thiết lập tạm dừng nhắc nhở thông báo trong khoảng thời gian cụ
                thể.
              </p>
              <Badge variant="secondary">Sắp ra mắt</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
