# @agentaily/web-kit

## 0.1.0

### Minor Changes

- [#1](https://github.com/agentaily/web-kit/pull/1) [`7f572f0`](https://github.com/agentaily/web-kit/commit/7f572f0b7135f850ff89a4ed430a2ffb4b2d2445) Thanks [@yarnovo](https://github.com/yarnovo)! - v1: cross-product browser runtime.

  - **Theme** — `ThemeProvider` / `useTheme` (tri-state `system | light | dark`, `prefers-color-scheme` resolution + live follow, applied as `<html data-theme>`) and `themeInitScript()` for a no-FOUC inline `<head>` snippet.
  - **i18n** — `createI18n(catalogs)` factory → type-safe `LocaleProvider` / `useLocale` / `useMessages`, `navigator.language` detection with fallback, `<html lang>`.
  - **Persistence** — `createStorage` / `persistentState`: cross-subdomain cookie by default (`domain=.agentaily.com`, `SameSite=Lax`), localhost/auto fallback, SSR- and private-mode-safe.
