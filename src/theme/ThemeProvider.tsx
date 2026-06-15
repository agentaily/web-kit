import { useCallback, useEffect, useMemo, useState } from "react";
import { isBrowser } from "../internal/env";
import { createStorage } from "../persistence/createStorage";
import { persistentState } from "../persistence/persistentState";
import { ThemeContext } from "./context";
import type { ResolvedTheme, ThemeContextValue, ThemeMode, ThemeProviderProps } from "./types";

const THEME_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";
const VALID_MODES: ThemeMode[] = ["system", "light", "dark"];

function systemResolved(): ResolvedTheme {
  if (!isBrowser() || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function resolve(theme: ThemeMode): ResolvedTheme {
  return theme === "system" ? systemResolved() : theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storage,
  attribute = "data-theme",
}: ThemeProviderProps) {
  // Storage config is fixed for the provider's lifetime; build once.
  const state = useMemo(
    () =>
      persistentState<ThemeMode>({
        key: THEME_KEY,
        defaultValue: defaultTheme,
        storage: createStorage(storage),
        decode: (raw) => (VALID_MODES.includes(raw as ThemeMode) ? (raw as ThemeMode) : undefined),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Initial render reads the persisted choice (browser) or the default (SSR).
  // The theme is never written into the JSX tree — only as a side effect onto
  // <html> — so there is no hydration mismatch even if SSR/client differ.
  const [theme, setThemeState] = useState<ThemeMode>(() => state.get());
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolve(theme));

  // Apply the resolved theme to <html> whenever the selection changes.
  useEffect(() => {
    const next = resolve(theme);
    setResolvedTheme(next);
    if (isBrowser()) document.documentElement.setAttribute(attribute, next);
  }, [theme, attribute]);

  // While following the system, react to OS-level scheme changes in real time.
  useEffect(() => {
    if (theme !== "system" || !isBrowser() || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(DARK_QUERY);
    const onChange = (): void => {
      const next: ResolvedTheme = mql.matches ? "dark" : "light";
      setResolvedTheme(next);
      document.documentElement.setAttribute(attribute, next);
    };
    if (typeof mql.addEventListener === "function") mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    return () => {
      if (typeof mql.removeEventListener === "function")
        mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [theme, attribute]);

  const setTheme = useCallback(
    (next: ThemeMode): void => {
      setThemeState(next);
      state.set(next);
    },
    [state],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
