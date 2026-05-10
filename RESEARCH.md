# Skill Wiki — Marketplace Research

A survey of eight existing skill / module / package marketplaces, captured to
inform the Skill Wiki website's information architecture. For each market we
record the URL, the dominant UX pattern, three ideas worth borrowing, and one
thing to avoid. Pages were inspected via WebFetch and supplemented with web
search where requests were rate-limited.

---

## 1. Anthropic Skills Hub
**URL:** https://github.com/anthropics/skills
**UX pattern:** Browse-first, GitHub-native. The README is the index; a
top-level `skills/` directory holds self-contained folders, each with a
`SKILL.md` containing YAML frontmatter (`name`, `description`). There is no
search or filtering at all — discovery is by reading the README and clicking
folders. Categories ("Creative & Design", "Development & Technical",
"Enterprise & Communication", "Document Skills") are flat headings.

**Borrow:** (1) Self-contained-folder convention — every skill is a directory,
not a row in a database. (2) Tiny YAML frontmatter as the only required
metadata; everything else is content. (3) The radical minimalism — no install
counts, no stars, no ranking. The signal is the curator (Anthropic).

**Avoid:** No search at all. Once you have ~50 skills, scrolling a README stops
working. We need at least a filter, even if no full-text search.

---

## 2. npm Registry Web UI
**URL:** https://www.npmjs.com (page returned 403 to bots; supplemented with
search)
**UX pattern:** Search-first. The header is dominated by a search box;
detail pages show install command, README, sidebar with version /
dependencies / dependents / weekly-downloads / maintainers / keywords.

**Borrow:** (1) Prominent copy-pastable install command at the top of every
detail page (`prime install @recipes/method-pan-sauce`). (2) Sidebar metadata
panel as a stable affordance — version, kind, domain, edges-out count, file
size. (3) Versions tab — showing every published version with date.

**Avoid:** Bloated chrome and slow search. Community feedback on npmjs.com in
2026 has produced an alternative browser (`npmx`) precisely because the
official UI feels heavy. Keep our pages text-first and fast.

---

## 3. Hugging Face Hub
**URL:** https://huggingface.co/models
**UX pattern:** Filter-first, sidebar-driven. A left rail offers ~50 task
filters, ~40 library filters, parameter-size sliders, language, license,
inference provider. Cards show task badge, parameter badge, downloads, likes,
update time.

**Borrow:** (1) Filter sidebar with multiple orthogonal axes (task / library /
language) — for us: kind / domain / edge-verb. (2) Trending sort + recently
updated sort as default tabs. (3) Quantitative engagement signals on cards —
we may not have downloads, but we have edge-degree and atom quality scores.

**Avoid:** Filter fragmentation. Fifty checkboxes induces choice paralysis.
Group filters under collapsible headings; show the most-used three at the top.

---

## 4. crates.io
**URL:** https://crates.io
**UX pattern:** Mixed. Homepage carries "most-downloaded", "just-published",
and "most-recent-downloads" columns side-by-side. Detail pages show README,
version dropdown, Cargo.toml-style install snippet, dependencies, owners,
docs.rs link.

**Borrow:** (1) Three columns of curated lists on the homepage (we'd use
"most-edges", "newly-added", "high-quality" as the three angles). (2) Direct
link from each crate to its rendered docs (`docs.rs/<crate>`); we should link
each atom to its `chunks/full.md` and to its rendered graph. (3) Categories
page (`/categories`) treats the taxonomy as a first-class noun.

**Avoid:** Ranking-by-downloads only. A new but high-quality skill should not
be buried under one with five years of accumulated downloads. Our rank
function should weight edge centrality and quality, not popularity alone.

---

## 5. PyPI
**URL:** https://pypi.org
**UX pattern:** Boring-baseline. Search-first homepage with raw stats
("804,996 projects, 8.6M releases"). Project pages show description, release
history, project links, classifiers. No browse-by-category beyond search.

**Borrow:** (1) Project-links sidebar (homepage / docs / source / issues) as a
stable affordance. (2) Release history as a chronological list — gives a sense
of maintenance pulse. (3) Honesty about scale; numbers act as social proof
without gamification.

**Avoid:** No browse mode. PyPI assumes you know the package name. For a
discovery site that's a non-starter — we'll have a Browse page from day one.

---

## 6. VS Code Marketplace
**URL:** https://marketplace.visualstudio.com
**UX pattern:** Curation-led category pages plus card grid. Each extension
card shows icon, name, publisher, install count, five-star rating. Detail
pages have tabs: Overview, Changelog, Q&A, Rating & Review, plus "Resources"
sidebar.

**Borrow:** (1) Tabbed detail page (we'd use Summary / Core / Full / Edges /
Provenance instead of marketing tabs). (2) Publisher / source visible on
every card — we'll show domain prefix `@recipes` / `@team` etc. (3) "Feature
Contributions" auto-extracted from manifest — for us: list of edges-out by
verb, computed at build time.

**Avoid:** Star ratings. Five-star reviews on knowledge artifacts are
incoherent ("I rate the Maillard reaction 4 stars"). Use objective signals
(edge degree, projection-level usage) instead.

---

## 7. Cursor Directory
**URL:** https://cursor.directory/
**UX pattern:** Browse-first, category-led. The site is the visual reference
the spec asks us to mirror — hero strip, category grid, dense card layout.
Each card has title, short description, tags, copy-rule button. Mobile
collapses to single column.

**Borrow:** (1) Copy-button on every card (`prime install ...` ready to
paste). (2) Category-as-page (`/category/cooking`) mirrors what we want for
domains. (3) Quiet, monochrome design — content carries the signal, no
gradient hero or marketing fluff.

**Avoid:** Thin detail pages. Cursor's individual rule pages are basically
just the rule text plus a copy button. Our atoms have edges and projection
levels — we should expose that, not bury it.

---

## 8. awesome-claude-skills (GitHub Topic)
**URL:** https://github.com/topics/claude-skills
**UX pattern:** Grass-roots aggregation. ~3,000 repos sorted by stars.
Common README shape: badges, short pitch, table of contents, categorized
list, contributing instructions. Discovery is by language filter and star
rank.

**Borrow:** (1) Star count as a signal — for us, the analogue is community
endorsement (PRs accepted, citing corpora). (2) Categorized lists in
markdown — easy to render, easy to fork, no infrastructure required. (3)
Cross-linking to other ecosystems (Cursor, Codex, Gemini) — we should link
to the agentskills.io standard explicitly.

**Avoid:** Pure star ranking. The top results in any "awesome" topic are
usually gamed. Editorial curation beats raw popularity for a knowledge
marketplace.

---

## Synthesis for Skill Wiki v0.1.0

- **Browse-first**, not search-first. Corpus is small (<1000 atoms).
- **Filter sidebar** with three axes only: kind, domain, edge-verb.
- **Card layout** with kind badge, domain prefix, quality dot, edges-out
  count, summary line. Copy-install button on hover.
- **Detail page** with tabs for projection levels (Summary / Core / Full),
  plus an Edges panel and Provenance panel.
- **No stars, no downloads.** Use edge degree and quality score as the
  objective signals.
- **Static HTML.** No DB, no auth. Mirror the npm install discovery flow:
  see → copy → run.
