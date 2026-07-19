// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// GitHub Pages serves a project repo under /<repo>/. The CI workflow sets
// BASE_PATH; local dev/build default to root ("/").
const BASE = process.env.BASE_PATH || '/';
const BASE_NOSLASH = BASE.replace(/\/$/, '');

// Astro does not prefix `base` onto author-written root-absolute links in
// Markdown content (only Starlight's own nav is base-aware). This rehype pass
// prefixes internal "/…" links so they resolve under the Pages base path.
// No-op when BASE is "/" (BASE_NOSLASH === "").
function rehypeBaseLinks() {
  return (/** @type {any} */ tree) => {
    const visit = (/** @type {any} */ node) => {
      if (node.type === 'element' && node.tagName === 'a') {
        const href = node.properties && node.properties.href;
        if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
          node.properties.href = BASE_NOSLASH + href;
        }
      }
      (node.children || []).forEach(visit);
    };
    visit(tree);
  };
}

// https://astro.build
export default defineConfig({
  site: 'https://charles-atlas.github.io',
  base: BASE,
  markdown: {
    // Only $$…$$ is math; single $ stays literal so prose like "$960k" is safe.
    remarkPlugins: [[remarkMath, { singleDollarTextMath: false }]],
    rehypePlugins: [rehypeKatex, rehypeBaseLinks],
  },
  integrations: [
    // astro-mermaid must come before starlight
    mermaid({ theme: 'default', autoTheme: true }),
    starlight({
      title: 'Atlas Docs',
      description:
        'Documentation for the Atlas critical-minerals derivatives and reference-price platform.',
      tagline: 'Critical-minerals perpetuals, a multi-source reference-price oracle, and an integrated market-making book.',
      customCss: ['katex/dist/katex.min.css', './src/styles/atlas.css'],
      pagination: true,
      lastUpdated: false,
      sidebar: [
        { label: 'Overview', link: '/' },
        {
          label: 'Exchange',
          items: [
            { label: 'Overview', link: '/exchange/overview/' },
            { label: 'API reference', link: '/exchange/api-reference/' },
          ],
        },
        {
          label: 'Oracle',
          items: [
            { label: 'Overview', link: '/oracle/overview/' },
            { label: 'Data licensing', link: '/oracle/data-licensing/' },
          ],
        },
        {
          label: 'Market making',
          items: [
            { label: 'How the market maker works', link: '/vault/market-making/' },
            { label: 'Risk overlay', link: '/vault/risk-overlay/' },
            { label: 'Offline simulation', link: '/vault/offline-sim/' },
          ],
        },
        { label: 'Model status & validation', link: '/model-status/' },
        {
          label: 'Surfaces',
          items: [{ label: 'Atlas Swaps', link: '/surfaces/atlas-swaps/' }],
        },
        {
          label: 'Reference',
          items: [{ label: 'Glossary', link: '/reference/glossary/' }],
        },
        {
          label: 'Roadmap',
          items: [{ label: 'Planned & in development', link: '/roadmap/' }],
        },
      ],
    }),
  ],
});
