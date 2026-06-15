---
"@agentaily/web-kit": minor
---

v1: cross-product browser runtime.

- **Theme** — `ThemeProvider` / `useTheme` (tri-state `system | light | dark`, `prefers-color-scheme` resolution + live follow, applied as `<html data-theme>`) and `themeInitScript()` for a no-FOUC inline `<head>` snippet.
- **i18n** — `createI18n(catalogs)` factory → type-safe `LocaleProvider` / `useLocale` / `useMessages`, `navigator.language` detection with fallback, `<html lang>`.
- **Persistence** — `createStorage` / `persistentState`: cross-subdomain cookie by default (`domain=.agentaily.com`, `SameSite=Lax`), localhost/auto fallback, SSR- and private-mode-safe.
