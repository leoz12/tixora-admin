import { AxiosError, AxiosHeaders } from "axios";
import { cn, formatDate, formatRupiah, getErrorMessage } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and drops falsy values", () => {
    expect(cn("px-2", false && "hidden", "py-1")).toBe("px-2 py-1");
  });

  it("resolves conflicting tailwind classes to the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("formatRupiah", () => {
  it("formats a number as Indonesian rupiah with thousands separators", () => {
    expect(formatRupiah(1500000)).toBe("Rp 1.500.000");
  });

  it("formats zero", () => {
    expect(formatRupiah(0)).toBe("Rp 0");
  });
});

describe("formatDate", () => {
  it("formats an ISO date string in id-ID day/month/year form", () => {
    expect(formatDate("2026-03-05T00:00:00.000Z")).toBe("05 Mar 2026");
  });
});

describe("getErrorMessage", () => {
  it("returns the backend message from an axios error response", () => {
    const error = new AxiosError(
      "Request failed",
      "400",
      undefined,
      undefined,
      {
        status: 400,
        statusText: "Bad Request",
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
        data: { message: "Invalid credentials" },
      }
    );

    expect(getErrorMessage(error, "fallback")).toBe("Invalid credentials");
  });

  it("falls back when the axios error has no response body message", () => {
    const error = new AxiosError("Network Error");
    expect(getErrorMessage(error, "fallback")).toBe("fallback");
  });

  it("falls back for a non-axios error", () => {
    expect(getErrorMessage(new Error("boom"), "fallback")).toBe("fallback");
  });
});
