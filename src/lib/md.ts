// Markdown rendering — used to project chunk content into HTML at build time.
import { marked, type MarkedOptions } from 'marked';

const opts: MarkedOptions = {
  gfm: true,
  breaks: false,
};

export function renderMarkdown(src: string): string {
  if (!src) return '';
  // Strip the YAML-ish header line `domain: cooking` that follows the H1 in chunk files.
  const cleaned = src.replace(/^domain:.*$/m, '').trim();
  return marked.parse(cleaned, opts) as string;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
