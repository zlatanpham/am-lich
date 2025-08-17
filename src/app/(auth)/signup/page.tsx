"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";

const formSchema = z
  .object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Địa chỉ email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(8, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export default function SignUpPage() {
  const router = useRouter();
  const registerUser = api.user.register.useMutation({
    onSuccess: () => {
      toast.success("Tạo tài khoản thành công! Vui lòng đăng nhập.");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(error.message || "Không thể tạo tài khoản.");
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await registerUser.mutateAsync({
      name: values.name,
      email: values.email,
      password: values.password,
    });
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-4">
        <Card className="w-full border border-slate-200/50 bg-white/60 shadow-sm backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/60">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-lg font-medium text-slate-800 dark:text-slate-200">
              Tạo tài khoản mới
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-500">
              Nhập thông tin để tạo tài khoản
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-slate-600 dark:text-slate-400">
                        Tên
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tên của bạn"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-slate-600 dark:text-slate-400">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
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
                      <FormLabel className="text-sm text-slate-600 dark:text-slate-400">
                        Mật khẩu
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
                        Xác nhận mật khẩu
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
                  disabled={registerUser.status === "pending"}
                >
                  {registerUser.status === "pending"
                    ? "Đang tạo tài khoản..."
                    : "Đăng ký"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="text-center text-xs text-slate-500">
          Đã có tài khoản?{" "}
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
