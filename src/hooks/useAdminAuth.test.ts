import { renderHook, waitFor } from "@testing-library/react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminAuth as useAdminAuthStore } from "@/lib/store/auth.store";
import { fetchCurrentAdmin } from "@/lib/auth";

jest.mock("@/lib/auth", () => ({
  fetchCurrentAdmin: jest.fn(),
}));

const mockedFetchCurrentAdmin = fetchCurrentAdmin as jest.MockedFunction<
  typeof fetchCurrentAdmin
>;

describe("useAdminAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAdminAuthStore.setState({ admin: null, isAuthenticated: false, isHydrated: false });
  });

  it("hydrates the store with the admin when /admin/auth/me succeeds", async () => {
    const admin = { id: "1", name: "Ada Lovelace", email: "ada@tixora.com" };
    mockedFetchCurrentAdmin.mockResolvedValueOnce(admin);

    const { result } = renderHook(() => useAdminAuth());

    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    expect(result.current.admin).toEqual(admin);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("logs out and still marks hydrated when /admin/auth/me fails", async () => {
    mockedFetchCurrentAdmin.mockRejectedValueOnce(new Error("401"));

    const { result } = renderHook(() => useAdminAuth());

    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    expect(result.current.admin).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("only calls fetchCurrentAdmin once across re-renders", async () => {
    mockedFetchCurrentAdmin.mockResolvedValueOnce({
      id: "1",
      name: "Ada Lovelace",
      email: "ada@tixora.com",
    });

    const { result, rerender } = renderHook(() => useAdminAuth());
    rerender();
    rerender();

    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    expect(mockedFetchCurrentAdmin).toHaveBeenCalledTimes(1);
  });

  it("does not re-fetch once already hydrated", async () => {
    useAdminAuthStore.setState({ admin: null, isAuthenticated: false, isHydrated: true });

    renderHook(() => useAdminAuth());

    expect(mockedFetchCurrentAdmin).not.toHaveBeenCalled();
  });
});
