"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { LoginSchema, type LoginFormData } from "@/lib/validators";
import { login } from "@/lib/auth";
import { useAdminAuth } from "@/lib/store/auth.store";
import { getErrorMessage } from "@/lib/utils";

export default function LoginForm() {
  const router = useRouter();
  const setAdmin = useAdminAuth((state) => state.setAdmin);
  const setHydrated = useAdminAuth((state) => state.setHydrated);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: ({ admin }) => {
      setAdmin(admin);
      setHydrated(true);
      toast.success(`Welcome back, ${admin.name}`);
      router.push("/dashboard");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Invalid email or password"));
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutate(data))}
      noValidate
      className="flex flex-col gap-5"
    >
      <Field data-invalid={Boolean(errors.email)}>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@tixora.com"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        <FieldError errors={errors.email ? [errors.email] : undefined} />
      </Field>

      <Field data-invalid={Boolean(errors.password)}>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="sr-only">Toggle password visibility</span>
          </button>
        </div>
        <FieldError errors={errors.password ? [errors.password] : undefined} />
      </Field>

      <Button type="submit" className="mt-1 w-full" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
