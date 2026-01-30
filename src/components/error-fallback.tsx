"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorFallbackProps {
  error?: Error;
  reset?: () => void;
  title?: string;
  description?: string;
  showHomeButton?: boolean;
}

export function ErrorFallback({
  error,
  reset,
  title = "Đã xảy ra lỗi",
  description = "Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại hoặc tải lại trang.",
  showHomeButton = true,
}: ErrorFallbackProps) {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
      <div className="bg-destructive/10 mb-6 rounded-full p-4">
        <AlertCircle className="text-destructive h-12 w-12" />
      </div>

      <h2 className="mb-2 text-2xl font-semibold tracking-tight">{title}</h2>

      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>

      {error?.message && (
        <div className="bg-muted mb-6 max-w-md rounded-lg p-4 text-left">
          <p className="text-muted-foreground text-sm font-medium">
            Chi tiết lỗi:
          </p>
          <code className="text-destructive mt-1 block text-sm break-all">
            {error.message}
          </code>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {reset && (
          <Button onClick={reset} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </Button>
        )}

        <Button onClick={handleReload} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Tải lại trang
        </Button>

        {showHomeButton && (
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <Home className="h-4 w-4" />
              Về trang chủ
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
