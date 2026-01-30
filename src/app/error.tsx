"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/error-fallback";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Đã xảy ra lỗi"
      description="Rất tiếc, đã có lỗi xảy ra khi tải trang này. Vui lòng thử lại hoặc tải lại trang."
    />
  );
}
