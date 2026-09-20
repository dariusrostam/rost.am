import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { parse as parseYaml } from 'yaml';

function publicationsParser(text: string) {
  return parseYaml(text).map((entry: Record<string, unknown>) => ({ ...entry, id: entry.slug }));
}

const AREAS = [
  'copyright',
  'ai',
  'it-security-law',
  'unfair-competition-law',
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
    venue: z.string().optional(),
    venueUrl: z.string().url().optional(),
    crosspostMode: z.enum(['full', 'stub']).optional(),
    canonical: z.string().url().optional(),
    link: z.string().url().optional(),
    linkSource: z.string().optional(),
    thumbnail: z.string().optional(),
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
    shortVenue: z.string().optional(),
    language: z.enum(['de', 'en']),
    openAccess: z.boolean().default(false),
    doi: z.string().optional(),
    ssrn: z.string().url().optional(),
    url: z.string().url().optional(),
    pdf: z.string().optional(),
    abstract: z.string().optional(),
    thumbnail: z.string().optional(),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/now' }),
  schema: z
    .object({
      type: z.enum(['note', 'link', 'youtube']),
      date: z.coerce.date(),
      title: z.string().optional(),
      url: z.string().url().optional(),
      source: z.string().optional(),
      pinned: z.boolean().default(false),
    })
    .refine((v) => v.type === 'note' || Boolean(v.url), {
      message: '`url` is required for "link" and "youtube" now-entries',
    }),
});

export const collections = { blog, publications, now };
