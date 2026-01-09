"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { type Petitioner } from "@/lib/prayer-utils";

const formSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  birthYear: z.coerce.number().int().min(1900).max(2100),
  buddhistName: z.string().optional(),
  isHead: z.boolean().default(false),
});

type PetitionerFormValues = z.infer<typeof formSchema>;

export function PetitionerFormDialog({
  open,
  onOpenChange,
  petitioner,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petitioner?: Petitioner;
}) {
  const utils = api.useUtils();
  const isEditing = !!petitioner;

  const form = useForm<PetitionerFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      birthYear: 1980,
      buddhistName: "",
      isHead: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (petitioner) {
        form.reset({
          name: petitioner.name,
          birthYear: petitioner.birthYear,
          buddhistName: petitioner.buddhistName ?? "",
          isHead: petitioner.isHead,
        });
      } else {
        form.reset({
          name: "",
          birthYear: 1980,
          buddhistName: "",
          isHead: false,
        });
      }
    }
  }, [petitioner, form, open]);

  const createMutation = api.prayers.createPetitioner.useMutation({
    onSuccess: () => {
      toast.success("Đã thêm tín chủ");
      void utils.prayers.getPetitioners.invalidate();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });

  const updateMutation = api.prayers.updatePetitioner.useMutation({
    onSuccess: () => {
      toast.success("Đã cập nhật tín chủ");
      void utils.prayers.getPetitioners.invalidate();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });

  function onSubmit(values: PetitionerFormValues) {
    if (isEditing && petitioner?.id) {
      updateMutation.mutate({
        id: petitioner.id,
        ...values,
      });
    } else {
      createMutation.mutate(values);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa tín chủ" : "Thêm tín chủ mới"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Năm sinh</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="buddhistName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pháp danh (nếu có)</FormLabel>
                  <FormControl>
                    <Input placeholder="Diệu Hạnh" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isHead"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Tín chủ chính</FormLabel>
                    <FormDescription>
                      Người đứng tên đầu tiên trong sớ
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
