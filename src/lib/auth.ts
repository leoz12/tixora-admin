import { api } from "@/lib/api";
import type { Admin } from "@/lib/types";
import type { LoginFormData } from "@/lib/validators";

export async function login(data: LoginFormData) {
  const response = await api.post<{ data: { admin: Admin } }>(
    "/admin/auth/login",
    data
  );
  return response.data.data;
}

export async function fetchCurrentAdmin() {
  const response = await api.get<{ data: Admin }>("/admin/auth/me");
  return response.data.data;
}

// Changes the current admin's password. The backend revokes every *other*
// session but keeps this one alive (the auth cookies are rotated in place),
// so a successful change leaves the admin logged in here.
export async function changePassword(data: {
  current_password: string;
  new_password: string;
}) {
  await api.post("/admin/auth/change-password", data);
}

// Revokes the refresh token server-side. Best-effort - the caller clears
// local auth state regardless of whether this succeeds.
export async function logoutRequest() {
  try {
    await api.post("/admin/auth/logout");
  } catch (error) {
    console.error("Failed to revoke session:", error);
  }
}
