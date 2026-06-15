---
name: agentaily-web-kit
description: >-
  消费 `@agentaily/web-kit`(跨产品浏览器运行时:主题切换 + 国际化 + 跨子域偏好持久化)的用法指南。任何 agentaily 产品/站点要做「亮暗主题切换、多语言、或把主题/语言记住(跨 *.agentaily.com 子域一致)」时,用它的 ThemeProvider / createI18n,别手搓。自包含,不需读仓库内部。
  TRIGGER:在某个 agentaily React 产品里做或迁移 主题切换 / i18n / 主题或语言的浏览器持久化。
  NOT FOR:可视化组件(按钮/卡片/页面壳)→ 那是 `@agentaily/design-system`(用 `agentaily-design` skill);非 React / 无浏览器运行时的项目。
---

# @agentaily/web-kit — 用法 skill

`@agentaily/web-kit` 是所有 agentaily 产品共享的**非可视化浏览器运行时**:把「主题 / 国际化 / 偏好持久化」这三件每个产品都要、又最容易各搓一遍的横切关注点统一到一处。**做这三件事时消费它,别在产品里再手写 `ThemeProvider` / `useTheme` / `LocaleProvider` / `localStorage` 读写。**

- **包**:`@agentaily/web-kit`(npm)· **源 / API 契约**:<https://github.com/agentaily/web-kit>(`SPEC.md` = 契约真相源)
- **与 `@agentaily/design-system` 的边界**:**DS = 视觉**(按钮/卡片/壳,渲染 UI + CSS);**web-kit = 非视觉运行时**(Provider/hook/工具,**不渲染任何 UI、无 CSS**)。两者都被产品消费、职责不重叠。要可视组件去 `agentaily-design` skill。

## 安装

```bash
npm i @agentaily/web-kit
# react / react-dom 是 peerDependencies,产品自己装(>=18)
```

## 1. 主题(亮 / 暗 / 跟随系统)

```tsx
import { ThemeProvider, useTheme } from "@agentaily/web-kit";

// 应用根:包一层 ThemeProvider
<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>;

// 任意组件:读 / 切主题
function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  // theme         = 用户选择:'system' | 'light' | 'dark'
  // resolvedTheme = 实际生效:'light' | 'dark'(system 时按 prefers-color-scheme 解析,且实时跟随系统切换)
  return (
    <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>{theme}</button>
  );
}
```

- 生效方式:在 `<html>` 上设 `data-theme="light|dark"`(可用 `attribute` prop 改属性名)。DS 的组件按 `data-theme` 出暗色。
- `ThemeProvider` props:`{ defaultTheme?='system'; storage?: StorageConfig; attribute?='data-theme'; children }`。

### 防 FOUC(首屏闪一下亮色)—— 必做

主题持久值在 React 接管前读不到 → 首帧会闪。用 `themeInitScript()` 把一段阻塞 JS 内联进 `<head>`,绘制前同步设好 `data-theme`:

```tsx
import { themeInitScript } from "@agentaily/web-kit";
// 静态站:写进 index.html 的 <head>;SSR:注入 document head
<script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />;
```

⚠️ 若给 `ThemeProvider` 传了自定义 `storage.keyPrefix`,**必须**把同一个键传给 init script:`themeInitScript({ storageKey: "<prefix>theme" })` —— 两端读同一个存储键,否则 init script 读不到、白防。

## 2. 国际化(机制共享、catalog 每产品注入)

web-kit 只给**机制**;**文案 catalog 每个产品自己注入**(类型安全):

```tsx
import { createI18n } from "@agentaily/web-kit";

// 产品自己的 i18n.ts:注入 catalog → 拿到绑定到它类型的一套 API
export const { LocaleProvider, useLocale, useMessages } = createI18n({
  catalogs: {
    zh: { greeting: "你好", save: "保存" },
    en: { greeting: "Hello", save: "Save" },
  },
  defaultLocale: "zh",
});
```

```tsx
// 根:包 LocaleProvider
<LocaleProvider>
  <App />
</LocaleProvider>;

// 组件:用文案 + 切语言
function Toolbar() {
  const m = useMessages(); // 当前 locale 的 catalog(类型 = 注入的形状,编译期保证 key 存在)
  const { locale, setLocale, locales } = useLocale();
  return (
    <>
      <span>{m.greeting}</span>
      <button onClick={() => setLocale(locale === "zh" ? "en" : "zh")}>{locale}</button>
    </>
  );
}
```

- 默认 locale:持久化值 →(无则)`navigator.language` 匹配 → fallback `defaultLocale`。自动设 `<html lang>`。
- 切换是**有状态的**(组件即时重渲染),**不刷新页面** —— 别再写 `location.reload()` 那套。

## 3. 持久化(跨子域 cookie,本库核心差异点)

主题 + locale 默认存进**跨子域 cookie**(`domain=.agentaily.com`)→ 用户在任一 `*.agentaily.com` 子域选的主题/语言**全站一致**。无需手动接 —— `ThemeProvider` / `createI18n` 默认就走它。要自定义存储:

```tsx
import type { StorageConfig } from "@agentaily/web-kit";
const storage: StorageConfig = {
  backend: "auto", // 'cookie' | 'local' | 'auto'(默认 auto:能写 .agentaily.com cookie 就 cookie、否则回退)
  cookieDomain: ".agentaily.com",
  keyPrefix: "agentaily:",
  cookieMaxAge: 31536000, // 秒,默认 1 年
};
// 传给 <ThemeProvider storage={storage}>,或 createStorage(storage) 自取
```

- **localhost / 非 agentaily 域 dev**:`.agentaily.com` cookie 写不进 → 自动回退(无 domain cookie 或 localStorage)。本地开发不用改配置。
- **SSR / 无 window 安全**:所有 `window/document/navigator/cookie` 访问带守卫;隐私模式 / 存储被禁时不抛错、退化为内存态。
- 直接用存储:`createStorage(config)` / `persistentState`(主题、locale 都建在它上;一般不用直接碰)。

## 迁移已有产品(替换手搓实现)

产品里若已手写了主题/i18n,接 web-kit 时**删掉重复实现**:

- 自己的 `useTheme` hook / `data-theme` 的 useEffect → 删,换 `ThemeProvider` + `useTheme`。
- 自己的 `LocaleProvider` / `useLocale` / catalog 装配 → 删,换 `createI18n({ catalogs, defaultLocale })`,把原 catalog 原样喂进去。
- `localStorage` 读写主题/语言 → 删;web-kit 默认 cookie 持久化(想跨子域一致就靠它)。
- index.html 加 `themeInitScript()` 防 FOUC。
- ⚠️ 行为差异:web-kit 切语言**不 reload**;若旧实现靠 `location.reload()` 重读文案,改成走 context(组件自然重渲染)。

## 坑

- `react`/`react-dom` 是 **peerDeps**,产品必须自己装(>=18);web-kit 不打包它们。
- `themeInitScript` 的 `storageKey` 要和 `ThemeProvider` 的 `storage.keyPrefix` 对齐,否则防 FOUC 失效。
- 库**不渲染 UI、无 CSS** —— 别指望它给按钮/开关的样子(那是 DS);它只管「状态 + 持久化 + 应用 `data-theme`/`lang`」。
- 完整签名 / 类型见仓库 `SPEC.md` §1 与导出的 `.d.ts`。
