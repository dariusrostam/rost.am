import type { CollectionEntry } from 'astro:content';

export type Publication = CollectionEntry<'publications'>['data'];

const TYPE_LABEL: Record<Publication['type'], string> = {
  monograph: 'Monograph',
  'edited-volume': 'Edited volume',
  article: 'Article',
  chapter: 'Chapter',
  'case-note': 'Case note',
  blog: 'Blog post',
  'working-paper': 'Working paper',
};

export { TYPE_LABEL };

function lastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1];
}

/** "Darius Rostam" -> "Rostam, Darius"; a bare surname (editor-role entries) is left as-is. */
function toLastFirst(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[parts.length - 1]}, ${parts.slice(0, -1).join(' ')}`;
}

function authorList(pub: Publication): string {
  return pub.authors.map((a) => lastName(a)).join('/');
}

/** Splits a `venue` like "ZGE (4) 2025, 471–499" into journal/year/firstpage. */
function parseJournalVenue(venue: string): { journal: string; year: string; firstPage: string; lastPage?: string } | null {
  const m = venue.match(/^([A-Za-zÄÖÜäöüß.]+)\s*(?:\(\d+\))?\s*(\d{4}),\s*(\d+)(?:[–-](\d+))?/);
  if (!m) return null;
  return { journal: m[1], year: m[2], firstPage: m[3], lastPage: m[4] };
}

/** Splits a chapter `venue` like "in: Golla/Brodowski (Hrsg.), Title, Publisher, Place 2023"
 *  into editors, book title, year and publisher/place. */
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

// ---------------------------------------------------------------------------
// German legal short citation (brief §1a) — "the style used in footnotes",
// with an empty pinpoint the reader fills in themselves.
// ---------------------------------------------------------------------------
export function toGermanCitation(pub: Publication): string {
  const author = authorList(pub);
  switch (pub.type) {
    case 'article':
    case 'case-note': {
      const parsed = parseJournalVenue(pub.venue);
      if (parsed) return `${author}, ${parsed.journal} ${parsed.year}, ${parsed.firstPage} ( )`;
      return `${author}, ${pub.venue} ( )`;
    }
    case 'chapter': {
      const { editorsAndTitle, year } = parseChapterVenue(pub.venue);
      return `${author}, in: ${editorsAndTitle}, ${year}, S. `;
    }
    case 'monograph':
      return `${author}, ${pub.title}, ${pub.year}, S. `;
    case 'edited-volume':
      return `${author} (Hrsg.), ${pub.title}, ${pub.year}, S. `;
    case 'working-paper':
      return `${author}, ${pub.title}, ${pub.venue}, ${pub.year}`;
    case 'blog':
      return `${author}, ${pub.title}, ${pub.venue}, ${pub.year}`;
  }
}

// ---------------------------------------------------------------------------
// Plain English citation, for the international pieces (brief §1a).
// ---------------------------------------------------------------------------
export function toEnglishCitation(pub: Publication): string {
  const authors = pub.authors.join(', ');
  switch (pub.type) {
    case 'monograph':
      return `${authors}, ${pub.title} (${pub.venue}).`;
    case 'edited-volume':
      return `${authors} (eds.), ${pub.title} (${pub.venue}).`;
    case 'chapter': {
      const { editorsAndTitle, publisherAndPlace, year } = parseChapterVenue(pub.venue);
      return `${authors}, '${pub.title}' in ${editorsAndTitle} (${publisherAndPlace} ${year}).`;
    }
    case 'article':
    case 'case-note':
      return `${authors}, '${pub.title}', ${pub.venue} (${pub.year}).`;
    case 'working-paper':
      return `${authors}, '${pub.title}' (${pub.year}), ${pub.venue}.`;
    case 'blog':
      return `${authors}, '${pub.title}', ${pub.venue}, ${pub.year}.`;
  }
}

// ---------------------------------------------------------------------------
// BibTeX
// ---------------------------------------------------------------------------
const BIBTEX_ENTRY_TYPE: Record<Publication['type'], string> = {
  monograph: 'book',
  'edited-volume': 'book',
  article: 'article',
  'case-note': 'article',
  chapter: 'incollection',
  'working-paper': 'unpublished',
  // Not specified in the brief; treated as @misc since it's neither a
  // journal article nor an unpublished working paper.
  blog: 'misc',
};

function bibtexEscape(value: string): string {
  return value.replace(/[{}]/g, '');
}

function bibtexField(name: string, value: string | undefined): string {
  if (!value) return '';
  return `  ${name} = {${bibtexEscape(value)}},\n`;
}

export function toBibTeX(pub: Publication): string {
  const entryType = BIBTEX_ENTRY_TYPE[pub.type];
  const authorField = pub.editorRole ? 'editor' : 'author';
  let fields = '';
  fields += bibtexField(authorField, pub.authors.map(toLastFirst).join(' and '));
  fields += bibtexField('title', pub.title);
  fields += bibtexField('year', String(pub.year));

  switch (pub.type) {
    case 'monograph':
    case 'edited-volume':
      fields += bibtexField('publisher', pub.venue);
      break;
    case 'article':
    case 'case-note': {
      const parsed = parseJournalVenue(pub.venue);
      fields += bibtexField('journal', parsed?.journal ?? pub.venue);
      if (parsed) {
        fields += bibtexField('pages', parsed.lastPage ? `${parsed.firstPage}--${parsed.lastPage}` : parsed.firstPage);
      }
      break;
    }
    case 'chapter': {
      const { editors, title, publisherAndPlace } = parseChapterVenue(pub.venue);
      fields += bibtexField('booktitle', title);
      fields += bibtexField('editor', editors);
      fields += bibtexField('publisher', publisherAndPlace);
      break;
    }
    case 'working-paper':
      fields += bibtexField('note', pub.venue);
      if (pub.ssrn) fields += bibtexField('url', pub.ssrn);
      break;
    case 'blog':
      fields += bibtexField('howpublished', pub.venue);
      break;
  }

  fields += bibtexField('language', pub.language === 'de' ? 'german' : 'english');
  if (pub.doi) fields += bibtexField('doi', pub.doi);
  const url = pub.url ?? pub.ssrn;
  if (url) fields += bibtexField('url', url);

  return `@${entryType}{${pub.slug},\n${fields}}`;
}

// ---------------------------------------------------------------------------
// RIS
// ---------------------------------------------------------------------------
const RIS_TYPE: Record<Publication['type'], string> = {
  monograph: 'BOOK',
  'edited-volume': 'BOOK',
  article: 'JOUR',
  'case-note': 'JOUR',
  chapter: 'CHAP',
  'working-paper': 'UNPB',
  blog: 'GEN',
};

export function toRIS(pub: Publication): string {
  const lines: string[] = [];
  lines.push(`TY  - ${RIS_TYPE[pub.type]}`);
  for (const a of pub.authors) lines.push(`AU  - ${toLastFirst(a)}`);
  lines.push(`TI  - ${pub.title}`);
  lines.push(`PY  - ${pub.year}`);

  if (pub.type === 'article' || pub.type === 'case-note') {
    const parsed = parseJournalVenue(pub.venue);
    lines.push(`JO  - ${parsed?.journal ?? pub.venue}`);
    if (parsed) {
      lines.push(`SP  - ${parsed.firstPage}`);
      if (parsed.lastPage) lines.push(`EP  - ${parsed.lastPage}`);
    }
  } else if (pub.type === 'chapter') {
    const { title, publisherAndPlace } = parseChapterVenue(pub.venue);
    lines.push(`T2  - ${title}`);
    lines.push(`PB  - ${publisherAndPlace}`);
  } else {
    lines.push(`PB  - ${pub.venue}`);
  }

  lines.push(`LA  - ${pub.language}`);
  if (pub.doi) lines.push(`DO  - ${pub.doi}`);
  const url = pub.url ?? pub.ssrn;
  if (url) lines.push(`UR  - ${url}`);
  lines.push('ER  - ');
  return lines.join('\n');
}
