"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Clock, Calendar, Users, Moon, Heart, Info } from "lucide-react";
import { PushNotificationManager } from "./push-notification-manager";
import { toast } from "sonner";

interface Preferences {
  enabled: boolean;
  notificationTime: string;
  personalEvents: boolean;
  sharedEvents: boolean;
  systemEvents: boolean;
  ancestorWorshipEvents: boolean;
  badgeCount: number;
}

export function NotificationSettings() {
  const { data: preferences, refetch: refetchPreferences } =
    api.notificationPreferences.getPreferences.useQuery();

  const updateMutation =
    api.notificationPreferences.updatePreferences.useMutation({
      onSuccess: () => {
        toast.success("Đã cập nhật cài đặt thông báo");
        void refetchPreferences();
      },
      onError: (error: { message: string }) => {
        toast.error("Lỗi cập nhật: " + error.message);
      },
    });

  const handleToggle = (key: keyof Preferences, value: boolean) => {
    updateMutation.mutate({ [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Cài đặt thông báo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Push Notification Subscription */}
        <PushNotificationManager />

        <Separator />

        {/* Fixed Notification Schedule Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="text-muted-foreground h-4 w-4" />
            <Label className="font-medium">Thờii gian thông báo</Label>
          </div>
          <div className="bg-muted space-y-2 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-primary text-2xl font-bold">09:00</span>
              <span className="text-muted-foreground">mỗi ngày</span>
            </div>
            <div className="text-muted-foreground flex items-start gap-2 text-sm">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>Thông báo sẽ được gửi vào khoảng 9:00 sáng hàng ngày.</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Event Type Toggles */}
        <div className="space-y-4">
          <p className="font-medium">Loại sự kiện nhận thông báo</p>

          <div className="space-y-3">
            {/* Personal Events */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <Label htmlFor="personal-events" className="cursor-pointer">
                    Sự kiện cá nhân
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Sự kiện âm lịch bạn đã tạo
                  </p>
                </div>
              </div>
              <Switch
                id="personal-events"
                checked={preferences?.personalEvents ?? true}
                onCheckedChange={(checked) =>
                  handleToggle("personalEvents", checked)
                }
                disabled={updateMutation.isPending}
              />
            </div>

            {/* Shared Events */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <Label htmlFor="shared-events" className="cursor-pointer">
                    Sự kiện được chia sẻ
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Sự kiện từ ngườii khác chia sẻ với bạn
                  </p>
                </div>
              </div>
              <Switch
                id="shared-events"
                checked={preferences?.sharedEvents ?? true}
                onCheckedChange={(checked) =>
                  handleToggle("sharedEvents", checked)
                }
                disabled={updateMutation.isPending}
              />
            </div>

            {/* System Events */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                  <Moon className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <Label htmlFor="system-events" className="cursor-pointer">
                    Sự kiện hệ thống
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Mồng 1, Rằm và ngày lễ quan trọng
                  </p>
                </div>
              </div>
              <Switch
                id="system-events"
                checked={preferences?.systemEvents ?? true}
                onCheckedChange={(checked) =>
                  handleToggle("systemEvents", checked)
                }
                disabled={updateMutation.isPending}
              />
            </div>

            {/* Ancestor Worship Events */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                  <Heart className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <Label htmlFor="ancestor-events" className="cursor-pointer">
                    Sự kiện cúng giỗ
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Ngày giỗ, cúng bái tổ tiên
                  </p>
                </div>
              </div>
              <Switch
                id="ancestor-events"
                checked={preferences?.ancestorWorshipEvents ?? true}
                onCheckedChange={(checked) =>
                  handleToggle("ancestorWorshipEvents", checked)
                }
                disabled={updateMutation.isPending}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
