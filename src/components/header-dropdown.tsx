"use client";

import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarPlus,
  Bell,
  User,
  LogOut,
  Send,
  ScrollText,
} from "lucide-react";
import Link from "next/link";
import { LoginDialog } from "@/components/login-dialog";

export function HeaderDropdown() {
  const { data: session } = useSession();

  const user = session?.user as {
    name?: string;
    email?: string;
    image?: string;
  };

  const handleSignOut = () => {
    void signOut({ callbackUrl: "/" });
  };

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <LoginDialog>
          <button className="hover:text-primary text-sm transition-colors">
            Đăng nhập
          </button>
        </LoginDialog>
        <Link
          href="/signup"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1 text-sm transition-colors"
        >
          Đăng ký
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.image ?? undefined}
              alt={user?.name ?? "User"}
            />
            <AvatarFallback>
              {user?.name?.charAt(0) ?? user?.email?.charAt(0) ?? "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{user?.name}</p>
            <p className="text-muted-foreground text-xs leading-none">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/events" className="flex items-center">
            <CalendarPlus className="mr-2 h-4 w-4" />
            <span>Sự kiện của tôi</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/prayers" className="flex items-center">
            <ScrollText className="mr-2 h-4 w-4" />
            <span>Cài đặt Sớ khấn</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/notifications" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            <span>Cài đặt thông báo</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/account" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Tài khoản</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a
            href="https://github.com/zlatanpham/am-lich/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <Send className="mr-2 h-4 w-4" />
            <span>Góp ý phản hồi</span>
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
