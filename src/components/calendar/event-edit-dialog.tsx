"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";
import { toast } from "sonner";

const editEventSchema = z.object({
  title: z.string().min(1, "Tên sự kiện không được để trống"),
  description: z.string().optional(),
  lunarYear: z
    .number()
    .min(1900, "Năm phải từ 1900 trở lên")
    .max(2100, "Năm phải nhỏ hơn 2100"),
  lunarMonth: z
    .number()
    .min(1, "Tháng phải từ 1-12")
    .max(12, "Tháng phải từ 1-12"),
  lunarDay: z.number().min(1, "Ngày phải từ 1-30").max(30, "Ngày phải từ 1-30"),
  isRecurring: z.boolean().optional(),
});

type EditEventFormData = z.infer<typeof editEventSchema>;

interface LunarEvent {
  id: string;
  title: string;
  description?: string | null;
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isRecurring: boolean;
}

interface EventEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: LunarEvent | null;
}

export function EventEditDialog({
  open,
  onOpenChange,
  event,
}: EventEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = api.useUtils();

  const form = useForm<EditEventFormData>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      title: "",
      description: "",
      lunarYear: new Date().getFullYear(),
      lunarMonth: 1,
      lunarDay: 1,
      isRecurring: false,
    },
  });

  // Update form when event changes
  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title ?? "",
        description: event.description ?? "",
        lunarYear: event.lunarYear ?? new Date().getFullYear(),
        lunarMonth: event.lunarMonth ?? 1,
        lunarDay: event.lunarDay ?? 1,
        isRecurring: event.isRecurring ?? false,
      });
    }
  }, [event, form]);

  const updateEvent = api.lunarEvents.update.useMutation({
    onSuccess: () => {
      toast.success("Đã cập nhật sự kiện thành công!");
      void utils.lunarEvents.getAll.invalidate();
      void utils.lunarEvents.getUpcoming.invalidate();
      onOpenChange(false);
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật sự kiện");
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: EditEventFormData) => {
    if (!event) return;

    setIsSubmitting(true);

    updateEvent.mutate({
      id: event.id,
      title: data.title,
      description: data.description ?? undefined,
      lunarYear: data.lunarYear,
      lunarMonth: data.lunarMonth,
      lunarDay: data.lunarDay,
      isRecurring: data.isRecurring ?? false,
    });
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa sự kiện âm lịch</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin sự kiện âm lịch của bạn
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên sự kiện</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Sinh nhật mẹ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả (tuỳ chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ghi chú thêm về sự kiện..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lunarYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Năm âm lịch</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1900"
                      max="2100"
                      placeholder={`Ví dụ: ${new Date().getFullYear()}`}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lunarMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tháng âm lịch</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        placeholder="1-12"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lunarDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày âm lịch</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        placeholder="1-30"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Lặp lại hàng năm</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Huỷ
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật sự kiện"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
