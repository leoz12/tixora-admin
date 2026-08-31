"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ChangePasswordForm from "@/components/forms/ChangePasswordForm";
import { changePassword } from "@/lib/auth";
import { useAdminAuth } from "@/lib/store/auth.store";
import { getErrorMessage } from "@/lib/utils";
import type { ChangePasswordFormData } from "@/lib/validators";

export default function SettingsPage() {
  const { admin } = useAdminAuth();
  // Bump to remount ChangePasswordForm and clear its fields after a success.
  const [formKey, setFormKey] = useState(0);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      }),
    onSuccess: () => {
      // The backend keeps this session alive, so no logout/redirect - just
      // confirm and reset the form.
      setFormKey((key) => key + 1);
      toast.success("Password changed successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to change password"));
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your admin account.</p>
      </div>

      <Card className="max-w-lg border-border">
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
          <CardDescription>
            Signed in as {admin?.email ?? "your account"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm
            key={formKey}
            isSubmitting={isPending}
            onSubmit={(data) => mutate(data)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
