import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/lib/constants";
import { useAdminAuth } from "@/lib/store/auth.store";

export const api = axios.create({
  baseURL: API_URL,
  // Auth is httpOnly cookies now, not a header - the browser needs to be
  // told to actually send/accept them on cross-origin requests.
  withCredentials: true,
  // Axios has no timeout by default. Without one, a slow/hanging network
  // leaves /admin/auth/me unresolved indefinitely, which stalls hydration
  // (see useAdminAuth) and leaves the login/dashboard gate blank forever.
  timeout: 10_000,
});

// CSRF is enforced server-side by an Origin/Referer allowlist (the SPA and API
// are on different registrable domains, so a double-submit cookie could never
// work — the frontend JS can't read the API's cookie). Nothing to send from
// here beyond the credentialed cookies; `withCredentials: true` covers it.

// A burst of concurrent requests that all hit a 401 (expired access token)
// should trigger exactly one /admin/auth/refresh call, not one per request.
let refreshPromise: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/admin/auth/refresh")
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Response interceptor - transparently refresh an expired access token once,
// then fall back to logging out. Only /admin/auth/refresh itself is excluded
// (a 401 there would otherwise recurse into another refresh attempt).
// /admin/auth/me deliberately goes through the same retry path: it's the
// call hydration fires on every mount, so an expired-but-refreshable access
// token must not log the admin out before a refresh is even attempted.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const url = originalRequest?.url ?? "";
    const isRefreshCall = url.includes("/admin/auth/refresh");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshCall
    ) {
      originalRequest._retry = true;

      const refreshed = await refreshSession();
      if (refreshed) {
        return api(originalRequest);
      }

      useAdminAuth.getState().logout();

      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- outside the React tree, no router available in an axios interceptor
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
