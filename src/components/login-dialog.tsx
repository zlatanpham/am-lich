"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useTransition, useState } from "react";
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

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginDialogProps {
  children: React.ReactNode;
}

export function LoginDialog({ children }: LoginDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
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
        setOpen(false);
        form.reset();
        toast.success("Đăng nhập thành công!");
      } catch (error) {
        console.log(error);
        toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đăng nhập</DialogTitle>
          <DialogDescription>
            Đăng nhập bằng email và mật khẩu của bạn
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
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
                      <FormLabel>Mật khẩu</FormLabel>
                      <div className="text-right text-[13px]">
                        <Link
                          href="/forgot-password"
                          className="text-muted-foreground hover:underline"
                          onClick={() => setOpen(false)}
                        >
                          Quên mật khẩu?
                        </Link>
                      </div>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                size="lg"
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                Đăng nhập
              </Button>
            </form>
          </Form>
          <div className="text-muted-foreground text-center text-sm">
            {"Chưa có tài khoản? "}
            <Link
              href="/signup"
              className="text-primary hover:underline"
              onClick={() => setOpen(false)}
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
