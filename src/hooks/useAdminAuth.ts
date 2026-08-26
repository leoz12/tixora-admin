import { useEffect, useRef } from "react";
import { useAdminAuth as useAdminAuthStore } from "@/lib/store/auth.store";
import { fetchCurrentAdmin } from "@/lib/auth";

export function useAdminAuth() {
  const store = useAdminAuthStore();
  const hydrating = useRef(false);

  useEffect(() => {
    if (store.isHydrated || hydrating.current) return;
    hydrating.current = true;

    fetchCurrentAdmin()
      .then((admin) => store.setAdmin(admin))
      .catch(() => store.logout())
      .finally(() => store.setHydrated(true));
  }, [store]);

  return store;
}
