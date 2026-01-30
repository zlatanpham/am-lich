import { HeaderDropdown } from "@/components/header-dropdown";
import { MoonStarIcon } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                <MoonStarIcon className="size-4" />
              </div>
              <span className="text-xl">Lịch âm</span>
            </Link>

            <HeaderDropdown />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto flex-1 px-4">
        <Suspense fallback={null}>{children}</Suspense>
      </main>

      {/* Footer */}
      <footer className="mt-0 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="text-muted-foreground *:[a]:hover:text-primary flex flex-wrap justify-center gap-x-2 text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            <span>
              Built with ❤️ by{" "}
              <a href="https://github.com/zlatanpham" className="underline">
                Zlatan Pham
              </a>
            </span>
            <span className="text-muted-foreground/50">•</span>
            <Link href="/features">Tính năng</Link>
            <span className="text-muted-foreground/50">•</span>
            <a
              href="https://github.com/zlatanpham/am-lich"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mã nguồn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
