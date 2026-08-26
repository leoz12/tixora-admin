import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { usePresignUpload, uploadFileToPresignedUrl } from "@/lib/queries/files";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: { post: jest.fn() },
}));

const mockedApi = api as jest.Mocked<typeof api>;

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe("usePresignUpload", () => {
  beforeEach(() => jest.clearAllMocks());

  it("registers the pending file via the api client and returns the presigned URL", async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: {
        data: { file_id: "file-1", upload_url: "https://cdn.example/upload", expires_in_seconds: 60 },
      },
    });

    const { result } = renderHook(() => usePresignUpload(), { wrapper: createWrapper() });
    result.current.mutate({ filename: "poster.png", mime_type: "image/png", size: 1024 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.post).toHaveBeenCalledWith("/files/presign-upload", {
      filename: "poster.png",
      mime_type: "image/png",
      size: 1024,
    });
    expect(result.current.data).toEqual({
      file_id: "file-1",
      upload_url: "https://cdn.example/upload",
      expires_in_seconds: 60,
    });
  });
});

describe("uploadFileToPresignedUrl", () => {
  const originalFetch = global.fetch;

  beforeEach(() => jest.clearAllMocks());

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("PUTs the raw file bytes directly to the presigned URL, not through the api client", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({ ok: true });
    global.fetch = fetchMock as unknown as typeof fetch;
    const file = new File(["bytes"], "poster.png", { type: "image/png" });

    await uploadFileToPresignedUrl("https://cdn.example/upload", file);

    expect(fetchMock).toHaveBeenCalledWith("https://cdn.example/upload", {
      method: "PUT",
      headers: { "Content-Type": "image/png" },
      body: file,
    });
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it("throws when the upload response is not ok", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false, status: 403 }) as unknown as typeof fetch;
    const file = new File(["bytes"], "poster.png", { type: "image/png" });

    await expect(uploadFileToPresignedUrl("https://cdn.example/upload", file)).rejects.toThrow(
      "Upload failed with status 403"
    );
  });
});
