"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface LunarEvent {
  id: string;
  title: string;
  description?: string | null;
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isRecurring: boolean;
  gregorianDate?: Date;
  lunarDateFormatted?: string;
}

interface EventDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: LunarEvent | null;
}

export function EventDeleteDialog({
  open,
  onOpenChange,
  event,
}: EventDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const utils = api.useUtils();

  const deleteEvent = api.lunarEvents.delete.useMutation({
    onSuccess: () => {
      toast.success("Đã xoá sự kiện thành công!");
      void utils.lunarEvents.getAll.invalidate();
      void utils.lunarEvents.getUpcoming.invalidate();
      void utils.lunarEvents.getByDateRange.invalidate();
      onOpenChange(false);
      setIsDeleting(false);
    },
    onError: (error) => {
      toast.error(error.message || "Có lỗi xảy ra khi xoá sự kiện");
      setIsDeleting(false);
    },
  });

  const handleDelete = async () => {
    if (!event) return;

    setIsDeleting(true);
    deleteEvent.mutate({ id: event.id });
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Xoá sự kiện
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xoá sự kiện này không? Hành động này không thể
            hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="font-semibold">{event.title}</h3>
            {event.description && (
              <p className="text-muted-foreground mt-1 text-sm">
                {event.description}
              </p>
            )}
            <p className="text-muted-foreground mt-2 text-sm">
              <span className="font-medium">
                {event.lunarDateFormatted ??
                  `Âm lịch năm ${event.lunarYear} tháng ${event.lunarMonth} ngày ${event.lunarDay}`}
              </span>
              {event.gregorianDate && (
                <span className="mt-1 block text-xs">
                  Dương lịch:{" "}
                  {new Date(event.gregorianDate).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Huỷ
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xoá..." : "Xoá sự kiện"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
