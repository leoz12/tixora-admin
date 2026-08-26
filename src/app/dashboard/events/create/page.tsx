"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import EventForm from "@/components/forms/EventForm";
import { useCreateEvent } from "@/lib/queries/events";
import type { EventFormData } from "@/lib/validators";

export default function CreateEventPage() {
  const router = useRouter();
  const { mutate, isPending } = useCreateEvent();

  const handleSubmit = (data: EventFormData) => {
    mutate(data, {
      onSuccess: () => router.push("/dashboard/events"),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Create event</h1>
        <p className="text-sm text-muted-foreground">Fill in the details for the new event.</p>
      </div>

      <Card className="max-w-2xl border-border">
        <CardContent className="pt-6">
          <EventForm isSubmitting={isPending} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
