// Realizes features/persistence.feature (cross-subdomain cookie, privacy mode,
// non-sensitive data) through the public storage API + provider usage.
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, createStorage, useTheme } from "../../src";
import { captureCookieWrites, clearCookies } from "../helpers/cookies";
import { installMatchMedia, type MatchMediaController } from "../helpers/matchMedia";

let mm: MatchMediaController | undefined;

afterEach(() => {
  mm?.restore();
  mm = undefined;
  clearCookies();
  window.localStorage.clear();
  vi.restoreAllMocks();
  document.documentElement.removeAttribute("data-theme");
});

function DarkButton() {
  const { setTheme } = useTheme();
  return <button onClick={() => setTheme("dark")}>go dark</button>;
}

describe("Feature: 跨子域持久化(cookie + 回退 + SSR 安全)", () => {
  it("Scenario: 跨子域 cookie 写入(domain=.agentaily.com, SameSite=Lax)并被另一子域读到", () => {
    mm = installMatchMedia(false);
    const cap = captureCookieWrites();
    render(
      <ThemeProvider>
        <DarkButton />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "go dark" }));

    const write = cap.writes.find((w) => w.startsWith("agentaily%3Atheme=dark"));
    expect(write).toContain("domain=.agentaily.com");
    expect(write).toContain("SameSite=Lax");
    cap.restore();

    // A different *.agentaily.com subdomain (same .agentaily.com cookie jar) reads it.
    expect(createStorage().get("theme")).toBe("dark");
  });

  it("Scenario: 隐私模式 / 存储被禁不抛错(退化为内存态)", () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("disabled");
    });
    const original = Object.getOwnPropertyDescriptor(document, "cookie");
    Object.defineProperty(document, "cookie", { configurable: true, get: () => "", set: () => {} });

    const storage = createStorage();
    expect(() => storage.set("theme", "dark")).not.toThrow();
    expect(storage.get("theme")).toBe("dark"); // memory, this session

    if (original) Object.defineProperty(document, "cookie", original);
  });

  it("Scenario: 只存非敏感数据(cookie 里只有 theme/locale 这类偏好)", () => {
    mm = installMatchMedia(false);
    const cap = captureCookieWrites();
    const storage = createStorage();
    storage.set("theme", "dark");
    storage.set("locale", "zh");

    const realWrites = cap.writes.filter((w) => !w.startsWith("__web_kit_probe__"));
    for (const w of realWrites) {
      const name = w.split("=")[0] ?? "";
      // only the agentaily preference keys — nothing sensitive
      expect(name).toMatch(/^agentaily%3A(theme|locale)$/);
    }
    cap.restore();
  });
});
