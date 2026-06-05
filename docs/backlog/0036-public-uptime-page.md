---
id: 0036
title: Public /uptime page surfacing demo and serverless health for regulated-vertical buyers
status: groomed
priority: P2
area: trust
created: 2026-06-05
owner: gtm-innovation
---

## User story

As a healthcare-office manager or legal-practice owner who has to
write a one-line "is this vendor reliable" answer to a partner or
compliance officer before piloting an AI tool, AND as a returning
prospect who wants a quick "are the demos actually up right now"
glance before re-trying the voice negotiator, I want a public
`/uptime` page that lists the current status of the public demo
surfaces plus the last 90 days of incident notes (if any), so that
"is this service reliable" stops requiring a Twitter / LinkedIn
check and the answer is one URL I can paste into an email.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: every public surface the
site already exposes (the four serverless route families
`/api/chat`, `/api/scrape`, `/api/vapi-*`, `/api/call-summary`)
either responds 2xx or it doesn't. A small client-side page can
ping a lightweight, key-free probe surface on each family and
render a green / yellow / red chip per surface, plus a
hand-curated `INCIDENTS` constant in
`src/data/uptimeIncidents.ts` (committed to the repo) listing any
incident in the last 90 days. The incident log is append-only and
edited by a human as part of any post-mortem; the page reads it
as a typed import. No new backend, no third-party uptime SaaS, no
new dependency. The page is informational and never claims
five-nines; it just shows the current state honestly.

### Stakeholder

This deepens the trust moat in the dimension `/trust` (ticket
0018) and the data-disclosure chip (ticket 0033) cannot cover:
operational transparency. Healthcare, legal, and dental verticals
are exactly the buyer profiles where a deal stalls on "show me
your uptime page" before a pilot even starts. Today the answer is
either silence or a LinkedIn post; tomorrow it is a URL. The
incident log is the genuinely defensible artifact - acknowledging
a real degradation honestly is a stronger trust signal than
hiding it. The same data also positions the brand against
incumbents (Podium, ServiceTitan) who do publish status pages,
closing a perceived-credibility gap the four trade landing pages
cannot close on their own.

### Visitor (in the real moment of use)

