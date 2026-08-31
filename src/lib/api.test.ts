import MockAdapter from "axios-mock-adapter";
import { api } from "@/lib/api";
import { useAdminAuth } from "@/lib/store/auth.store";

describe("api response interceptor - silent refresh", () => {
  let mock: MockAdapter;
  // jsdom's `window.location` accessor is non-configurable, so it can't be
  // swapped for a mock object. Instead we navigate for real via pushState
  // (jsdom supports same-origin history navigation) and detect an attempted
  // `location.href` assignment via jsdom's "Not implemented: navigation"
  // console.error, which it emits synchronously for any href/assign call.
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mock = new MockAdapter(api);
    useAdminAuth.setState({ admin: null, isAuthenticated: false, isHydrated: false });
    window.history.pushState({}, "", "/dashboard");
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    mock.restore();
    consoleErrorSpy.mockRestore();
    window.history.pushState({}, "", "/");
  });

  function navigationWasAttempted() {
    return consoleErrorSpy.mock.calls.some(([error]) =>
      String(error?.message ?? error).includes("navigation")
    );
  }

  it("retries the original request once after a successful refresh", async () => {
    let eventsCallCount = 0;
    mock.onPost("/admin/auth/refresh").reply(200);
    mock.onGet("/events").reply(() => {
      eventsCallCount += 1;
      return eventsCallCount === 1 ? [401] : [200, { data: [] }];
    });

    const response = await api.get("/events");

    expect(response.status).toBe(200);
    expect(eventsCallCount).toBe(2);
    expect(mock.history.post.filter((r) => r.url === "/admin/auth/refresh")).toHaveLength(1);
  });

  it("shares a single in-flight refresh across concurrent 401s", async () => {
    let refreshCallCount = 0;
    mock.onPost("/admin/auth/refresh").reply(() => {
      refreshCallCount += 1;
      return [200];
    });
    mock.onGet("/events").replyOnce(401);
    mock.onGet("/events").reply(200, { data: [] });
    mock.onGet("/categories").replyOnce(401);
    mock.onGet("/categories").reply(200, { data: [] });

    await Promise.all([api.get("/events"), api.get("/categories")]);

    expect(refreshCallCount).toBe(1);
  });

  it("logs out and redirects to /login when refresh fails", async () => {
    useAdminAuth.getState().setAdmin({ id: "1", name: "Ada", email: "ada@tixora.com" });
    mock.onPost("/admin/auth/refresh").reply(401);
    mock.onGet("/events").reply(401);

    await expect(api.get("/events")).rejects.toBeTruthy();

    expect(useAdminAuth.getState().isAuthenticated).toBe(false);
    expect(navigationWasAttempted()).toBe(true);
  });

  it("does not redirect when already on /login", async () => {
    window.history.pushState({}, "", "/login");
    mock.onPost("/admin/auth/refresh").reply(401);
    mock.onGet("/events").reply(401);

    await expect(api.get("/events")).rejects.toBeTruthy();

    expect(navigationWasAttempted()).toBe(false);
  });

  it("attempts a silent refresh and retries on a 401 from /admin/auth/me", async () => {
    let meCallCount = 0;
    mock.onPost("/admin/auth/refresh").reply(200);
    mock.onGet("/admin/auth/me").reply(() => {
      meCallCount += 1;
      return meCallCount === 1 ? [401] : [200, { data: { id: "1", name: "Ada", email: "ada@tixora.com" } }];
    });

    const response = await api.get("/admin/auth/me");

    expect(response.status).toBe(200);
    expect(meCallCount).toBe(2);
    expect(mock.history.post.filter((r) => r.url === "/admin/auth/refresh")).toHaveLength(1);
  });

  it("does not attempt a refresh for a 401 on /admin/auth/refresh itself", async () => {
    mock.onPost("/admin/auth/refresh").reply(401);

    await expect(api.post("/admin/auth/refresh")).rejects.toBeTruthy();

    // Only the one call we made ourselves - the interceptor must not try to
    // refresh a failed refresh (that would recurse forever).
    expect(mock.history.post.filter((r) => r.url === "/admin/auth/refresh")).toHaveLength(1);
  });

  it("does not loop forever when the retried request is also 401", async () => {
    mock.onPost("/admin/auth/refresh").reply(200);
    mock.onGet("/events").reply(401);

    await expect(api.get("/events")).rejects.toBeTruthy();

    // Original request + exactly one retry - the second 401 is not retried
    // again because _retry is already true.
    expect(mock.history.get.filter((r) => r.url === "/events")).toHaveLength(2);
  });
});
