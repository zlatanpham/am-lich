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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    id: string;
    title: string;
    description?: string | null | undefined;
    lunarYear: number;
    lunarMonth: number;
    lunarDay: number;
    isRecurring: boolean;
    reminderDays: number;
  } | null;
}

export function EditEventDialog({ open, onOpenChange, event }: EditEventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lunarYear, setLunarYear] = useState("");
  const [lunarMonth, setLunarMonth] = useState("");
  const [lunarDay, setLunarDay] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [reminderDays, setReminderDays] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);

  const updateEventMutation = api.lunarEvents.update.useMutation({
    onSuccess: () => {
      if (isMountedRef.current) {
        toast.success("Sự kiện đã được cập nhật thành công!");
        onOpenChange(false);
      }
    },
    onError: (error) => {
      if (isMountedRef.current) {
        toast.error("Có lỗi xảy ra khi cập nhật sự kiện: " + error.message);
      }
    },
  });

  const utils = api.useUtils();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Reset form when event changes
  useEffect(() => {
    if (isMountedRef.current) {
      if (event) {
        setTitle(event.title);
        setDescription(event.description ?? "");
        setLunarYear(event.lunarYear.toString());
        setLunarMonth(event.lunarMonth.toString());
        setLunarDay(event.lunarDay.toString());
        setIsRecurring(event.isRecurring);
        setReminderDays(event.reminderDays.toString());
      } else {
        resetForm();
      }
    }
  }, [event]);

  const resetForm = () => {
    if (isMountedRef.current) {
      setTitle("");
      setDescription("");
      setLunarYear("");
      setLunarMonth("");
      setLunarDay("");
      setIsRecurring(false);
      setReminderDays("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event || !title.trim() || !lunarYear || !lunarMonth || !lunarDay) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const year = parseInt(lunarYear);
    const month = parseInt(lunarMonth);
    const day = parseInt(lunarDay);
    const reminder = parseInt(reminderDays) || 3;

    if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 30) {
      toast.error("Năm, tháng và ngày âm lịch không hợp lệ");
      return;
    }

    if (reminder < 1 || reminder > 30) {
      toast.error("Số ngày nhắc nhở phải từ 1 đến 30");
      return;
    }

    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    try {
      await updateEventMutation.mutateAsync({
        id: event.id,
        title: title.trim(),
        description: description.trim() || undefined,
        lunarYear: year,
        lunarMonth: month,
        lunarDay: day,
        isRecurring,
        reminderDays: reminder,
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
          <DialogTitle>Chỉnh sửa sự kiện</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin sự kiện âm lịch của bạn.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Tên sự kiện *</Label>
            <Input
              id="edit-title"
              placeholder="Ví dụ: Sinh nhật mẹ"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Mô tả</Label>
            <Textarea
              id="edit-description"
              placeholder="Mô tả thêm về sự kiện..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-lunarYear">Năm âm lịch *</Label>
            <Input
              id="edit-lunarYear"
              type="number"
              min="1900"
              max="2100"
              placeholder={`Ví dụ: ${new Date().getFullYear()}`}
              value={lunarYear}
              onChange={(e) => setLunarYear(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-lunarMonth">Tháng âm lịch *</Label>
              <Input
                id="edit-lunarMonth"
                type="number"
                min="1"
                max="12"
                placeholder="1-12"
                value={lunarMonth}
                onChange={(e) => setLunarMonth(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lunarDay">Ngày âm lịch *</Label>
              <Input
                id="edit-lunarDay"
                type="number"
                min="1"
                max="30"
                placeholder="1-30"
                value={lunarDay}
                onChange={(e) => setLunarDay(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-reminderDays">Nhắc nhở trước (ngày)</Label>
            <Input
              id="edit-reminderDays"
              type="number"
              min="1"
              max="30"
              placeholder="3"
              value={reminderDays}
              onChange={(e) => setReminderDays(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="edit-recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
            <Label htmlFor="edit-recurring">
              Lặp lại hàng năm
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}