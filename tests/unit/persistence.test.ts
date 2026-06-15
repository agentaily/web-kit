import { afterEach, describe, expect, it, vi } from "vitest";
import { createStorage, persistentState } from "../../src";
import { captureCookieWrites, clearCookies } from "../helpers/cookies";

afterEach(() => {
  clearCookies();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("createStorage — cross-subdomain cookie (auto on *.agentaily.com)", () => {
  it("writes domain=.agentaily.com, SameSite=Lax, path=/ and round-trips", () => {
    const cap = captureCookieWrites();
    const storage = createStorage(); // auto, default jsdom origin form-design.agentaily.com
    storage.set("theme", "dark");

    const write = cap.writes.find((w) => w.startsWith("agentaily%3Atheme=dark"));
    expect(write).toBeDefined();
    expect(write).toContain("domain=.agentaily.com");
    expect(write).toContain("SameSite=Lax");
    expect(write).toContain("path=/");
    expect(write).toContain("max-age=");
    // https origin → Secure
    expect(write).toContain("Secure");

    expect(storage.get("theme")).toBe("dark");
    cap.restore();
  });

  it("applies keyPrefix to the persisted key", () => {
    const cap = captureCookieWrites();
    const storage = createStorage({ keyPrefix: "myapp:" });
    storage.set("locale", "en");
    expect(cap.writes.some((w) => w.startsWith("myapp%3Alocale=en"))).toBe(true);
    expect(storage.get("locale")).toBe("en");
    cap.restore();
  });

  it("remove deletes the value", () => {
    const storage = createStorage();
    storage.set("theme", "dark");
    storage.remove("theme");
    expect(storage.get("theme")).toBeNull();
  });
});

describe("createStorage — degraded environments do not throw", () => {
  it("falls back to in-memory when cookie and localStorage are both unavailable", () => {
    // localStorage throws (private mode)
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    // cookies disabled: writes are dropped so a probe can't round-trip
    const original = Object.getOwnPropertyDescriptor(document, "cookie");
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get: () => "",
      set: () => {},
    });

    const storage = createStorage();
    expect(() => storage.set("theme", "dark")).not.toThrow();
    // in-memory round-trip within the session
    expect(storage.get("theme")).toBe("dark");

    if (original) Object.defineProperty(document, "cookie", original);
    else Reflect.deleteProperty(document as unknown as Record<string, unknown>, "cookie");
  });
});

describe("persistentState", () => {
  it("returns the default when nothing is stored", () => {
    const storage = createStorage();
    const state = persistentState({ key: "x", defaultValue: "system", storage });
    expect(state.get()).toBe("system");
  });

  it("rejects values the decoder does not accept, falling back to default", () => {
    const storage = createStorage();
    storage.set("x", "bogus");
    const state = persistentState<"a" | "b">({
      key: "x",
      defaultValue: "a",
      storage,
      decode: (raw) => (raw === "a" || raw === "b" ? raw : undefined),
    });
    expect(state.get()).toBe("a");
  });

  it("round-trips a set value", () => {
    const storage = createStorage();
    const state = persistentState({ key: "x", defaultValue: "system", storage });
    state.set("dark");
    expect(state.get()).toBe("dark");
  });
});
