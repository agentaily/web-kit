/**
 * @vitest-environment jsdom
 * @vitest-environment-options { "url": "http://localhost:3000/" }
 */
// Realizes features/persistence.feature "localhost dev 回退" scenario.
import { afterEach, describe, expect, it } from "vitest";
import { createStorage } from "../../src";
import { captureCookieWrites } from "../helpers/cookies";

afterEach(() => {
  window.localStorage.clear();
});

describe("Feature: 跨子域持久化 — localhost dev 回退", () => {
  it("Scenario: localhost(.agentaily.com cookie 写不进)→ 回退 localStorage,刷新后仍在", () => {
    const cap = captureCookieWrites();
    const storage = createStorage();
    storage.set("theme", "dark");

    const wroteDomainCookie = cap.writes.some(
      (w) => w.startsWith("agentaily%3Atheme") && w.includes("domain="),
    );
    expect(wroteDomainCookie).toBe(false);
    expect(window.localStorage.getItem("agentaily:theme")).toBe("dark");
    cap.restore();

    // refresh
    expect(createStorage().get("theme")).toBe("dark");
  });
});
