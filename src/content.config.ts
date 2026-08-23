import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { parse as parseYaml } from 'yaml';

// publications.yaml lives at the repo root (brief §1: "adding a paper must
// stay a single edit to that one file"), not under src/content/ -- file()
// paths resolve against the project root. The loader already falls back to
// `slug` for the id, but a custom parser is still needed to use `yaml`
// (already a project dependency) rather than pulling in js-yaml as well.
function publicationsParser(text: string) {
  return parseYaml(text).map((entry: Record<string, unknown>) => ({ ...entry, id: entry.slug }));
}

const AREAS = [
  'copyright',
  'ai',
  'it-security-law',
  'unfair-competition-law',
  'antitrust',
  'law-and-society',
  'transnational-law',
  'culture-and-law',
  'societal-constitutionalism',
] as const;

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    language: z.enum(['de', 'en']),
    draft: z.boolean().default(false),
    description: z.string(),
    // Cross-posts: set `venue`/`venueUrl` when a piece appeared elsewhere
    // first. `crosspostMode: 'full'` hosts the full text here with a
    // banner and an outward canonical; 'stub' shows only a summary and an
    // outbound link and stays self-canonical (nothing here competes with
    // the publisher).
    venue: z.string().optional(),
    venueUrl: z.string().url().optional(),
    crosspostMode: z.enum(['full', 'stub']).optional(),
    canonical: z.string().url().optional(),
    // Kottke-style link posts: a short entry pointing at something
    // interesting elsewhere (a paper, an article, anything). When `link`
    // is set, the title links straight out to it instead of just to this
    // post's own permalink; `linkSource` is an optional short site name
    // shown as "(via X)". The post still gets its own page (for RSS and a
    // stable URL to comment on/cite), it's just a different card style in
    // the index.
    link: z.string().url().optional(),
    linkSource: z.string().optional(),
    // Demo posts exist only to prove the margin-note mechanism and are
    // excluded from the index/RSS feed.
    demo: z.boolean().default(false),
  }),
});

const publications = defineCollection({
  loader: file('publications.yaml', { parser: publicationsParser }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    authors: z.array(z.string()),
    editorRole: z.boolean().default(false),
    year: z.number(),
    type: z.enum(['monograph', 'edited-volume', 'article', 'chapter', 'case-note', 'blog', 'working-paper']),
    areas: z.array(z.enum(AREAS)),
    venue: z.string(),
    language: z.enum(['de', 'en']),
    openAccess: z.boolean().default(false),
    doi: z.string().optional(),
    ssrn: z.string().url().optional(),
    url: z.string().url().optional(),
    pdf: z.string().optional(),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/now' }),
  schema: z.object({
    updated: z.coerce.date(),
  }),
});

export const collections = { blog, publications, now };
