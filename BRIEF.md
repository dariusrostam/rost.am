# Personal academic website — build brief

> Put this file and `publications.yaml` in an empty repo, then start Claude Code and say:
> *"Read BRIEF.md and build this. Give me your plan first."*

---

## Who this is for

Dr. Darius Rostam, LL.M. (NYU) — postdoc at the University of Bonn (Chair of Prof. Dr. Benjamin Raue) and Executive Director of the Center for Transnational IP, Media and Technology Law and Policy (Bucerius IP Center) at Bucerius Law School, Hamburg. Research: private law and law and technology, especially copyright and AI. Publishes in German and English.

Replaces a Notion site. It should read as the site of a serious scholar who is fluent with technology: clean, fast, text-first, no template smell, nothing that looks like a startup landing page.

**Read this whole brief, then give me a plan and ask any blocking questions before writing code.** Don't ask about things answered here.

## Stack

- **Astro**, MDX, static output, TypeScript.
- No React/Vue/Svelte. Small vanilla-JS islands only where genuinely needed.
- Plain modern CSS — custom properties, `@layer`, container queries. No Tailwind, no CSS framework.
- Content in Markdown/MDX + YAML data files, edited in git. No CMS, no database.
- **Deployment: GitHub Pages, custom domain, DNS and CDN on Cloudflare.** See the deployment section — there are real pitfalls.
- No trackers, no third-party requests at runtime, no cookie banner because there is nothing to consent to.

## Performance — this is a hard requirement

Budget per page: **≤ 15 KB CSS, ≤ 15 KB JS, ≤ 60 KB HTML**, and **zero blocking third-party requests**.

- Inline critical CSS in `<head>`; load the rest async.
- Self-host fonts as subset `woff2`, `font-display: swap`, `<link rel="preload">` for the two faces actually used above the fold. Latin + Latin Extended only (German needs ä/ö/ü/ß; § and – must be in the subset).
- **Speculation Rules API** to prerender same-origin links on hover/viewport, with a `moderate` eagerness. Navigation should feel instantaneous.
- No layout shift. Reserve space for everything, including margin notes.
- Ship no JS at all on pages that don't need it. Filters and margin-note positioning are the only real JS on the site.
- Images: AVIF with WebP fallback, explicit dimensions, lazy below the fold.
- Verify with Lighthouse **and** a throttled 3G run. Target: LCP < 1.2s cold on Slow 4G, CLS 0.

## Site structure

```
/                    Home — short bio, current focus, recent work, socials, newsletter
/research            Filterable publication list
/research/[slug]     Publication page (abstract, links, Cite this)
/writing             Blog index (native posts + pieces published elsewhere)
/writing/[slug]      Post with margin notes
/talks               Talks & teaching
/reading             Reading list — its own top-level section, not part of /writing
/uses                Software & tech
/now                 What I'm working on right now
/about               Longer CV-style bio
/impressum
/datenschutz
/rss.xml
404                  See "The 404 page" — this one is special
```

---

## 1. Publications

Data: **`publications.yaml`** — already written, in this repo, migrated from Notion. Read it; the schema is defined by its contents. Adding a paper must stay a single edit to that one file.

Facets in use:

- `type`: monograph, edited-volume, article, chapter, case-note, blog, working-paper
- `areas`: copyright, ai, it-security-law, unfair-competition-law, antitrust, law-and-society, transnational-law, culture-and-law, societal-constitutionalism
- also present: `language` (de/en), `openAccess`, `year`, `venue`, `doi`, `ssrn`, `url`, `pdf`, `authors`, `editorRole`

Requirements:

- Filter by **area** and **type**; free-text box matching title, venue and co-authors. AND across facets, OR within a facet.
- Filter chips, not dropdowns. Live counts. One "clear all".
- **Filter state in the URL query string** (`?area=copyright&type=case-note`), back button works, filtered views are linkable.
- Every publication is in the HTML on first load and filtering only shows/hides — works without JS, fully indexable.
- Grouped by year, newest first. Badges for type, language and open access. Links to PDF / DOI / SSRN / publisher.
- Co-authored entries display co-authors; `editorRole: true` renders "(Hrsg.)".
- Two entries share the title *Handlungslasten des Urhebers* (monograph and ZGE article). The UI must make the difference obvious at a glance.

### 1a. "Cite this"

On every `/research/[slug]` page, a citation block with **copy-to-clipboard** buttons for:

