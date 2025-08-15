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

interface EventDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
}

export function EventDeleteDialog({ open, onOpenChange, event }: EventDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const utils = api.useUtils();

  const deleteEvent = api.event.delete.useMutation({
    onSuccess: () => {
      toast.success("Đã xoá sự kiện thành công!");
      utils.event.list.invalidate();
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
            Bạn có chắc chắn muốn xoá sự kiện này không? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold">{event.title}</h3>
            {event.description && (
              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {new Date(event.date).toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
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