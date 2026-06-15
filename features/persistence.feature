Feature: 跨子域持久化(cookie + 回退 + SSR 安全)
  作为 agentaily 多产品生态,我要用户在任一 *.agentaily.com 子域选的偏好(主题/语言)全站一致。

  Scenario: 跨子域 cookie 写入
    Given backend 是 "auto" 且当前在 form-design.agentaily.com
    When 持久化主题偏好 "dark"
    Then 写入 cookie:domain=.agentaily.com, path=/, SameSite=Lax, 长有效期
    And 在 form-design.studio.agentaily.com 读到同一偏好

  Scenario: localhost dev 回退
    Given 当前在 localhost(.agentaily.com cookie 写不进)
    When 持久化偏好
    Then 自动回退到无 domain 的 cookie 或 localStorage
    And 偏好在本地刷新后仍在

  Scenario: 隐私模式 / 存储被禁不抛错
    Given 浏览器禁用了 cookie 与 localStorage
    When 读写偏好
    Then 不抛错,退化为内存态(本次会话有效)

  Scenario: SSR / 无 document 安全
    Given 没有 document(服务端)
    When 读取持久化偏好
    Then 不抛错,返回默认值

  Scenario: 只存非敏感数据
    Then cookie 里只有主题/语言这类偏好,不含任何敏感信息
