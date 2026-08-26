import { renderHook, act } from "@testing-library/react";
import { useConfirm } from "@/hooks/useConfirm";

describe("useConfirm", () => {
  it("starts closed with no target", () => {
    const { result } = renderHook(() => useConfirm());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.targetId).toBeNull();
  });

  it("request opens the dialog with the given id", () => {
    const { result } = renderHook(() => useConfirm());

    act(() => {
      result.current.request("event-1");
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.targetId).toBe("event-1");
  });

  it("close resets the target and closes the dialog", () => {
    const { result } = renderHook(() => useConfirm());

    act(() => {
      result.current.request("event-1");
    });
    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.targetId).toBeNull();
  });
});
