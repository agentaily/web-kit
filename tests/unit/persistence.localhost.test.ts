/**
 * @vitest-environment jsdom
 * @vitest-environment-options { "url": "http://localhost:3000/" }
 */
import { afterEach, describe, expect, it } from "vitest";
import { createStorage } from "../../src";
import { captureCookieWrites } from "../helpers/cookies";

afterEach(() => {
  window.localStorage.clear();
});

describe("createStorage — localhost dev fallback", () => {
  it("never writes a .agentaily.com cookie; persists via localStorage and survives refresh", () => {
    const cap = captureCookieWrites();
    const storage = createStorage(); // auto, on localhost
    storage.set("theme", "dark");

    // No cross-subdomain cookie is attempted for the real key (it would be rejected).
    const domainCookie = cap.writes.some(
      (w) => w.startsWith("agentaily%3Atheme") && w.includes("domain="),
    );
    expect(domainCookie).toBe(false);

    // Falls back to localStorage.
    expect(window.localStorage.getItem("agentaily:theme")).toBe("dark");
    cap.restore();

    // "Refresh": a fresh storage instance still reads the value.
    expect(createStorage().get("theme")).toBe("dark");
  });
});
