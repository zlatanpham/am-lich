"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, FileText, RotateCcw } from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface TemplateCardProps {
  type: "mong1" | "ram15" | "ancestor";
  title: string;
  description: string;
  content?: string | null;
}

export function TemplateCard({
  type,
  title,
  description,
  content,
}: TemplateCardProps) {
  const utils = api.useUtils();
  const resetMutation = api.prayers.resetTemplate.useMutation({
    onSuccess: () => {
      toast.success("Đã khôi phục mẫu mặc định");
      void utils.prayers.getTemplates.invalidate();
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });

  const handleReset = () => {
    if (
      confirm(
        "Bạn có chắc chắn muốn khôi phục mẫu mặc định cho loại này? Mọi chỉnh sửa của bạn sẽ bị mất.",
      )
    ) {
      resetMutation.mutate({ type });
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <FileText className="text-muted-foreground h-5 w-5" />
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="bg-muted relative h-[150px] overflow-hidden rounded-md p-3">
          <pre className="text-muted-foreground text-xs whitespace-pre-wrap">
            {content || "Chưa có nội dung (sẽ dùng mặc định)"}
          </pre>
          <div className="to-muted pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent" />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/prayers/templates/${type}`}>
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={resetMutation.isPending}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
