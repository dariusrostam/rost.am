import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../config';

export async function GET(context: APIContext) {
  const posts = (await getCollection('writing', ({ data }) => !data.draft && !data.demo)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  return rss({
    title: `${SITE.title} — Writing`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link:
        post.data.crosspostMode === 'stub' && post.data.venueUrl
          ? post.data.venueUrl
          : `/writing/${post.id}/`,
      categories: post.data.tags,
    })),
    customData: `<language>${SITE.locale}</language>`,
  });
}
