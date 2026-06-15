// Realizes features/i18n.feature at component altitude: a product injects its
// catalogs via createI18n, and a consumer renders messages / switches locale.
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createI18n, createStorage } from "../../src";
import { clearCookies } from "../helpers/cookies";

const catalogs = {
  en: { greeting: "Hello" },
  zh: { greeting: "你好" },
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

describe("Feature: 国际化(机制共享 + catalog 每产品注入)", () => {
  it("Scenario: 默认 locale 探测(navigator.language=zh-CN → zh, <html lang=zh>)", () => {
    setNavigatorLanguage("zh-CN");
    const { LocaleProvider, useMessages } = createI18n({ catalogs, defaultLocale: "en" });
    function Greeting() {
      return <p>{useMessages().greeting}</p>;
    }
    render(
      <LocaleProvider>
        <Greeting />
      </LocaleProvider>,
    );
    expect(screen.getByText("你好")).toBeInTheDocument();
    expect(document.documentElement.getAttribute("lang")).toBe("zh");
  });

  it("Scenario: 切换语言并持久化(messages 更新、<html lang> 更新、跨子域持久化)", () => {
    setNavigatorLanguage("en-US");
    const i18n = createI18n({ catalogs, defaultLocale: "en" });
    function App() {
      const { setLocale } = i18n.useLocale();
      const messages = i18n.useMessages();
      return (
        <div>
          <p data-testid="msg">{messages.greeting}</p>
          <button onClick={() => setLocale("zh")}>zh</button>
        </div>
      );
    }
    render(
      <i18n.LocaleProvider>
        <App />
      </i18n.LocaleProvider>,
    );
    expect(screen.getByTestId("msg")).toHaveTextContent("Hello");

    fireEvent.click(screen.getByRole("button", { name: "zh" }));
    expect(screen.getByTestId("msg")).toHaveTextContent("你好");
    expect(document.documentElement.getAttribute("lang")).toBe("zh");
    expect(createStorage().get("locale")).toBe("zh"); // persisted cross-subdomain
  });

  it("Scenario: 未知 locale 回退(持久化值不在可用 locales → 默认)", () => {
    setNavigatorLanguage("fr-FR");
    createStorage().set("locale", "de"); // unknown
    const { LocaleProvider, useLocale } = createI18n({ catalogs, defaultLocale: "en" });
    function Show() {
      return <p data-testid="loc">{useLocale().locale}</p>;
    }
    render(
      <LocaleProvider>
        <Show />
      </LocaleProvider>,
    );
    expect(screen.getByTestId("loc")).toHaveTextContent("en");
  });
});
