import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { categoryKeys, eventKeys } from "@/lib/queries/queryKeys";
import { getErrorMessage } from "@/lib/utils";
import type { Category } from "@/lib/types";
import type { CategoryFormData } from "@/lib/validators";

interface CategoryListParams {
  includeInactive?: boolean;
}

export function useCategories({ includeInactive = false }: CategoryListParams = {}) {
  return useQuery({
    queryKey: categoryKeys.list({ includeInactive }),
    queryFn: async () => {
      const response = await api.get<{ data: Category[] }>("/categories", {
        params: includeInactive ? { include_inactive: true } : undefined,
      });
      return response.data.data;
    },
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<{ data: Category }>(`/categories/${id}`);
      return response.data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await api.post<{ data: Category }>("/categories", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Category created");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create category"));
    },
  });
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await api.put<{ data: Category }>(`/categories/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Category updated");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update category"));
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      toast.success("Category deleted");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete category"));
    },
  });
}
