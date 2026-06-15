// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createStorage, persistentState } from "../../src";

describe("createStorage — SSR / no document", () => {
  it("does not throw and reads as empty (consumer uses default)", () => {
    const storage = createStorage();
    expect(() => storage.set("theme", "dark")).not.toThrow();
    expect(storage.get("theme")).toBeNull();
  });

  it("persistentState yields the default on the server", () => {
    const storage = createStorage();
    const state = persistentState({ key: "theme", defaultValue: "system", storage });
    expect(state.get()).toBe("system");
    expect(() => state.set("dark")).not.toThrow();
  });
});
