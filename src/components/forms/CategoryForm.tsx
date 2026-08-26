"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { CategorySchema, type CategoryFormData } from "@/lib/validators";
import type { Category } from "@/lib/types";

interface CategoryFormProps {
  category?: Category;
  isSubmitting: boolean;
  onSubmit: (data: CategoryFormData) => void;
}

export default function CategoryForm({ category, isSubmitting, onSubmit }: CategoryFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: category?.name ?? "",
      is_active: category?.is_active ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Field data-invalid={Boolean(errors.name)}>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input
          id="name"
          placeholder="Music, Sports, Conference..."
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        <FieldError errors={errors.name ? [errors.name] : undefined} />
      </Field>

      {category && (
        <Field orientation="horizontal">
          <input
            id="is_active"
            type="checkbox"
            className="h-4 w-4 rounded border-input"
            {...register("is_active")}
          />
          <FieldLabel htmlFor="is_active" className="font-normal">
            Active (visible for assigning to events)
          </FieldLabel>
        </Field>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving..." : category ? "Save changes" : "Create category"}
        </Button>
      </div>
    </form>
  );
}
