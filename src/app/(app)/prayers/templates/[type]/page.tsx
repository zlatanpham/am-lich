"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Save, ArrowLeft, RotateCcw, Info } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  DEFAULT_ANCESTOR_TEMPLATE,
  DEFAULT_MONG1_TEMPLATE,
  DEFAULT_RAM15_TEMPLATE,
} from "@/lib/prayer-templates";

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as "mong1" | "ram15" | "ancestor";

  const { data: templates, isLoading } = api.prayers.getTemplates.useQuery();
  const [content, setContent] = useState("");

  const templateTitle = {
    mong1: "Văn khấn Mùng Một",
    ram15: "Văn khấn Ngày Rằm",
    ancestor: "Văn khấn Cúng Giỗ",
  }[type];

  useEffect(() => {
    if (templates) {
      const template = templates.find(
        (t: { type: string; content: string }) => t.type === type,
      );
      if (template) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setContent(template.content);
      } else {
        // Use default if not found in DB
        const defaultContent = {
          mong1: DEFAULT_MONG1_TEMPLATE,
          ram15: DEFAULT_RAM15_TEMPLATE,
          ancestor: DEFAULT_ANCESTOR_TEMPLATE,
        }[type];
        setContent(defaultContent);
      }
    }
  }, [templates, type]);

  const utils = api.useUtils();
  const updateMutation = api.prayers.updateTemplate.useMutation({
    onSuccess: () => {
      toast.success("Đã lưu thay đổi");
      void utils.prayers.getTemplates.invalidate();
      router.push("/prayers");
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ type, content });
  };

  const handleReset = () => {
    if (confirm("Khôi phục về nội dung mặc định?")) {
      const defaultContent = {
        mong1: DEFAULT_MONG1_TEMPLATE,
        ram15: DEFAULT_RAM15_TEMPLATE,
        ancestor: DEFAULT_ANCESTOR_TEMPLATE,
      }[type];
      setContent(defaultContent);
    }
  };

  if (isLoading) return <div className="container py-8">Đang tải...</div>;

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/prayers">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{templateTitle}</h1>
          <p className="text-muted-foreground">Tùy chỉnh nội dung văn khấn</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="min-h-[500px]">
            <CardContent className="pt-6">
              <Textarea
                className="min-h-[600px] font-serif text-lg leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Khôi phục mặc định
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Lưu thay đổi
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4" />
                Các từ khóa thay thế
              </CardTitle>
              <CardDescription>
                Sử dụng các từ khóa này để tự động điền thông tin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <code className="bg-muted px-1 text-xs">
                  {"{{ngayAmLich}}"}
                </code>
                <span>Mùng một, rằm...</span>
                <code className="bg-muted px-1 text-xs">
                  {"{{thangAmLich}}"}
                </code>
                <span>Tháng Giêng, hai...</span>
                <code className="bg-muted px-1 text-xs">{"{{namAmLich}}"}</code>
                <span>Ất Tỵ, Bính Ngọ...</span>
                <code className="bg-muted px-1 text-xs">
                  {"{{danhSachTinChu}}"}
                </code>
                <span>Tên, tuổi các tín chủ</span>
                <code className="bg-muted px-1 text-xs">
                  {"{{diaChiNhaTai}}"}
                </code>
                <span>Địa chỉ tín chủ chính</span>
                <code className="bg-muted px-1 text-xs">{"{{hoGiaDinh}}"}</code>
                <span>Họ của gia đình</span>
                <code className="bg-muted px-1 text-xs">{"{{tenToTien}}"}</code>
                <span>Tên người được giỗ</span>
                <code className="bg-muted px-1 text-xs">
                  {"{{danhXungToTien}}"}
                </code>
                <span>Cụ, Ông, Bà...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
