# @agentaily/web-kit

[![npm](https://img.shields.io/npm/v/@agentaily/web-kit)](https://www.npmjs.com/package/@agentaily/web-kit)

跨产品共享的**浏览器运行时**库 —— 把「主题切换 + 国际化 + 持久化」这套横切关注点统一到一处,所有 agentaily 产品(form-design、official-website、各产品宣传站…)消费它,别各自手搓。

> **定位**:`@agentaily/design-system` 是**视觉/镜像组件**;`@agentaily/web-kit` 是**非视觉的 app 运行时**(状态/持久化/Provider)。两者都被产品消费,职责不重叠。React + TypeScript,changesets 自动发 npm(同 design-system 流程)。

## 提供什么(v1 已发布)

- **主题** `ThemeProvider` + `useTheme()` —— 三态 `system | light | dark`,默认 `system`(`prefers-color-scheme` + 监听变化),应用为 `<html data-theme>`;**防 FOUC**:导出 `themeInitScript`(首屏前阻塞执行的 `<head>` snippet,静态站注入 index.html / SSR 注入 document head)。
- **国际化** `createI18n(config)` 工厂 → `LocaleProvider` + `useLocale()` + `useMessages()` —— **机制共享、catalog 每产品自己注入**(类型安全);`navigator.language` 探测 + 回退;设 `<html lang>`。
- **持久化** `createStorage` / `persistentState` —— **跨子域 cookie**(`domain=.agentaily.com`、`SameSite=Lax`,用户在任一 agentaily 子域选的主题/语言全站一致;localhost dev 回退 localStorage);SSR/无 window 安全、隐私模式不抛错。

## 安装

```bash
npm i @agentaily/web-kit
# react / react-dom 为 peerDependencies,自行安装(>=18)
```

## 用法

```tsx
import { ThemeProvider, useTheme, themeInitScript, createI18n } from "@agentaily/web-kit";

// 1) 主题:用 ThemeProvider 包裹应用
function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <Toolbar />
    </ThemeProvider>
  );
}
function Toolbar() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>{theme}</button>
  );
}

// 2) 防 FOUC:把 themeInitScript() 的输出内联进 <head>(React 接管前同步执行)
//    静态站:写进 index.html;SSR:注入 document head。
//    <script>{themeInitScript()}</script>
//    注:若给 ThemeProvider 传了自定义 storage.keyPrefix,要把同样的 key 传给
//    themeInitScript({ storageKey: "<prefix>theme" }),两端读同一个存储键。

// 3) i18n:每个产品注入自己的 catalog(类型安全)
const { LocaleProvider, useLocale, useMessages } = createI18n({
  catalogs: { en: { greeting: "Hello" }, zh: { greeting: "你好" } },
  defaultLocale: "en",
});
//    useMessages() 的返回类型 = 注入的 catalog 形状(编译期保证)。
```

## 技术栈

TypeScript (strict) · 双格式产物(ESM + CJS + `.d.ts`,tsup)· vitest + @testing-library/react (jsdom) · changesets 自动发 npm · lefthook + Prettier · GitHub Actions(CI + release）。`react`/`react-dom` 为 peerDependencies(不打进产物)。done-gate 见 [TESTING.md](./TESTING.md),API 契约见 [SPEC.md](./SPEC.md)。
