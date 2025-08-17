"use client";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Địa chỉ email không hợp lệ." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const requestReset = api.user.requestPasswordReset.useMutation({
    onSuccess: () => {
      toast.success(
        "Nếu tài khoản với email này tồn tại, một liên kết đặt lại mật khẩu đã được gửi.",
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    await requestReset.mutateAsync({ email: data.email });
  };

  return (
    <AuthLayout>
      <div className="flex flex-col gap-4">
        <Card className="border border-slate-200/50 bg-white/60 shadow-sm backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/60">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-lg font-medium text-slate-800 dark:text-slate-200">
              Quên mật khẩu
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-500">
              Nhập email để nhận liên kết đặt lại mật khẩu
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
                <Button
                  type="submit"
                  className="w-full text-sm"
                  disabled={requestReset.status === "pending"}
                >
                  {requestReset.status === "pending"
                    ? "Đang gửi..."
                    : "Gửi liên kết đặt lại"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="text-center text-xs text-slate-500">
          Nhớ mật khẩu của bạn?{" "}
          <Link
            href="/login"
            className="text-slate-600 hover:text-slate-800 hover:underline"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
