import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { eventKeys } from "@/lib/queries/queryKeys";
import { getErrorMessage } from "@/lib/utils";
import type { ApiListEnvelope, EventItem } from "@/lib/types";
import { toPaginated } from "@/lib/types";
import type { EventFormData } from "@/lib/validators";

interface EventListParams extends Record<string, unknown> {
  page?: number;
  search?: string;
}

export function useEvents(params: EventListParams = {}) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: async () => {
      const response = await api.get<ApiListEnvelope<EventItem>>("/events", {
        params,
      });
      return toPaginated(response.data);
    },
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<{ data: EventItem }>(`/events/${id}`);
      return response.data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EventFormData) => {
      const response = await api.post<{ data: EventItem }>("/events", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      toast.success("Event created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create event"));
    },
  });
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EventFormData) => {
      const response = await api.put<{ data: EventItem }>(`/events/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      toast.success("Event updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update event"));
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      toast.success("Event deleted");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete event"));
    },
  });
}
