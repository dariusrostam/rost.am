// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeMarginNotes from './src/plugins/rehype-margin-notes.mjs';
import rehypeTypography from './src/plugins/rehype-typography.mjs';

const markdownProcessor = unified({
  gfm: true,
  smartypants: false,
  rehypePlugins: [rehypeMarginNotes, rehypeTypography],
});

export default defineConfig({
  site: 'https://rost.am',
  build: {
    inlineStylesheets: 'never',
  },
  integrations: [
    mdx({ gfm: true, smartypants: false, rehypePlugins: [rehypeMarginNotes, rehypeTypography] }),
    sitemap(),
  ],
  markdown: {
    processor: markdownProcessor,
  },
});
