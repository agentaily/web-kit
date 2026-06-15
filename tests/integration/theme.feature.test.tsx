// Realizes features/theme.feature at component altitude: a real consumer renders
// inside <ThemeProvider>, the user interacts, and we assert the DOM + <html>.
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeProvider, themeInitScript, useTheme } from "../../src";
import { clearCookies } from "../helpers/cookies";
import { installMatchMedia, type MatchMediaController } from "../helpers/matchMedia";

let mm: MatchMediaController | undefined;

afterEach(() => {
  mm?.restore();
  mm = undefined;
  clearCookies();
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <output data-testid="theme">{theme}</output>
      <output data-testid="resolved">{resolvedTheme}</output>
      <button onClick={() => setTheme("light")}>light</button>
      <button onClick={() => setTheme("dark")}>dark</button>
      <button onClick={() => setTheme("system")}>system</button>
    </div>
  );
}

const html = () => document.documentElement.getAttribute("data-theme");

describe("Feature: 主题切换(三态 + 防 FOUC)", () => {
  it("Scenario: 默认跟随系统(system=dark → resolved dark, <html data-theme=dark>)", () => {
    mm = installMatchMedia(true);
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("system");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(html()).toBe("dark");
  });

  it("Scenario: 系统主题变化时实时跟随(light → dark)", () => {
    mm = installMatchMedia(false);
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    act(() => mm!.set(true)); // OS switches to dark
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(html()).toBe("dark");
  });

  it("Scenario: 用户显式选择覆盖系统(并持久化、不再跟随)", () => {
    mm = installMatchMedia(true); // system dark
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "light" }));
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    expect(html()).toBe("light");

    // system keeps changing — no longer followed
    act(() => mm!.set(false));
    act(() => mm!.set(true));
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
  });

  it("Scenario: 防 FOUC —— themeInitScript 在首屏前定主题", () => {
    document.cookie = "agentaily%3Atheme=dark; path=/";
    // The inline <head> snippet runs before React mounts.
    new Function(themeInitScript())();
    expect(html()).toBe("dark");

    // React then mounts and agrees — no flash.
    mm = installMatchMedia(false);
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(html()).toBe("dark");
  });
});
