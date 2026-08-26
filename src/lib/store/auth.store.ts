import { create } from "zustand";
import type { Admin } from "@/lib/types";

interface AuthStore {
  admin: Admin | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAdmin: (admin: Admin) => void;
  setHydrated: (hydrated: boolean) => void;
  logout: () => void;
}

// Auth tokens live only in httpOnly cookies now - not readable by JS, so
// there's nothing to read synchronously here. Initial hydration (asking the
// backend "am I logged in?" via GET /admin/auth/me) happens in
// hooks/useAdminAuth.ts instead, since that needs the API client.
export const useAdminAuth = create<AuthStore>((set) => ({
  admin: null,
  isAuthenticated: false,
  isHydrated: false,

  setAdmin: (admin) => set({ admin, isAuthenticated: true }),

  setHydrated: (isHydrated) => set({ isHydrated }),

  logout: () => {
    set({ admin: null, isAuthenticated: false });
  },
}));
