# @agentaily/web-kit — 项目指引

跨产品共享的浏览器运行时库(主题 + 国际化 + 跨子域 cookie 持久化)。React 18 + TypeScript strict,changesets 发 npm。**非视觉运行时**(职责见 [SPEC.md](./SPEC.md);别和 `@agentaily/design-system` 的视觉组件搞混)。

## 文档体系(真相源)
- [SPEC.md](./SPEC.md) —— 架构 / API 契约(`spec-architect` 的真相源)
- [TESTING.md](./TESTING.md) —— 测试分层 / 选型 / 护栏(测试真相)
- [`features/`](./features) —— 行为契约(Gherkin,行为真相)
- [`.claude/agents/README.md`](./.claude/agents/README.md) —— sub agent 分工(双循环 TDD,PR 驱动)

## 双循环 TDD 约定
行为契约在 `features/`(Gherkin)。内环 `implementer`(写单元的失败测试 + 实现,red→green→refactor),外环 `outer-tester`(把 `features/` 场景 realize 成集成测试)。契约先行、独立评审(`reviewer` 只读、对抗)、最小权限、并行靠 worktree 隔离。方法论真相在 `.claude/agents/README.md` + `TESTING.md`,**不依赖外部 skill**。

## 自主运作约定(就绪 + 双轮询)
被 `fleet` 起终端后,读完本文件即**就绪**。**双轮询**:① 自己仓的 `autopilot`+draft PR(任务工单)→ worker 自己 triage 路由消化;② 上游依赖发版(`npm view <dep> version`)→ 出新版给自己开「同步依赖」PR。**合并 / 上游反馈 / 跨项目开 PR / 触发发布叫人。** 本库**无 UI / 设计步骤**(纯运行时),不走 Claude Design。

## done(一条命令验完)
```bash
npm run typecheck && npm test && npm run build
```
还要 `npx prettier --check .` 通过。

## 关键不变量(别破)
`react`/`react-dom` 仅 peerDependencies、不打进产物;公开 API 全有 `.d.ts`;所有 `window`/`document`/`navigator`/`cookie` 访问 **SSR-safe**(带守卫、隐私模式不抛);库不渲染可见 UI;cookie 只存非敏感偏好、`SameSite=Lax`、`domain=.agentaily.com`。
