import { HeaderDropdown } from "@/components/header-dropdown";
import { Calendar } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                <Calendar className="size-4" />
              </div>
              <span className="text-xl">Lịch âm</span>
            </Link>

            <HeaderDropdown />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4">
        <Suspense fallback={null}>{children}</Suspense>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t">
        <div className="text-muted-foreground container mx-auto px-4 py-8 text-center text-sm">
          <p>
            &copy; 2025 Ứng dụng Lịch âm. Dựa trên hệ thống lịch âm truyền thống
            Việt Nam.
          </p>
        </div>
      </footer>
    </div>
  );
}
