"use client";

import Link from "next/link";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ConfirmDialog from "@/components/modals/ConfirmDialog";
import { useCategories, useDeleteCategory } from "@/lib/queries/categories";
import { useConfirm } from "@/hooks/useConfirm";
import { CATEGORY_STATUS_BADGE } from "@/lib/constants";

export default function CategoriesTable() {
  const { data: categories, isLoading } = useCategories({ includeInactive: true });
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();
  const confirm = useConfirm();

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-end">
          <Button asChild>
            <Link href="/dashboard/categories/create">
              <Plus className="h-4 w-4" />
              New category
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 4 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-4 w-full max-w-40" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {!isLoading && categories?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Tags className="h-8 w-8" strokeWidth={1.5} />
                      <p className="text-sm font-medium text-foreground">No categories yet</p>
                      <p className="text-sm">Categories help organize events for buyers.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                categories?.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          CATEGORY_STATUS_BADGE[category.is_active ? "active" : "inactive"]
                        }
                      >
                        {category.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/dashboard/categories/${category.id}`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => confirm.request(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirm.isOpen}
        title="Delete category"
        message="Events using this category will keep their reference, but you won't be able to assign it to new events. This action cannot be undone."
        isDangerous
        loading={isDeleting}
        confirmLabel="Delete"
        onConfirm={() => {
          if (confirm.targetId) {
            deleteCategory(confirm.targetId, { onSuccess: () => confirm.close() });
          }
        }}
        onCancel={confirm.close}
      />
    </>
  );
}
