"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { ChangePasswordSchema, type ChangePasswordFormData } from "@/lib/validators";

interface ChangePasswordFormProps {
  isSubmitting: boolean;
  onSubmit: (data: ChangePasswordFormData) => void;
}

export default function ChangePasswordForm({ isSubmitting, onSubmit }: ChangePasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Field data-invalid={Boolean(errors.current_password)}>
        <FieldLabel htmlFor="current_password">Current password</FieldLabel>
        <Input
          id="current_password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.current_password)}
          {...register("current_password")}
        />
        <FieldError errors={errors.current_password ? [errors.current_password] : undefined} />
      </Field>

      <Field data-invalid={Boolean(errors.new_password)}>
        <FieldLabel htmlFor="new_password">New password</FieldLabel>
        <Input
          id="new_password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.new_password)}
          {...register("new_password")}
        />
        <FieldError errors={errors.new_password ? [errors.new_password] : undefined} />
      </Field>

      <Field data-invalid={Boolean(errors.confirm_password)}>
        <FieldLabel htmlFor="confirm_password">Confirm new password</FieldLabel>
        <Input
          id="confirm_password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirm_password)}
          {...register("confirm_password")}
        />
        <FieldError errors={errors.confirm_password ? [errors.confirm_password] : undefined} />
      </Field>

      <p className="text-sm text-muted-foreground">
        Changing your password signs out your other devices. You&apos;ll stay logged in here.
      </p>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Updating..." : "Update password"}
        </Button>
      </div>
    </form>
  );
}
