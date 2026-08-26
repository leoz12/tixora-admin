import "@testing-library/jest-dom";

// jsdom doesn't implement these; Radix UI (Select/Dialog/etc, used throughout
// components/ui) and EventForm's image preview rely on them being present.
if (!window.HTMLElement.prototype.hasPointerCapture) {
  window.HTMLElement.prototype.hasPointerCapture = () => false;
}
if (!window.HTMLElement.prototype.releasePointerCapture) {
  window.HTMLElement.prototype.releasePointerCapture = () => {};
}
if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}
if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = () => "blob:mock-url";
}
if (!window.URL.revokeObjectURL) {
  window.URL.revokeObjectURL = () => {};
}
