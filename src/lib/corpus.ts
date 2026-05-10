// Data loader — reads atom corpora from disk at build time.
//
// Sources:
//   release/prime-system/examples/<corpus>/primes/compiled/_index.xml
//   release/prime-system/examples/<corpus>/primes/compiled/<prefix>/<atom-id>/atom.yaml
//   release/prime-system/examples/<corpus>/primes/compiled/<prefix>/<atom-id>/chunks/{summary,core,full}.md
//   release/prime-system/examples/<corpus>/domain.yaml
//
// Falls back to release/prime-corpus-frontend-design if compiled, otherwise skips.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import { parse as parseYaml } from 'yaml';

// ─── Locations ────────────────────────────────────────────────────────────────

// Resolve relative to the website root (this file lives at src/lib/).
const WEBSITE_ROOT = resolve(new URL('../..', import.meta.url).pathname);
const RELEASE_ROOT = resolve(WEBSITE_ROOT, '..');

// Each entry is: corpus slug → { rootPath, compiledSubdir }.
// compiledSubdir defaults to 'primes/compiled' but can be overridden when a
// corpus repo lays its compiled artifact elsewhere (e.g. frontend-design's
// `compiled-v3-final/`).
type CorpusLocation = { rootPath: string; compiledSubdir: string };

const CORPUS_PATHS: Record<string, CorpusLocation> = {
  recipes: {
    rootPath: join(RELEASE_ROOT, 'prime-system/examples/recipes'),
    compiledSubdir: 'primes/compiled',
  },
  'coding-style': {
    rootPath: join(RELEASE_ROOT, 'prime-system/examples/coding-style'),
    compiledSubdir: 'primes/compiled',
  },
  'hello-world': {
    rootPath: join(RELEASE_ROOT, 'prime-system/examples/hello-world'),
    compiledSubdir: 'primes/compiled',
  },
  'frontend-design': {
    rootPath: join(RELEASE_ROOT, 'prime-corpus-frontend-design'),
    compiledSubdir: 'compiled-v3-final',
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type Edge = {
  type: string; // verb: requires / supplies-to / related / see-also / enhances / includes / ...
  target: string; // fully-qualified atom id
};

export type Atom = {
  corpus: string; // slug, e.g. "recipes"
  id: string; // fully-qualified, e.g. "@recipes/term-deglazing"
  shortId: string; // tail, e.g. "term-deglazing"
  prefix: string; // e.g. "@recipes"
  kind: string; // term / fact / rule / pattern / anti-pattern / method / ...
  domain: string; // taken from atom.yaml when available, else cluster name
  version: string;
  cluster: string;
  tokens: { summary: number; core: number; full: number };
  quality: number;
  preview: string; // short text from index — first sentence of summary
  summary: string; // full summary chunk (markdown)
  core: string; // full core chunk (markdown)
  full: string; // full full chunk (markdown)
  edges: Edge[];
  edgesIn: Edge[]; // computed inverse edges
  sourcePath: string; // relative path to atom.yaml (for provenance)
  createdAt?: string;
};

export type Domain = {
  name: string;
  version: string;
  description: string;
  tags: string[];
  axes: { name: string; description: string; matches?: string[] }[];
  corpora: string[]; // which corpora declare this domain
};

export type Corpus = {
  slug: string;
  prefix: string; // e.g. "@recipes"
  total: number;
  totalTokens: number;
  atoms: Atom[];
  domain?: Domain;
  rootPath: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeReadFile(path: string): string | null {
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    return null;
  }
}

function listAtomDirs(prefixDir: string): string[] {
  if (!existsSync(prefixDir)) return [];
  return readdirSync(prefixDir).filter((entry) => {
    const full = join(prefixDir, entry);
    try {
      return statSync(full).isDirectory();
    } catch {
      return false;
    }
  });
}

function inferKindFromShortId(shortId: string): string {
  // shortId conventions: "<kind>-<slug>" — kind is the first hyphen-prefix.
  // Compound kinds like "anti-pattern" need explicit handling.
  if (shortId.startsWith('anti-pattern-')) return 'anti-pattern';
  const dash = shortId.indexOf('-');
  return dash > 0 ? shortId.slice(0, dash) : 'unknown';
}

function firstSentence(text: string, max = 220): string {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= max) return trimmed;
  const cut = trimmed.slice(0, max);
  const lastDot = cut.lastIndexOf('.');
  return (lastDot > 80 ? cut.slice(0, lastDot + 1) : cut) + '…';
}

// Strip the YAML-ish header at the top of summary.md (the "> ..." quoted line)
// and produce just the prose preview. We keep markdown for the detail page.
function extractPreview(summaryMd: string | null, fallback: string): string {
  if (!summaryMd) return firstSentence(fallback);
  const m = summaryMd.match(/^>\s*(.+?)$/m);
  if (m) return firstSentence(m[1]);
  // strip the H1 title and return first paragraph
  const stripped = summaryMd
    .replace(/^#.*$/gm, '')
    .replace(/^domain:.*$/gm, '')
    .trim();
  return firstSentence(stripped) || firstSentence(fallback);
}

// ─── XML parsing ──────────────────────────────────────────────────────────────

const xml = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: '_text',
  parseAttributeValue: false,
});

