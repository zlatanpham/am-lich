import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { SessionProvider } from "next-auth/react";

import { HydrateClient } from "@/trpc/server";
import { Toaster } from "@/components/ui/sonner";
import { HeaderDropdown } from "@/components/header-dropdown";
import { Calendar } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Âm Lịch Việt Nam",
  description: "Xem ngày âm lịch, quản lý sự kiện âm lịch, nhận thông báo ngày quan trọng",
  keywords: ["âm lịch", "lịch việt nam", "truyền thống việt nam", "lễ hội", "nhắc nhở", "pha trăng"],
  authors: [{ name: "Âm Lịch Việt Nam" }],
  creator: "Âm Lịch Việt Nam",
  publisher: "Âm Lịch Việt Nam",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: [
    { rel: "icon", url: "/favicon.png", type: "image/png", sizes: "64x64" },
    { rel: "apple-touch-icon", url: "/icons/icon-192x192.png", sizes: "192x192" },
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Âm Lịch VN",
  },
  applicationName: "Âm Lịch Việt Nam",
  category: "productivity",
  classification: "productivity",
  other: {
    "mobile-web-app-capable": "yes",
    "mobile-web-app-status-bar-style": "default",
    "mobile-web-app-title": "Âm Lịch VN",
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${geist.variable}`}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" sizes="64x64" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1d4ed8" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Âm Lịch VN" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-title" content="Âm Lịch VN" />
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            <HydrateClient>
              <div className="min-h-screen bg-background">
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
            </HydrateClient>
          </TRPCReactProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
