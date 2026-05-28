---
id: 0022
title: Emit lastmod timestamps in sitemap.xml so Google prioritizes recrawl of fresh routes
status: groomed
priority: P2
area: seo
created: 2026-05-28
owner: gtm-innovation
---

## User story

As the site's SEO surface, I want every URL in `public/sitemap.xml` to
carry a real `<lastmod>` timestamp sourced from the underlying file's git
history, so that Google's crawler stops treating every page as equally
stale and refreshes the index for recently-changed routes (new blog
posts, freshly-added long-tail landing pages, edited compare pages) on
its next visit instead of waiting for the slow generic recrawl.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the sitemap generator already
exists at `scripts/generate-sitemap.ts` and already emits `<changefreq>`
and `<priority>` per URL (lines 83 to 88). It writes `public/sitemap.xml`
on build via the existing `npm run build` chain. Adding one `<lastmod>`
child per URL, sourced from `git log -1 --format=%cs` on the underlying
file, is a script-only edit (no React, no demos, no copy). The output
sitemap goes from descriptor-of-shape to descriptor-of-freshness with no
behavior change anywhere else.

### Stakeholder

This deepens the SEO moat in a way competitors with hand-maintained
sitemaps cannot match. Google explicitly uses `<lastmod>` as a recrawl
priority signal when it is accurate (Google's docs and John Mueller have
said repeatedly that a sitemap with stale or always-current `<lastmod>`
gets devalued, but an accurate one shortens recrawl latency). The site
ships new tickets weekly (ticket 0017 shipped 2026-05-26, 0019 shipped
2026-05-27); without `<lastmod>`, those new pages can wait weeks for
Google to notice. With `<lastmod>` driven by git, every new page lands
with an accurate "edited today" signal automatically.

### Visitor (in the real moment of use)

Indirect for the on-page visitor; the win is the visitor who finds the
page sooner via Google because Google recrawled it faster. The four-lens
visitor check here is: a search-time visitor lands on a fresher page
(e.g. the new HVAC landing page from ticket 0020) days or weeks earlier
than they otherwise would, because Google saw the `<lastmod>` ping and
prioritized the recrawl. No on-page behavior change.

### Growth

