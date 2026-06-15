import { useContext } from "react";
import { ThemeContext } from "./context";
import type { ThemeContextValue } from "./types";

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return ctx;
}