A legal-practice owner on a phone opens `/uptime` from the
footer link. They see a clean grid of three or four surface
chips ("AI chat: green," "Web scraping: green," "Voice calls:
green") with the last-checked timestamp, then a reverse-
chronological "Recent incidents" list under each surface. If
nothing has happened in 90 days the section reads "No incidents
reported in the last 90 days." One tap on a chip shows a short
plain-language description of what that surface does
(cross-referenced to the matching `/trust` section anchor). The
page renders in light and dark mode, needs no scroll on first
viewport to see every surface chip, and contains zero hype copy.

### Growth

The "show me" moment is the URL a salesperson can paste into a
follow-up reply to "what about reliability": a status page with
real surface checks and an honest incident log. The implicit
"we don't hide our outages" signal is a single artifact and a
single tap. Each surface-chip click fires
`trackCTAClick('uptime_surface_open', '<surfaceId>')` and each
`/trust` jump fires `trackCTAClick('uptime_to_trust', '<surfaceId>')`
so we can measure which surfaces drive the most trust-page
traffic; that data informs which areas need deeper operational
copy on `/trust` itself. Each incident entry also gives Google
a fresh `lastmod` signal on the page via the existing ticket
0022 sitemap-lastmod infra.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/Uptime.tsx` (new file, under 200 lines) renders at `/uptime`. The page lists every surface in a typed `UPTIME_SURFACES` constant in `src/data/uptimeSurfaces.ts` (new file, under 60 lines) - at minimum: AI chat (`/api/stream`), web scraping (`/api/scrape`), voice infrastructure (`/api/vapi-status`), and call summary (`/api/call-summary`). Each surface row renders a chip showing the current status (green / yellow / red), the surface name, a one-line description, and a link to the matching `/trust` anchor. The page uses the same `Navbar` + `Footer` + `ScrollProgress` + `Helmet` shell as `src/pages/Trust.tsx` (ticket 0018).
- [ ] The page does NOT call any new endpoint and does NOT add any new hostname. Status is derived client-side from a `useUptimeProbe()` hook in `src/hooks/useUptimeProbe.ts` (new file, under 80 lines) that issues a `HEAD` (or `OPTIONS` if the surface rejects HEAD) request to each EXISTING `/api/*` route already used by the site, with a 3-second timeout, and resolves to green for any 2xx response, yellow for 5xx-without-error-body, red for network failure or timeout. Per the AGENTS.md Hard NO this ticket touches NO `/api/*` file; the probe uses the existing routes verbatim. The implementer documents in the Implementation log which routes were selected and which HTTP method each accepts (a 405 is fine; the page treats "got a response at all" as "the surface is reachable").
- [ ] A typed `INCIDENTS` constant in `src/data/uptimeIncidents.ts` (new file, under 60 lines) lists every recorded operational incident in reverse-chronological order, each entry shaped as `{ id, surfaceId, startedAt, endedAt, severity, summary }`. The initial commit ships with an empty `INCIDENTS = []` array (no invented historical incidents per the AGENTS.md Hard NO on inflated claims) and a leading module comment naming the human-editing workflow: any post-mortem appends a new entry; the page renders "No incidents reported in the last 90 days" when the filtered list is empty.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text, never claims an uptime number (no "99.9%" anywhere; the page reports current observed state only), and degrades gracefully on offline / blocked-CORS environments (the probe hook returns `unknown` status and the chip renders gray with copy "Status unavailable from this network" so the page is never misleading).
- [ ] The new route is registered in `src/App.tsx` next to the existing `/trust` and `/changelog` routes (tickets 0018 and 0032). The sitemap generator (ticket 0022) picks up the new route automatically. The footer's existing link block in `src/components/Footer.tsx` gains one new `<Link to="/uptime">Uptime</Link>` entry near the existing `Trust` and `Changelog` links (one-line edit, no restructure of the footer column). Clicking the footer link fires `trackCTAClick('open_uptime', 'footer')` per the existing footer analytics pattern.
- [ ] A new e2e spec at `tests/e2e/uptime-page.spec.ts` (new) navigates to `/uptime`, asserts the page returns < 400 status, asserts the H1 contains "Uptime" or "Status," asserts at least 3 surface chips render (use `data-testid="uptime-surface"` on every chip), asserts the footer link points at `/uptime`, asserts dark-mode renders cleanly, asserts the rendered text contains no `U+2014` code point and no percent-with-decimal pattern (`/\d+\.\d+%/`) to enforce the "no uptime number" rule, and asserts the "No incidents" empty state renders on a fresh install. The spec STUBS `page.route('**/api/**', ...)` for each surface route so the probe behavior is deterministic without hitting the real API (per the cross-fleet pattern: a CLIENT-component page with browser-side fetches IS `page.route()`-interceptable).
- [ ] No new hostnames, no `/api/` change, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/pages/Trust.tsx` (the page links to `/trust` anchors; `/trust` does not need to know about `/uptime`). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta` stay green; `npm run typecheck` stays clean.

## Out of scope

- A real uptime-history graph or a "last 30 days" pixel calendar.
  The page is a current-state snapshot plus a hand-curated
  incident log; a real time-series store is its own infra ticket
  (it would need a serverless cron and a write-back store, both
  Hard NOs for the GTM queue).
- Integrating a third-party status-page SaaS (Statuspage,
  Better Stack, Instatus). The page is intentionally
  self-hosted and dependency-free; a SaaS integration is its
  own ticket once the self-hosted page proves usage.
- Claiming any uptime SLA number ("99.9%," "99.99%"). The page
  reports current observed state only, no aggregate claims. The
  e2e spec encodes this as a forbidden-pattern assertion so the
  rule is gate-enforced.
- A webhook or RSS feed of incidents. The page renders the typed
  `INCIDENTS` constant only; a feed is its own follow-up.
- A "Subscribe to incident notifications" email capture. Three
  capture surfaces already exist (tickets 0002, 0015, 0033); a
  fourth is noise. A future ticket can wire one if usage
  justifies it.
- Per-vertical uptime (separate status for healthcare vs legal
  demos). Every vertical shares the same serverless and AI
  provider chain; per-vertical chips would imply per-vertical
  infra that does not exist.
- Documenting the uptime page on `/trust`. The page reads only
  existing public probe behavior and a human-edited log; nothing
  new about the data flow needs disclosure.
- Adding a top-navbar link. The footer link is enough; promoting
  it higher is a follow-up A/B test once we measure baseline
  traffic.
- Probing the OpenAI, Vapi, Firecrawl, Jina, ElevenLabs,
  Deepgram, or Formspree endpoints directly. The page reports
  reachability of the DigitalCraft serverless surfaces, not of
  upstream providers (whose status pages each have their own
  canonical URL).

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/Uptime.tsx` (under 200 lines). Model the page
  shell on `src/pages/Trust.tsx` (ticket 0018) and
  `src/pages/Changelog.tsx` (ticket 0032) exactly: `Helmet` head,
  `Navbar` at the top, `ScrollProgress`, jump-nav by surface id,
  `<Footer data={content.footer} />` via `useContent()`. The
  page imports `UPTIME_SURFACES` and `INCIDENTS` from the two
  new data files and calls `useUptimeProbe(UPTIME_SURFACES)` to
  drive the chip states. Apply `dark:` Tailwind variants on
  every new class per the AGENTS.md Hard NO.
- New `src/data/uptimeSurfaces.ts` (under 60 lines). Each
  surface entry shape: `{ id: string; name: string; description: string; probePath: string; method: 'HEAD' | 'OPTIONS' | 'GET'; trustAnchor: string }`.
  The `probePath` MUST be an existing `/api/*` route already
  used by the running site; do NOT invent a new probe endpoint
  per the AGENTS.md Hard NO. Per the 2026-05-25 mirror-source
  lesson, the `trustAnchor` MUST resolve to an existing section
  id in `src/pages/Trust.tsx`; the e2e spec asserts every
  surface's `trustAnchor` is present in the rendered `/trust`
  body (cross-reference by reading `/trust` text in `beforeAll`).
- New `src/data/uptimeIncidents.ts` (under 60 lines). The
  module exports `INCIDENTS: Incident[]` initially as `[]` and
  a leading block comment names the human-editing workflow.
  Each `Incident` shape: `{ id: string; surfaceId: string; startedAt: string; endedAt: string | null; severity: 'minor' | 'major' | 'critical'; summary: string }`.
  A module-load assertion confirms every `surfaceId` in any
  incident is present in `UPTIME_SURFACES` (throw a clear
  dev-time error on drift, so a renamed surface cannot strand
  a dead incident reference). Severity strings are constrained
  by the type; the page color-codes by severity.
- New `src/hooks/useUptimeProbe.ts` (under 80 lines). Uses
  `useEffect` + `Promise.allSettled` to fire one probe per
  surface in parallel with `AbortController` and a 3-second
  timeout. Returns a `Record<surfaceId, 'green' | 'yellow' | 'red' | 'unknown'>` map.
  A 2xx is green; a 5xx is yellow; a network error, a timeout,
  or a CORS rejection is red. A page that loaded in an offline
  / blocked environment returns `unknown` for every surface and
  the chip renders gray. The hook re-probes every 60 seconds
  via `setInterval` (cleared on unmount). NEVER store probe
  results in any storage backend - the probe is ephemeral.
- `src/App.tsx` - register `<Route path="/uptime" element={<Uptime />} />`
  next to the existing `/trust` and `/changelog` routes. The
  sitemap generator (ticket 0022) picks up the new route
  automatically and emits a `lastmod` from today's commit date.
- `src/components/Footer.tsx` - one-line addition of a
  `<Link to="/uptime">Uptime</Link>` near the existing
  `Trust & Privacy` and `Changelog` links, with the same
  `onClick` analytics pattern the other footer links use. This
  is the only edit to the footer.
- Per the 2026-05-25 SEO Pilot lesson, `/uptime` is NOT added
  to the `index.html` SEO Pilot pages table in this ticket. The
  e2e spec asserts the Helmet-managed `meta[name="description"]`
  content directly (reading the LAST `meta[name="description"]`
  element in the head per the 2026-05-25 Helmet-appends
  lesson), NOT `page.toHaveTitle()`. Adding `/uptime` to the
  SEO Pilot table is its own SEO concern, out of scope here.
- Per the 2026-05-30 second-@type lesson, this ticket emits no
  JSON-LD. If the implementer decides to add a `WebPage` or
  `Service.serviceOperator.contactPoint` schema for the uptime
  page, they MUST grep `tests/e2e/*-jsonld.spec.ts` for matching
  `@type` predicates first. Default posture: no new JSON-LD.
- Per the 2026-05-07 em-dash Hard NO, every string in the page,
  the surface descriptions, the incident summaries (when added
  in future PRs), and the probe-state copy uses hyphens.
  Self-Review greps the diff for the em-dash character (`U+2014`)
  before pushing. Per the AGENTS.md Hard NO on inflated claims,
  the page MUST NOT print any aggregate uptime percentage; the
  e2e spec encodes this as a forbidden-pattern assertion
  (`/\d+\.\d+%/.test(pageText)` must be false). Same family as
  the 2026-05-25 mirror-source-fix: the rule is enforced at the
  single shared source (the page module) and gated by the spec.
- `tests/e2e/uptime-page.spec.ts` (new) - one spec per
  acceptance box. Page-renders case: navigate to `/uptime`,
  assert status < 400, count at least 3
  `data-testid="uptime-surface"` chips, assert the H1 matches
  `/uptime|status/i`. Probe-stub case: register
  `page.route('**/api/**', route => route.fulfill({ status: 204 }))`
  in `beforeEach` so every surface resolves green, assert every
  chip renders green. Failure-case: register a 503 stub for one
  surface and assert that chip renders yellow, the others green.
  Empty-incidents case: assert the page renders "No incidents
  reported in the last 90 days" on a fresh `INCIDENTS = []`
  build. Footer-link case: navigate to `/`, click the footer
  `Uptime` link, assert URL changes to `/uptime`. Dark-mode
  case: apply `document.documentElement.classList.add('dark')`
  and assert the page renders. No-em-dash case: read
  `page.textContent('main')` and assert no `String.fromCharCode(8212)`.
  No-percent case: assert `/\d+\.\d+%/.test(await page.textContent('main'))`
  is false. Trust-anchor case: read every `trustAnchor` from
  `UPTIME_SURFACES` and assert each matches a section id in the
  rendered `/trust` body (the cross-page assertion runs in a
  separate `test.describe` block).
- Per the 2026-05-22 two-PR ship lesson, ship will need a
  follow-up `chore/0036-ship-status` PR after the feat PR
  merges to flip the ticket frontmatter AND its
  `docs/backlog/README.md` index row to `shipped` together;
  run `node scripts/check-backlog.mjs` before pushing the second
  PR so the file and index never drift mid-flip.
- New deps: NO. The probe uses `fetch` + `AbortController` from
  the platform; the page reuses `lucide-react`, the existing
  Navbar / Footer / ScrollProgress components, and `useContent()`.
  Schema migration: no. Privacy/security surface change: NO new
  data flow - the probe fires from the visitor's own browser
  against existing routes the site already calls; no new
  external network destination is introduced, no new storage
  key is written, no new analytics field is captured. Per the
  AGENTS.md Hard NO, this ticket touches `/api/` zero times.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0036-public-uptime-page` opened
- YYYY-MM-DD - failing test added in `tests/e2e/uptime-page.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
