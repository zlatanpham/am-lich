"use client";

import { useState } from "react";
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
import { api } from "@/trpc/react";
import { toast } from "sonner";

const createEventSchema = z.object({
  title: z.string().min(1, "Tên sự kiện không được để trống"),
  description: z.string().optional(),
  date: z.string().min(1, "Ngày không được để trống"),
  time: z.string().optional(),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

interface EventCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventCreateDialog({ open, onOpenChange }: EventCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = api.useUtils();

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
    },
  });

  const createEvent = api.event.create.useMutation({
    onSuccess: () => {
      toast.success("Đã tạo sự kiện thành công!");
      utils.event.list.invalidate();
      form.reset();
      onOpenChange(false);
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(error.message || "Có lỗi xảy ra khi tạo sự kiện");
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: CreateEventFormData) => {
    setIsSubmitting(true);
    
    // Combine date and time if time is provided
    const dateTime = new Date(data.date);
    if (data.time) {
      const timeParts = data.time.split(':');
      const hours = parseInt(timeParts[0] || '0', 10);
      const minutes = parseInt(timeParts[1] || '0', 10);
      if (!isNaN(hours) && !isNaN(minutes)) {
        dateTime.setHours(hours, minutes);
      }
    }

    createEvent.mutate({
      title: data.title,
      description: data.description || null,
      date: dateTime,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo sự kiện mới</DialogTitle>
          <DialogDescription>
            Thêm sự kiện cá nhân để nhớ những ngày quan trọng theo âm lịch
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ (tuỳ chọn)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Huỷ
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang tạo..." : "Tạo sự kiện"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}