The "show me" moment is the Google Search Console "Last crawled" date on
a new long-tail page dropping from weeks-old to days-old after the
sitemap upgrade ships. That latency reduction compounds: every future
landing page (0020 HVAC, 0021 Jobber compare, future trade pages) starts
ranking sooner, and every blog post is indexed within Google's normal
fresh-crawl window instead of waiting for the periodic site-wide sweep.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] Every `<url>` block in the generated `public/sitemap.xml` contains exactly one `<lastmod>` child whose value is a valid `YYYY-MM-DD` date (or a full ISO-8601 datetime), placed before `<changefreq>` and `<priority>` per the sitemap.org element order. The CTO subdomain entry also carries a `<lastmod>`.
- [ ] The `<lastmod>` for a route maps to the most recent commit date that touched the underlying source file (`src/App.tsx` for the route registration OR the page file like `src/pages/AiForPlumbers.tsx`, whichever is more recent). For blog posts, `<lastmod>` maps to the most recent commit that touched `src/data/blogPosts.ts`. For class sessions, `<lastmod>` maps to the most recent commit that touched `api/_classes.json`. A test fixture asserts the resolver returns the expected `git log -1 --format=%cs -- <file>` value for at least three known files.
- [ ] If `git log` returns no commits for a file (e.g. running outside a git checkout in CI build cache), the generator falls back to the current date (`new Date().toISOString().split('T')[0]`) and logs a single warning line per missing file so a future CI failure is debuggable. The generator does NOT throw; the sitemap is still emitted.
- [ ] The generator's existing console summary line still prints the same URL count breakdown (`{n} routes + {m} blog posts + {k} class sessions x 2 + 1 subdomain`); the only new output is the per-file warning line(s) when git data is missing.
- [ ] Running `npm run build` (or whatever script in `package.json` invokes the sitemap generator today) produces a `public/sitemap.xml` that parses as valid XML (e.g. via Node's `DOMParser` or a regex-validated structure check) and validates against the sitemap.org schema for `<lastmod>` format. The existing `check-links` and `check-meta` scripts stay green.
- [ ] No new hostnames, no `/api/` change, no new npm dependency added to `package.json` (use Node's built-in `child_process.execSync('git log ...')` rather than a git library). Per the Hard NO list in `AGENTS.md`, the GTM queue does not touch `package.json` / `package-lock.json`.

## Out of scope

- A separate XML sitemap index file (`sitemapindex` with multiple
  `<sitemap>` children). The site fits comfortably under the 50k-URL
  per-file limit; splitting is unnecessary churn.
- An image sitemap (`<image:image>` children) or a video sitemap
  (`<video:video>` children); each is its own ticket if it earns the
  work. The 200-line budget here fits `<lastmod>` only.
- Hreflang or alternate-locale entries; the site is en-US only today.
- Surfacing `<lastmod>` data anywhere else on the site (e.g. a "Last
  updated" badge on long-tail landing pages). That is its own UX ticket.
- Auto-regenerating the sitemap on a cron or rebuild trigger beyond the
  existing `npm run build` invocation. Vercel rebuilds on every push to
  `main`, which is sufficient.
- Pre-computing or caching the `git log` lookups. The generator runs
  ~100 files; sequential `execSync` is fine and keeps the script simple.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- `scripts/generate-sitemap.ts` - the only file changed beyond the test.
  Add a helper `function getLastmod(absolutePath: string): string` that
  shells out to `child_process.execSync('git log -1 --format=%cs -- ' + path, { encoding: 'utf-8' }).trim()`,
  returns the result if non-empty, otherwise returns
  `new Date().toISOString().split('T')[0]` after a `console.warn`.
- Map a route path to its source file with a small explicit table:
  static routes resolve to `src/pages/<PageName>.tsx` by inspecting the
  `import ... from "./pages/..."` lines already at the top of
  `src/App.tsx`; blog post paths resolve to `src/data/blogPosts.ts`;
  class session paths resolve to `api/_classes.json`; the root `/` and
  CTO subdomain resolve to `src/pages/Index.tsx` and
  `src/pages/IndexV2.tsx` respectively. If the mapping is ambiguous (a
  route reuses a shared component like `LeadResponder.tsx` across 12
  verticals), fall back to the most recent commit date of `src/App.tsx`
  (which is touched whenever a route is added or moved).
- Update the `<url>` template in `generateSitemap()` to interpolate
  `<lastmod>${lastmod}</lastmod>` BEFORE the existing
  `<changefreq>` line, matching sitemap.org's required element order
  (`loc`, `lastmod`, `changefreq`, `priority`).
- `tests/unit/generate-sitemap.spec.ts` (new) - one spec per acceptance
  box: assert the `getLastmod` helper returns a `YYYY-MM-DD` string for a
  known checked-in file (e.g. `src/pages/AiForPlumbers.tsx`, which
  shipped 2026-05-26 per the ARCHIVE), returns today's date for a
  nonexistent path after a warn, and assert the generated sitemap string
  contains `<lastmod>` for at least three known URLs. Tests use Vitest;
  see the existing test setup file pattern.
- Per the 2026-05-22 two-PR lesson, ship will need a follow-up
  `chore/0022-ship-status` PR after the feat PR merges to flip the
  ticket frontmatter + README index row to `shipped` together. Do not
  skip the second PR.
- New deps: no (use Node's built-in `child_process.execSync`). Schema
  migration: no. Privacy/security surface change: no (output is already
  public; the change is adding a date to existing public URLs).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0022-...` opened
- YYYY-MM-DD - failing test added in `tests/unit/generate-sitemap.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
