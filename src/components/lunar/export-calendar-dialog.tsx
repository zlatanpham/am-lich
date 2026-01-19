"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/trpc/react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExportCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportCalendarDialog({
  open,
  onOpenChange,
}: ExportCalendarDialogProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [includeLunarEvents, setIncludeLunarEvents] = useState(true);
  const [includePersonalEvents, setIncludePersonalEvents] = useState(true);
  const [includeSharedEvents, setIncludeSharedEvents] = useState(true);

  const exportMutation = api.calendarExport.exportYear.useMutation({
    onSuccess: (data) => {
      // Create and download the ICS file
      const blob = new Blob([data.content], { type: "text/calendar" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Đã xuất ${data.eventCount} sự kiện cho năm ${data.year}`);

      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Có lỗi xảy ra khi xuất lịch");
    },
  });

  const handleExport = () => {
    if (!includeLunarEvents && !includePersonalEvents && !includeSharedEvents) {
      toast.error("Vui lòng chọn ít nhất một loại sự kiện để xuất");
      return;
    }

    exportMutation.mutate({
      year: parseInt(selectedYear),
      includeLunarEvents,
      includePersonalEvents,
      includeSharedEvents,
    });
  };

  // Generate year options (current year ± 5 years)
  const yearOptions = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    yearOptions.push(i);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xuất lịch âm</DialogTitle>
          <DialogDescription>
            Xuất các sự kiện âm lịch để nhập vào Google Calendar, Apple Calendar
            hoặc các ứng dụng lịch khác.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Year Selection */}
          <div className="space-y-2">
            <Label htmlFor="year-select">Chọn năm</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn năm" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                    {year === currentYear && " (hiện tại)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Event Type Selection */}
          <div className="space-y-3">
            <Label>Loại sự kiện</Label>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="lunar-events"
                checked={includeLunarEvents}
                onCheckedChange={(checked) => setIncludeLunarEvents(!!checked)}
              />
              <Label htmlFor="lunar-events" className="text-sm font-normal">
                Sự kiện âm lịch (Mồng 1, Rằm)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="personal-events"
                checked={includePersonalEvents}
                onCheckedChange={(checked) =>
                  setIncludePersonalEvents(!!checked)
                }
              />
              <Label htmlFor="personal-events" className="text-sm font-normal">
                Sự kiện cá nhân
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="shared-events"
                checked={includeSharedEvents}
                onCheckedChange={(checked) => setIncludeSharedEvents(!!checked)}
              />
              <Label htmlFor="shared-events" className="text-sm font-normal">
                Sự kiện được chia sẻ
              </Label>
            </div>
          </div>

          {/* Info about export format */}
          <div className="bg-muted rounded-lg p-3">
            <h4 className="mb-2 text-sm font-medium">Định dạng xuất</h4>
            <p className="text-muted-foreground text-sm">
              File sẽ được xuất dưới định dạng iCalendar (.ics) có thể nhập vào:
            </p>
            <ul className="text-muted-foreground mt-1 list-inside list-disc text-sm">
              <li>Google Calendar</li>
              <li>Apple Calendar</li>
              <li>Microsoft Outlook</li>
              <li>Các ứng dụng lịch khác hỗ trợ định dạng iCalendar</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="gap-2"
          >
            {exportMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {exportMutation.isPending ? "Đang xuất..." : "Xuất lịch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
