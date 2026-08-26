"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatISO, parseISO } from "date-fns";
import { Loader2, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCategories } from "@/lib/queries/categories";
import {
  usePresignUpload,
  uploadFileToPresignedUrl,
} from "@/lib/queries/files";
import { getErrorMessage } from "@/lib/utils";
import { EventSchema, type EventFormData } from "@/lib/validators";
import type { EventItem } from "@/lib/types";

interface EventFormProps {
  event?: EventItem;
  isSubmitting: boolean;
  onSubmit: (data: EventFormData) => void;
}

function toDatetimeLocalValue(isoString: string): string {
  return formatISO(parseISO(isoString), { representation: "complete" }).slice(
    0,
    16,
  );
}

export default function EventForm({
  event,
  isSubmitting,
  onSubmit,
}: EventFormProps) {
  const router = useRouter();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const presignUpload = usePresignUpload();

  const [previewUrl, setPreviewUrl] = useState(event?.image_url);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(EventSchema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      event_date: event?.event_date
        ? toDatetimeLocalValue(event.event_date)
        : "",
      location: event?.location ?? "",
      image_id: undefined,
      price: event?.price ?? undefined,
      total_tickets: event?.total_tickets ?? undefined,
      category_id: event?.category_id ?? "",
    },
  });

  const isUploading = presignUpload.isPending;

  async function handleImageChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    setUploadError(null);

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const localPreviewUrl = URL.createObjectURL(file);
    objectUrlRef.current = localPreviewUrl;
    setPreviewUrl(localPreviewUrl);

    try {
      const { file_id, upload_url } = await presignUpload.mutateAsync({
        filename: file.name,
        mime_type: file.type,
        size: file.size,
      });
      await uploadFileToPresignedUrl(upload_url, file);
      setValue("image_id", file_id, { shouldValidate: true });
    } catch (error) {
      setUploadError(getErrorMessage(error, "Failed to upload image"));
    }
  }

  const submitForm = handleSubmit((data) => {
    onSubmit({ ...data, event_date: formatISO(parseISO(data.event_date)) });
  });

  return (
    <>
      <form onSubmit={submitForm} className="flex flex-col gap-5">
        <Field data-invalid={Boolean(errors.title)}>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            placeholder="Jakarta Jazz Night 2026"
            aria-invalid={Boolean(errors.title)}
            {...register("title")}
          />
          <FieldError errors={errors.title ? [errors.title] : undefined} />
        </Field>

        <Field data-invalid={Boolean(errors.description)}>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            rows={5}
            placeholder="Tell admins and buyers what this event is about"
            aria-invalid={Boolean(errors.description)}
            {...register("description")}
          />
          <FieldError
            errors={errors.description ? [errors.description] : undefined}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.event_date)}>
            <FieldLabel htmlFor="event_date">Event date & time</FieldLabel>
            <Input
              id="event_date"
              type="datetime-local"
              aria-invalid={Boolean(errors.event_date)}
              {...register("event_date")}
            />
            <FieldError
              errors={errors.event_date ? [errors.event_date] : undefined}
            />
          </Field>

          <Field data-invalid={Boolean(errors.location)}>
            <FieldLabel htmlFor="location">Location</FieldLabel>
            <Input
              id="location"
              placeholder="ICE BSD, Tangerang"
              aria-invalid={Boolean(errors.location)}
              {...register("location")}
            />
            <FieldError
              errors={errors.location ? [errors.location] : undefined}
            />
          </Field>
        </div>

        <Field data-invalid={Boolean(uploadError)}>
          <FieldLabel htmlFor="image">Event image</FieldLabel>
          {previewUrl && (
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="group relative h-32 w-full max-w-xs overflow-hidden rounded-md border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- previews a blob: or CDN URL, not worth the next/image config for an admin form */}
              <img
                src={previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40">
                <ZoomIn className="h-5 w-5 text-white opacity-0 transition group-hover:opacity-100" />
              </div>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              )}
            </button>
          )}
          <Input
            id="image"
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={(e) => handleImageChange(e.target.files)}
          />
          {isUploading && <FieldDescription>Uploading...</FieldDescription>}
          {event && (
            <FieldDescription>
              The API currently replaces the event image on every save, so
              re-upload it here even if it isn&apos;t changing, or it will be
              cleared.
            </FieldDescription>
          )}
          {uploadError && <FieldError>{uploadError}</FieldError>}
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.price)}>
            <FieldLabel htmlFor="price">Price (Rp)</FieldLabel>
            <Input
              id="price"
              type="number"
              min={0}
              step={1000}
              aria-invalid={Boolean(errors.price)}
              {...register("price", { valueAsNumber: true })}
            />
            <FieldError errors={errors.price ? [errors.price] : undefined} />
          </Field>

          <Field data-invalid={Boolean(errors.total_tickets)}>
            <FieldLabel htmlFor="total_tickets">Total tickets</FieldLabel>
            <Input
              id="total_tickets"
              type="number"
              min={1}
              aria-invalid={Boolean(errors.total_tickets)}
              {...register("total_tickets", { valueAsNumber: true })}
            />
            <FieldError
              errors={errors.total_tickets ? [errors.total_tickets] : undefined}
            />
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.category_id)}>
          <FieldLabel htmlFor="category_id">Category</FieldLabel>
          <Controller
            control={control}
            name="category_id"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="category_id" className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingCategories
                        ? "Loading categories..."
                        : "Select category"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError
            errors={errors.category_id ? [errors.category_id] : undefined}
          />
        </Field>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting
              ? "Saving..."
              : event
                ? "Save changes"
                : "Create event"}
          </Button>
        </div>
      </form>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle className="sr-only">Event image preview</DialogTitle>
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- previews a blob: or CDN URL, not worth the next/image config for an admin form
            <img
              src={previewUrl}
              alt=""
              className="max-h-[70vh] w-full rounded-md object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
