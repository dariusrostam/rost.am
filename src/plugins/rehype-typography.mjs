import { visit, SKIP } from 'unist-util-visit';

const QUOTES = {
  de: { openDouble: '„', closeDouble: '“', openSingle: '‚', closeSingle: '‘' },
  en: { openDouble: '“', closeDouble: '”', openSingle: '‘', closeSingle: '’' },
};

const APOSTROPHE = '’';

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
  let out = value.replace(/---/g, '—').replace(/--/g, '–');

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
