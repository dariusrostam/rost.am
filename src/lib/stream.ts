import { getCollection, type CollectionEntry } from 'astro:content';
import { fetchLatestBlueskyPosts } from './bluesky';

export type StreamEntry =
  | { type: 'note' | 'link' | 'youtube'; date: Date; entry: CollectionEntry<'now'> }
  | { type: 'blogpost'; date: Date; post: CollectionEntry<'blog'> }
  | { type: 'publication'; date: Date; pub: CollectionEntry<'publications'> }
  | { type: 'bluesky'; date: Date; url: string; text: string; thumb?: string };

export interface StreamResult {
  entries: StreamEntry[];
  pinnedNote?: Extract<StreamEntry, { type: 'note' }>;
}

export async function getStreamEntries(limit?: number): Promise<StreamResult> {
  const [nowItems, blogPosts, pubs, blueskyPosts] = await Promise.all([
    getCollection('now'),
    getCollection('blog', ({ data }) => !data.draft && !data.demo),
    getCollection('publications'),
    fetchLatestBlueskyPosts(),
  ]);

  const entries: StreamEntry[] = [
    ...nowItems.map((entry): StreamEntry => ({ type: entry.data.type, date: entry.data.date, entry })),
    ...blogPosts.map((post): StreamEntry => ({ type: 'blogpost', date: post.data.date, post })),
    ...pubs.map((pub): StreamEntry => ({ type: 'publication', date: pub.data.date ?? new Date(pub.data.year, 0, 1), pub })),
    ...blueskyPosts.map((p): StreamEntry => ({ type: 'bluesky', date: p.date, url: p.url, text: p.text, thumb: p.thumb })),
  ];

  entries.sort((a, b) => b.date.valueOf() - a.date.valueOf());

  const pinnedNote = entries.find(
    (e): e is Extract<StreamEntry, { type: 'note' }> => e.type === 'note' && e.entry.data.pinned,
  );
  const rest = pinnedNote ? entries.filter((e) => e !== pinnedNote) : entries;

  return { entries: limit ? rest.slice(0, limit) : rest, pinnedNote };
}
