"use client";

import { useState } from "react";
import { X, Share, Download, MoreVertical, Plus } from "lucide-react";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { Button } from "@/components/ui/button";

export function PwaInstallBanner() {
  const {
    shouldShowBanner,
    platform,
    dismiss,
    triggerInstall,
    canPromptInstall,
  } = usePwaInstall();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!shouldShowBanner) {
    return null;
  }

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="animate-in slide-in-from-bottom pb-safe fixed right-0 bottom-0 left-0 z-50 duration-300">
      <div className="bg-card relative mx-3 mb-3 rounded-lg border p-4 shadow-lg">
        {/* Header - clickable to expand */}
        <button
          onClick={toggleExpand}
          className="flex w-full items-start gap-3 text-left"
        >
          {/* App Icon */}
          <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
            <img
              src="/icon-72x72.png"
              alt="App Icon"
              className="h-8 w-8 rounded-lg"
            />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 pr-6">
            <h3 className="text-foreground font-semibold">Cài đặt ứng dụng</h3>

            {platform === "ios" ? (
              <p className="text-muted-foreground mt-1 text-sm">
                Nhấn <Share className="inline h-4 w-4 align-text-bottom" /> rồi
                chọn{" "}
                <span className="font-medium">
                  &quot;Thêm vào MH chính&quot;
                </span>
              </p>
            ) : canPromptInstall ? (
              <p className="text-muted-foreground mt-1 text-sm">
                Cài đặt để truy cập nhanh hơn
              </p>
            ) : (
              <p className="text-muted-foreground mt-1 text-sm">
                Nhấn{" "}
                <MoreVertical className="inline h-4 w-4 align-text-bottom" />{" "}
                rồi chọn{" "}
                <span className="font-medium">
                  &quot;Thêm vào MH chính&quot;
                </span>
              </p>
            )}
          </div>
        </button>

        {/* Expanded Content - Detailed Instructions */}
        {isExpanded && (
          <div className="mt-4 border-t pt-4">
            {platform === "ios" ? (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Thêm ứng dụng vào màn hình chính để truy cập như một app thật:
                </p>
                <ol className="text-foreground space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="bg-muted flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                      1
                    </span>
                    <span>
                      Nhấn vào biểu tượng{" "}
                      <Share className="inline h-4 w-4 align-text-bottom" />{" "}
                      <span className="text-muted-foreground">(Chia sẻ)</span> ở
                      thanh công cụ phía dưới
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-muted flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                      2
                    </span>
                    <span>
                      Cuộn xuống danh sách và chọn{" "}
                      <span className="font-medium">
                        &quot;Thêm vào Màn hình chính&quot;
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        (Add to Home Screen)
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-muted flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                      3
                    </span>
                    <span>
                      Nhấn <span className="font-medium">&quot;Thêm&quot;</span>{" "}
                      ở góc trên bên phải
                    </span>
                  </li>
                </ol>
                <p className="text-muted-foreground text-xs">
                  Nếu không thấy tuỳ chọn này, hãy cuộn xuống cuối danh sách,
                  nhấn <span className="font-medium">Sửa tác vụ</span>, rồi thêm{" "}
                  <Plus className="inline h-3 w-3 align-text-bottom" />{" "}
                  <span className="font-medium">Thêm vào Màn hình chính</span>.
                </p>
              </div>
            ) : canPromptInstall ? (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Cài đặt ứng dụng để truy cập nhanh từ màn hình chính:
                </p>
                <Button className="w-full" onClick={triggerInstall}>
                  <Download className="mr-1.5 h-4 w-4" />
                  Cài đặt ngay
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Thêm ứng dụng vào màn hình chính để truy cập như một app thật:
                </p>
                <ol className="text-foreground space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="bg-muted flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                      1
                    </span>
                    <span>
                      Nhấn vào biểu tượng{" "}
                      <MoreVertical className="inline h-4 w-4 align-text-bottom" />{" "}
                      <span className="text-muted-foreground">(Menu)</span> ở
                      góc trên bên phải
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-muted flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                      2
                    </span>
                    <span>
                      Chọn{" "}
                      <span className="font-medium">
                        &quot;Thêm vào màn hình chính&quot;
                      </span>{" "}
                      hoặc{" "}
                      <span className="font-medium">
                        &quot;Cài đặt ứng dụng&quot;
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        (Add to Home screen / Install app)
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-muted flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                      3
                    </span>
                    <span>
                      Nhấn{" "}
                      <span className="font-medium">&quot;Cài đặt&quot;</span>{" "}
                      hoặc <span className="font-medium">&quot;Thêm&quot;</span>{" "}
                      để xác nhận
                    </span>
                  </li>
                </ol>
                <p className="text-muted-foreground text-xs">
                  Tuỳ chọn có thể khác nhau tuỳ theo trình duyệt bạn đang sử
                  dụng (Chrome, Samsung Internet, Firefox...).
                </p>
              </div>
            )}
          </div>
        )}

        {/* Close Button - positioned absolute */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            dismiss();
          }}
          className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-3 right-3 shrink-0 rounded-md p-1.5 transition-colors"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
