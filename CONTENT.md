# Content field reference

One page, every field. See README.md for workflows (how to actually do things); this is just the schema.

## Blog posts — `src/content/blog/*.md` or `*.mdx`

| Field           | Required | Notes                                                                 |
| --------------- | -------- | ---------------------------------------------------------------------- |
| `title`         | yes      |                                                                        |
| `date`          | yes      | `YYYY-MM-DD`                                                          |
| `updated`       | no       | `YYYY-MM-DD`, shown next to the date if set                          |
| `tags`          | no       | list of strings, defaults to empty                                    |
| `language`      | yes      | `en` or `de` — sets the page's `lang` and drives typography rules     |
| `draft`         | no       | `true` excludes the post from the build entirely; defaults to `false` |
| `description`   | yes      | one sentence; used in meta tags, OG cards, RSS                        |
| `venue`         | no       | set only for cross-posts, e.g. `"Verfassungsblog"`                    |
| `venueUrl`      | no       | the external URL, needed for the "Read at X →" button                |
| `crosspostMode` | no       | `"full"` (hosted here, canonical points out) or `"stub"` (summary + outbound link only) |
| `canonical`     | no       | only used when `crosspostMode: full`                                  |
| `link`          | no       | kottke-style link post — the title links straight out to this URL instead of just the post's own page |
| `linkSource`    | no       | short site name shown as "via X" next to a `link` post                |
| `demo`          | no       | marks a demo/test post; excluded from the index and RSS, `noindex`    |

Footnotes: standard Markdown syntax `[^1]` / `[^1]: text` — becomes a margin note automatically, no frontmatter
needed. `<Aside>` component: `.mdx` files only, needs `import Aside from '../../components/Aside.astro'`.

## `publications.yaml` (repo root)

| Field        | Required | Notes                                                                                   |
| ------------ | -------- | ---------------------------------------------------------------------------------------- |
| `slug`       | yes      | becomes the URL and the BibTeX cite key — keep it stable once published                  |
| `title`      | yes      |                                                                                          |
| `authors`    | yes      | list of full names, in citation order                                                    |
| `editorRole` | no       | `true` renders "(Hrsg.)"; defaults to `false`                                            |
| `year`       | yes      | number                                                                                   |
| `type`       | yes      | `monograph` \| `edited-volume` \| `article` \| `chapter` \| `case-note` \| `blog` \| `working-paper` — drives the BibTeX/RIS entry type and citation template |
| `areas`      | yes      | list from the fixed vocabulary below                                                     |
| `venue`      | yes      | free text, but the citation generators parse it — see the pattern notes below            |
| `language`   | yes      | `en` or `de`                                                                             |
| `openAccess` | no       | defaults to `false`                                                                      |
| `doi`        | no       |                                                                                          |
| `ssrn`       | no       | full URL                                                                                 |
| `url`        | no       | publisher/other link                                                                     |
| `pdf`        | no       | `/papers/<slug>.pdf` — file goes in `public/papers/`                                     |

**`venue` format matters** — the four "Cite this" formats are parsed out of it:

- Articles/case-notes: `"JOURNAL YEAR, PAGE"` or `"JOURNAL (issue) YEAR, PAGE–PAGE"`, e.g. `"ZGE (4) 2025, 471–499"`.
- Chapters: `"in: Editors (Hrsg.), Book Title, Publisher, Place YEAR"`, e.g.
  `"in: Golla/Brodowski (Hrsg.), IT-Sicherheitsforschung und IT-Strafrecht, Mohr Siebeck, Tübingen 2023"`.
- Everything else (monographs, working papers, blog): free text, used as-is.

If a citation looks wrong, check `venue` first — the generators (`src/lib/citations.ts`) expect these shapes. Each
entry's page also gets a preview image automatically (a typographic card generated from the title, the same way
Open Graph cards are) — nothing to configure.

**Areas vocabulary**: `copyright`, `ai`, `it-security-law`, `unfair-competition-law`, `antitrust`,
`law-and-society`, `transnational-law`, `culture-and-law`, `societal-constitutionalism`.

## `/now` — `src/content/now/now.md`

Single file. Frontmatter is just `updated: YYYY-MM-DD` — **update this every time you edit the body**; both this
page and the homepage show a visibly-stale warning past 45 days since that date. Body is plain Markdown.

## Legal pages

`src/pages/impressum.astro` and `src/pages/datenschutz.astro` aren't data-driven — edit the `.astro` files
directly. Personal details are marked `LOREM/TODO` inline.
