"use client";

import { useState, useEffect } from "react";
import { PetitionerList } from "@/components/prayers/petitioner-list";
import { TemplateCard } from "@/components/prayers/template-card";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PrayersPage() {
  const { data: templates, isLoading: isLoadingTemplates } =
    api.prayers.getTemplates.useQuery();
  const { data: settings, isLoading: isLoadingSettings } =
    api.prayers.getSettings.useQuery();
  const [familySurname, setFamilySurname] = useState("");
  const [address, setAddress] = useState("");

  // Update local state when data is loaded
  useEffect(() => {
    if (settings?.familySurname) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFamilySurname(settings.familySurname);
    }
    if (settings?.address) {
      setAddress(settings.address);
    }
  }, [settings]);

  const utils = api.useUtils();
  const updateSettingsMutation = api.prayers.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Đã lưu cài đặt");
      void utils.prayers.getSettings.invalidate();
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({ familySurname, address });
  };

  const getTemplateContent = (type: string) => {
    return templates?.find(
      (t: { type: string; content: string }) => t.type === type,
    )?.content;
  };

  return (
    <div className="container mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Cấu hình Sớ khấn</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Quản lý tín chủ và các mẫu văn khấn truyền thống
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <PetitionerList />

          <div className="grid gap-6 md:grid-cols-3">
            {isLoadingTemplates ? (
              <>
                <TemplateSkeleton />
                <TemplateSkeleton />
                <TemplateSkeleton />
              </>
            ) : (
              <>
                <TemplateCard
                  type="mong1"
                  title="Mùng 1"
                  description="Văn khấn ngày Mùng Một đầu tháng"
                  content={getTemplateContent("mong1")}
                />
                <TemplateCard
                  type="ram15"
                  title="Ngày Rằm"
                  description="Văn khấn ngày Rằm hàng tháng"
                  content={getTemplateContent("ram15")}
                />
                <TemplateCard
                  type="ancestor"
                  title="Cúng Giỗ"
                  description="Văn khấn ngày Giỗ Tổ Tiên"
                  content={getTemplateContent("ancestor")}
                />
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt chung</CardTitle>
              <CardDescription>
                Thông tin dùng chung cho các mẫu sớ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="surname">Họ gia đình (Ví dụ: họ Nguyễn)</Label>
                {isLoadingSettings ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    id="surname"
                    placeholder="họ Nguyễn, họ Trần..."
                    value={familySurname}
                    onChange={(e) => setFamilySurname(e.target.value)}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ (Nơi cư ngụ hiện tại)</Label>
                {isLoadingSettings ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    id="address"
                    placeholder="Số nhà, đường, xã/phường, quận/huyện..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                )}
              </div>
              <Button
                className="w-full"
                onClick={handleSaveSettings}
                disabled={updateSettingsMutation.isPending || isLoadingSettings}
              >
                <Save className="mr-2 h-4 w-4" />
                Lưu cài đặt
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-sm">
              <p>
                1. Thêm danh sách các thành viên trong gia đình vào mục{" "}
                <strong>Tín chủ</strong>.
              </p>
              <p>
                2. Chọn một người làm <strong>Tín chủ chính</strong> (thường là
                chủ gia đình).
              </p>
              <p>
                3. Nhập <strong>Họ gia đình</strong> để tự động điền vào các mẫu
                văn khấn giỗ.
              </p>
              <p>
                4. Bạn có thể tùy chỉnh nội dung từng mẫu văn khấn bằng cách
                nhấn <strong>Chỉnh sửa</strong>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TemplateSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <Skeleton className="mt-2 h-4 w-full" />
      </CardHeader>
      <CardContent className="flex-1">
        <Skeleton className="h-[150px] w-full rounded-md" />
      </CardContent>
      <CardFooter className="flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-9" />
      </CardFooter>
    </Card>
  );
}
