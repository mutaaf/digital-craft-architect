---
id: 0091
title: Persist the visitor's read blog posts and surface an "Articles you've read" card on /my dashboard
status: groomed
priority: P1
area: demos
created: 2026-09-22
owner: gtm-innovation
---

## User story

As a returning prospect who is
actively reading Digital Craft's
long-form content while
evaluating whether to book a
strategy call (a construction GC
who opened
`/blog/ai-lead-response-for-
contractors` last Tuesday from a
LinkedIn share, a real-estate
broker who bounced between three
posts about voice AI on Sunday
evening from a Google search, a
property-manager CTO who
bookmarked
`/blog/ai-solar-installers-
permit-interconnection-followup`
in a private Slack channel and
returned to it Monday morning), I
want the blog posts I have
opened to persist in my browser
and surface as one saved card on
the `/my` dashboard when I come
back, so that I can reopen the
exact article I was reading
without re-searching my history,
without any email capture, any
push notification, or any new
account, and so that my
qualification signal (the
articles I chose to invest time
in) is visible to me on my
personal dashboard as a
reflection of the topics I care
about.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of
value: blog-post read tracking
is a NEW retention artifact
type that does NOT exist today.
Every other high-intent
artifact on the site persists
to localStorage and surfaces on
`/my`: the estimate calculator
persists via
`dca_last_estimate_v1_<vertical>`
(ticket 0014's
`src/pages/construction/lastEstimateStore.ts`);
the ROI calculator persists
via `dca_last_roi_result_v1`
(ticket 0062's
`src/utils/roiResultStore.ts`);
demo visits persist via
`dca_recent_demos_v1` (ticket
0026's
`src/utils/recentDemosStore.ts`);
compare-page visits persist via
`dca_recent_compares_v1`
(ticket 0074's
`src/utils/recentComparesStore.ts`);
quiz completions persist via
`dca_quiz_history_v1` (ticket
0076); the visit-streak count
persists via `dca_visit_days_v1`
(ticket 0060). Blog-post reads
are the ONLY high-intent
content-consumption surface
family with no persistent-store
equivalent, even though a
visitor who taps into
`/blog/<slug>` has self-selected
as a content-qualified prospect
who chose to spend 3 to 8
minutes reading long-form
material about their specific
vertical pain (the 46 blog
posts shipped as of 2026-09-22
span construction, real-estate,
solar, window-installer,
plumber, and other vertical
long-form pieces). This ticket
adds the missing store
(`src/utils/recentBlogPostsStore.ts`,
mirroring the allow-list-
validated shape of
`recentComparesStore.ts` from
ticket 0074), wires a one-line
`recordBlogPostRead` call into
`src/pages/BlogPost.tsx` (ONE
additive `useEffect` at the
top of the component that
fires once per slug view), and
renders one new card on `/my`
that shows the read posts with
quick-return links plus one
"you might also read" sibling
chip pointing at an unread
entry from
`src/data/blogPosts.ts`. One
new util, one additive edit to
`src/pages/BlogPost.tsx`, one
additive edit to
`src/pages/MyDashboard.tsx`,
one additive entry in
`src/data/demoDisclosures.ts`
under `NEW_PERSISTENT_STORES`,
zero new backend, zero new
dependency.

### Stakeholder

This widens the moat in the
retention dimension that the
ticket 0045 dashboard opened
and that tickets 0062 (ROI),
0066 (printable recap), 0074
(compares), 0076 (quiz
history), 0082 (dossier export)
extended, but that has NOT
been extended to the blog-post
family. The `/my` dashboard
already surfaces seven sibling
persistent artifacts (estimate,
recent demos, quiz persona,
quiz history sparkline, ROI,
recent compares, printable
summary); the blog-post family
is the missing eighth. A
visitor who read three blog
posts about voice AI last week
is materially further down the
funnel than a visitor who
tried one demo, and surfacing
the read-post recap on `/my`
is the single cheapest
retention lever that closes
the "which article was I
reading again" loop for a
returning content-qualified
prospect. The
`recentBlogPostsStore.ts`
module also unlocks a "you
read X, here's Y on a related
topic" sibling nudge that
the `/blog` index (ticket
0079) cannot personalize
because the index renders
every post equally by date;
the `/my` dashboard is the
correct surface for a
personalized suggestion
because it already knows the
visitor's history. Per the
ticket 0074 recentComparesStore
precedent, the new store uses
an ALLOW-LIST derived from
`blogPosts.map(p => p.slug)`
in `src/data/blogPosts.ts` so
a renamed or removed post
cannot strand a dead recap
link, mirroring the
`recentComparesStore` `path`
allow-list from
`COMPARE_ENTRIES`. The new
localStorage key
(`dca_recent_blog_posts_v1`)
is added to the
`NEW_PERSISTENT_STORES`
constant in
`src/data/demoDisclosures.ts`
and the `/trust` data-
handling disclosure list in
the same PR per the ticket
0018 / 0033 / 0045 / 0060 /
0062 / 0074 / 0076 honesty
rule that every persistent
store appears in the
disclosure.

