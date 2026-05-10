---
title: "Skill Wiki v0.1.0 — the protocol is shipping"
date: "2026-05-10"
excerpt: "Today we're releasing v0.1.0 of the Prime protocol — a typed knowledge graph for AI agents. 28 atom kinds, 14 edge verbs, 3 projection levels, a generic MCP server, and a 898-atom reference frontend-design Prime. Apache-2.0."
---

# Skill Wiki v0.1.0 — the protocol is shipping

We're shipping **Skill Wiki v0.1.0** today — the marketplace home of the
**Prime protocol**, our open spec for putting typed, addressable domain
knowledge in the reach of AI agents without bulk-loading SKILL.md files
into every turn. Prime is the protocol and CLI; Skill Wiki is the site
and community marketplace.

Background: [the spec overview](/docs/spec/overview) and the [bulk-loading problem](/docs/background/problem).

## What ships

**The protocol** — frozen at v1.0:

- **28 atom kinds** across 5 layers: Data, Behaviour, Composition, Style, Meta. Authors pick a subset; unused kinds simply don't appear.
- **14 typed edge verbs** — `requires`, `validates-with`, `contradicts`, `specializes`, … — with allowed source/target kinds and L3-checkable semantics.
- **3 projection levels** — `summary` (~30 tok), `core` (~150 tok), `full` (~380 tok). Kind-aware chunker.
- **Composition contracts** — `must-include` / `must-avoid` / `conditionally-required` declarations on methods, personas, and scopes.
- **Registry contract** — HTTP-only, four endpoints. Reference impl is one file.

**Reference implementation** — 7 npm packages under `@skill-wiki`:

- `@skill-wiki/parser` — hand-written recursive-descent parser, 125 tests.
- `@skill-wiki/compiler` — L1 schema, L2 (opt-in LLM), L3 cross-atom checkers; chunker; emitters.
- `@skill-wiki/runtime` — atom loader, projection resolver, edge walker.
- `@skill-wiki/mcp-server-core` — generic MCP server with 5 tools.
- `@skill-wiki/registry` — HTTP registry; SQLite-backed; ~600 LOC.
- `@skill-wiki/cli` — `prime init / compile / check / show / publish / install / …`.
- `@skill-wiki/types` — shared AST + protocol types.

**Reference Prime** — `@frontend-design`:

- 898 typed atoms across 9 design sub-domains.
- 5 namespaces: `@community`, `@impeccable`, `@anthropic-impeccable`, `@nielsen`, `@w3c`.
- Domain-specific MCP wrapper with 4 extra tools.
- 31 personas, 30 task taxonomies, 20-task benchmark fixtures.

**Tooling**:

- `prime-decompose` Claude Code skill — AI-assisted SKILL.md → atoms decomposition.
- L2 cache (DeepSeek by default; configurable).
- Docs site — 30 pages, dark + light, MIT (the docs themselves; the code is Apache-2.0).

## What it replaces

If you've been using bulk-loaded SKILL.md files as your knowledge layer for
agents, the failures stack up at scale:

| Problem | SKILL.md | Prime |
|---|---|---|
| Token cost grows with skill count | Yes | Bounded by what loads |
| Bad knowledge pollutes every turn | Yes | Filtered per-turn |
| Validator can reason over relationships | No | Yes (14 typed verbs) |
| Can compose without recompiling | No | Yes (contracts) |
| Cross-corpus references possible | No | Yes (`@scope/...` refs) |

The full argument is in [the bulk-loading problem](/docs/background/problem)
page; the measurement we ran on the 20-task benchmark gave a −13 quality-score
delta between bulk-loaded and on-demand conditions, on the same atoms.

## What's good

The protocol is small enough that you can read it in an afternoon and the
implementation is small enough that you can read it in a weekend. We
deliberately did not build:

- A vector store. The retriever ranks by typed-graph metrics.
- A custom LLM. The L2 checker uses DeepSeek by default; swap it if you want.
- A lock-in registry. The HTTP contract is four endpoints; mirror or self-host trivially.

The reference Primes are small (the trivial `@hello-world` is 8 atoms; the
example `@recipes` is 47) so you can read every atom and see how kinds
compose. The flagship `@frontend-design` is intentionally larger — 898
atoms — so you can see what the architecture looks like at scale.

## What's missing in v0.1.0

We froze the spec at v1.0 but didn't claim 100% implementation. Honest gaps:

- **Lifecycle / `deprecated` warnings** are partially enforced. v0.2 will harden this.
- **Type-expression AST**. The `type` kind currently uses a string body; v0.2 will introduce a structured AST so types can be checked statically.
- **Domain plugin protocol** is config-driven (`domain.yaml`) but doesn't yet have a formal Type-1 plugin contract for shipping JS-defined L1/L5 logic. Most use cases work without it; the wrapper-MCP-server pattern fills the gap until v0.2.
- **`prime outdated`** was specified but not implemented. Removed from the CLI for v0.1.0; will return in v0.2.

The full roadmap is in [`docs/community/roadmap.md`](https://github.com/skill-wiki/prime-system/blob/main/docs/community/roadmap.md)
on the source repo.

## How to try it

Install in 30 seconds:

```bash
bun add -g @skill-wiki/cli
prime install @recipes
PRIME_DIR=./.primes/@recipes bunx @skill-wiki/mcp-server-core
```

Then [wire it into Claude Code](/docs/usage/mcp-claude) (or Cursor, Continue,
Aider — anything that speaks MCP).

To publish a Prime of your own, see [Publish & install](/docs/usage/publish-install).

To extend the protocol with a custom kind or verb, see [Custom kinds](/docs/extending/custom-kinds).

## What we want feedback on

A few open questions where authoritative input would change v0.2 priorities:

1. **Domain plugin shape**. Is `domain.yaml` enough, or do you want a JS plugin with `intent(brief) → IntentObject` and `validate(artifact) → verdict` hooks?
2. **Token-count tightness**. Empirically the 30/150/380 split fits most kinds; we've seen `method` atoms strain at 380. Bump the upper bound, add a fourth level, or live with it?
3. **L2 checker model choice**. DeepSeek (~$0.0001/atom) is the default. We've tried Claude Haiku and DeepSeek — quality is comparable. Other defaults worth supporting?

Issues + discussions: [github.com/skill-wiki/prime-system](https://github.com/skill-wiki/prime-system).

## Thanks

The protocol carries direct lineage from the [Anthropic Impeccable design
guidelines](https://github.com/skill-wiki/prime-corpus-frontend) — the
typed-atom shape grew out of decomposing those into individually-addressable
units. The Wikipedia analogy in the design philosophy is borrowed, accurately,
from Wikipedia. The Voyager paper's skill-library pattern was a direct
influence on the registry shape.

The full lineage is in [Prior art](/docs/background/prior-art).

—
