import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { userKeys } from "@/lib/queries/queryKeys";
import type { ApiListEnvelope, UserItem } from "@/lib/types";
import { toPaginated } from "@/lib/types";

interface UserListParams extends Record<string, unknown> {
  page?: number;
  search?: string;
}

export function useUsers(params: UserListParams = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const response = await api.get<ApiListEnvelope<UserItem>>("/admin/users", {
        params,
      });
      return toPaginated(response.data);
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<{ data: UserItem }>(`/admin/users/${id}`);
      return response.data.data;
    },
    enabled: Boolean(id),
  });
}
