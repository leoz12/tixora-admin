import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useUser, useUsers } from "@/lib/queries/users";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: { get: jest.fn() },
}));

const mockedApi = api as jest.Mocked<typeof api>;

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe("useUsers", () => {
  beforeEach(() => jest.clearAllMocks());

  it("hits the admin-prefixed users endpoint and flattens the envelope", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ id: "1", name: "Ada" }],
        pagination: { current_page: 2, total_pages: 4, total_items: 40, per_page: 10 },
      },
    });

    const { result } = renderHook(() => useUsers({ page: 2, search: "ada" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.get).toHaveBeenCalledWith("/admin/users", {
      params: { page: 2, search: "ada" },
    });
    expect(result.current.data).toEqual({
      items: [{ id: "1", name: "Ada" }],
      page: 2,
      per_page: 10,
      total: 40,
      total_pages: 4,
    });
  });
});

describe("useUser", () => {
  beforeEach(() => jest.clearAllMocks());

  it("fetches a single customer from the admin-prefixed detail endpoint", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { data: { id: "1", name: "Ada" } } });

    const { result } = renderHook(() => useUser("1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.get).toHaveBeenCalledWith("/admin/users/1");
  });

  it("does not fetch when id is empty", () => {
    renderHook(() => useUser(""), { wrapper: createWrapper() });
    expect(mockedApi.get).not.toHaveBeenCalled();
  });
});
