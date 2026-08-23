import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../../config';

export async function GET(context: APIContext) {
  const items = (await getCollection('reading'))
    .filter((i) => i.data.added)
    .sort((a, b) => b.data.added!.valueOf() - a.data.added!.valueOf());

  return rss({
    title: `${SITE.title} — Reading`,
    description: 'New additions to the reading list.',
    site: context.site ?? SITE.url,
    items: items.map((item) => ({
      title: item.data.title,
      description: item.data.annotation,
      pubDate: item.data.added!,
      link: item.data.link ?? '/reading/',
      categories: item.data.areas,
    })),
    customData: `<language>${SITE.locale}</language>`,
  });
}
