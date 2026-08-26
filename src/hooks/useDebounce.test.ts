import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("first", 300));
    expect(result.current).toBe("first");
  });

  it("does not update before the delay elapses", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "first" },
    });

    rerender({ value: "second" });
    act(() => {
      jest.advanceTimersByTime(299);
    });

    expect(result.current).toBe("first");
  });

  it("updates to the latest value once the delay elapses", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "first" },
    });

    rerender({ value: "second" });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe("second");
  });

  it("resets the timer on rapid successive changes, keeping only the last value", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "first" },
    });

    rerender({ value: "second" });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    rerender({ value: "third" });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Only 200ms have passed since "third" was set, so it shouldn't have
    // committed yet, and "second" was superseded before its own delay fired.
    expect(result.current).toBe("first");

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe("third");
  });
});
