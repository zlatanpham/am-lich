"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, Suspense } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/trpc/react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { Users } from "lucide-react";

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

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get("invitation");

  const { data: invitationInfo } =
    api.eventSharing.validateInvitationToken.useQuery(
      { token: invitationToken ?? "" },
      { enabled: !!invitationToken },
    );

  const registerUser = api.user.register.useMutation({
    onSuccess: () => {
      if (invitationToken && invitationInfo?.valid) {
        toast.success(
          "Tạo tài khoản thành công! Bạn có thể xem lời mời chia sẻ.",
        );
        router.push("/sharing");
      } else {
        toast.success("Tạo tài khoản thành công! Vui lòng đăng nhập.");
        router.push("/login");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Không thể tạo tài khoản.");
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: invitationInfo?.email ?? "",
      password: "",
      confirmPassword: "",
    },
  });

  // Update email when invitation info is loaded
  useEffect(() => {
    if (invitationInfo?.valid && invitationInfo.email) {
      form.setValue("email", invitationInfo.email);
    }
  }, [invitationInfo, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await registerUser.mutateAsync({
      name: values.name,
      email: values.email,
      password: values.password,
      invitationToken: invitationToken ?? undefined,
    });
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-4">
        {invitationToken && invitationInfo?.valid && (
          <Alert className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <AlertDescription className="text-purple-700 dark:text-purple-300">
              <strong>{invitationInfo.ownerName}</strong> muốn chia sẻ sự kiện
              âm lịch với bạn. Tạo tài khoản để xem các sự kiện được chia sẻ.
            </AlertDescription>
          </Alert>
        )}
        {invitationToken && invitationInfo && !invitationInfo.valid && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertDescription className="text-red-700 dark:text-red-300">
              {invitationInfo.error || "Mã mời không hợp lệ hoặc đã hết hạn."}
            </AlertDescription>
          </Alert>
        )}
        <Card className="w-full border border-slate-200/50 bg-white/60 shadow-sm backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/60">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-lg font-medium text-slate-800 dark:text-slate-200">
              Tạo tài khoản mới
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-500">
              {invitationToken && invitationInfo?.valid
                ? "Tạo tài khoản để xem sự kiện được chia sẻ"
                : "Nhập thông tin để tạo tài khoản"}
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

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <Card className="w-full border border-slate-200/50 bg-white/60 shadow-sm backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/60">
            <CardContent className="py-8 text-center">
              <div className="text-muted-foreground">Đang tải...</div>
            </CardContent>
          </Card>
        </AuthLayout>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
