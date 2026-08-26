"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAdminAuth();

  useEffect(() => {
    if (!isHydrated) return;
    router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [isAuthenticated, isHydrated, router]);

  return null;
}
