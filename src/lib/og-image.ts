import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const regular = readFileSync(join(process.cwd(), 'src/assets/og-fonts/inter-regular.ttf'));
const bold = readFileSync(join(process.cwd(), 'src/assets/og-fonts/inter-bold.ttf'));

const WIDTH = 1200;
const HEIGHT = 630;

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
