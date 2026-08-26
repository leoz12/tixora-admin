"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import EventForm from "@/components/forms/EventForm";
import { useEvent, useUpdateEvent } from "@/lib/queries/events";
import type { EventFormData } from "@/lib/validators";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: event, isLoading } = useEvent(id);
  const { mutate, isPending } = useUpdateEvent(id);

  const handleSubmit = (data: EventFormData) => {
    mutate(data, {
      onSuccess: () => router.push("/dashboard/events"),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Edit event</h1>
        <p className="text-sm text-muted-foreground">Update the details for this event.</p>
      </div>

      <Card className="max-w-2xl border-border">
        <CardContent className="pt-6">
          {isLoading && (
            <div className="flex flex-col gap-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          )}
          {!isLoading && event && (
            <EventForm event={event} isSubmitting={isPending} onSubmit={handleSubmit} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
