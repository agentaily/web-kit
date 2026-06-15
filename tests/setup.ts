// Extends vitest's `expect` with @testing-library/jest-dom matchers
// (toBeInTheDocument, toHaveAttribute, …). Loaded via vitest.config setupFiles.
import "@testing-library/jest-dom/vitest";

// vitest's jsdom environment does not expose a working `window.localStorage`
// (the property exists but reads as undefined). Real browsers have it, so we
// install a minimal in-memory Storage to model "a browser that has localStorage".
// Tests that need to simulate private mode / disabled storage spy on its methods.
if (typeof window !== "undefined" && !window.localStorage) {
  class MemoryStorage implements Storage {
    private store = new Map<string, string>();
    get length(): number {
      return this.store.size;
    }
    clear(): void {
      this.store.clear();
    }
    getItem(key: string): string | null {
      return this.store.has(key) ? (this.store.get(key) as string) : null;
    }
    setItem(key: string, value: string): void {
      this.store.set(key, String(value));
    }
    removeItem(key: string): void {
      this.store.delete(key);
    }
    key(index: number): string | null {
      return Array.from(this.store.keys())[index] ?? null;
    }
  }
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: new MemoryStorage(),
  });
}
