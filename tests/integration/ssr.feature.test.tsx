// @vitest-environment node
// Realizes the "SSR / 无 window/document 安全" scenarios of theme.feature and
// persistence.feature: rendering / reading on the server must not throw.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ThemeProvider, createStorage, useTheme } from "../../src";

function Probe() {
  const { theme, resolvedTheme } = useTheme();
  return createElement("span", null, `${theme}/${resolvedTheme}`);
}

describe("Feature: SSR / 无 window 安全", () => {
  it("Scenario(theme): 渲染 ThemeProvider 不抛错(退化为默认主题)", () => {
    let markup = "";
    expect(() => {
      markup = renderToStaticMarkup(
        createElement(ThemeProvider, { defaultTheme: "system", children: createElement(Probe) }),
      );
    }).not.toThrow();
    expect(markup).toContain("system/light");
  });

  it("Scenario(persistence): 读取持久化偏好不抛错,返回默认值", () => {
    const storage = createStorage();
    expect(() => storage.get("theme")).not.toThrow();
    expect(storage.get("theme")).toBeNull();
    expect(() => storage.set("theme", "dark")).not.toThrow();
  });
});
