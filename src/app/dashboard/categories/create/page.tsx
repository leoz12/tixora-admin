"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import CategoryForm from "@/components/forms/CategoryForm";
import { useCreateCategory } from "@/lib/queries/categories";
import type { CategoryFormData } from "@/lib/validators";

export default function CreateCategoryPage() {
  const router = useRouter();
  const { mutate, isPending } = useCreateCategory();

  const handleSubmit = (data: CategoryFormData) => {
    mutate(data, {
      onSuccess: () => router.push("/dashboard/categories"),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Create category</h1>
        <p className="text-sm text-muted-foreground">Add a new category for events.</p>
      </div>

      <Card className="max-w-lg border-border">
        <CardContent className="pt-6">
          <CategoryForm isSubmitting={isPending} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