type IndexAtom = {
  id: string;
  kind: string;
  tokens: string;
  q: string;
  cluster: string;
  preview: string;
  edges: Edge[];
};

function parseIndex(xmlContent: string): { total: number; totalTokens: number; atoms: IndexAtom[] } {
  const parsed = xml.parse(xmlContent);
  const root = parsed.prime_index;
  const total = Number(root.total ?? 0);
  const totalTokens = Number(root.total_tokens ?? 0);
  const atoms: IndexAtom[] = [];

  const clusters = Array.isArray(root.cluster) ? root.cluster : root.cluster ? [root.cluster] : [];
  for (const cluster of clusters) {
    const clusterName = String(cluster.name ?? 'general');
    const clusterAtoms = Array.isArray(cluster.atom) ? cluster.atom : cluster.atom ? [cluster.atom] : [];
    for (const atom of clusterAtoms) {
      const edges: Edge[] = [];
      const edgeList = Array.isArray(atom.edge) ? atom.edge : atom.edge ? [atom.edge] : [];
      for (const e of edgeList) {
        edges.push({ type: String(e.type), target: String(e.target) });
      }
      const id = String(atom.id);
      const text =
        typeof atom._text === 'string'
          ? atom._text
          : typeof atom['#text'] === 'string'
            ? atom['#text']
            : '';
      atoms.push({
        id,
        kind: String(atom.kind ?? 'unknown'),
        tokens: String(atom.tokens ?? '0'),
        q: String(atom.q ?? '0'),
        cluster: clusterName,
        preview: text.trim(),
        edges,
      });
    }
  }
  return { total, totalTokens, atoms };
}

// ─── Domain loader ────────────────────────────────────────────────────────────

function loadDomain(rootPath: string): Domain | undefined {
  const path = join(rootPath, 'domain.yaml');
  const raw = safeReadFile(path);
  if (!raw) return undefined;
  try {
    const parsed = parseYaml(raw) as {
      name?: string;
      version?: string;
      description?: string;
      tags?: string[];
      axes?: { name: string; description: string; matches?: string[] }[];
    };
    return {
      name: String(parsed.name ?? 'unknown'),
      version: String(parsed.version ?? '0.0.0'),
      description: String(parsed.description ?? '').trim(),
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
      axes: Array.isArray(parsed.axes) ? parsed.axes : [],
      corpora: [],
    };
  } catch {
    return undefined;
  }
}

// ─── Atom loader ──────────────────────────────────────────────────────────────

function loadAtomDetails(corpusSlug: string, prefix: string, shortId: string, atomDir: string): Partial<Atom> {
  const atomYamlPath = join(atomDir, 'atom.yaml');
  const atomRaw = safeReadFile(atomYamlPath);
  let domain: string | undefined;
  let version: string | undefined;
  let createdAt: string | undefined;
  let qSummary = 0;
  let qCore = 0;
  let qFull = 0;
  if (atomRaw) {
    try {
      const meta = parseYaml(atomRaw) as {
        domain?: string;
        version?: string;
        created_at?: string;
        tokens?: { summary?: number; core?: number; full?: number };
        quality?: { overall?: number };
      };
      domain = meta.domain ? String(meta.domain) : undefined;
      version = meta.version ? String(meta.version) : undefined;
      createdAt = meta.created_at ? String(meta.created_at) : undefined;
      qSummary = Number(meta.tokens?.summary ?? 0);
      qCore = Number(meta.tokens?.core ?? 0);
      qFull = Number(meta.tokens?.full ?? 0);
    } catch {
      // ignore — atom.yaml is best-effort
    }
  }

  const summary = safeReadFile(join(atomDir, 'chunks/summary.md')) ?? '';
  const core = safeReadFile(join(atomDir, 'chunks/core.md')) ?? '';
  const full = safeReadFile(join(atomDir, 'chunks/full.md')) ?? '';

  return {
    summary,
    core,
    full,
    domain,
    version,
    createdAt,
    tokens: { summary: qSummary, core: qCore, full: qFull },
    sourcePath: `prime-system/examples/${corpusSlug}/primes/compiled/${prefix}/${shortId}/atom.yaml`,
  };
}

// ─── Top-level loader ─────────────────────────────────────────────────────────

let _cache: { corpora: Corpus[]; domains: Domain[] } | null = null;

