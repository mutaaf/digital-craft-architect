---
id: 0023
title: Footer "AI providers we use" trust chip linking to /trust
status: shipped
priority: P2
area: trust
created: 2026-05-28
owner: gtm-innovation
---

## User story

As a skeptical owner skimming any page on the site for the first time, I
want a small, quiet "AI providers we use" chip in the footer that names
the headline providers (OpenAI, Vapi, ElevenLabs) inline and links to the
existing `/trust` page for the full breakdown, so that I see proof of the
stack without having to discover the `/trust` page through a buried
Privacy link or trust the marketing copy alone.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: ticket 0018 shipped the `/trust`
page with the full provider list, data-flow narrative, and deletion
contact. Today the only path to that page is the small "Trust & Privacy"
link at the bottom of the footer (added in 0018 to replace `href="#"`).
A second, more discoverable surface - a chip near the existing Deployed
timestamp that names the headline providers inline - turns the trust page
from a destination a visitor has to seek into a signal they catch in
passing. The chip is one component, one place, with no new copy obligations
beyond a trio of provider names already published on `/trust` and in
`CLAUDE.md`.

### Stakeholder

This deepens the moat in a way generic AI vendors cannot copy without
exposing their own stacks. Naming OpenAI, Vapi, and ElevenLabs in the
footer of every page is a transparency move that buyers in regulated or
risk-averse industries (healthcare, legal, real estate brokerages with
compliance officers) reward; vendors that hide behind "proprietary AI"
language do not get to opt in. Because the chip is global (footer ships
on every page that uses `<Footer />`), the trust signal compounds across
the hundreds of vertical, demo, blog, compare, and landing routes that
exist today.

### Visitor (in the real moment of use)

A construction owner skimming on mobile reaches the bottom of any page
and sees, next to the "Deployed" timestamp chip already there, a second
quiet chip reading "Powered by OpenAI, Vapi, ElevenLabs - see how" linked
to `/trust`. One tap goes to the full transparency page. The chip is the
same muted size as the deploy timestamp so it does not crowd the legal
links or pull attention away from the newsletter signup directly above.

### Growth

