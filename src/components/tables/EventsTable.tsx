"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Search, CalendarX2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/modals/ConfirmDialog";
import TablePagination from "@/components/tables/TablePagination";
import { useDeleteEvent, useEvents } from "@/lib/queries/events";
import { useConfirm } from "@/hooks/useConfirm";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate, formatRupiah } from "@/lib/utils";

export default function EventsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useEvents({ page, search: debouncedSearch || undefined });
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();
  const confirm = useConfirm();
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search events..."
              className="pl-9"
            />
          </div>
          <Button asChild>
            <Link href="/dashboard/events/create">
              <Plus className="h-4 w-4" />
              New event
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 8 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-4 w-full max-w-32" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {!isLoading && data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <CalendarX2 className="h-8 w-8" strokeWidth={1.5} />
                      <p className="text-sm font-medium text-foreground">No events yet</p>
                      <p className="text-sm">Create your first event to see it listed here.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                data?.items.map((event, index) => (
                  <TableRow key={event.id}>
                    <TableCell className="text-muted-foreground">
                      {(data.page - 1) * data.per_page + index + 1}
                    </TableCell>
                    <TableCell>
                      {event.image_url && (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImage({ url: event.image_url!, title: event.title })
                          }
                          className="block cursor-zoom-in rounded-md ring-offset-2 ring-offset-background transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="h-10 w-10 rounded-md border border-border object-cover"
                          />
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(event.event_date)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.category?.name ?? "—"}
                    </TableCell>
                    <TableCell className="tabular-nums">{formatRupiah(event.price)}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {event.available_tickets}/{event.total_tickets}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/dashboard/events/${event.id}`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => confirm.request(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {data && (
          <TablePagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />
        )}
      </div>

      <ConfirmDialog
        isOpen={confirm.isOpen}
        title="Delete event"
        message="This will permanently remove the event. This action cannot be undone."
        isDangerous
        loading={isDeleting}
        confirmLabel="Delete"
        onConfirm={() => {
          if (confirm.targetId) {
            deleteEvent(confirm.targetId, { onSuccess: () => confirm.close() });
          }
        }}
        onCancel={confirm.close}
      />

      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogTitle className="sr-only">{previewImage?.title}</DialogTitle>
          {previewImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
