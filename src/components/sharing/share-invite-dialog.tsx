"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

interface ShareInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  email: z.string().email("Địa chỉ email không hợp lệ"),
});

export function ShareInviteDialog({
  open,
  onOpenChange,
}: ShareInviteDialogProps) {
  const utils = api.useUtils();

  const sendInvitation = api.eventSharing.sendShareInvitation.useMutation({
    onSuccess: (data) => {
      if (data.isNewUser) {
        toast.success("Đã gửi email mời đăng ký để xem sự kiện của bạn");
      } else {
        toast.success("Đã gửi lời mời chia sẻ sự kiện");
      }
      void utils.eventSharing.getMyShares.invalidate();
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Không thể gửi lời mời");
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    void sendInvitation.mutateAsync({
      recipientEmail: values.email,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chia sẻ sự kiện</DialogTitle>
          <DialogDescription>
            Mời người khác xem các sự kiện âm lịch của bạn. Họ sẽ có thể xem tất
            cả sự kiện của bạn (chỉ đọc).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email người nhận</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Nếu người này chưa có tài khoản, họ sẽ nhận được email mời
                    đăng ký.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={sendInvitation.status === "pending"}
              >
                {sendInvitation.status === "pending" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Gửi lời mời
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