The "show me" moment is the screenshot a salesperson can paste into a
follow-up email when a prospect asks "what AI are you actually using?"
Today the answer requires clicking through the Privacy & Trust footer
link; with this chip the answer is visible in the footer of any page they
already have open. That asymmetry (their question takes 30 seconds, the
answer is already on screen) shortens the gap between "interested" and
"booked," the same lever ticket 0018 named.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new chip element is rendered inside `src/components/Footer.tsx` in the bottom legal-links row (the same row that today contains the "Deployed: ..." chip and the "Industries / Trust & Privacy / Terms of Service" links, lines 145 to 156). The chip text reads exactly "Powered by OpenAI, Vapi, ElevenLabs" (no em-dash) and is wrapped in a react-router `<Link to="/trust">` so it navigates SPA-internally with no full reload.
- [ ] The chip styles match the existing "Deployed" chip's muted appearance: same `text-xs`, same `bg-gray-800` inline-block rounded pill, same `text-gray-500` family. It sits visually adjacent to the Deployed chip (same flex container or a sibling chip in the same row) and does not break the existing layout on mobile (flex-col) or desktop (flex-row).
- [ ] Clicking the chip fires `trackCTAClick('trust_providers_chip', 'footer')` so the chip's click-through to `/trust` is measurable in GA. The existing footer CTAs (`trackCTAClick('newsletter_subscribe', 'footer')` on line 21) confirm the pattern; the new call mirrors it.
- [ ] The three provider names in the chip text are a strict subset of the provider list rendered on `/trust` (sourced from `CLAUDE.md`'s "Tech Stack" table per ticket 0018). The chip MUST NOT name a provider that is not actually used in the repo, and MUST NOT contradict the longer list on `/trust`. A test asserts the chip's text matches the three names exactly so a future edit to one source does not silently diverge.
- [ ] The footer (and therefore the chip) renders in light and dark mode on a 375px mobile viewport without overlapping any sibling element or pushing the copyright line off-screen. The chip text contains no em-dash character.
- [ ] No new hostnames, no `/api/` change, no new npm dependency, no new component file (the chip is added inline to the existing `Footer.tsx`). Per the Hard NO list in `AGENTS.md`, the GTM queue does not touch `package.json` / `package-lock.json`. `npm run check-links` and `node scripts/check-backlog.mjs` stay green.

## Out of scope

- Naming every provider in the chip (the full list of nine on `/trust`
  is too long for a footer chip; the three headline names plus a "see
  how" link to the full breakdown is the right size for a passing
  skim).
- A second chip or badge above the fold (hero, navbar, or any landing
  page). The footer is global; adding the chip in one place covers every
  page that ships `<Footer />`. Per-vertical hero chips are their own
  ticket if a specific vertical needs them.
- Editing the `/trust` page's content, structure, or schema; this ticket
  only adds a link surface to it.
- Adding the chip to a header or persistent banner; the visitor noise
  budget at the top of the page is reserved for navigation and demo
  CTAs.
- Generating a provider logo lockup (third-party logos require usage
  rights review); the chip is text-only.
- Editing `src/components/EmailCourseOptin.tsx`, `FooterNewsletter`, or
  any other element of `Footer.tsx` beyond the legal-links row insertion.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- `src/components/Footer.tsx` - the only source file changed. Insert the
  new chip inside the existing `<div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 items-center">` at line 145, as
  a sibling of the existing "Deployed" `<p className="text-gray-500 text-xs">`
  chip at line 146. Mirror that chip's wrapping pattern
  (`<p className="text-gray-500 text-xs"><Link to="/trust" onClick={...}><span className="inline-block bg-gray-800 px-2 py-1 rounded">...</span></Link></p>`)
  so the visual weight matches. Use the already-imported `Link` from
  react-router (line 3) and the already-imported `trackCTAClick` from
  `@/utils/analytics` (line 6). No new imports needed beyond a single
  lucide icon if desired (e.g. `Cpu` or `Sparkles`); the chip can also
  ship as text-only to avoid any new import.
- The provider name strings should live in a small `const PROVIDERS = ['OpenAI', 'Vapi', 'ElevenLabs'] as const;` at the top of `Footer.tsx`
  so the chip text and any test assertion read from one array. This
  satisfies the 2026-05-25 mirror-source lesson: if the headline three
  providers change later, the chip and the test both follow from one
  edit.
- DO NOT change the existing "Trust & Privacy" Link at line 153; this
  ticket adds a second discovery surface, it does not replace the
  existing one.
- Per the 2026-05-07 em-dash Hard NO, write the chip text with a comma
  separator or a hyphen ("Powered by OpenAI, Vapi, ElevenLabs - see how"),
  never an em-dash. Self-Review must grep the diff for the em-dash
  character before pushing.
- `tests/e2e/footer-providers-chip.spec.ts` (new) - one spec per
  acceptance box: chip text renders with the three exact provider names,
  chip is wrapped in a `<a href="/trust">` (Playwright sees `Link`
  rendered as `<a>`), clicking the chip navigates to `/trust` without
  full reload (assert `page.url()` ends with `/trust` and no full
  navigation event fired - mirror the SPA-nav assertion pattern from
  `tests/e2e/demo-breadcrumbs.spec.ts`), the chip text in the rendered
  DOM matches the `PROVIDERS` array values (read from the page source
  or a `data-testid` selector), dark-mode render check, and no em-dash
  character in the rendered footer text. Test on at least two routes
  (`/` and `/construction/demo`) to confirm the chip ships everywhere
  the footer ships.
- Per the 2026-05-22 two-PR lesson, ship will need a follow-up
  `chore/0023-ship-status` PR after the feat PR merges to flip the
  ticket frontmatter + README index row to `shipped` together. Do not
  skip the second PR.
- New deps: no. Schema migration: no. Privacy/security surface change: no
  (the chip names providers already publicly listed on `/trust` and in
  `CLAUDE.md`; no data is collected by the chip itself).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-05-28 - branch `feat/0023-footer-ai-providers-chip` opened, status flipped to in-progress
- 2026-05-28 - failing Playwright spec added in `tests/e2e/footer-providers-chip.spec.ts`
- 2026-05-28 - chip implemented in `src/components/Footer.tsx`; PROVIDERS const at top, chip mirrors the Deployed chip styling
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
