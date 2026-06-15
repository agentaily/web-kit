import type { ReactNode } from "react";
import type { StorageConfig } from "../persistence/types";

/** User-facing theme choice (includes `system`). */
export type ThemeMode = "system" | "light" | "dark";

/** The concrete theme actually applied to the document. */
export type ResolvedTheme = "light" | "dark";

export interface ThemeProviderProps {
  children: ReactNode;
  /** Initial theme when nothing is persisted. Default `system`. */
  defaultTheme?: ThemeMode;
  /** Persistence configuration (shared cross-subdomain cookie by default). */
  storage?: StorageConfig;
  /** Attribute set on `<html>` to carry the resolved theme. Default `data-theme`. */
  attribute?: string;
}

export interface ThemeContextValue {
  /** User selection, including `system`. */
  theme: ThemeMode;
  /** Concrete `light` | `dark` in effect (resolves `system` via matchMedia). */
  resolvedTheme: ResolvedTheme;
  setTheme(theme: ThemeMode): void;
}

export interface ThemeInitScriptOptions {
  /** Theme to assume when nothing is persisted. Default `system`. */
  defaultTheme?: ThemeMode;
  /** Attribute to set on `<html>`. Default `data-theme`. */
  attribute?: string;
  /** Full storage key (prefix + key) the ThemeProvider persists to.
   * Default `agentaily:theme`. Keep in sync with the provider's keyPrefix. */
  storageKey?: string;
}