- **BibTeX** (correct entry types: `@book`, `@article`, `@incollection`, `@unpublished` for working papers)
- **RIS**
- A **formatted German legal citation** in the style used in footnotes, e.g. `Rostam, ZGE 2025, 471 (473)` with an empty pinpoint the reader fills in, and for chapters `Rostam, in: Golla/Brodowski (Hrsg.), IT-Sicherheitsforschung und IT-Strafrecht, 2023, S. …`
- A **plain English citation** for the international pieces.

All four generated at build time from the YAML — never hand-maintained. A "Download all as BibTeX" button on `/research` produces one `.bib` for the whole list.

### 1b. Zotero and Google Scholar capture

Every `/research/[slug]` page emits Highwire Press meta tags so the Zotero connector and Google Scholar ingest it in one click:

`citation_title`, `citation_author` (repeated, one tag per author), `citation_publication_date`, `citation_journal_title` or `citation_inbook_title`, `citation_firstpage`, `citation_doi`, `citation_pdf_url`, `citation_language`, `citation_abstract_html_url`.

Also JSON-LD: `Person` on the home page (with `sameAs` for LinkedIn, SSRN, Bluesky, ORCID), `ScholarlyArticle` / `Book` on publication pages. **Test the result against the real Zotero browser connector before calling this done.**

PDFs live at `/public/papers/<slug>.pdf` and must be linked from `citation_pdf_url` so Scholar indexes the full text.

## 2. Blog with margin notes

The most important build detail. Footnotes appear **in the right margin, aligned to the line that references them** — Tufte-style, not collected at the bottom.

- I write plain Markdown with standard footnote syntax (`[^1]` … `[^1]: text`). No custom components to learn. A remark/rehype plugin transforms GFM footnotes into margin notes at build time.
- Layout: main text column + narrower right margin column. Note sits at its reference point.
- **Collision handling is essential.** Overlapping notes push down and stack with a small gap. Recompute after fonts load and on resize via `ResizeObserver`. It must never visibly jump.
- Numbering preserved; the in-text marker is a subtle superscript link. Hover or focus highlights the matching note in both directions.
- Footnote text supports links, italics, and nested citations.
- **Below ~1100px:** margin column disappears; tapping the superscript expands the note inline beneath the paragraph, tapping again collapses. Never a jump to the bottom of the page.
- `<Aside>` MDX component for content I explicitly want in the margin (figures, side remarks).
- Print stylesheet turns margin notes into proper bottom-of-page footnotes.
- Frontmatter: title, date, updated, tags, language (de/en), draft, description, and **`canonical`** — see below.
- Build two sample posts, one with densely clustered footnotes to prove the collision logic.

### 2a. Cross-posts

Most of my writing appears first on other blogs (Verfassungsblog, Kluwer Copyright Blog, Legal Tribune Online). `/writing` must list those alongside native posts:

- If `canonical` is set, emit `<link rel="canonical">` pointing outward so I don't compete with the publisher in search.
- Two display modes: **full text hosted here** with a "This appeared first in X" note at the top, or **stub only** — title, date, a two-sentence summary and a "Read at X →" link. Frontmatter flag decides which.
- Existing content to migrate (from Notion):
  - *Targeting the Right Question: What AG Rantos Left Open in Anne Frank Fonds* — 2026-07-02, Kluwer Copyright Blog, full text available, canonical to Kluwer.
  - *If It Looks Like a Duck* — 2025-11-18, Verfassungsblog (Munich Regional Court, GEMA v OpenAI), tags AI + Copyright.
  - *Machine-Readable Opt-Outs in Kneschke vs LAION* — 2024-12-28, native post.

### 2b. Shareable highlights

Select text in a post → a small floating control appears offering "Copy link to selection". It builds a URL with a **text fragment** (`#:~:text=…`), correctly encoded, with a prefix/suffix for disambiguation when the passage isn't unique. On load, the browser scrolls and highlights natively; style `::target-text` to match the site. Falls back silently where unsupported. Must not interfere with normal copying, and must not appear on touch-drag scrolling.

## 3. Talks & teaching (`/talks`)

Driven by `talks.yaml`. Fields: title, event, institution, place, date, type (talk / panel / lecture / workshop / conference-organisation), language, optional slides PDF, optional link, optional one-line note. Grouped by year, newest first. A separate short "Teaching" block below: course title, institution, term, level.

Leave the file with two clearly-marked placeholder entries — I'll fill it in.

