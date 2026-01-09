"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { generatePrayer, type Petitioner } from "@/lib/prayer-utils";
import { Copy, Check, Printer, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface PrayerPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "mong1" | "ram15" | "ancestor";
  lunarDate: {
    day: number;
    month: number;
    year: number;
    dayName: string;
    monthName: string;
    yearName: string;
    solarDate: Date;
  };
  ancestorName?: string;
  ancestorPrecall?: string;
}

export function PrayerPreviewDialog({
  open,
  onOpenChange,
  type,
  lunarDate,
  ancestorName,
  ancestorPrecall,
}: PrayerPreviewDialogProps) {
  const [copied, setCopied] = useState(false);
  const [renderedContent, setRenderedContent] = useState("");

  const { data: petitioners, isLoading: loadingPetitioners } =
    api.prayers.getPetitioners.useQuery(undefined, { enabled: open });
  const { data: templates, isLoading: loadingTemplates } =
    api.prayers.getTemplates.useQuery(undefined, { enabled: open });
  const { data: settings, isLoading: loadingSettings } =
    api.prayers.getSettings.useQuery(undefined, { enabled: open });

  useEffect(() => {
    if (petitioners && templates && open) {
      const customTemplate = templates.find(
        (t: { type: string; content: string }) => t.type === type,
      )?.content;

      const content = generatePrayer(
        type,
        {
          ngayAmLich: lunarDate.dayName,
          thangAmLich: lunarDate.monthName,
          namAmLich: lunarDate.yearName,
          ngayDuongLich: lunarDate.solarDate.toLocaleDateString("vi-VN"),
          petitioners: petitioners as Petitioner[],
          familySurname: settings?.familySurname || undefined,
          address: settings?.address || undefined,
          tenToTien: ancestorName,
          danhXungToTien: ancestorPrecall,
          currentLunarYear: lunarDate.year,
        },
        customTemplate,
      );

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRenderedContent(content);
    }
  }, [
    petitioners,
    templates,
    settings,
    open,
    type,
    lunarDate,
    ancestorName,
    ancestorPrecall,
  ]);

  const handleCopy = () => {
    void navigator.clipboard.writeText(renderedContent);
    setCopied(true);
    toast.success("Đã sao chép vào bộ nhớ tạm");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Sớ khấn - ${lunarDate.solarDate.toLocaleDateString("vi-VN")}</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.8; font-size: 18px; }
              .content { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <div class="content">${renderedContent}</div>
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const isLoading = loadingPetitioners || loadingTemplates || loadingSettings;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            Nội dung Sớ khấn
          </DialogTitle>
        </DialogHeader>

        <div className="bg-muted/30 min-h-[300px] flex-1 overflow-y-auto rounded-md p-6 font-serif text-lg leading-relaxed whitespace-pre-wrap">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            renderedContent ||
            "Không thể tạo nội dung. Vui lòng kiểm tra lại cấu hình."
          )}
        </div>

        <DialogFooter className="mt-4 flex flex-row justify-between gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={isLoading || !renderedContent}
          >
            <Printer className="mr-2 h-4 w-4" />
            In sớ
          </Button>
          <Button onClick={handleCopy} disabled={isLoading || !renderedContent}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Đã sao chép" : "Sao chép"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
