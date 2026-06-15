---
"@agentaily/web-kit": patch
---

fix: 发布前构建 dist —— 此前 release 流程在 `changeset publish` 之前漏了 build,`0.1.1` 误发成**空包**(tarball 只有 package.json + README、无 `dist/`,而 main/module/types 全指向 `./dist/*`)→ 任何 import 都 `MODULE_NOT_FOUND`。加 `prepack: npm run build`(包级保险,覆盖任何 publish 路径)+ release.yml 显式 build 步,确保 dist 进包。本版 `0.1.2` 起恢复完整产物;`0.1.1` 请勿使用。
