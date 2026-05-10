// Blog loader — read markdown posts from src/content/blog/ at build time.

import { marked } from 'marked';

// Eager import every markdown file under src/content/blog/ as raw strings.
// Vite handles the path resolution at build time, so this works in both `astro
// dev` and the production bundle without depending on import.meta.url paths.
const RAW = import.meta.glob('../content/blog/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

export type Post = {
  slug: string;
  lang: 'en' | 'zh';
  title: string;
  date: string;
  reading: string;
  excerpt: string;
  bodyHtml: string;
};

function pickReadingTime(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 220));
  return `${mins} min`;
}

function frontmatter(raw: string): { meta: Record<string, string>; body: string } {
  if (!raw.startsWith('---')) return { meta: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { meta: {}, body: raw };
  const fmRaw = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\s*\n/, '');
  const meta: Record<string, string> = {};
  for (const line of fmRaw.split('\n')) {
    const m = line.match(/^([\w-]+):\s*(.*)$/);
    if (m) meta[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return { meta, body };
}

function deriveTitle(body: string, fallback: string): string {
  const m = body.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : fallback;
}

function deriveExcerpt(body: string): string {
  const stripped = body.replace(/^#.*$/m, '').trim();
  const para = stripped.split(/\n\n+/).find((p) => !p.startsWith('#') && p.length > 40);
  return (para || stripped.slice(0, 240)).replace(/\s+/g, ' ').slice(0, 240);
}

let _cache: Post[] | null = null;

export function loadPosts(): Post[] {
  if (_cache) return _cache;
  const posts: Post[] = [];

  for (const [path, raw] of Object.entries(RAW)) {
    const file = path.split('/').pop() || '';
    const { meta, body } = frontmatter(raw);

    const isZh = file.endsWith('.zh-CN.md');
    const slug = file.replace(/\.zh-CN\.md$|\.md$/, '');
    const lang: 'en' | 'zh' = isZh ? 'zh' : 'en';

    const title = meta.title || deriveTitle(body, slug);
    const cleanBody = body.replace(/^#\s+.+\n+/, '');

    posts.push({
      slug,
      lang,
      title,
      date: meta.date || '2026-05-10',
      reading: pickReadingTime(body),
      excerpt: meta.excerpt || deriveExcerpt(body),
      bodyHtml: marked.parse(cleanBody, { async: false }) as string,
    });
  }

  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  _cache = posts;
  return posts;
}

export function findPost(slug: string, lang: 'en' | 'zh' = 'en'): Post | undefined {
  return loadPosts().find((p) => p.slug === slug && p.lang === lang);
}
