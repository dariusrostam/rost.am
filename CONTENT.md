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
| `date`       | no       | `YYYY-MM-DD` — used only to order entries (home stream, research list) when `year` alone doesn't disambiguate; falls back to Jan 1 of `year` when unset |
| `type`       | yes      | `monograph` \| `edited-volume` \| `article` \| `chapter` \| `case-note` \| `blog` \| `working-paper` — drives the BibTeX/RIS entry type and citation template |
| `areas`      | yes      | list from the fixed vocabulary below                                                     |
| `venue`      | yes      | free text, but the citation generators parse it — see the pattern notes below            |
| `language`   | yes      | `en` or `de`                                                                             |
| `openAccess` | no       | defaults to `false`                                                                      |
| `doi`        | no       |                                                                                          |
| `ssrn`       | no       | full URL                                                                                 |
| `url`        | no       | publisher/other link                                                                     |
| `pdf`        | no       | `/papers/<slug>.pdf` — file goes in `public/papers/`                                     |
| `abstract`   | no       | shown in its own "Abstract" section on the item page                                     |
| `thumbnail`  | no       | small image (URL or `/papers/thumbs/<file>`) shown next to the entry in lists and on the item page — opt-in, most entries render text-only without one |

**`venue` format matters** — the four "Cite this" formats are parsed out of it:

- Articles/case-notes: `"JOURNAL YEAR, PAGE"` or `"JOURNAL (issue) YEAR, PAGE–PAGE"`, e.g. `"ZGE (4) 2025, 471–499"`.
- Chapters: `"in: Editors (Hrsg.), Book Title, Publisher, Place YEAR"`, e.g.
  `"in: Golla/Brodowski (Hrsg.), IT-Sicherheitsforschung und IT-Strafrecht, Mohr Siebeck, Tübingen 2023"`.
- Everything else (monographs, working papers, blog): free text, used as-is.

If a citation looks wrong, check `venue` first — the generators (`src/lib/citations.ts`) expect these shapes. Each
entry's page also gets a preview image automatically (a typographic card generated from the title, the same way
Open Graph cards are) — that's what's used for social-media link previews; `thumbnail` is separate and only affects
what's shown on the site itself.

**Areas vocabulary**: `copyright`, `ai`, `it-security-law`, `unfair-competition-law`, `antitrust`,
`law-and-society`, `transnational-law`, `culture-and-law`, `societal-constitutionalism`.

## `/now` — `src/content/now/*.md`

A kottke-style stream, not a single status page. One file per entry (any filename — `date` in the frontmatter
drives the order, newest first); `src/lib/stream.ts` merges everything below into one feed shown on `/now` (in
full) and the homepage (latest 5).

| Field    | Required                | Notes                                                                      |
| -------- | ------------------------ | --------------------------------------------------------------------------------- |
| `type`   | yes                       | `note` \| `link` \| `youtube`                                            |
| `date`   | yes                       | `YYYY-MM-DD`                                                              |
| `title`  | for `link`/`youtube`     | shown as the entry's heading, links out to `url`                          |
| `url`    | for `link`/`youtube`     | the external URL                                                          |
| `source` | no                        | short attribution shown next to a `link` entry, e.g. `"via Verfassungsblog"` |

Body is plain Markdown — a short comment/commentary under the title.

- `type: note` — a short freeform update, no `url` needed. This is what used to be the whole `/now` page ("what
  I'm working on right now").
- `type: link` — kottke-style: a link to something elsewhere plus your comment on it.
- `type: youtube` — a video link; the thumbnail is pulled automatically from the URL (`src/lib/youtube.ts`), nothing
  to upload.

Two more "post types" show up in the same stream automatically, with **no file to create**:

- Blog posts — every published post in `src/content/blog/` appears in the stream by its `date`.
- Bluesky posts — the latest posts from `@rost.am` are fetched live at build time (`src/lib/bluesky.ts`, public API,
  no auth). If the fetch fails (offline build, API hiccup) they're silently omitted rather than breaking the build.

"Last updated" on `/now` and the homepage is just the date of the newest item across the whole merged stream — no
frontmatter field to remember to bump anymore.

## Legal pages

`src/pages/datenschutz.astro` isn't data-driven — edit the `.astro` file directly. Personal details are marked
`LOREM/TODO` inline.
