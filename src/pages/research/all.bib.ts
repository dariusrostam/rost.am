import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { toBibTeX } from '../../lib/citations';

export const GET: APIRoute = async () => {
  const pubs = (await getCollection('publications')).sort((a, b) => b.data.year - a.data.year);
  const body = pubs.map((pub) => toBibTeX(pub.data)).join('\n\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'application/x-bibtex; charset=utf-8',
      'Content-Disposition': 'attachment; filename="rostam-publications.bib"',
    },
  });
};
