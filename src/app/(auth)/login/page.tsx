"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { login } from "@/app/actions/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSession } from "next-auth/react";
import { AuthLayout } from "@/components/auth-layout";

const loginSchema = z.object({
  email: z.string().email({ message: "Địa chỉ email không hợp lệ." }),
  password: z.string().min(1, { message: "Mật khẩu là bắt buộc." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const { update } = useSession();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("password", data.password);
        await login(formData);
        await update();
        // Use window.location.href to do a full page reload to ensure session state is properly synced
        window.location.href = "/";
      } catch (error) {
        console.log(error);
        toast.error(
          "Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.",
        );
      }
    });
  };

  return (
    <AuthLayout>
      <div className="flex flex-col gap-4">
        <Card className="border border-slate-200/50 bg-white/60 shadow-sm backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/60">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-lg font-medium text-slate-800 dark:text-slate-200">
              Chào mừng trở lại
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-500">
              Đăng nhập để tiếp tục
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-slate-600 dark:text-slate-400">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          className="text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm text-slate-600 dark:text-slate-400">
                          Mật khẩu
                        </FormLabel>
                        <div className="text-right text-xs">
                          <Link
                            href="/forgot-password"
                            className="text-slate-500 hover:text-slate-700 hover:underline"
                          >
                            Quên mật khẩu?
                          </Link>
                        </div>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="********"
                          className="text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full text-sm"
                  disabled={isPending}
                >
                  {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="text-center text-xs text-slate-500">
          Chưa có tài khoản?{" "}
          <Link
            href="/signup"
            className="text-slate-600 hover:text-slate-800 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
