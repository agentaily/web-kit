// @agentaily/web-kit — cross-product browser runtime (theme + i18n + persistence).
// Non-visual: Providers / hooks / utilities only — no rendered UI, no CSS.

// Theme
export { ThemeProvider } from "./theme/ThemeProvider";
export { useTheme } from "./theme/useTheme";
export { themeInitScript } from "./theme/themeInitScript";
export type {
  ResolvedTheme,
  ThemeContextValue,
  ThemeInitScriptOptions,
  ThemeMode,
  ThemeProviderProps,
} from "./theme/types";

// i18n
export { createI18n } from "./i18n/createI18n";
export type {
  CreateI18nConfig,
  I18nApi,
  LocaleContextValue,
  LocaleProviderProps,
} from "./i18n/createI18n";

// Persistence
export { createStorage, persistentState } from "./persistence";
export type {
  PersistentState,
  PersistentStateOptions,
  PreferenceStorage,
  StorageBackend,
  StorageConfig,
} from "./persistence";
