"use client";

import { MoonStarIcon } from "lucide-react";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-950/50 dark:to-slate-900/50">
      <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-sm">
          {/* Minimal Logo */}
          <div className="mb-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-lg font-medium text-slate-700 transition-opacity hover:opacity-70 dark:text-slate-300"
            >
              <div className="bg-primary/80 text-primary-foreground flex size-10 items-center justify-center rounded-md">
                <MoonStarIcon className="size-5" />
              </div>
              <span>Lịch âm</span>
            </Link>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              Lịch âm truyền thống
            </p>
          </div>

          {/* Auth Form */}
          <div className="relative">{children}</div>
        </div>

        {/* Subtle background decoration */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="bg-primary/3 absolute -top-32 -right-32 h-64 w-64 rounded-full blur-3xl"></div>
          <div className="bg-primary/3 absolute -bottom-32 -left-32 h-64 w-64 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
