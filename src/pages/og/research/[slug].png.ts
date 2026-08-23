import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgImage } from '../../../lib/og-image';

export async function getStaticPaths() {
  const pubs = await getCollection('publications');
  return pubs.map((pub) => ({ params: { slug: pub.id }, props: { title: pub.data.title } }));
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage(props.title as string);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
