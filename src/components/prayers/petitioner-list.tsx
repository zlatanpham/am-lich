"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Plus, User } from "lucide-react";
import { PetitionerFormDialog } from "./petitioner-form-dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { type Petitioner } from "@/lib/prayer-utils";

export function PetitionerList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPetitioner, setSelectedPetitioner] =
    useState<Petitioner | null>(null);

  const { data: petitioners, isLoading } =
    api.prayers.getPetitioners.useQuery();
  const utils = api.useUtils();

  const deleteMutation = api.prayers.deletePetitioner.useMutation({
    onSuccess: () => {
      toast.success("Đã xóa tín chủ");
      void utils.prayers.getPetitioners.invalidate();
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });

  const handleEdit = (petitioner: Petitioner) => {
    setSelectedPetitioner(petitioner);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedPetitioner(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tín chủ này?")) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <CardTitle>Danh sách tín chủ</CardTitle>
            <CardDescription>Đang tải danh sách...</CardDescription>
          </div>
          <Skeleton className="h-9 w-full sm:w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle>Danh sách tín chủ</CardTitle>
          <CardDescription>
            Cấu hình danh sách người thực hiện nghi lễ
          </CardDescription>
        </div>
        <Button
          onClick={handleAdd}
          size="sm"
          className="w-full shrink-0 sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm tín chủ
        </Button>
      </CardHeader>
      <CardContent>
        {petitioners?.length === 0 ? (
          <div className="py-8 text-center">
            <User className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">
              Chưa có tín chủ nào được tạo
            </p>
          </div>
        ) : (
          <>
            {/* Mobile view - card list */}
            <div className="space-y-3 sm:hidden">
              {petitioners?.map((p: Petitioner) => (
                <div
                  key={p.id}
                  className="bg-muted/30 flex items-center justify-between rounded-lg p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{p.name}</span>
                      {p.isHead && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary shrink-0 border-none"
                        >
                          Chính
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {p.birthYear}
                      {p.buddhistName && ` · ${p.buddhistName}`}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(p)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (p.id) handleDelete(p.id);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop view - table */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Năm sinh</TableHead>
                    <TableHead className="w-[100px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {petitioners?.map((p: Petitioner) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {p.name}
                          {p.isHead && (
                            <Badge
                              variant="secondary"
                              className="bg-primary/10 text-primary border-none"
                            >
                              Chính
                            </Badge>
                          )}
                        </div>
                        {p.buddhistName && (
                          <div className="text-muted-foreground text-xs">
                            Pháp danh: {p.buddhistName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{p.birthYear}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(p)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (p.id) handleDelete(p.id);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <PetitionerFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          petitioner={selectedPetitioner ?? undefined}
        />
      </CardContent>
    </Card>
  );
}
