import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { SessionProvider } from "next-auth/react";

import { HydrateClient } from "@/trpc/server";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Đăng nhập - Âm Lịch Việt Nam",
  description: "Đăng nhập để quản lý sự kiện âm lịch và nhận thông báo",
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${geist.variable}`}>
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            <HydrateClient>
              {/* Fullscreen layout without header/footer */}
              <div className="min-h-screen">{children}</div>
            </HydrateClient>
          </TRPCReactProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
