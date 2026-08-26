import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

export const CategorySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  is_active: z.boolean(),
});

export type CategoryFormData = z.infer<typeof CategorySchema>;

export const EventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().optional(),
  event_date: z.string().min(1, "Event date is required"),
  location: z.string().min(1, "Location is required"),
  image_id: z.string().optional(),
  price: z.number().min(0, "Price must be 0 or greater"),
  total_tickets: z.number().int().positive("Total tickets must be greater than 0"),
  category_id: z.string().min(1, "Select a category"),
});

export type EventFormData = z.infer<typeof EventSchema>;
