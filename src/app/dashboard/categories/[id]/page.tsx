"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryForm from "@/components/forms/CategoryForm";
import { useCategory, useUpdateCategory } from "@/lib/queries/categories";
import type { CategoryFormData } from "@/lib/validators";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: category, isLoading } = useCategory(id);
  const { mutate, isPending } = useUpdateCategory(id);

  const handleSubmit = (data: CategoryFormData) => {
    mutate(data, {
      onSuccess: () => router.push("/dashboard/categories"),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Edit category</h1>
        <p className="text-sm text-muted-foreground">Update this category&apos;s details.</p>
      </div>

      <Card className="max-w-lg border-border">
        <CardContent className="pt-6">
          {isLoading && (
            <div className="flex flex-col gap-5">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          )}
          {!isLoading && category && (
            <CategoryForm category={category} isSubmitting={isPending} onSubmit={handleSubmit} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
