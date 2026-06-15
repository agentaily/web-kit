Feature: 主题切换(三态 + 防 FOUC)
  作为消费 web-kit 的产品,我要主题在 system/light/dark 三态间切换并持久化,首屏不闪错。

  Background:
    Given 应用被 ThemeProvider 包裹,attribute 默认 "data-theme"

  Scenario: 默认跟随系统
    Given 用户没有存过主题偏好
    And 系统 prefers-color-scheme 是 dark
    When 应用挂载
    Then theme 是 "system"
    And resolvedTheme 是 "dark"
    And <html data-theme="dark">

  Scenario: 系统主题变化时实时跟随
    Given theme 是 "system"
    When 系统 prefers-color-scheme 从 light 变为 dark
    Then resolvedTheme 实时变为 "dark"
    And <html data-theme> 同步更新

  Scenario: 用户显式选择覆盖系统
    When 用户 setTheme("light")
    Then theme 是 "light"
    And resolvedTheme 是 "light"(不再跟随系统)
    And 偏好被持久化

  Scenario: 防 FOUC —— 首屏前定主题
    Given 持久化的主题是 "dark"
    When themeInitScript() 的输出在 <head> 同步执行(React 接管前)
    Then <html data-theme="dark"> 在首次绘制前已设好
    And 不出现亮→暗的闪烁

  Scenario: SSR / 无 window 安全
    Given 没有 window(服务端 / 构建期)
    When 渲染 ThemeProvider
    Then 不抛错(退化为默认主题)
