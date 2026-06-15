Feature: 国际化(机制共享 + catalog 每产品注入)
  作为消费 web-kit 的产品,我要用统一机制做多语言、自己注入文案 catalog。

  Background:
    Given 产品用 createI18n 注入了自己的 catalogs(如 { en, zh })

  Scenario: 默认 locale 探测
    Given 用户没有存过语言偏好
    And navigator.language 是 "zh-CN"
    When 应用挂载
    Then locale 解析为 "zh"(匹配可用 locale)
    And <html lang="zh">

  Scenario: 切换语言并持久化
    When 用户 setLocale("en")
    Then useMessages() 返回 en catalog 的文案
    And <html lang="en">
    And 语言偏好被持久化(跨子域,见 persistence.feature)

  Scenario: 类型安全
    Then useMessages() 的返回类型与注入的 catalog 形状一致(TS 编译期保证)

  Scenario: 未知 locale 回退
    Given 持久化的 locale 不在可用 locales 里
    Then 回退到默认 locale,不抛错
