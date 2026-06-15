// Single source of truth for the "are we in a browser?" guard. Every access to
// window / document / navigator / document.cookie in this library funnels through
// an isBrowser() check (directly or via a guarded store) so the package is
// SSR-safe: importing or rendering on the server never touches a missing global.
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}
