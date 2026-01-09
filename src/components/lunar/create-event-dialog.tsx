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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateEventDialog({
  open,
  onOpenChange,
}: CreateEventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lunarYear, setLunarYear] = useState("");
  const [lunarMonth, setLunarMonth] = useState("");
  const [lunarDay, setLunarDay] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eventType, setEventType] = useState<"general" | "ancestor_worship">(
    "general",
  );
  const [ancestorName, setAncestorName] = useState("");
  const [ancestorPrecall, setAncestorPrecall] = useState("");
  const isMountedRef = useRef(true);

  const createEventMutation = api.lunarEvents.create.useMutation({
    onSuccess: () => {
      if (isMountedRef.current) {
        toast.success("Sự kiện đã được tạo thành công!");
        resetForm();
        onOpenChange(false);
      }
    },
    onError: (error) => {
      if (isMountedRef.current) {
        toast.error("Có lỗi xảy ra khi tạo sự kiện: " + error.message);
      }
    },
  });

  const utils = api.useUtils();

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const resetForm = () => {
    if (isMountedRef.current) {
      setTitle("");
      setDescription("");
      setLunarYear("");
      setLunarMonth("");
      setLunarDay("");
      setIsRecurring(false);
      setEventType("general");
      setAncestorName("");
      setAncestorPrecall("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !lunarYear || !lunarMonth || !lunarDay) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Validate ancestor worship fields
    if (
      eventType === "ancestor_worship" &&
      (!ancestorName.trim() || !ancestorPrecall.trim())
    ) {
      toast.error("Vui lòng điền tên và cách gọi người được giỗ");
      return;
    }

    const year = parseInt(lunarYear);
    const month = parseInt(lunarMonth);
    const day = parseInt(lunarDay);

    if (
      year < 1900 ||
      year > 2100 ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 30
    ) {
      toast.error("Năm, tháng và ngày âm lịch không hợp lệ");
      return;
    }

    if (!isMountedRef.current) return;

    setIsLoading(true);
    try {
      await createEventMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        lunarYear: year,
        lunarMonth: month,
        lunarDay: day,
        isRecurring,
        eventType,
        ancestorName:
          eventType === "ancestor_worship" ? ancestorName.trim() : undefined,
        ancestorPrecall:
          eventType === "ancestor_worship" ? ancestorPrecall.trim() : undefined,
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
          <DialogTitle>Tạo sự kiện âm lịch mới</DialogTitle>
          <DialogDescription>
            Tạo một sự kiện âm lịch để nhận thông báo vào những ngày đặc biệt.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tên sự kiện *</Label>
            <Input
              id="title"
              placeholder="Ví dụ: Sinh nhật mẹ"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả thêm về sự kiện..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Loại sự kiện</Label>
            <RadioGroup
              value={eventType}
              onValueChange={(value) =>
                setEventType(value as "general" | "ancestor_worship")
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="general" id="general" />
                <Label htmlFor="general" className="cursor-pointer font-normal">
                  Sự kiện chung
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="ancestor_worship"
                  id="ancestor_worship"
                />
                <Label
                  htmlFor="ancestor_worship"
                  className="cursor-pointer font-normal"
                >
                  Cúng giỗ
                </Label>
              </div>
            </RadioGroup>
          </div>

          {eventType === "ancestor_worship" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="ancestorPrecall">Cách gọi *</Label>
                <Input
                  id="ancestorPrecall"
                  placeholder="Ví dụ: ông nội, bố, cụ..."
                  value={ancestorPrecall}
                  onChange={(e) => setAncestorPrecall(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ancestorName">Tên người được giỗ *</Label>
                <Input
                  id="ancestorName"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={ancestorName}
                  onChange={(e) => setAncestorName(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="lunarYear">Năm âm lịch *</Label>
            <Input
              id="lunarYear"
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
              <Label htmlFor="lunarMonth">Tháng âm lịch *</Label>
              <Input
                id="lunarMonth"
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
              <Label htmlFor="lunarDay">Ngày âm lịch *</Label>
              <Input
                id="lunarDay"
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

          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
            <Label htmlFor="recurring">Lặp lại hàng năm</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang tạo..." : "Tạo sự kiện"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
