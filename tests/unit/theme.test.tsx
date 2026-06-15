import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeProvider, createStorage, useTheme } from "../../src";
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

const wrap =
  (props: { defaultTheme?: "system" | "light" | "dark" } = {}) =>
  ({ children }: { children: ReactNode }) => <ThemeProvider {...props}>{children}</ThemeProvider>;

describe("ThemeProvider / useTheme", () => {
  it("defaults to system and resolves via prefers-color-scheme (dark)", () => {
    mm = installMatchMedia(true); // system reports dark
    const { result } = renderHook(() => useTheme(), { wrapper: wrap() });
    expect(result.current.theme).toBe("system");
    expect(result.current.resolvedTheme).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("follows system changes in real time while in system mode", () => {
    mm = installMatchMedia(false); // light
    const { result } = renderHook(() => useTheme(), { wrapper: wrap() });
    expect(result.current.resolvedTheme).toBe("light");

    act(() => mm!.set(true)); // OS switches to dark
    expect(result.current.resolvedTheme).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("explicit setTheme overrides system, persists, and stops following the system", () => {
    mm = installMatchMedia(true); // system dark
    const { result } = renderHook(() => useTheme(), { wrapper: wrap() });
    expect(result.current.resolvedTheme).toBe("dark");

    act(() => result.current.setTheme("light"));
    expect(result.current.theme).toBe("light");
    expect(result.current.resolvedTheme).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(createStorage().get("theme")).toBe("light"); // persisted

    // System keeps changing, but we no longer follow it.
    act(() => mm!.set(false));
    act(() => mm!.set(true));
    expect(result.current.resolvedTheme).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("reads a persisted theme on mount (no flash)", () => {
    mm = installMatchMedia(false); // system light
    createStorage().set("theme", "dark");
    const { result } = renderHook(() => useTheme(), { wrapper: wrap() });
    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("throws when used outside a provider", () => {
    expect(() => renderHook(() => useTheme())).toThrow(/ThemeProvider/);
  });
});
