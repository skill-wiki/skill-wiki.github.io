# Skill Wiki — Website

Static discovery site for the Skill Wiki / Prime atom corpora.

## Quickstart

```bash
bun install     # or: npm install
bun run dev     # local preview at http://localhost:4321
bun run build   # produces dist/ — deploy anywhere
```

## Architecture

- **Astro 4** — file-based routing, zero JS by default, ships static HTML.
- **Data loader** at `src/lib/corpus.ts` reads `_index.xml`, `atom.yaml`, and
  `chunks/{summary,core,full}.md` from each corpus at build time.
- **Corpora** live under `release/prime-system/examples/<corpus>/primes/`.
  The loader picks them up by relative path; no environment variables.

## Pages

| Path                    | Source                                           |
|-------------------------|--------------------------------------------------|
| `/`                     | `src/pages/index.astro`                          |
| `/browse`               | `src/pages/browse.astro`                         |
| `/atom/<corpus>/<id>`   | `src/pages/atom/[corpus]/[id].astro`             |
| `/domain/<name>`        | `src/pages/domain/[name].astro`                  |
| `/get-started`          | `src/pages/get-started.astro`                    |
| `/about`                | `src/pages/about.astro`                          |

## What this is not

- Not a publishing portal. Publishing happens via `prime publish --remote …`.
- Not analytics-instrumented. Zero trackers.
- Not a search engine. The corpus is small enough to browse.

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request, and follow the [PR template](./.github/PULL_REQUEST_TEMPLATE.md). For questions and ideas, use [Discussions](https://github.com/skill-wiki/skill-wiki.github.io/discussions); for defects or proposals, use [Issues](https://github.com/skill-wiki/skill-wiki.github.io/issues).
