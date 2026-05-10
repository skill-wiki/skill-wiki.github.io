# Publishing a Skill to the marketplace

The Skill Wiki marketplace is **PR-driven**. There's no central registry server, no
account, no token, no payment. Just GitHub.

To publish a Skill: open one PR adding an entry to [`data/skills.yaml`](./data/skills.yaml).
We review, merge, and CI rebuilds the marketplace automatically.

---

## Before you PR

Your Skill needs to:

1. **Live in a public GitHub repo.** Any owner. Any visibility — public.
2. **Compile cleanly.** `prime compile` against your sources should produce
   `_index.xml` plus per-atom directories with no L1/L3 errors.
3. **Be Apache-2.0 (or compatible) licensed.** We don't accept GPL or non-OSI
   licenses for the public marketplace. Private Skills can self-host the same
   protocol — see [docs/usage/publish-install](https://skill-wiki.github.io/docs/usage/publish-install/).
4. **Have a `LICENSE` and a `README.md`.** Reviewers need to know what the
   Skill is and how to use it.
5. **Pin its protocol version.** Add `prime-version: "1.0"` to your Skill's
   `pack.yaml` so we can flag breaking-protocol drift.

---

## The PR

In your fork of `skill-wiki/skill-wiki.github.io`, edit `data/skills.yaml` and
add one entry to the `skills:` list:

```yaml
- slug: my-skill                          # short URL-safe id
  repo: my-org/my-skill                   # GitHub "owner/repo"
  compiledSubdir: primes/compiled         # where _index.xml lives in your repo
  description: |
    One short paragraph. Two-three sentences max. What domain, how
    big, who it's for. No marketing copy.
  homepage: https://github.com/my-org/my-skill
  maintainers: [my-github-username]
  tags: [security, owasp, web]
```

Commit message format: `marketplace: add @my-skill`.

PR title: `Add @my-skill to marketplace`.

PR description should include:
- Link to your Skill repo
- Atom count, kind count, edge count
- One sentence: who is this for?
- Confirmation you've read this guide

---

## Review

We aim to merge within a week. We may ask for:

- A description rewrite (less marketing, more concrete)
- A renamed `slug` if it conflicts with an existing one
- A bumped version if your atoms break L3 against existing Skills (cross-Skill `requires` etc.)
- A move to a different `tags:` set if yours isn't searchable

We will **not** review the actual atom content for accuracy. That's your
responsibility. We will reject Skills that:

- Don't compile
- Have malicious / spam content (obvious cases)
- Are duplicates of an existing Skill
- Break the protocol's `kind` / `verb` set without an RFC

---

## After merge

CI clones your repo into the website at build time and renders your Skill on
the marketplace. The build runs every time `main` of `skill-wiki.github.io`
moves. Updates to your Skill propagate on next site rebuild — usually next
push to the marketplace, or you can re-trigger the workflow manually.

To force a rebuild after you push to your Skill repo, ping us in
[Discussions](https://github.com/skill-wiki/skill-wiki.github.io/discussions)
and we'll re-run the workflow.

---

## Removing or transferring a Skill

- **Remove**: open a PR deleting the entry in `data/skills.yaml`. The
  marketplace card disappears on next deploy.
- **Transfer ownership**: open a PR updating the `repo` and `maintainers`
  fields.

We don't delete your repo or your atoms — just the marketplace listing.

---

## What this is and isn't

**Is**: a curated GitHub-native discovery layer for Skill Wiki Skills.

**Isn't**:
- A package registry with `prime publish` semantics — that's planned for
  v0.2 once volume justifies it.
- An enterprise / private marketplace — if you need that, run the reference
  registry on your own infra.
- A search engine — for now we list everything and rely on tags + `Cmd-F`.
- An official endorsement — listed Skills aren't blessed by the protocol
  authors; they're community-published.

---

## Questions

[GitHub Discussions](https://github.com/skill-wiki/skill-wiki.github.io/discussions).
