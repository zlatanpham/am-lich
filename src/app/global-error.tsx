"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/error-fallback";
import "@/styles/globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="vi">
      <body>
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
          <ErrorFallback
            error={error}
            reset={reset}
            title="Lỗi ứng dụng"
            description="Rất tiếc, đã có lỗi nghiêm trọng xảy ra. Vui lòng tải lại trang để tiếp tục."
          />
        </div>
      </body>
    </html>
  );
}