export function loadAll(): { corpora: Corpus[]; domains: Domain[] } {
  if (_cache) return _cache;

  const corpora: Corpus[] = [];
  const domainMap = new Map<string, Domain>();

  for (const [slug, loc] of Object.entries(CORPUS_PATHS)) {
    const { rootPath, compiledSubdir } = loc;
    const indexPath = join(rootPath, compiledSubdir, '_index.xml');
    const xmlContent = safeReadFile(indexPath);
    if (!xmlContent) {
      // Corpus not compiled yet — skip gracefully.
      continue;
    }
    const idx = parseIndex(xmlContent);
    if (idx.atoms.length === 0) continue;

    // Determine the *primary* prefix (most common namespace) from the index —
    // used as the corpus's "branding" prefix on cards. Per-atom prefix is
    // resolved below so multi-namespace corpora (e.g. frontend-design with
    // @community / @impeccable / @anthropic-impeccable / @nielsen / @w3c)
    // load correctly.
    const prefixCounts = new Map<string, number>();
    for (const a of idx.atoms) {
      const slash = a.id.indexOf('/');
      if (slash > 0) {
        const p = a.id.slice(0, slash);
        prefixCounts.set(p, (prefixCounts.get(p) ?? 0) + 1);
      }
    }
    const prefix =
      [...prefixCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? `@${slug}`;

    const compiledBase = join(rootPath, compiledSubdir);

    // Cache atom-folder listings per namespace (avoid re-scanning each atom).
    const folderCache = new Map<string, Set<string>>();
    const folderFor = (ns: string): Set<string> => {
      let s = folderCache.get(ns);
      if (!s) {
        s = new Set(listAtomDirs(join(compiledBase, ns)));
        folderCache.set(ns, s);
      }
      return s;
    };

    const atoms: Atom[] = [];
    for (const ix of idx.atoms) {
      const slash = ix.id.indexOf('/');
      const atomPrefix = slash > 0 ? ix.id.slice(0, slash) : prefix;
      const shortId = slash > 0 ? ix.id.slice(slash + 1) : ix.id;
      const atomDir = folderFor(atomPrefix).has(shortId)
        ? join(compiledBase, atomPrefix, shortId)
        : '';
      const detail = atomDir ? loadAtomDetails(slug, atomPrefix, shortId, atomDir) : {};
      const kind = ix.kind || inferKindFromShortId(shortId);
      const domainName =
        detail.domain ||
        ix.cluster ||
        'general';
      const preview = extractPreview(detail.summary ?? null, ix.preview);

      atoms.push({
        corpus: slug,
        id: ix.id,
        shortId,
        prefix: atomPrefix,
        kind,
        domain: domainName,
        version: detail.version ?? '1.0.0',
        cluster: ix.cluster,
        tokens: detail.tokens ?? { summary: 0, core: 0, full: 0 },
        quality: Number(ix.q),
        preview,
        summary: detail.summary ?? '',
        core: detail.core ?? '',
        full: detail.full ?? '',
        edges: ix.edges,
        edgesIn: [], // filled in below
        sourcePath: detail.sourcePath ?? `${atomPrefix}/${shortId}`,
        createdAt: detail.createdAt,
      });
    }

    // Compute reverse edges within the corpus.
    const byId = new Map(atoms.map((a) => [a.id, a] as const));
    for (const atom of atoms) {
      for (const edge of atom.edges) {
        const target = byId.get(edge.target);
        if (target) {
          target.edgesIn.push({ type: edge.type, target: atom.id });
        }
      }
    }

    const domain = loadDomain(rootPath);
    if (domain) {
      const existing = domainMap.get(domain.name);
      if (existing) {
        existing.corpora.push(slug);
      } else {
        domain.corpora = [slug];
        domainMap.set(domain.name, domain);
      }
    }

    corpora.push({
      slug,
      prefix,
      total: idx.total || atoms.length,
      totalTokens: idx.totalTokens,
      atoms,
      domain,
      rootPath,
    });
  }

  _cache = { corpora, domains: [...domainMap.values()] };
  return _cache;
}

// ─── Lookups ──────────────────────────────────────────────────────────────────

export function findAtom(corpus: string, shortId: string): Atom | undefined {
  const { corpora } = loadAll();
  const c = corpora.find((c) => c.slug === corpus);
  return c?.atoms.find((a) => a.shortId === shortId);
}

export function allKinds(): string[] {
  const { corpora } = loadAll();
  const set = new Set<string>();
  for (const c of corpora) for (const a of c.atoms) set.add(a.kind);
  return [...set].sort();
}

export function allEdgeVerbs(): string[] {
  const { corpora } = loadAll();
  const set = new Set<string>();
  for (const c of corpora) for (const a of c.atoms) for (const e of a.edges) set.add(e.type);
  return [...set].sort();
}

export function allDomainNames(): string[] {
  const { corpora } = loadAll();
  const set = new Set<string>();
  for (const c of corpora) for (const a of c.atoms) set.add(a.domain);
  return [...set].sort();
}

export function totals(): { atoms: number; edges: number; corpora: number; domains: number } {
  const { corpora, domains } = loadAll();
  let atoms = 0;
  let edges = 0;
  for (const c of corpora) {
    atoms += c.atoms.length;
    for (const a of c.atoms) edges += a.edges.length;
  }
  return { atoms, edges, corpora: corpora.length, domains: domains.length };
}
