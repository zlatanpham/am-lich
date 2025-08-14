import { Calendar, ComponentIcon } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if this is the calendar page to use different layout
  const isCalendarPage = typeof window !== 'undefined' ? 
    window.location.pathname === '/calendar' : false;

  if (isCalendarPage || true) { // Always use full layout for now
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/calendar" className="flex items-center gap-2 font-medium">
                <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                  <Calendar className="size-4" />
                </div>
                <span className="text-xl">Lịch âm</span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-6">
                <Link 
                  href="/calendar" 
                  className="text-sm hover:text-primary transition-colors"
                >
                  Xem lịch âm
                </Link>
                <Link 
                  href="/login" 
                  className="text-sm hover:text-primary transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link 
                  href="/signup" 
                  className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Đăng ký
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main>
          <Suspense fallback={null}>{children}</Suspense>
        </main>

        {/* Footer */}
        <footer className="border-t mt-16">
          <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Ứng dụng Lịch âm. Dựa trên hệ thống lịch âm truyền thống Việt Nam.</p>
          </div>
        </footer>
      </div>
    );
  }

  // Default layout for auth pages
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/calendar" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Calendar className="size-4" />
          </div>
          Lịch âm
        </Link>
        <Suspense fallback={null}>{children}</Suspense>
      </div>
    </div>
  );
}
