import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { orderKeys } from "@/lib/queries/queryKeys";
import type { ApiListEnvelope, OrderItem } from "@/lib/types";
import { toPaginated } from "@/lib/types";

interface OrderListParams extends Record<string, unknown> {
  page?: number;
  search?: string;
  status?: string;
}

export function useOrders(params: OrderListParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: async () => {
      const response = await api.get<ApiListEnvelope<OrderItem>>("/admin/orders", {
        params,
      });
      return toPaginated(response.data);
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<{ data: OrderItem }>(`/admin/orders/${id}`);
      return response.data.data;
    },
    enabled: Boolean(id),
  });
}
