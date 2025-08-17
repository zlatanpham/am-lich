"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface DeleteEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    id: string;
    title: string;
  } | null;
}

export function DeleteEventDialog({
  open,
  onOpenChange,
  event,
}: DeleteEventDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);

  const deleteEventMutation = api.lunarEvents.delete.useMutation({
    onSuccess: () => {
      if (isMountedRef.current) {
        toast.success("Sự kiện đã được xóa thành công!");
        onOpenChange(false);
      }
    },
    onError: (error) => {
      if (isMountedRef.current) {
        toast.error("Có lỗi xảy ra khi xóa sự kiện: " + error.message);
      }
    },
  });

  const utils = api.useUtils();

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleDelete = async () => {
    if (!event || !isMountedRef.current) return;

    setIsLoading(true);
    try {
      await deleteEventMutation.mutateAsync({
        id: event.id,
      });

      // Refetch events to update the list
      if (isMountedRef.current) {
        await utils.lunarEvents.getAll.invalidate();
        await utils.lunarEvents.getUpcoming.invalidate();
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="text-destructive h-5 w-5" />
            Xóa sự kiện
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa sự kiện này không? Hành động này không thể
            hoàn tác.
          </DialogDescription>
        </DialogHeader>

        {event && (
          <div className="py-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-muted-foreground text-sm font-medium">
                Sự kiện sẽ bị xóa:
              </p>
              <p className="mt-1 font-semibold">{event.title}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Đang xóa..." : "Xóa sự kiện"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
