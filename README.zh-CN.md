# Skill Wiki — 网站

Skill Wiki / Prime 原子语料库的静态发现站点。

## 快速开始

```bash
bun install     # 或：npm install
bun run dev     # 本地预览，地址：http://localhost:4321
bun run build   # 生成 dist/——可部署至任何地方
```

## 架构

- **Astro 4** — 基于文件的路由，默认零 JS，输出静态 HTML。
- **数据加载器**位于 `src/lib/corpus.ts`，在构建时从每个语料库读取 `_index.xml`、`atom.yaml` 和 `chunks/{summary,core,full}.md`。
- **语料库**位于 `release/prime-system/examples/<corpus>/primes/` 下。加载器通过相对路径自动发现，无需环境变量。

## 页面

| 路径 | 源文件 |
|---|---|
| `/` | `src/pages/index.astro` |
| `/browse` | `src/pages/browse.astro` |
| `/atom/<corpus>/<id>` | `src/pages/atom/[corpus]/[id].astro` |
| `/domain/<name>` | `src/pages/domain/[name].astro` |
| `/get-started` | `src/pages/get-started.astro` |
| `/about` | `src/pages/about.astro` |

## 不是什么

- 不是发布门户。发布通过 `prime publish --remote …` 进行。
- 不含分析埋点。零追踪器。
- 不是搜索引擎。语料库足够小，可直接浏览。
