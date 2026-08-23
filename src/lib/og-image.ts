import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Static (non-variable) instances specifically for OG-card generation --
// satori doesn't support the variable woff2 files the rest of the site
// uses (it needs ttf/otf/woff), so these two weights are fetched once from
// Google Fonts' legacy (non-variable) endpoint and committed here rather
// than reprocessed on every build. Read via an absolute, cwd-based path
// (astro build always runs from the project root) rather than an
// import.meta.url or Vite asset import -- both of those resolve to
// locations that don't survive Astro moving the compiled chunk around
// during prerendering.
const regular = readFileSync(join(process.cwd(), 'src/assets/og-fonts/inter-regular.ttf'));
const bold = readFileSync(join(process.cwd(), 'src/assets/og-fonts/inter-bold.ttf'));

const WIDTH = 1200;
const HEIGHT = 630;

/** Simple typographic OG card: title + site kicker, no external service. */
export async function renderOgImage(title: string, kicker = 'rost.am'): Promise<Buffer> {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#ffffff',
          padding: '80px',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { fontSize: 28, color: '#555555', letterSpacing: '0.02em' },
              children: kicker,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: title.length > 70 ? 48 : 60,
                fontWeight: 700,
                color: '#0a0a0a',
                lineHeight: 1.25,
                display: 'flex',
              },
              children: title,
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: 24, color: '#1d4ed8', fontWeight: 700 },
              children: 'Darius Rostam',
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: 'Inter', data: regular, weight: 400, style: 'normal' },
        { name: 'Inter', data: bold, weight: 700, style: 'normal' },
      ],
    }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } });
  return resvg.render().asPng();
}
