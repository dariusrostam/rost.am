import type { APIRoute } from 'astro';
import { renderOgImage } from '../../lib/og-image';

export const GET: APIRoute = async () => {
  const png = await renderOgImage('Private law, law and technology — copyright and AI.');
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