## 4. Reading list (`/reading`) — its own section

Not a blog category, not part of `/writing`. An annotated bibliography of things worth reading in my fields, driven by `reading.yaml`.

Fields: title, author(s), year, link, area tags (same vocabulary as publications), a one-to-three-sentence annotation in my voice on why it matters, optional `type` (book / article / report / case / other), optional `added` date. Grouped by area with a filter row reusing the publications filter component. Newest additions marked. Include an RSS feed for the section so people can follow additions.

## 5. Now (`/now`)

A single Markdown file. Current projects, what I'm writing, what I'm reading toward, where I'll be speaking next. Shows a "last updated" date prominently — if it's stale it should look stale. Link to it from the home page and footer.

## 6. Newsletter — Buttondown

- Box on the home page, at the foot of every post, on `/writing` and on `/reading`.
- Posts to `https://buttondown.com/api/emails/embed-subscribe/USERNAME`, username in one config constant. Hidden honeypot field, `tag` support.
- Works as a plain form without JS; with JS it submits via `fetch` and shows an inline result without leaving the page.
- One line of copy: what it is, roughly how often, link to `/datenschutz`. No growth-hack language.
- Leave a `TODO` and a README note: **double opt-in must be switched on in Buttondown** (German law).

## 7. Uses (`/uses`)

`uses.yaml`, grouped: Writing & research, Legal research, Dev & automation, Hardware, Reading & notes. Each item: name, optional URL, one-line reason. Optional "recently added / recently dropped" marker.

## 8. Socials

LinkedIn `https://www.linkedin.com/in/dariusrostam/`, SSRN `https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=3680881`, Bluesky `https://bsky.app/profile/rost.am`, plus email and RSS. Defined once in `src/config.ts`. Inline SVG icons, no icon library, proper `aria-label`s, `rel="me"` on Bluesky.

---

## The 404 page — build this carefully

The 404 page is rendered as a **judgment of the Court of Justice of the European Union**, imitating the HTML of a real InfoCuria / EUR-Lex judgment as closely as possible. It is the only playful thing on the site, and it works because it is straight-faced. **No winking, no emoji, no "oops!" — commit to the bit completely.**

Match the real formatting:

- Serif throughout (Times-like), narrow measure, justified body, small type, generous space between numbered paragraphs, the whole thing visually distinct from the rest of the site.
- Header, centred and in caps: `JUDGMENT OF THE COURT (Grand Chamber)` followed by the current date rendered long-form (`23 August 2026`).
- Beneath it, the italic keyword line in parentheses, em-dash separated, as EUR-Lex does:
  `(Reference for a preliminary ruling — Hypertext Transfer Protocol — Status code 404 — Resource not found — Whether a uniform resource locator confers a right of access — Legitimate expectations)`
- `In Case C‑404/26,`
- The standard reference formula: `REQUEST for a preliminary ruling under Article 267 TFEU from the browser of the applicant, made by decision of …, received at the Court on …, in the proceedings`
- Parties, centred: `Darius Rostam` v `The Requested URL`
- `THE COURT (Grand Chamber),` composed of a bench, an Advocate General and a Registrar — invent plausible, obviously fictional names; **do not use the names of real judges or Advocates General.**
- `having regard to the written procedure,` / `after hearing the Opinion of the Advocate General at the sitting on …,` / `gives the following` / *Judgment* in italics.
- Numbered paragraphs starting at 1, with the real section headings: **Legal context**, **The dispute in the main proceedings and the question referred for a preliminary ruling**, **Consideration of the question referred**, **Costs**. Roughly 10–14 paragraphs. The reasoning should soberly establish that the requested resource does not exist, that the applicant's expectation was nonetheless legitimate, and that the appropriate remedy is navigation.
- The operative part: `On those grounds, the Court (Grand Chamber) hereby rules:` followed by an indented numbered ruling that, in the dry register of an operative part, tells the reader the page does not exist and directs them home.
- `[Signatures]` and the footnote line `*      Language of the case: German.` in small type.
- Links back to the home page and `/research` styled as ordinary judgment citations, so they read as part of the document.

Requirements: fully static, **zero JavaScript**, accessible (real headings, correct landmarks, the numbered paragraphs as an ordered list so a screen reader gets it), readable on mobile, and the correct HTTP status where the host allows it. Add a note in the README explaining that GitHub Pages serves `404.html` automatically for unmatched paths.

