import type { Metadata } from "next";
import EventsTable from "@/components/tables/EventsTable";

export const metadata: Metadata = {
  title: "Events — Tixora Admin",
};

export default function EventsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Events</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage events available on Tixora.
        </p>
      </div>
      <EventsTable />
    </div>
  );
}
