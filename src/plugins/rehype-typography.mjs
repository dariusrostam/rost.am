import { visit, SKIP } from 'unist-util-visit';

const QUOTES = {
  de: { openDouble: '„', closeDouble: '“', openSingle: '‚', closeSingle: '‘' },
  en: { openDouble: '“', closeDouble: '”', openSingle: '‘', closeSingle: '’' },
};

const APOSTROPHE = '’';

/**
 * Language-aware typography for mixed German/English prose (brief: "Real
 * typography" under Design direction). Reads the post's `language`
 * frontmatter (set by Astro on `file.data.astro.frontmatter`) rather than
 * guessing per element, since each post is single-language end to end.
 *
 * - `--`/`---` -> en/em dash
 * - straight quotes -> „…" for German, "…" for English, tracked per
 *   top-level block so nesting stays balanced within a paragraph
 * - word-internal `'` -> a typographic apostrophe, not a quote mark
 * - for German content: non-breaking space after `§`/`§§`, `Rn.`, `S.`
 *   before a following number
 *
 * Skips `<code>`/`<pre>` so literal text is never rewritten.
 */
export default function rehypeTypography() {
  return (tree, file) => {
    const lang = file?.data?.astro?.frontmatter?.language === 'de' ? 'de' : 'en';
    const marks = QUOTES[lang];

    for (const block of tree.children) {
      const state = { double: false, single: false };
      visit(block, () => true, (node) => {
        if (node.type === 'element' && (node.tagName === 'code' || node.tagName === 'pre')) {
          return SKIP;
        }
        if (node.type === 'text') {
          node.value = transformText(node.value, state, marks, lang);
        }
      });
    }
  };
}

function transformText(value, state, marks, lang) {
  let out = value
    .replace(/---/g, '—') // em dash
    .replace(/--/g, '–'); // en dash

  out = out.replace(/([A-Za-zÀ-ÖØ-öø-ÿ])'([A-Za-zÀ-ÖØ-öø-ÿ])/g, `$1${APOSTROPHE}$2`);

  out = out.replace(/["']/g, (match) => {
    if (match === '"') {
      state.double = !state.double;
      return state.double ? marks.openDouble : marks.closeDouble;
    }
    state.single = !state.single;
    return state.single ? marks.openSingle : marks.closeSingle;
  });

  if (lang === 'de') {
    out = out.replace(/(§§?)\s+(?=\d)/g, '$1 ').replace(/\b(Rn\.|S\.)\s+(?=\d)/g, '$1 ');
  }

  return out;
}