Everything else on the site stays serious. This is the whole joke and it should be the only one.

---

## Design direction

- **Simple, modern, text-first** — a well-set book page with a technologist's restraint.
- Body in a good serif with a variable weight axis; sans-serif for UI, labels and metadata. Self-hosted, subset. Propose 2–3 pairings, implement one, I'll say if I want to swap.
- Measure 62–70 characters on the main column.
- One restrained accent colour for links and active chips. Otherwise near-black on warm off-white.
- Dark mode via `prefers-color-scheme` plus a manual toggle that remembers.
- Real typography: en/em dashes, German quotation marks „…" in German content, non-breaking space between `§` and its number and between `Rn.`/`S.` and the number, hanging punctuation.
- Almost no motion. Subtle hover/filter transitions only. Respect `prefers-reduced-motion`.
- Mobile: single column, comfortable tap targets, no horizontal scroll, header collapses to a plain row of links — no hamburger, there are few pages.

## Language

Content is mixed German and English. **Do not build full i18n.** Each publication, post, talk and reading entry carries a `language` field, shown as a small badge, and sets `lang` correctly on its own element so hyphenation and screen readers behave. Site chrome is English. (Tell me if you think this is the wrong call before building it.)

## Deployment — GitHub Pages behind Cloudflare

- GitHub Actions workflow building Astro and deploying to Pages. Include `.nojekyll` and a `CNAME` file.
- `site` in `astro.config.mjs` set to the production domain so canonical URLs, sitemap and RSS are absolute and correct.
- **Certificate ordering matters.** Document this in the README as an ordered checklist: point DNS at GitHub Pages with the Cloudflare proxy **off** (grey cloud) → set the custom domain in the repo's Pages settings → wait for GitHub to issue the certificate and for "Enforce HTTPS" to become available → *then* turn the proxy on (orange cloud). Turning the proxy on first is the classic failure and produces a redirect loop.
- Cloudflare SSL/TLS mode must be **Full**, never Flexible.
- Apex domain: A/AAAA records to GitHub's Pages IPs, plus `www` as CNAME (or the reverse — document whichever you configure).
- Cloudflare rules: Brotli on, Auto Minify off (Astro already minifies, and it breaks hashed assets), a cache rule giving hashed `/_astro/*` assets a long TTL and HTML a short one. Add security headers (`Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, a tight `Content-Security-Policy`) via a Cloudflare Transform Rule, since GitHub Pages can't set headers itself. Document the exact rules in the README.
- Include a `make preview` / `npm run preview` path that serves the built output so I can check the 404 behaves.

## Quality bar

- Semantic HTML, correct heading order, keyboard-operable filters and footnote toggles, visible focus rings, WCAG AA contrast in both themes.
- Lighthouse 100 across the board on a blog post page and on `/research`.
- Open Graph and Twitter meta everywhere, with **build-time generated OG images** — simple typographic cards from the page title, no external service.
- `sitemap.xml`, sensible `robots.txt`, canonical URLs, RSS for `/writing` and `/reading`.
- Sensible `<title>` and meta description per page, German where the content is German.

## Content migration

Publications are done — `publications.yaml` is in the repo. For everything else I'll export the Notion pages to Markdown and drop them in `/content-import`; **ask me for it before you start on content.** Don't invent bio text, talk entries or reading-list items. Use clearly-marked `LOREM` placeholders while building, all in one place so they're easy to find and replace.

Facts you can rely on: name and title as above; Bonn (Prof. Dr. Benjamin Raue's chair) and Bucerius IP Center; research areas as described; the three blog posts listed in §2a; the social links in §8.

## How I want you to work

1. Plan first — file structure, the margin-note plugin approach, the citation-generation approach, and any questions. Wait for my go-ahead.
2. Build in this order: scaffold and design system → blog + margin notes → publications, filters and Cite this → home/about/now/uses → talks and reading → newsletter → **404 judgment** → legal pages → performance pass.
3. Small, reviewable commits with clear messages at each milestone.
4. Write `README.md` **for me, not for developers**: how to add a paper, a post (including footnote syntax), a talk, a reading entry, a `/uses` item; how to update `/now`; how to run locally; how to deploy; the Cloudflare checklist. Assume I know git basics and nothing about Astro.
5. Add `CONTENT.md` — one page of frontmatter and YAML field reference.
6. After each milestone, tell me what to look at and which decisions you made that I might want to overturn.
