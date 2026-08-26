import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface PresignUploadParams {
  filename: string;
  mime_type: string;
  size: number;
}

interface PresignUploadResult {
  file_id: string;
  upload_url: string;
  expires_in_seconds: number;
}

// usePresignUpload registers a pending file and returns a presigned R2 URL.
// Callers must PUT the raw file bytes to upload_url themselves (not through
// the `api` instance - that URL is a different host and must not receive
// the admin's Authorization header), then use file_id as image_id.
export function usePresignUpload() {
  return useMutation({
    mutationFn: async (params: PresignUploadParams) => {
      const response = await api.post<{ data: PresignUploadResult }>(
        "/files/presign-upload",
        params
      );
      return response.data.data;
    },
  });
}

export async function uploadFileToPresignedUrl(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}
