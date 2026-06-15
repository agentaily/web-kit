# Testing — @agentaily/web-kit

这个项目**怎么设计测试**:分层、框架技术选型、护栏。和 `.claude/agents/README.md` 的双循环 TDD 方法论配套 —— 测试是 `implementer`(内环)/`outer-tester`(外环)把行为契约 `features/` realize 出来、并在护栏上自动拦回归的方式。

> 这是项目的**测试真相源**;改测试策略/选型/护栏 → 同一次改动更新本文件(文档与代码同步纪律)。

## 测试分层(海拔:多而快在下,少而真在上)

| 层 | 框架 | 测什么 | 位置 | 谁写 | 跑在哪道闸 |
| --- | --- | --- | --- | --- | --- |
| **unit** | vitest (tests/unit) | 纯逻辑单元(behavior-styled AAA,不为每断言写 Gherkin) | (见框架约定) | implementer | pre-push + CI |
| **BDD 行为契约** | `features/` (Gherkin) | 系统该做什么(唯一真相源) | `features/` | spec-architect | CI |
| **integration** | vitest + @testing-library/react, jsdom (tests/integration) | 组件 / 跨模块协作 | (见框架约定) | outer-tester | CI |

## 框架技术选型(为什么这么选)

- **单测 → vitest (tests/unit)**:vitest —— 与 design-system 一致、ESM 原生、jsdom 下快
- **BDD 契约 → Gherkin `features/`**:行为可执行、business-readable,内外环都对着它,是契约真相源。
- **集成 → vitest + @testing-library/react, jsdom (tests/integration)**:@testing-library/react 测 Provider/hook 渲染行为;jsdom 提供 window/document/cookie 以测持久化往返
- Provider/hook 行为用 @testing-library/react;持久化往返直接断言 document.cookie / localStorage;SSR 分支用无 window 环境模拟

## 护栏(质量门:纵深防御,便宜在前、权威在后)

| 阶段 | 闸 | 拦什么 |
| --- | --- | --- |
| 写时 | plan 模式 + 先写失败测试 | 方向错 / 实现错 |
| 提交时 | lefthook `pre-commit`(lefthook pre-commit:prettier --check + 相关单测) | 格式 / 类型 |
| 推送时 | lefthook `pre-push`(lefthook pre-push:typecheck + test + build) | 单测红 / 构建坏 |
| PR 时 | CI 必需检查(typecheck、test(vitest run)、build(双格式 ESM+CJS+.d.ts)、prettier --check)+ 独立 `reviewer` | 集成/e2e 回归、设计偏差 |
| 合并时 | branch protection(main 保护:PR + CI 绿才可合(release 自动化除外)) | 带病进 main |

lefthook + Prettier;CI 必过 typecheck/test/build/prettier;changesets 发版

## 本地一条命令验完(done 的定义)

```bash
npm run typecheck && npm test && npm run build
```

## 约定 / 坑(this repo)

- 每个外环测试映射一个 `features/` 场景 —— 匹配 Gherkin 步骤,别断言 trivia。
- 外环把 features/ 行为(主题三态、system 跟随、cookie 跨子域 domain、no-FOUC initScript、locale 切换)实现成集成测试
