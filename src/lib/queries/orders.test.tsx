import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useOrder, useOrders } from "@/lib/queries/orders";
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

describe("useOrders", () => {
  beforeEach(() => jest.clearAllMocks());

  it("hits the admin-prefixed orders endpoint and flattens the envelope", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ id: "1", status: "paid" }],
        pagination: { current_page: 1, total_pages: 1, total_items: 1, per_page: 10 },
      },
    });

    const { result } = renderHook(() => useOrders({ status: "paid" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.get).toHaveBeenCalledWith("/admin/orders", {
      params: { status: "paid" },
    });
    expect(result.current.data?.items).toEqual([{ id: "1", status: "paid" }]);
  });
});

describe("useOrder", () => {
  beforeEach(() => jest.clearAllMocks());

  it("fetches a single order from the admin-prefixed detail endpoint", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { data: { id: "1", status: "paid" } } });

    const { result } = renderHook(() => useOrder("1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.get).toHaveBeenCalledWith("/admin/orders/1");
  });

  it("does not fetch when id is empty", () => {
    renderHook(() => useOrder(""), { wrapper: createWrapper() });
    expect(mockedApi.get).not.toHaveBeenCalled();
  });
});
