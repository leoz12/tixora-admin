import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { toast } from "sonner";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "@/lib/queries/categories";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockedApi = api as jest.Mocked<typeof api>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

describe("useCategories", () => {
  beforeEach(() => jest.clearAllMocks());

  it("omits query params by default (active only)", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { data: [] } });
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.get).toHaveBeenCalledWith("/categories", { params: undefined });
  });

  it("passes include_inactive=true when requested", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { data: [] } });
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCategories({ includeInactive: true }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.get).toHaveBeenCalledWith("/categories", {
      params: { include_inactive: true },
    });
  });
});

describe("useCreateCategory", () => {
  beforeEach(() => jest.clearAllMocks());

  it("posts the category and toasts success", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { data: { id: "1" } } });
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateCategory(), { wrapper });
    result.current.mutate({ name: "Concerts", is_active: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.post).toHaveBeenCalledWith("/categories", {
      name: "Concerts",
      is_active: true,
    });
    expect(toast.success).toHaveBeenCalledWith("Category created");
  });
});

describe("useDeleteCategory", () => {
  beforeEach(() => jest.clearAllMocks());

  it("invalidates both category and event caches, since events embed category data", async () => {
    mockedApi.delete.mockResolvedValueOnce({});
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteCategory(), { wrapper });
    result.current.mutate("1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["categories"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["events"] });
    expect(toast.success).toHaveBeenCalledWith("Category deleted");
  });
});
