import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    language: z.enum(['de', 'en']),
    draft: z.boolean().default(false),
    description: z.string(),
    // Cross-posts (brief §2a): set `venue`/`venueUrl` when a piece appeared
    // elsewhere first. `crosspostMode: 'full'` hosts the full text here with a
    // banner and an outward canonical; 'stub' shows only a summary + outbound
    // link and stays self-canonical (nothing here competes with the publisher).
    venue: z.string().optional(),
    venueUrl: z.string().url().optional(),
    crosspostMode: z.enum(['full', 'stub']).optional(),
    canonical: z.string().url().optional(),
    // Demo posts exist only to prove the margin-note mechanism (brief §2) and
    // are excluded from the index/RSS feed.
    demo: z.boolean().default(false),
  }),
});

export const collections = { writing };
