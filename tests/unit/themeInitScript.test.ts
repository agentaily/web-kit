import { afterEach, describe, expect, it } from "vitest";
import { themeInitScript } from "../../src";
import { clearCookies } from "../helpers/cookies";
import { installMatchMedia, type MatchMediaController } from "../helpers/matchMedia";

let mm: MatchMediaController | undefined;

afterEach(() => {
  mm?.restore();
  mm = undefined;
  clearCookies();
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-mode");
});

// Execute the generated snippet the way an inline <head> script would.
function run(script: string): void {
  new Function(script)();
}

describe("themeInitScript", () => {
  it("sets data-theme from a persisted cookie before paint (no FOUC)", () => {
    document.cookie = "agentaily%3Atheme=dark; path=/";
    run(themeInitScript());
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("reads from localStorage when there is no cookie", () => {
    window.localStorage.setItem("agentaily:theme", "light");
    run(themeInitScript());
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("resolves system via matchMedia when nothing is stored", () => {
    mm = installMatchMedia(true); // dark
    run(themeInitScript()); // default theme = system
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("is idempotent (running twice keeps the same result)", () => {
    document.cookie = "agentaily%3Atheme=dark; path=/";
    run(themeInitScript());
    run(themeInitScript());
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("honors a custom attribute and storageKey", () => {
    document.cookie = `${encodeURIComponent("myapp:theme")}=light; path=/`;
    run(themeInitScript({ attribute: "data-mode", storageKey: "myapp:theme" }));
    expect(document.documentElement.getAttribute("data-mode")).toBe("light");
  });

  it("is XSS-safe: interpolated config cannot break out of the <script> tag", () => {
    const script = themeInitScript({
      attribute: "</script><img src=x onerror=alert(1)>",
      storageKey: 'a";evil()//',
    });
    // No raw closing tag → cannot terminate an inline <head> <script> early.
    expect(script).not.toContain("</script>");
    // Still valid, parseable JS.
    expect(() => new Function(script)).not.toThrow();
  });
});
