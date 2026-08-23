// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';

// https://astro.build/config
export default defineConfig({
  site: 'https://rost.am',
  integrations: [mdx(), sitemap()],
  markdown: {
    // Explicit unified() processor (remark/rehype pipeline) rather than Astro's
    // newer default, so the custom margin-notes rehype plugin can hook in.
    processor: unified({
      gfm: true,
      // Astro's smartypants applies English-only quote rules; content here is
      // mixed German/English, so quote/dash typography is handled by our own
      // language-aware rehype plugin instead (see src/plugins/rehype-typography.mjs).
      smartypants: false,
      rehypePlugins: [],
    }),
  },
});
