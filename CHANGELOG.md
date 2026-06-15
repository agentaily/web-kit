# @agentaily/web-kit

## 0.1.2

### Patch Changes

- [#5](https://github.com/agentaily/web-kit/pull/5) [`b53a286`](https://github.com/agentaily/web-kit/commit/b53a286ce1167401074d27933076ffbf68605583) Thanks [@yarnovo](https://github.com/yarnovo)! - fix: 发布前构建 dist —— 此前 release 流程在 `changeset publish` 之前漏了 build,`0.1.1` 误发成**空包**(tarball 只有 package.json + README、无 `dist/`,而 main/module/types 全指向 `./dist/*`)→ 任何 import 都 `MODULE_NOT_FOUND`。加 `prepack: npm run build`(包级保险,覆盖任何 publish 路径)+ release.yml 显式 build 步,确保 dist 进包。本版 `0.1.2` 起恢复完整产物;`0.1.1` 请勿使用。

## 0.1.1

### Patch Changes

- [#2](https://github.com/agentaily/web-kit/pull/2) [`6381c65`](https://github.com/agentaily/web-kit/commit/6381c65cf4b260a2a0d6a42455f0e815ee48c544) Thanks [@yarnovo](https://github.com/yarnovo)! - docs: README 顶部加 npm 版本徽章(已发布包标准做法,消费者一眼看到当前 npm 版本)

## 0.1.0

### Minor Changes

- [#1](https://github.com/agentaily/web-kit/pull/1) [`7f572f0`](https://github.com/agentaily/web-kit/commit/7f572f0b7135f850ff89a4ed430a2ffb4b2d2445) Thanks [@yarnovo](https://github.com/yarnovo)! - v1: cross-product browser runtime.

  - **Theme** — `ThemeProvider` / `useTheme` (tri-state `system | light | dark`, `prefers-color-scheme` resolution + live follow, applied as `<html data-theme>`) and `themeInitScript()` for a no-FOUC inline `<head>` snippet.
  - **i18n** — `createI18n(catalogs)` factory → type-safe `LocaleProvider` / `useLocale` / `useMessages`, `navigator.language` detection with fallback, `<html lang>`.
  - **Persistence** — `createStorage` / `persistentState`: cross-subdomain cookie by default (`domain=.agentaily.com`, `SameSite=Lax`), localhost/auto fallback, SSR- and private-mode-safe.
