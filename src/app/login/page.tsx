import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import LoginForm from "@/components/forms/LoginForm";
import TixoraMark from "@/components/icons/TixoraMark";
import LoginGate from "./LoginGate";

export const metadata: Metadata = {
  title: "Sign in — Tixora Admin",
};

export default function LoginPage() {
  return (
    <LoginGate>
      <main className="flex min-h-screen flex-1 items-center justify-center bg-[linear-gradient(180deg,var(--accent)_0%,var(--background)_55%)] px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg text-primary shadow-sm">
              <TixoraMark size={44} />
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Tixora Admin</h1>
              <p className="text-sm text-muted-foreground">Sign in to manage events and orders</p>
            </div>
          </div>

          <Card className="border-border shadow-sm">
            <CardHeader className="sr-only">
              <h2>Sign in</h2>
            </CardHeader>
            <CardContent className="pt-6">
              <LoginForm />
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Internal admin access only. Contact your platform owner for credentials.
          </p>
        </div>
      </main>
    </LoginGate>
  );
}
