# @agentaily/web-kit

跨产品共享的**浏览器运行时**库 —— 把「主题切换 + 国际化 + 持久化」这套横切关注点统一到一处,所有 agentaily 产品(form-design、official-website、各产品宣传站…)消费它,别各自手搓。

> **定位**:`@agentaily/design-system` 是**视觉/镜像组件**;`@agentaily/web-kit` 是**非视觉的 app 运行时**(状态/持久化/Provider)。两者都被产品消费,职责不重叠。React + TypeScript,changesets 自动发 npm(同 design-system 流程)。

## 提供什么(目标 API)

- **主题** `ThemeProvider` + `useTheme()` —— 三态 `system | light | dark`,默认 `system`(`prefers-color-scheme` + 监听变化),应用为 `<html data-theme>`;**防 FOUC**:导出 `themeInitScript`(首屏前阻塞执行的 `<head>` snippet,静态站注入 index.html / SSR 注入 document head)。
- **国际化** `LocaleProvider` + `useLocale()` + `useMessages()` + `createI18n(catalogs)` 工厂 —— **机制共享、catalog 每产品自己注入**;设 `<html lang>`。
- **持久化** —— **跨子域 cookie**(`domain=.agentaily.com`,用户在任一 agentaily 子域选的主题/语言全站一致;localhost dev 回退 localStorage);SSR/无 window 安全、隐私模式不抛错。

## 状态:🚧 bootstrap

仓刚建、已纳入 fleet 托管。**脚手架 + API 实现走 fleet 的 autopilot PR**(见仓内 draft PR)。done-gate 见 [TESTING.md](./TESTING.md)。

## 技术栈(目标)

TypeScript (strict) · 双格式产物(ESM + CJS + `.d.ts`,tsup 或 vite lib)· vitest + @testing-library/react (jsdom) · changesets 自动发 npm · lefthook + Prettier · GitHub Actions(CI + release）。`react`/`react-dom` 为 peerDependencies。
