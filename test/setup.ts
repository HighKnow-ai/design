/**
 * jest-dom's matchers and Testing Library's cleanup, wired explicitly, plus the two browser APIs
 * jsdom lacks and Radix reaches for: `ResizeObserver` (checkbox, radio, scroll area) and
 * `matchMedia` (the sidebar's phone breakpoint). Nothing under test depends on a measured size or
 * a real media query, so no-op stand-ins are enough.
 */
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";

expect.extend(matchers);

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}

// Sonner captures the pointer on a toast (for its swipe) and Radix asks whether it has; jsdom
// implements neither, and a real press through user-event reaches both.
if (typeof Element.prototype.setPointerCapture !== "function") {
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.hasPointerCapture = () => false;
}

// Sonner reads the system scheme, and nothing else here needs a real query: every query is false.
if (typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }),
  });
}

afterEach(() => {
  cleanup();
  try {
    window.localStorage.clear();
  } catch {
    // No storage in this environment: nothing to clear.
  }
});
