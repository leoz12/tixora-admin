import { useAdminAuth } from "@/lib/store/auth.store";
import type { Admin } from "@/lib/types";

const admin: Admin = {
  id: "1",
  name: "Ada Lovelace",
  email: "ada@tixora.com",
};

const initialState = useAdminAuth.getState();

afterEach(() => {
  useAdminAuth.setState(initialState, true);
});

describe("useAdminAuth store", () => {
  it("starts unauthenticated and not hydrated", () => {
    const state = useAdminAuth.getState();
    expect(state.admin).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isHydrated).toBe(false);
  });

  it("setAdmin stores the admin and marks the session authenticated", () => {
    useAdminAuth.getState().setAdmin(admin);

    const state = useAdminAuth.getState();
    expect(state.admin).toEqual(admin);
    expect(state.isAuthenticated).toBe(true);
  });

  it("setHydrated toggles hydration independently of auth state", () => {
    useAdminAuth.getState().setHydrated(true);
    expect(useAdminAuth.getState().isHydrated).toBe(true);
    expect(useAdminAuth.getState().isAuthenticated).toBe(false);
  });

  it("logout clears the admin and authentication flag", () => {
    useAdminAuth.getState().setAdmin(admin);
    useAdminAuth.getState().logout();

    const state = useAdminAuth.getState();
    expect(state.admin).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("logout does not reset isHydrated", () => {
    useAdminAuth.getState().setHydrated(true);
    useAdminAuth.getState().logout();

    expect(useAdminAuth.getState().isHydrated).toBe(true);
  });
});
