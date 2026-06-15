import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { createI18n, createStorage } from "../../src";
import { captureCookieWrites, clearCookies } from "../helpers/cookies";

const catalogs = {
  en: { greeting: "Hello", nested: { hi: "Hi" } },
  zh: { greeting: "你好", nested: { hi: "嗨" } },
};

function setNavigatorLanguage(lang: string): void {
  Object.defineProperty(navigator, "language", { configurable: true, value: lang });
}

afterEach(() => {
  Reflect.deleteProperty(navigator as unknown as Record<string, unknown>, "language");
  clearCookies();
  window.localStorage.clear();
  document.documentElement.removeAttribute("lang");
});

type I18n = ReturnType<typeof createI18n<typeof catalogs>>;
const wrap =
  (i18n: I18n) =>
  ({ children }: { children: ReactNode }) => <i18n.LocaleProvider>{children}</i18n.LocaleProvider>;

describe("createI18n", () => {
  it("detects the default locale from navigator.language", () => {
    setNavigatorLanguage("zh-CN");
    const i18n = createI18n({ catalogs, defaultLocale: "en" });
    const { result } = renderHook(() => i18n.useLocale(), { wrapper: wrap(i18n) });
    expect(result.current.locale).toBe("zh"); // "zh-CN" → primary "zh"
    expect(document.documentElement.getAttribute("lang")).toBe("zh");
  });

  it("switches the locale, updates messages + <html lang>, and persists it", () => {
    setNavigatorLanguage("en-US");
    const cap = captureCookieWrites();
    const i18n = createI18n({ catalogs, defaultLocale: "en" });
    const { result } = renderHook(() => ({ ...i18n.useLocale(), messages: i18n.useMessages() }), {
      wrapper: wrap(i18n),
    });

    expect(result.current.locale).toBe("en");
    expect(result.current.messages.greeting).toBe("Hello");

    act(() => result.current.setLocale("zh"));
    expect(result.current.messages.greeting).toBe("你好");
    expect(document.documentElement.getAttribute("lang")).toBe("zh");
    expect(cap.writes.some((w) => w.startsWith("agentaily%3Alocale=zh"))).toBe(true);
    cap.restore();
  });

  it("falls back to the default for an unknown persisted locale", () => {
    setNavigatorLanguage("fr-FR"); // no matching catalog
    createStorage().set("locale", "de"); // not an available locale
    const i18n = createI18n({ catalogs, defaultLocale: "en" });
    const { result } = renderHook(() => i18n.useLocale(), { wrapper: wrap(i18n) });
    expect(result.current.locale).toBe("en");
  });

  it("exposes the available locales", () => {
    const i18n = createI18n({ catalogs, defaultLocale: "en" });
    const { result } = renderHook(() => i18n.useLocale(), { wrapper: wrap(i18n) });
    expect([...result.current.locales].sort()).toEqual(["en", "zh"]);
  });

  it("is type-safe — useMessages() matches the injected catalog shape", () => {
    setNavigatorLanguage("en-US");
    const i18n = createI18n({ catalogs, defaultLocale: "en" });
    const { result } = renderHook(() => i18n.useMessages(), { wrapper: wrap(i18n) });
    expect(result.current.greeting).toBe("Hello");
    expect(result.current.nested.hi).toBe("Hi");
    // @ts-expect-error — `missing` is not a key of the catalog (compile-time guarantee)
    expect(result.current.missing).toBeUndefined();
  });

  it("throws when the hooks are used outside a provider", () => {
    const i18n = createI18n({ catalogs, defaultLocale: "en" });
    expect(() => renderHook(() => i18n.useLocale())).toThrow(/LocaleProvider/);
  });
});
