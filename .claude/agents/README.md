# Subagents

Project subagents for **@agentaily/web-kit**. Each has a single responsibility, least-privilege tools, and communicates through **durable artifacts** — features/ is the contract everyone works against. **This project is self-contained**: the methodology below + `TESTING.md` (test strategy/layers/guardrails) are the agents' shared truth — no external skill needed.

## Roster

| Agent            | Owns                                                                         | Doesn't touch                 |
| ---------------- | ---------------------------------------------------------------------------- | ----------------------------- |
| `spec-architect` | SPEC.md, features/, src/\*.ts (strict TS,导出类型/接口) contracts            | implementation, tests         |
| `implementer`    | src/\*.ts (strict TS,导出类型/接口) bodies, vitest (tests/unit) (inner loop) | features, integration/e2e, CI |
| `outer-tester`   | vitest + @testing-library/react, jsdom (tests/integration)                   | product code                  |
| `reviewer`       | independent adversarial review (read-only)                                   | editing code                  |
| `release-eng`    | GitHub Actions + Changesets (发 npm) + lefthook + Prettier                   | product code, features, tests |

## Flow (double-loop TDD + PR-driven)

```
PR (task ticket) ─► worker self-triage ─► classify + route ───────┐
intent / handoff ─► spec-architect ─► features/ + contracts ─┤
                                                                   ▼
                              implementer  ◄── contract ──►  outer-tester
                          (inner loop: code + unit tests)   (outer loop: integration + e2e)
                                            └───────┬────────┘
                                                    ▼
                                              reviewer  (independent, read-only)
                                                    ▼
                                              release-eng  (CI / build / release)
```

## Principles (the five hard rules — this project's methodology truth)

- **Contract-first**: hand off via artifacts (features/, types, structured reports), not prose.
- **Independent verification**: `reviewer` ≠ `implementer`; reviewer is read-only and adversarial.
- **Don't split the inner loop**: the same agent (`implementer`) writes a unit's failing test and its code.
- **Least privilege**: tools encode the boundary (reviewer has no Write).
- **Parallelism needs isolation**: run concurrent implementers in git worktrees.
- **Persistent memory**: each agent carries `memory: project` + a `# Persistent Agent Memory` block — learnings accrue into `.claude/agent-memory/<agent>/` (per-agent, project-scoped, version-controlled & team-shared) and survive across conversations.

Invoke via the Agent tool (`subagent_type: <name>`). The main loop stays the orchestrator: it decomposes by feature, routes, and reconciles conflicts.
