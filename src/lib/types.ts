export interface Admin {
  id: string;
  name: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image_url?: string;
  price: number;
  total_tickets: number;
  available_tickets: number;
  category_id: string;
  category?: Category;
  created_at: string;
  updated_at: string;
}

// Matches backend's models.OrderStatus (internal/models/order.go).
export type OrderStatus = "pending" | "paid" | "cancelled" | "expired";

// Matches backend's dto.OrderResponse (internal/dto/order_dto.go): event and
// buyer fields are flattened onto the order rather than nested objects.
export interface OrderItem {
  id: string;
  order_id: string;
  event_id: string;
  event_title?: string;
  event_image?: string;
  event_description?: string;
  event_date?: string;
  event_location?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  admin_fee: number;
  total_price: number;
  status: OrderStatus;
  payment_url: string;
  snap_token: string;
  payment_method: string;
  ticket_reference: string | null;
  buyer_name?: string;
  buyer_email?: string;
  paid_at: string | null;
  expires_at: string | null;
  purchased_at: string;
  created_at: string;
  updated_at: string;
}

// Matches backend's dto.UserResponse (internal/dto/user_dto.go).
export interface UserItem {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

// Matches backend's dto.Pagination (internal/dto/response.go).
export interface ApiPagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  per_page: number;
}

// Matches backend's dto.ListResponse envelope: a flat array in `data` plus a
// separate `pagination` object, rather than a nested `{ items, ... }` shape.
export interface ApiListEnvelope<T> {
  success: boolean;
  data: T[];
  pagination: ApiPagination;
}

export function toPaginated<T>(envelope: ApiListEnvelope<T>): Paginated<T> {
  return {
    items: envelope.data,
    page: envelope.pagination.current_page,
    per_page: envelope.pagination.per_page,
    total: envelope.pagination.total_items,
    total_pages: envelope.pagination.total_pages,
  };
}

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
