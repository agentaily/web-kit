// @vitest-environment node
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "../../src";

function Probe() {
  const { theme, resolvedTheme } = useTheme();
  return createElement("span", null, `${theme}:${resolvedTheme}`);
}

describe("ThemeProvider — SSR / no window", () => {
  it("renders on the server without throwing (degrades to default → light)", () => {
    const html = renderToStaticMarkup(
      createElement(ThemeProvider, { defaultTheme: "system", children: createElement(Probe) }),
    );
    expect(html).toContain("system:light");
  });
});
