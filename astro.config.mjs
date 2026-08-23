// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeMarginNotes from './src/plugins/rehype-margin-notes.mjs';
import rehypeTypography from './src/plugins/rehype-typography.mjs';

// Explicit unified() processor (remark/rehype pipeline) rather than Astro's
// newer default, so the custom margin-notes rehype plugin can hook in.
// Built once and passed to both `markdown.processor` (.md files) and
// `mdx({ processor })` (.mdx files) -- MDX documents `config.markdown.processor`
// as its default, but in practice it needs the same processor passed
// explicitly to actually apply these plugins to .mdx content.
const markdownProcessor = unified({
  gfm: true,
  // Astro's smartypants applies English-only quote rules; content here is
  // mixed German/English, so quote/dash typography is handled by our own
  // language-aware rehype plugin instead (see src/plugins/rehype-typography.mjs).
  smartypants: false,
  // margin-notes first, so each relocated note becomes its own top-level
  // block and gets independent quote-nesting state from rehype-typography
  rehypePlugins: [rehypeMarginNotes, rehypeTypography],
});

// https://astro.build/config
export default defineConfig({
  site: 'https://rost.am',
  integrations: [
    // MDX's `processor` option documents `config.markdown.processor` as its
    // default but doesn't actually apply it in practice (tested); the plugin
    // arrays below are deprecated but are what actually wires .mdx footnotes
    // through the same margin-notes/typography pipeline as .md files.
    mdx({ gfm: true, smartypants: false, rehypePlugins: [rehypeMarginNotes, rehypeTypography] }),
    sitemap(),
  ],
  markdown: {
    processor: markdownProcessor,
  },
});
