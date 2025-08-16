"use client";

import { useEffect, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "Mật khẩu mới phải có ít nhất 8 ký tự." }),
    confirmPassword: z
      .string()
      .min(8, { message: "Vui lòng xác nhận mật khẩu mới của bạn." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu không khớp.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [, startTransition] = useTransition();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const confirmReset = api.user.confirmPasswordReset.useMutation({
    onSuccess: () => {
      toast.success("Mật khẩu của bạn đã được đặt lại thành công!");
      startTransition(() => {
        router.push("/login");
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!token) {
      toast.error(
        "Không tìm thấy mã xác nhận. Vui lòng yêu cầu đặt lại mật khẩu mới.",
      );
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error(
        "Không tìm thấy mã xác nhận. Vui lòng yêu cầu đặt lại mật khẩu mới.",
      );
      return;
    }
    await confirmReset.mutateAsync({
      token,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
  };

  return (
    <AuthLayout>
      <div className="flex flex-col gap-4">
        <Card className="border border-slate-200/50 bg-white/60 shadow-sm backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/60">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-lg font-medium text-slate-800 dark:text-slate-200">
              Đặt lại mật khẩu
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-500">
              Nhập mật khẩu mới của bạn
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
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-slate-600 dark:text-slate-400">
                        Mật khẩu mới
                      </FormLabel>
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
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-slate-600 dark:text-slate-400">
                        Xác nhận mật khẩu mới
                      </FormLabel>
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
                  disabled={!token}
                >
                  {confirmReset.status === "pending"
                    ? "Đang đặt lại..."
                    : "Đặt lại mật khẩu"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="text-center text-xs text-slate-500">
          <Link
            href="/login"
            className="text-slate-600 hover:text-slate-800 hover:underline"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
