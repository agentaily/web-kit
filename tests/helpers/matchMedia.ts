import { vi } from "vitest";

export interface MatchMediaController {
  /** Flip the `(prefers-color-scheme: dark)` match and notify listeners. */
  set(matches: boolean): void;
  restore(): void;
}

/**
 * Install a controllable `window.matchMedia` (jsdom ships none). Supports both
 * the modern add/removeEventListener and the legacy add/removeListener APIs.
 */
export function installMatchMedia(initialDark: boolean): MatchMediaController {
  let matches = initialDark;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  const mql = {
    get matches() {
      return matches;
    },
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addEventListener: (_type: string, cb: (event: MediaQueryListEvent) => void) => {
      listeners.add(cb);
    },
    removeEventListener: (_type: string, cb: (event: MediaQueryListEvent) => void) => {
      listeners.delete(cb);
    },
    addListener: (cb: (event: MediaQueryListEvent) => void) => {
      listeners.add(cb);
    },
    removeListener: (cb: (event: MediaQueryListEvent) => void) => {
      listeners.delete(cb);
    },
    dispatchEvent: () => true,
  };

  const fn = vi.fn(() => mql as unknown as MediaQueryList);
  Object.defineProperty(window, "matchMedia", { configurable: true, writable: true, value: fn });

  return {
    set(next: boolean) {
      matches = next;
      const event = { matches: next, media: mql.media } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
    restore() {
      Reflect.deleteProperty(window, "matchMedia");
    },
  };
}