### User (in the real moment of use)

A construction GC who tapped
`/blog/ai-lead-response-for-
contractors` on Sunday
evening from a LinkedIn share,
then
`/blog/ai-solar-installers-
permit-interconnection-
followup` on Monday morning
from an email thread with his
solar-installer subcontractor,
opens `/my` Tuesday morning
to pick up where he left off.
Above the existing saved-
compare card, saved-estimate
card, saved-ROI card, and
recent-demos card, one new
"Articles you've read" card
renders with two small rows:
one for each post title, each
with the vertical tag, the
"read 2 days ago" timestamp,
and a "Reopen article" button
that routes to
`/blog/<slug>`. Below the two
rows, one small "You might
also read <title>" chip
routes to an unread entry
from `blogPosts` (the entry
chosen deterministically by
same-vertical-tag preference;
the exact heuristic is
documented in the store). On
a first-time visitor with no
read history, the card is
hidden entirely (no empty
state, no nag), so the first-
time experience is identical
to today. Light and dark mode
supported; the card reads
cleanly on a 375px viewport.

### Growth

The "show me" moment is the
screenshot a salesperson can
paste into a follow-up email:
"Open digitalcraftai.com/my
and you will see the three
articles you read last week
at the top, plus one article
we recommend based on your
reading pattern." That
implicit "we remembered plus
we noticed you skipped one"
signal is the same retention
lever tickets 0014, 0026,
0045, 0062, 0074, 0076
proved for other artifacts,
lifted to the highest-intent
content-consumption family
the site has. It also
creates a measurable
retention KPI: clicks on the
"Reopen article" and "Read
next" buttons fire as
distinct `trackCTAClick`
events (`my_blog_reopen`
and `my_blog_suggest`) so
returning-visit content-
consumption depth is
measurable in GA. Per the
ticket 0062 dashboard-card
precedent, the card is filed
on `/my` NOT on `/blog`
because retention surfaces
belong on the personalized
dashboard, not on crawler-
facing hubs.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new client-side store at `src/utils/recentBlogPostsStore.ts` (new file, under 180 lines) exports `recordBlogPostRead(slug: string, title: string, tags: readonly string[]): void`, `getRecentBlogPosts(): RecentBlogPost[]`, `suggestNextBlogPost(): BlogPost | null`, and `clearRecentBlogPosts(): void`. The store persists at most 5 entries (most recent first) under the localStorage key `dca_recent_blog_posts_v1`, deduplicates by `slug` (a re-visit moves the entry to the front, does not append a duplicate), is parse-safe (a malformed value returns `[]` without throwing), and is bounded so a quota-exceeded write silently no-ops per the ticket 0074 `recentComparesStore.ts` convention. The `RecentBlogPost` shape is `{ slug: string; title: string; tags: readonly string[]; readAt: number }`. The slug allow-list is derived at module load time from `blogPosts.map(p => p.slug)` (imported from `src/data/blogPosts.ts`); a `recordBlogPostRead` call with a slug outside the allow-list is a no-op, mirroring the ticket 0074 `path` allow-list invariant. Entries whose slug is no longer in the allow-list are filtered at read time so a renamed post cannot strand a dead recap link. Per the 2026-09-10 raw-vs-sliced lesson, keep a private `readAllVisited()` helper that returns the full validated list; expose `getRecentBlogPosts()` as `readAllVisited().slice(0, MAX_ENTRIES)` for display; have `suggestNextBlogPost()` read `readAllVisited()` directly so the "every entry has been read" case truly returns `null` when the visitor's full history covers every blog post.
- [ ] `suggestNextBlogPost(): BlogPost | null` returns an entry from `blogPosts` whose `slug` is NOT present in the visitor's full read history (the raw list, per the 2026-09-10 lesson). The suggestion prefers a post that SHARES at least one tag with the most-recently-read post (a same-vertical follow-up nudge); when no same-tag unread post exists, the function falls back to the FIRST unread entry in `blogPosts` array order. When every post has been read the function returns `null`. When no post has been read (empty history) it returns `null` (the suggestion chip is only shown to visitors who have already read at least one post, so a first-time visitor sees nothing). The function is deterministic and pure per the ticket 0074 `suggestNextCompare` shape.
- [ ] `src/pages/BlogPost.tsx` gains ONE new `useEffect` at the top of its component body that calls `recordBlogPostRead(post.slug, post.title, post.tags)` on mount when `post` is defined, where `post` is the existing local variable already computed from `getBlogPost(slug)`. The `useEffect` dependency array is `[post?.slug]` so a navigation between two blog posts (SPA route change on the same `BlogPost` component) records both reads. The `useEffect` is a no-op when `post` is undefined (the `<Navigate to="/blog" replace />` return path). This is one additive edit that does not otherwise touch the render tree.
- [ ] `src/pages/MyDashboard.tsx` gains ONE new card component (`RecentBlogPostsCard`, inline or under `src/components/`) that renders ABOVE the existing saved-estimate / saved-ROI / recent-demos cards when `getRecentBlogPosts().length > 0`. The card renders (a) an H2 heading "Articles you've read", (b) one row per stored entry with the post title, a vertical-tag chip (the first tag from the entry's `tags` array), a relative-time chip (e.g. "read 2 days ago" computed client-side, no fabricated dates), and a `<Link to={`/blog/${entry.slug}`}>` "Reopen article" button firing `trackCTAClick('my_blog_reopen', 'my_dashboard')`, (c) one "You might also read <title>" chip below the rows ONLY when `suggestNextBlogPost()` returns a non-null entry, routing to that entry's `/blog/<slug>` and firing `trackCTAClick('my_blog_suggest', 'my_dashboard')`. On a visitor with zero stored entries the entire card is null (no empty state, no nag). Per the ticket 0074 vertical-order precedent the card renders in the top-of-dashboard retention cluster near the RecentComparesCard, above the estimate / demos / quiz cards.
- [ ] The `dca_recent_blog_posts_v1` localStorage key is added to `src/data/demoDisclosures.ts` under the existing `NEW_PERSISTENT_STORES` constant per the ticket 0074 precedent AND (transitively via that constant's render loop on `/trust`) to the persistent-stores list rendered on `src/pages/Trust.tsx` per the ticket 0018 / 0033 / 0045 / 0060 / 0062 / 0074 / 0076 honesty rule. The disclosure text names the key, the shape (slug + title + tags + readAt), and the "client-side only, never leaves your browser" language mirroring the ticket 0076 quiz-history disclosure. The `/trust` render tree passes its existing `tests/e2e/trust-page.spec.ts` after the additive entry.
- [ ] Per the 2026-05-30 second-@type lesson, this ticket adds NO new JSON-LD blocks (the `/my` dashboard already emits BreadcrumbList + WebPage per ticket 0045, and no blog-post JSON-LD changes; `BlogPost.tsx` already emits `BlogPosting` JSON-LD). The pre-code grep for JSON-LD predicate collisions is a no-op, but the implementer records "no new JSON-LD blocks added" in the Implementation log for auditability. The existing `tests/e2e/my-dashboard.spec.ts` (ticket 0045) and `tests/e2e/recent-compares-recap.spec.ts` (ticket 0074) MUST stay green after the additive card insertion; those specs assert the dashboard renders and the existing cards render but do NOT assert "no additional cards on the dashboard," so an additive card is safe.
- [ ] A new e2e spec at `tests/e2e/recent-blog-posts-recap.spec.ts` (modeled on `tests/e2e/recent-compares-recap.spec.ts` from ticket 0074) asserts: (1) with an empty `dca_recent_blog_posts_v1` value, `/my` renders WITHOUT the RecentBlogPostsCard (`page.getByTestId('recent-blog-posts-card').count() === 0`), (2) after `page.evaluate` seeds two entries with valid slugs from `blogPosts`, `/my` renders exactly two `data-testid="recent-blog-post-row"` rows with the post titles visible, (3) each row's "Reopen article" anchor href matches `/blog/<slug>` and the slug is present in the `blogPosts.map(p => p.slug)` allow-list (imported from `src/data/blogPosts.ts` per the 2026-06-07 src-imports-tests lesson), (4) navigating to any two `/blog/<slug>` routes and then to `/my` causes both slugs to appear at positions 1 and 2 of the recap card in reverse-visit order (write-through case; per the 2026-09-10 mount-signal lesson the `gotoPath` helper waits for both the RouteFallback detach AND the `BlogPost` H1 to be visible before navigating away so the `useEffect` write completes), (5) a duplicate visit to the same blog slug does NOT create a second row (dedup case, per the ticket 0074 dedup pattern), (6) a seeded entry whose slug is NOT in `blogPosts` (an invalid slug) is filtered at read time and does NOT render (allow-list case), (7) when at least one entry is stored AND at least one `blogPosts` entry is NOT in the stored list, exactly one `data-testid="blog-suggest-chip"` renders with a valid `/blog/<slug>` href, (8) when every `blogPosts` entry has been seeded into `dca_recent_blog_posts_v1`, the suggest chip is absent (`toHaveCount(0)`) per the 2026-09-10 raw-vs-sliced lesson (the `suggestNextBlogPost` implementation must read the RAW parsed list, not the display-sliced list, so this box actually returns `null` when all 46 slugs are seeded and the visible list is capped at 5), (9) the page text on `/my` contains no `String.fromCharCode(8212)` code point in any RecentBlogPostsCard string, (10) dark mode renders cleanly via `document.documentElement.classList.add('dark')` and the card is still visible, (11) same-tag-suggestion regression case: seed one entry whose `tags` array contains a tag also present on an unread post; assert the suggest chip's href routes to that same-tag unread post, not to a different-tag unread post; when no same-tag unread post exists, the chip href falls back to the first unread post in `blogPosts` array order.
- [ ] Standard box: no `/api/` change, no new hostname (the store is localStorage only, no network), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/data/blogPosts.ts` beyond a possible import (this ticket does NOT append a new blog post). Every string in the new util, the RecentBlogPostsCard, and the disclosure additions is hyphen-only per the 2026-05-07 em-dash Hard NO; Self-Review greps the diff for `String.fromCharCode(8212)`. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the existing `tests/e2e/my-dashboard.spec.ts`, `tests/e2e/recent-compares-recap.spec.ts`, `tests/e2e/recent-demos-recap.spec.ts`, `tests/e2e/trust-page.spec.ts`, and every `tests/e2e/blog-*.spec.ts` (the blog-index and BlogPosting JSON-LD specs) stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- Standard anti-goals: no /api/
  changes, no package.json
  changes, no em-dashes in
  copy, dark-mode required.
- Emitting an email digest of
  read articles. The store is
  client-side only and no
  server-side surface (email,
  webhook, analytics event
  beyond the existing
  `trackCTAClick`) is wired.
  Email retention is its own
  ticket once ticket 0002
  (5-day course opt-in)
  confirms email consent.
- Adding a "Articles you
  haven't read yet" section
  to the `/blog` index itself.
  Retention surfaces belong
  on `/my`, not on crawler-
  facing hubs per the ticket
  0045 / 0062 / 0074
  precedent; the hub renders
  every post equally by date
  as an SEO surface.
- A blog-post-suggestion
  algorithm that reads the
  visitor's quiz persona, ROI
  figure, recent-compare
  history, or estimate
  vertical and blends them.
  The suggestion is
  same-tag-preferred with a
  first-unread fallback,
  matching the deterministic
  simplicity of ticket 0074's
  `suggestNextCompare`. A
  blended suggestion is its
  own follow-up ticket once
  telemetry justifies the
  complexity.
- Displaying the blog-post
  description or the first
  paragraph excerpt on the
  RecentBlogPostsCard. The
  card shows title + tag
  chip + timestamp + reopen
  button only, mirroring
  the ticket 0074 recent-
  compares strip minimalism.
  Adding excerpts would
  balloon the card and
  duplicate the `/blog`
  hub's card shape.
- A "clear read history"
  button visible in the
  RecentBlogPostsCard.
  `clearRecentBlogPosts()`
  is exported for future
  use but no visible UI is
  wired, mirroring the
  ticket 0074 pattern of
  reserving the clear
  function for a later
  general-clear UI ticket.
- Cross-promoting the card
  from the homepage hero,
  `/demos`, `/blog`, or
  any vertical strip.
  Cross-surface promotion
  is its own follow-up
  ticket once telemetry
  shows the card earns
  return-visit engagement.
- A reading-progress
  indicator ("you read 40%
  of this post") persisted
  per slug. Progress
  tracking requires scroll-
  position instrumentation
  on `BlogPost.tsx` and
  extra localStorage
  bytes; the ticket scopes
  to "the visitor opened
  the post" only. A
  reading-progress
  extension is its own
  follow-up ticket.
- A reading-time estimate
  visible on the recap
  card ("you spent 4
  minutes on this
  article"). Reading-time
  requires an
  `unload`/`pagehide`
  timer instrumentation
  that adds an edge case
  for a browser back-nav
  or a tab-close mid-
  scroll; the ticket
  scopes to "opened" only.
- Emitting a `Person` or
  `ProfilePage` JSON-LD
  block on `/my`. The
  dashboard already emits
  WebPage per ticket 0045
  and adding a Person
  block would misrepresent
  the artifact (there is
  no named person). Out
  of scope.
- Persisting the visitor's
  OUTCOME of a read
  (whether they clicked a
  CTA on the blog post,
  whether they shared the
  link). The store
  records opens only; a
  downstream engagement
  store is its own
  ticket.
- Serverside sync of the
  read posts (so a
  visitor sees the same
  recap on a different
  device). The store is
  browser-local per the
  privacy posture of the
  five sibling stores;
  cross-device sync is
  its own major ticket
  and requires a backend
  account surface.
- Fabricated relative-
  time strings ("read 100
  days ago" rendered for
  a 3-day-old entry).
  The relative-time chip
  is computed client-
  side via
  `Date.now() - readAt`
  per standard patterns;
  no display gets a
  fabricated value.
- Editing the shipped
  ticket 0074 recent-
  compares card, ticket
  0060 visit-streak
  badge, ticket 0045
  dashboard layout beyond
  inserting the card, or
  the ticket 0026 recent-
  demos strip. The card
  sits in the top-of-
  dashboard retention
  cluster with no
  reorder of the
  predecessor artifacts.
- Adding the
  RecentBlogPostsCard to
  the `index.html` SEO
  Pilot pages table. The
  `/my` route is not in
  the table per the
  ticket 0045 precedent
  and is not indexable.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/utils/recentBlogPostsStore.ts`
  (under 180 lines). Copy
  the shape of
  `src/utils/recentComparesStore.ts`
  (ticket 0074): parse-safe
  read via `isRecentBlogPost`
  type guard, dedup-by-slug
  append that moves an
  existing entry to the
  front, quota-tolerant
  write. The slug allow-list
  is derived at module load
  time from
  `blogPosts.map(p => p.slug)`
  (imported from
  `../data/blogPosts`) so
  appending a forty-seventh
  post automatically widens
  the allow-list. Export
  `recordBlogPostRead`,
  `getRecentBlogPosts`,
  `suggestNextBlogPost`, and
  `clearRecentBlogPosts`.
  Per the 2026-09-10 raw-vs-
  sliced lesson, keep a
  private `readAllVisited()`
  helper that returns the
  full validated list;
  expose
  `getRecentBlogPosts()` as
  `readAllVisited().slice(0, MAX_ENTRIES)`
  for display; have
  `suggestNextBlogPost()`
  read `readAllVisited()`
  directly so the "every
  post has been read" case
  truly returns `null`.
- `src/pages/BlogPost.tsx`
  gains ONE additive
  `useEffect(() => { if (post) recordBlogPostRead(post.slug, post.title, post.tags); }, [post?.slug]);`
  at the top of the
  component body (after
  the `post = getBlogPost(slug)`
  local computation). The
  dependency array is
  `[post?.slug]` so a
  navigation between two
  blog posts on the same
  component records both
  reads. This is a
  mechanical one-line
  edit; the render tree
  is unchanged.
- `src/pages/MyDashboard.tsx`
  gains one new
  `RecentBlogPostsCard`
  render block (either
  inline or under
  `src/components/RecentBlogPostsCard.tsx`
  to mirror the ticket 0076
  `QuizHistoryCard`
  component pattern). The
  block reads
  `getRecentBlogPosts()`
  once on mount into local
  state (mirroring the
  ticket 0074
  `RecentComparesCard`
  hydration pattern),
  renders a
  `data-testid="recent-blog-posts-card"`
  wrapper when the length
  is > 0, and returns null
  otherwise. Each row is
  `data-testid="recent-blog-post-row"`;
  the suggest chip is
  `data-testid="blog-suggest-chip"`.
  Place the block in the
  top-of-dashboard
  retention cluster
  alongside the ticket 0074
  RecentComparesCard.
- `src/data/demoDisclosures.ts`
  gains one new entry
  describing the
  `dca_recent_blog_posts_v1`
  key: purpose, shape,
  "client-side only, never
  leaves your browser," per
  the ticket 0074
  disclosure convention.
  Append the entry to the
  existing
  `NEW_PERSISTENT_STORES`
  constant so the `/trust`
  render tree
  automatically picks up
  the new row via its
  existing render loop per
  the ticket 0018 / 0033
  mirror-source rule.
- Per the 2026-05-25
  mirror-source rule, if
  the dashboard renders a
  store-key disclosure
  list, that list and the
  `/trust` disclosure MUST
  share the same source.
  Do NOT hand-roll a
  second copy of the
  disclosure string.
- Per the 2026-05-30
  second-@type lesson,
  this ticket adds NO new
  JSON-LD blocks. The
  pre-code grep is a
  no-op; record the no-op
  in the Implementation
  log for auditability.
- Per the 2026-05-07 em-
  dash Hard NO, every
  string in the new util,
  the RecentBlogPostsCard,
  and the disclosure
  additions is hyphen-
  only. Self-Review greps
  the diff for
  `String.fromCharCode(8212)`
  before pushing.
- Per the 2026-09-06
  VISIBLE_LIMIT window
  drift lesson, the new
  spec's row-count
  assertion uses
  `toHaveCount(N)` over
  the seeded-then-read
  state, NOT `count > 0`
  over the live dashboard
  whose card visibility
  depends on prior state.
  The spec seeds
  `dca_recent_blog_posts_v1`
  via `page.evaluate` at
  the start of each case
  so the assertion is
  deterministic.
- Per the 2026-09-10
  mount-signal lesson,
  the write-through case
  in the new spec (visits
  `/blog/<slug>` then
  `/my`) uses a `gotoPath`
  helper that waits for
  the `BlogPost` H1 to be
  visible before
  navigating away so the
  `useEffect` write
  completes before the
  `/my` read fires.
- Per the 2026-09-10
  raw-vs-sliced lesson,
  the "every post has
  been read" acceptance
  box (box 8) seeds all
  46 blog slugs into
  `dca_recent_blog_posts_v1`
  and asserts the
  suggest chip is
  absent; the
  `suggestNextBlogPost`
  implementation must
  read the RAW parsed
  list, not the display-
  sliced list, so this
  box actually returns
  `null`.
- Per the 2026-09-12
  code-beats-prose
  lesson, this ticket
  cites the blog-post
  count (46 posts as of
  2026-09-22) as
  groomer prose; the
  implementer greps
  `blogPosts.length` on
  branch head to pin
  the count before
  writing the spec's
  "all posts read"
  case. If the count
  has changed between
  2026-09-22 and the
  implementation start,
  the implementer notes
  the deviation in the
  Implementation log
  with the file:line of
  the real source.
- `tests/e2e/recent-blog-posts-recap.spec.ts`
  (new) - one assertion
  per acceptance box.
  Model the spec on
  `tests/e2e/recent-compares-recap.spec.ts`
  (ticket 0074, the
  direct peer for a
  dashboard-card
  retention surface) and
  on
  `tests/e2e/quiz-history-card.spec.ts`
  (ticket 0076, the
  direct peer for a
  history-persistence
  card). The allow-list
  case seeds an invalid
  slug and asserts it
  does NOT render.
- Per the 2026-05-22
  two-PR ship lesson,
  ship will need a
  follow-up
  `chore/0091-ship-status`
  PR after the feat PR
  merges to flip the
  ticket frontmatter AND
  its
  `docs/backlog/README.md`
  index row to `shipped`
  together; run
  `node scripts/check-backlog.mjs`
  before pushing the
  second PR so the file
  and index never drift
  mid-flip.
- New deps: NO. The
  store reuses
  `localStorage` and
  standard `try/catch`
  per the ticket 0074
  pattern. The card
  reuses `react-router-dom`,
  `lucide-react`, and
  Tailwind utility
  classes already in
  use on `/my`. Schema
  migration: no. Privacy
  / security surface
  change: YES - the new
  `dca_recent_blog_posts_v1`
  key is added to the
  `NEW_PERSISTENT_STORES`
  constant and rendered
  on `/trust` in the
  same PR per the ticket
  0018 / 0033 / 0045 /
  0060 / 0062 / 0074 /
  0076 honesty rule; no
  data leaves the
  browser.

## Implementation log

(Appended by the implementation-dev agent during execution.)
