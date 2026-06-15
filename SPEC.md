# SPEC — @agentaily/web-kit

本库的**架构 / API 契约真相源**(`spec-architect` 的真相源;与 `TESTING.md`(测试真相)、`features/`(行为真相)三足鼎立)。

## 0. 定位

跨产品共享的**浏览器运行时**库:把「主题切换 + 国际化机制 + 浏览器持久化」这套横切关注点统一一处。所有 agentaily 产品(form-design、official-website、各产品宣传站…)消费它。

- 与 `@agentaily/design-system` 的边界:**DS = 视觉/镜像组件**(按钮/卡片/token);**web-kit = 非视觉的 app 运行时**(状态/持久化/Provider)。两者都被产品消费,职责不重叠。
- React 18+ · TypeScript strict · 双格式产物(ESM + CJS + `.d.ts`)· `react`/`react-dom` 为 **peerDependencies**。

## 1. 模块与导出面(契约)

### 1.1 主题 Theme

- `ThemeProvider`(props:`{ defaultTheme?: 'system'|'light'|'dark' = 'system'; storage?: StorageConfig; attribute?: string = 'data-theme'; children }`)。
- `useTheme(): { theme: 'system'|'light'|'dark'; resolvedTheme: 'light'|'dark'; setTheme(t): void }`。
  - `theme` = 用户选择(含 `system`);`resolvedTheme` = 实际生效的 `light|dark`(system 时由 `matchMedia('(prefers-color-scheme: dark)')` 解析,且**监听其变化**实时更新)。
  - 应用方式:在 `<html>`(或配置的根)上设 `attribute`(默认 `data-theme="light|dark"`)。
- `themeInitScript(opts?): string` —— **防 FOUC**:返回一段**可内联进 `<head>` 的阻塞 JS 字符串**,首屏绘制前同步读持久化值 + 设 `data-theme`。静态站注入 `index.html`、SSR 注入 document head。必须**幂等、无依赖、SSR-safe、无 XSS**(不插未净化内容)。

### 1.2 国际化 i18n

- `createI18n<Catalogs>(config)` 工厂 —— **机制共享、catalog 每产品注入**。返回 `{ LocaleProvider, useLocale, useMessages }` 绑定到该产品的 catalog 类型(类型安全)。
- `useLocale(): { locale: string; setLocale(l): void; locales: string[] }`;`useMessages(): Messages`(当前 locale 的文案)。
- 默认 locale:持久化值 →(无)`navigator.language` 匹配 → fallback default。设 `<html lang>`。

### 1.3 持久化 Persistence(本库的核心差异点)

- 统一存储抽象 `persistentState` / `createStorage(config)`,主题 + locale 都走它。
- **默认后端 = 跨子域 cookie**:`domain=.agentaily.com; path=/; max-age=1y; SameSite=Lax`(非 secret 数据,无需 HttpOnly;前端要读)。→ 用户在任一 `*.agentaily.com` 子域选的主题/语言**全站一致**。
- **localhost / 非 agentaily 域 dev 回退**:`.agentaily.com` cookie 在 localhost 写不进 → 自动回退**无 domain 的 cookie 或 localStorage**(配置/探测)。
- **SSR / 无 window 安全**:所有 `window`/`document`/`navigator`/`document.cookie` 访问带守卫;隐私模式 / 存储被禁时 **try/catch 不抛**、退化为内存态。
- `StorageConfig`:`{ backend?: 'cookie'|'local'|'auto' = 'auto'; cookieDomain?: string = '.agentaily.com'; keyPrefix?: string = 'agentaily:'; cookieMaxAge?: number = 31536000 }`(`cookieMaxAge` 单位秒,默认 1 年)。

## 2. 关键不变量(reviewer 盯)

- `react`/`react-dom` **不打进产物**(peerDeps)。
- 公开 API 全有 `.d.ts`;无 `any` 漏网。
- 库**不渲染任何可见 UI**(无组件/CSS 产物,只 Provider/hook/工具)——视觉归 DS。
- 所有浏览器 API 访问 **SSR-safe**(服务端/构建期不炸)。
- cookie 只存非敏感偏好(主题/语言),`SameSite=Lax`、domain 受限。

## 3. 构建 / 发布

- tsup(或 vite lib)产 ESM + CJS + `.d.ts`;`exports` map 双格式。
- changesets 自动发 npm(同 design-system:合 main → Version PR → `changeset publish`)。`publishConfig.access=public`。
- CI:`typecheck && test && build` + `prettier --check`。

## 4. 下游采用(落地后)

form-design / official-website / form-design-website 各开 adopt PR:`npm i @agentaily/web-kit`,用它的 ThemeProvider/createI18n 替换各自手搓的 LocaleProvider/useTheme,注入自己的 catalog,index.html 注入 `themeInitScript()`。删本地重复实现。
