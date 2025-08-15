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
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { format } from "date-fns";

const editEventSchema = z.object({
  title: z.string().min(1, "Tên sự kiện không được để trống"),
  description: z.string().optional(),
  date: z.string().min(1, "Ngày không được để trống"),
  time: z.string().optional(),
});

type EditEventFormData = z.infer<typeof editEventSchema>;

interface EventEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
}

export function EventEditDialog({ open, onOpenChange, event }: EventEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = api.useUtils();

  const form = useForm<EditEventFormData>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
    },
  });

  // Update form when event changes
  useEffect(() => {
    if (event) {
      const eventDate = new Date(event.date);
      form.reset({
        title: event.title || "",
        description: event.description || "",
        date: format(eventDate, "yyyy-MM-dd"),
        time: format(eventDate, "HH:mm"),
      });
    }
  }, [event, form]);

  const updateEvent = api.event.update.useMutation({
    onSuccess: () => {
      toast.success("Đã cập nhật sự kiện thành công!");
      utils.event.list.invalidate();
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

    updateEvent.mutate({
      id: event.id,
      title: data.title,
      description: data.description || null,
      date: dateTime,
    });
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa sự kiện</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin sự kiện của bạn
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
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật sự kiện"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}