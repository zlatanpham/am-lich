"use client";

import { useEffect } from "react";
import { RefreshCw, X, Sparkles } from "lucide-react";
import { useAppUpdate } from "@/hooks/use-app-update";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AppUpdateToast() {
  const { status, updateInfo, applyUpdate, dismissUpdate } = useAppUpdate();

  useEffect(() => {
    if (status === "available" && updateInfo) {
      // Show update notification toast
      toast.custom(
        (t) => (
          <div className="bg-card w-full max-w-sm rounded-lg border p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Sparkles className="text-primary h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-foreground font-semibold">
                  Có phiên bản mới!
                </h4>
                <p className="text-muted-foreground mt-1 text-sm">
                  Ứng dụng đã được cập nhật với các tính năng và cải tiến mới.
                  Vui lòng khởi động lại để trải nghiệm phiên bản mới nhất.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      toast.dismiss(t);
                      applyUpdate();
                    }}
                    className="flex-1"
                  >
                    <RefreshCw className="mr-1.5 h-4 w-4" />
                    Cập nhật ngay
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      toast.dismiss(t);
                      dismissUpdate();
                    }}
                  >
                    Để sau
                  </Button>
                </div>
              </div>
              <button
                onClick={() => {
                  toast.dismiss(t);
                  dismissUpdate();
                }}
                className="text-muted-foreground hover:bg-muted hover:text-foreground -mt-1 -mr-1 shrink-0 rounded-md p-1 transition-colors"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          position: "top-center",
          id: "app-update-notification",
        },
      );
    }

    // Cleanup toast when component unmounts
    return () => {
      toast.dismiss("app-update-notification");
    };
  }, [status, updateInfo, applyUpdate, dismissUpdate]);

  // This component doesn't render anything directly
  return null;
}
