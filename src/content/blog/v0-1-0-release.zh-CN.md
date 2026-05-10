---
title: "Skill Wiki v0.1.0 —— 协议正式发布"
date: "2026-05-10"
excerpt: "今天发布 Skill Wiki 协议 v0.1.0 —— 一个面向 AI agent 的类型化知识图。28 种原子 kind、14 个边动词、3 级投影、通用 MCP server、898 个原子的参考 frontend-design Skill。Apache-2.0。"
---

# Skill Wiki v0.1.0 —— 协议正式发布

今天，**Skill Wiki v0.1.0** 正式发布。它把 SKILL.md 那种 200 行的散文 blob，
换成一组带类型、可寻址的原子，让 agent 无须每轮把整个文件灌进 prompt。

背景资料：[规范总览](/zh/docs/spec/overview) 和 [批量加载的问题](/zh/docs/background/problem)。

## 这次发布了什么

**协议本身** —— v1.0 已冻结：

- **28 种原子 kind**，分 5 层：Data、Behaviour、Composition、Style、Meta。作者按需挑用，没用到的 kind 不出现在你的 Prime 里。
- **14 种类型化边动词** —— `requires`、`validates-with`、`contradicts`、`specializes`…，每个动词限定来源/目标 kind，L3 检查器据此推理。
- **3 级投影** —— `summary`（约 30 token）、`core`（约 150 token）、`full`（约 380 token）。Kind-aware chunker。
- **组合契约** —— 在 method、persona、scope 上声明 `must-include` / `must-avoid` / `conditionally-required`。
- **Registry 协议** —— 纯 HTTP，4 个端点。参考实现一个文件搞定。

**参考实现** —— `@skill-wiki` 下 7 个 npm 包：

- `@skill-wiki/parser` —— 手写递归下降 parser，125 个测试。
- `@skill-wiki/compiler` —— L1 schema、L2（可选 LLM）、L3 跨原子检查；chunker；emitter。
- `@skill-wiki/runtime` —— 原子 loader、投影解析、边遍历。
- `@skill-wiki/mcp-server-core` —— 通用 MCP server，5 个工具。
- `@skill-wiki/registry` —— HTTP registry，SQLite 后端，约 600 行。
- `@skill-wiki/cli` —— `prime init / compile / check / show / publish / install / …`。
- `@skill-wiki/types` —— 共享 AST + 协议类型。

**参考 Prime** —— `@frontend-design`：

- 898 个类型化原子，覆盖 9 个设计子领域。
- 5 个命名空间：`@community`、`@impeccable`、`@anthropic-impeccable`、`@nielsen`、`@w3c`。
- 领域专用 MCP 封装，多 4 个工具。
- 31 个 persona、30 类任务分类、20 个 benchmark fixture。

**周边工具**：

- `prime-decompose` Claude Code skill —— AI 辅助把 SKILL.md 拆成原子。
- L2 缓存（默认 DeepSeek，可配）。
- 文档站 —— 30 页文档、双主题、Apache-2.0。

## 它要替代什么

如果你一直把批量加载的 SKILL.md 当 agent 的知识层，到一定规模会撞上这些问题：

| 问题 | SKILL.md | Skill Wiki |
|---|---|---|
| token 成本随 Prime 数增长 | 是 | 只随实际加载量 |
| 坏知识每轮都污染上下文 | 是 | 按需过滤 |
| validator 能基于关系推理 | 否 | 是（14 个动词） |
| 不重新编译就能组合 | 否 | 是（contracts） |
| 跨 corpus 引用 | 否 | 是（`@scope/...`） |

完整论证在 [批量加载的问题](/zh/docs/background/problem)；
我们在 20 个任务的 benchmark 上测出，相比批量加载，按需加载在同一组原子上
质量分高 13 分。

## 哪里做得不错

协议小到一下午能读完，实现小到一周末能读完。我们故意没做：

- **不做向量库**。检索按类型化图度量排序。
- **不做自家 LLM**。L2 检查器默认走 DeepSeek，想换随便换。
- **不做锁仓库的 registry**。HTTP 协议 4 个端点，自托管和镜像都简单。

参考 Prime 都做得很小（最简的 `@hello-world` 就 8 个原子；
`@recipes` 47 个），方便你逐个原子看 kind 怎么组合。
旗舰 `@frontend-design` 故意做大 —— 898 个原子 —— 让你看到规模化时架构长什么样。

## v0.1.0 还缺什么

规范冻结在 v1.0，但我们没声称 100% 实现。诚实的缺口：

- **Lifecycle / `deprecated` 警告**部分实现，v0.2 会强化。
- **类型表达式 AST**。`type` kind 现在用字符串存正文；v0.2 会引入结构化 AST，让类型可静态检查。
- **领域插件协议**目前是配置驱动（`domain.yaml`），还没正式的 Type-1 JS 插件契约（用来 ship 自定义的 L1/L5 逻辑）。大多数场景目前用"包装一个 MCP server"的模式就够，v0.2 会补齐。
- **`prime outdated`** 规范里有，实现里没做。v0.1.0 的 CLI 暂时去掉，v0.2 回归。

完整 roadmap 在源仓库的 [`docs/community/roadmap.md`](https://github.com/skill-wiki/prime-system/blob/main/docs/community/roadmap.md)。

## 怎么试

30 秒装好：

```bash
bun add -g @skill-wiki/cli
prime install @recipes
PRIME_DIR=./.primes/@recipes bunx @skill-wiki/mcp-server-core
```

然后[接进 Claude Code](/zh/docs/usage/mcp-claude)（或 Cursor、Continue、Aider —— 任何讲 MCP 的客户端）。

发布自己的 Prime：[发布与安装](/zh/docs/usage/publish-install)。

加新 kind 或 verb：[自定义 kind](/zh/docs/extending/custom-kinds)。

## 想听听你的反馈

几个会决定 v0.2 优先级的问题：

1. **领域插件该长什么样**。`domain.yaml` 够用？还是要支持 JS 插件，带 `intent(brief) → IntentObject` 和 `validate(artifact) → verdict` 钩子？
2. **token 数是否合适**。30/150/380 这套对大多 kind 够用，但 `method` 经常顶到 380。把上限抬高？加第四级？还是接受现状？
3. **L2 检查器默认模型**。现在默认 DeepSeek（约 $0.0001/原子）。我们也试过 Claude Haiku，质量接近。还有别的默认值值得支持？

Issue / 讨论：[github.com/skill-wiki/prime-system](https://github.com/skill-wiki/prime-system)。

## 致谢

协议直接继承自 [Anthropic Impeccable 设计指南](https://github.com/skill-wiki/prime-corpus-frontend) ——
类型化原子的形状就是从把那套指南拆成可单独寻址的单元里长出来的。
"存在 ≠ 内容" 的 Wikipedia 类比直接借自 Wikipedia 本身。
Voyager 论文的 skill 库模式直接影响了 registry 的形态。

完整脉络在 [Prior art](/zh/docs/background/prior-art)。

—
