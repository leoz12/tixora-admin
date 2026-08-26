import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { toast } from "sonner";
import {
  useCreateEvent,
  useDeleteEvent,
  useEvent,
  useEvents,
  useUpdateEvent,
} from "@/lib/queries/events";
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

describe("useEvents", () => {
  beforeEach(() => jest.clearAllMocks());

  it("fetches events and flattens the list envelope into a Paginated shape", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ id: "1", title: "Jazz Night" }],
        pagination: { current_page: 1, total_pages: 3, total_items: 25, per_page: 10 },
      },
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useEvents({ page: 1 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.get).toHaveBeenCalledWith("/events", { params: { page: 1 } });
    expect(result.current.data).toEqual({
      items: [{ id: "1", title: "Jazz Night" }],
      page: 1,
      per_page: 10,
      total: 25,
      total_pages: 3,
    });
  });
});

describe("useEvent", () => {
  beforeEach(() => jest.clearAllMocks());

  it("fetches a single event by id", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { data: { id: "1", title: "Jazz Night" } } });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useEvent("1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.get).toHaveBeenCalledWith("/events/1");
    expect(result.current.data).toEqual({ id: "1", title: "Jazz Night" });
  });

  it("does not fetch when id is empty", () => {
    const { wrapper } = createWrapper();
    renderHook(() => useEvent(""), { wrapper });

    expect(mockedApi.get).not.toHaveBeenCalled();
  });
});

describe("useCreateEvent", () => {
  beforeEach(() => jest.clearAllMocks());

  it("posts the form data, invalidates the events cache, and toasts success", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { data: { id: "1" } } });
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateEvent(), { wrapper });
    result.current.mutate({
      title: "Jazz Night",
      event_date: "2026-12-01T00:00:00Z",
      location: "Jakarta",
      price: 100000,
      total_tickets: 100,
      category_id: "cat-1",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.post).toHaveBeenCalledWith(
      "/events",
      expect.objectContaining({ title: "Jazz Night" })
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["events"] });
    expect(toast.success).toHaveBeenCalledWith("Event created successfully");
  });

  it("toasts the backend error message on failure", async () => {
    mockedApi.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: "Title already exists" } },
    });
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateEvent(), { wrapper });
    result.current.mutate({
      title: "Jazz Night",
      event_date: "2026-12-01T00:00:00Z",
      location: "Jakarta",
      price: 100000,
      total_tickets: 100,
      category_id: "cat-1",
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith("Title already exists");
  });
});

describe("useUpdateEvent", () => {
  beforeEach(() => jest.clearAllMocks());

  it("puts to the event's id-scoped endpoint and toasts success", async () => {
    mockedApi.put.mockResolvedValueOnce({ data: { data: { id: "1" } } });
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useUpdateEvent("1"), { wrapper });
    result.current.mutate({
      title: "Jazz Night 2",
      event_date: "2026-12-01T00:00:00Z",
      location: "Jakarta",
      price: 150000,
      total_tickets: 100,
      category_id: "cat-1",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.put).toHaveBeenCalledWith(
      "/events/1",
      expect.objectContaining({ title: "Jazz Night 2" })
    );
    expect(toast.success).toHaveBeenCalledWith("Event updated successfully");
  });
});

describe("useDeleteEvent", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deletes by id and toasts success", async () => {
    mockedApi.delete.mockResolvedValueOnce({});
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteEvent(), { wrapper });
    result.current.mutate("1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.delete).toHaveBeenCalledWith("/events/1");
    expect(toast.success).toHaveBeenCalledWith("Event deleted");
  });

  it("toasts a fallback message when the backend gives no message", async () => {
    mockedApi.delete.mockRejectedValueOnce(new Error("network down"));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteEvent(), { wrapper });
    result.current.mutate("1");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith("Failed to delete event");
  });
});
