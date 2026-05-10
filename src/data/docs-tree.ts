// Docs sitemap — single source of truth for sidebar nav + prev/next pagination.

export type DocLink = {
  slug: string;        // url-relative to /docs/, e.g. "spec/atoms"
  title: string;       // sidebar label
  zhTitle: string;
};

export type DocSection = {
  heading: string;
  zhHeading: string;
  pages: DocLink[];
};

export const DOCS_TREE: DocSection[] = [
  {
    heading: 'Introduction',
    zhHeading: '入门',
    pages: [
      { slug: '',                         title: 'Overview',           zhTitle: '总览' },
    ],
  },
  {
    heading: 'Background',
    zhHeading: '背景',
    pages: [
      { slug: 'background/problem',                title: 'The bulk-loading problem', zhTitle: '批量加载的问题' },
      { slug: 'background/existence-not-content',  title: 'Existence ≠ content',      zhTitle: '存在 ≠ 内容' },
      { slug: 'background/prior-art',              title: 'Prior art',                zhTitle: '相关工作' },
    ],
  },
  {
    heading: 'Specification',
    zhHeading: '协议规范',
    pages: [
      { slug: 'spec/overview',     title: 'Overview',      zhTitle: '总览' },
      { slug: 'spec/atoms',        title: 'Atoms · 28 kinds', zhTitle: '原子 · 28 种 kind' },
      { slug: 'spec/edges',        title: 'Edges · 14 verbs', zhTitle: '边 · 14 种 verb' },
      { slug: 'spec/projection',   title: 'Projection',    zhTitle: '投影' },
      { slug: 'spec/contracts',    title: 'Contracts',     zhTitle: '组合契约' },
      { slug: 'spec/registry',     title: 'Registry',      zhTitle: '注册表' },
      { slug: 'spec/index-format', title: '_index.xml',    zhTitle: '_index.xml' },
    ],
  },
  {
    heading: 'Architecture',
    zhHeading: '架构',
    pages: [
      { slug: 'architecture/pipeline',      title: '5-layer pipeline',  zhTitle: '五层流水线' },
      { slug: 'architecture/compile-time',  title: 'Compile time',      zhTitle: '编译期' },
      { slug: 'architecture/runtime',       title: 'Runtime',           zhTitle: '运行时' },
      { slug: 'architecture/domain-plugin', title: 'Domain plugin',     zhTitle: '领域插件' },
    ],
  },
  {
    heading: 'Implementation',
    zhHeading: '实现',
    pages: [
      { slug: 'implementation/parser',     title: 'Parser & AST',      zhTitle: '解析器与 AST' },
      { slug: 'implementation/checkers',   title: 'L1 / L2 / L3',      zhTitle: 'L1 / L2 / L3 校验' },
      { slug: 'implementation/chunker',    title: 'Chunker',           zhTitle: '分块器' },
      { slug: 'implementation/runtime',    title: 'Loader & resolver', zhTitle: '加载器与解析器' },
      { slug: 'implementation/mcp-server', title: 'MCP server',        zhTitle: 'MCP 服务' },
    ],
  },
  {
    heading: 'Usage',
    zhHeading: '使用',
    pages: [
      { slug: 'usage/install',          title: 'Install',          zhTitle: '安装' },
      { slug: 'usage/first-atom',       title: 'First atom',       zhTitle: '第一个原子' },
      { slug: 'usage/compile',          title: 'Compile',          zhTitle: '编译' },
      { slug: 'usage/mcp-claude',       title: 'Wire into Claude', zhTitle: '接 Claude' },
      { slug: 'usage/publish-install',  title: 'Publish & Install',zhTitle: '发布与安装' },
    ],
  },
  {
    heading: 'Extending',
    zhHeading: '拓展',
    pages: [
      { slug: 'extending/custom-kinds',  title: 'Custom kinds',     zhTitle: '自定义 kind' },
      { slug: 'extending/custom-verbs',  title: 'Custom verbs',     zhTitle: '自定义 verb' },
      { slug: 'extending/domain-yaml',   title: 'domain.yaml',      zhTitle: 'domain.yaml' },
      { slug: 'extending/domain-mcp',    title: 'Domain MCP',       zhTitle: '领域 MCP 包装' },
    ],
  },
  {
    heading: 'Reference',
    zhHeading: '参考',
    pages: [
      { slug: 'reference/cli',           title: 'CLI',              zhTitle: 'CLI 命令' },
      { slug: 'reference/dsl',           title: '.prime DSL',       zhTitle: '.prime 文法' },
      { slug: 'reference/mcp',           title: 'MCP tool schemas', zhTitle: 'MCP 工具' },
      { slug: 'reference/http-registry', title: 'HTTP registry',    zhTitle: 'HTTP 注册表' },
    ],
  },
  {
    heading: 'Skills',
    zhHeading: 'Skill 示例',
    pages: [
      { slug: 'skills/frontend-design', title: 'frontend-design', zhTitle: 'frontend-design' },
    ],
  },
  {
    heading: 'Community',
    zhHeading: '社区',
    pages: [
      { slug: 'community/roadmap',       title: 'Roadmap',          zhTitle: '路线图' },
    ],
  },
];

// Flat list for prev/next pagination.
export const DOCS_FLAT: DocLink[] = DOCS_TREE.flatMap((s) => s.pages);

export function findNeighbors(slug: string) {
  const idx = DOCS_FLAT.findIndex((p) => p.slug === slug);
  return {
    prev: idx > 0 ? DOCS_FLAT[idx - 1] : null,
    next: idx >= 0 && idx < DOCS_FLAT.length - 1 ? DOCS_FLAT[idx + 1] : null,
  };
}
