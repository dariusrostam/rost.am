import type { CollectionEntry } from 'astro:content';
import { SITE } from '../config';

export type Publication = CollectionEntry<'publications'>['data'];

const TYPE_LABEL: Record<Publication['type'], string> = {
  monograph: 'Monograph',
  'edited-volume': 'Editorship',
  article: 'Article',
  chapter: 'Chapter',
  'case-note': 'Case note',
  blog: 'Various',
  'working-paper': 'Working paper',
};

export { TYPE_LABEL };

export function coAuthorLine(pub: Publication): string | undefined {
  const others = pub.authors.filter((a) => a !== SITE.author);
  if (others.length === 0) return undefined;
  if (others.length === pub.authors.length) return others.join(', ');
  return `${pub.editorRole ? 'edited with' : 'with'} ${others.join(', ')}`;
}

export function venueWithYear(pub: Publication): string {
  const venue = pub.shortVenue ?? (pub.type === 'chapter' ? parseChapterVenue(pub.venue).title : pub.venue);
  return /\d{4}/.test(venue) ? venue : `${venue}, ${pub.year}`;
}

export function primaryLink(pub: Publication): string | undefined {
  if (pub.pdf) return pub.pdf;
  if (pub.doi) return `https://doi.org/${pub.doi}`;
  return pub.url ?? pub.ssrn;
}

function parseChapterVenue(venue: string): {
  editors: string;
  title: string;
  editorsAndTitle: string;
  year: string;
  publisherAndPlace: string;
} {
  const year = venue.match(/(\d{4})/)?.[1] ?? '';
  const withoutPrefix = venue.replace(/^in:\s*/, '');
  const parts = withoutPrefix.split(',').map((s) => s.trim());
  const editors = (parts[0] ?? '').replace(/\s*\(Hrsg\.\)$/, '');
  const title = parts.slice(1, -2).join(', ');
  const editorsAndTitle = parts.slice(0, -2).join(', ');
  const publisherAndPlace = parts.slice(-2).join(', ').replace(/\s*\d{4}$/, '').trim();
  return { editors, title, editorsAndTitle, year, publisherAndPlace };
}

