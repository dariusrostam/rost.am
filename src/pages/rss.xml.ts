import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../config';
import { getStreamEntries } from '../lib/stream';

function stripComments(markdown: string): string {
  return markdown.replace(/<!--[\s\S]*?-->/g, '').trim();
}

export async function GET(context: APIContext) {
  const { entries, pinnedNote } = await getStreamEntries();
  const all = (pinnedNote ? [pinnedNote, ...entries] : entries).sort(
    (a, b) => b.date.valueOf() - a.date.valueOf()
  );

  const items = all.map((item) => {
    if (item.type === 'blogpost') {
      const post = item.post;
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link:
          post.data.link ??
          (post.data.crosspostMode === 'stub' && post.data.venueUrl ? post.data.venueUrl : `/blog/${post.id}/`),
        categories: post.data.tags,
      };
    }
    if (item.type === 'publication') {
      const pub = item.pub;
      return {
        title: pub.data.title,
        description: pub.data.abstract ?? pub.data.venue,
        pubDate: item.date,
        link: `/research/${pub.id}/`,
        categories: pub.data.areas,
      };
    }
    if (item.type === 'bluesky') {
      return {
        title: 'Bluesky post',
        description: item.text,
        pubDate: item.date,
        link: item.url,
      };
    }
    const entry = item.entry;
    const title = entry.data.title ?? (item.type === 'link' ? 'Link' : item.type === 'youtube' ? 'Video' : 'Note');
    return {
      title,
      description: stripComments(entry.body ?? ''),
      pubDate: item.date,
      link: entry.data.url ?? new URL('/', SITE.url).toString(),
    };
  });

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items,
    customData: `<language>${SITE.locale}</language>`,
  });
}
