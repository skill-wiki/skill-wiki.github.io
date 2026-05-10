import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Skill Wiki website — static-first, zero-JS by default.
// Pages render at build time from corpora on disk; no DB, no auth, no telemetry.
// Deployed to GitHub Pages org-root at https://skill-wiki.github.io/ via
// the org's special repo `skill-wiki/skill-wiki.github.io`.
export default defineConfig({
  site: 'https://skill-wiki.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  devToolbar: { enabled: false },
  integrations: [sitemap()],
});
