---
id: 0109
title: Public /agent-prompts transparency page listing the committed system prompt for every autonomous agent as a defensible moat artifact
status: in-progress
priority: P2
area: trust
created: 2026-10-02
owner: gtm-innovation
---

## User story

As a buyer who has already read `/agent-fleet` and now wants to see HOW
the autonomous ship loop actually decides what to ship (a public-sector
construction GC's data-protection officer whose onboarding checklist
asks "what instructions do the vendor's autonomous agents operate
under;" a franchise VP's AI-governance lead whose vendor diligence
packet requires a written AI-operator statement; a real-estate
brokerage's E&O insurance underwriter who has read `/model-card` and
`/hallucination-safeguards` and now wants to see the agent-side half of
the story; a researcher comparing public AI-labor transparency across
small vendors), I want one public dated page at `/agent-prompts`
listing the first N characters of the committed system prompt for each
autonomous agent (gtm-innovation, implementation-dev, review, eng-dev,
validation), with a link to the full prompt file path and a dated last-
reviewed line, so that I can cite a defensible per-agent prompt
transparency posture to my counsel, my insurer, or my owner before
booking a strategy call, and I can hand it to my AI-governance lead as
evidence that the vendor publishes WHAT its agents are instructed to do
rather than hand-waving as "we use AI responsibly."

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the site now ships `/agent-fleet`
(ticket 0090) listing WHICH autonomous agents exist and their intended
use, `/hallucination-safeguards` (0102) listing per-demo grounding and
known failure modes, `/model-card` (0088) listing third-party AI models,
`/how-we-ship` (0083) describing the ship-loop meta-process, and
`/ai-risks-we-watch` (0094) listing the dated risk watchlist. What is
missing is the artifact that answers "what are the agents literally
instructed to do," which is the question a serious AI-governance review
asks after reading `/agent-fleet` and `/model-card`. The committed
`.claude/agents/*.md` prompt files are already in the repo (every
AGENTS.md section 55 agent card is a Markdown file on main); publishing
a dated SUMMARY of each prompt alongside its full file path is one new
page component (`src/pages/AgentPrompts.tsx` modeled 1:1 on
`src/pages/AgentFleet.tsx` from ticket 0090), one new data file
(`src/data/agentPrompts.ts` mirroring `src/data/agentFleet.ts`), one
new build-time script extension (an addition to `scripts/generate-sitemap.ts`
or a new sibling script that reads `.claude/agents/*.md` at build time
and emits the typed row set), one new entry in `src/data/routes.ts`,
one new route in `src/App.tsx`, one new sitemap entry (auto-emitted),
one new footer trust-chip link, one new cross-link chip on `/trust`
and on `/agent-fleet`, and one new spec.

### Stakeholder

This widens the moat in a dimension no shipped trust artifact fully
addresses. The competitive positioning is asymmetric: most AI-services
vendors do not publish their system prompts in any form (prompts are
treated as proprietary IP), and NONE publish a dated per-agent prompt
transparency page with a build-time guarantee that the published excerpt
is byte-identical to the committed `.claude/agents/*.md` file at the
build SHA. Per the ticket 0090 precedent, every row's path is grepable
at branch head (`.claude/agents/gtm-innovation.md`,
`.claude/agents/implementation-dev.md`, `.claude/agents/review.md`,
`.claude/agents/eng-dev.md`, `.claude/agents/validation.md`); per the
2026-09-12 code-beats-prose lesson, the ticket's inline enumeration is
placeholder and the real agent set is pinned at the branch-head grep.
Per the ticket 0102 / 0097 / 0094 precedent, this page emits
CollectionPage plus BreadcrumbList JSON-LD so search engines index it
as a canonical collection of dated rows. The build-time guarantee is
the defensible moat: the generator reads each `.claude/agents/*.md`
file at build time, extracts the first N characters of the prompt body
(up to a defensible excerpt limit, e.g. 2000 chars), and emits the
excerpt into `src/data/agentPrompts.ts` so a divergence between the
committed prompt file and the published excerpt is impossible by
construction. The page is a specific artifact a buyer-side AI-governance
lead asks for and almost no competitor publishes.

### User (in the real moment of use)

A real-estate brokerage's E&O insurance underwriter sits down Tuesday
morning to review a vendor diligence packet from Digital Craft. His
checklist has a "published AI-agent operating instructions" line. He
opens `digitalcraftai.com/agent-prompts` from the footer trust-chip
cluster; the page loads under one screen on his laptop with a hero H1
("Agent Prompts"), a top-of-page "Last reviewed: 2026-10-02" line, a
one-paragraph explainer naming what "agent prompt" means and the
build-time byte-equivalence guarantee ("the excerpt below is the first
2000 characters of the committed prompt file at the build SHA"), and a
per-agent table with columns: Agent name, Role, Prompt file path,
Prompt excerpt, Full-prompt char count, Last modified SHA. Each row has
one agent (gtm-innovation, implementation-dev, review, eng-dev,
validation). The excerpt text is rendered in a monospace `<pre>` block
on each row with a "View full prompt" link pointing at the public
GitHub blob URL for that file at the build SHA (a honest, dated,
auditable link). A caveat at the top: "This page publishes the full
instructions committed to version control; the agents may receive
additional runtime context from the fleet runner (environment, branch
head SHA, prior PR state) that is NOT in the committed prompt." At the
bottom, a "How we decide what to ship next" link to `/how-we-ship`, a
"Which agents are running" link to `/agent-fleet`, and a "Models we
use" link to `/model-card`. He copies the URL into his diligence packet
and moves on. Light and dark mode read cleanly; the mobile view stacks
the table columns per the ticket 0090 pattern; the excerpt `<pre>`
blocks wrap long lines.

### Growth

The "show me" moment is an AI-governance lead forwarding
`digitalcraftai.com/agent-prompts` to a peer with the note "this vendor
is the first small-shop I've seen that actually publishes its agent
prompts with a build-time byte-equivalence guarantee; the diligence
packet cleared." That single forward is the shortest path from "we are
a small AI vendor you have not heard of" to "we cleared the AI-governance
transparency gate that a material fraction of your competitors treat as
proprietary." The peer-share signal is a second-order effect: AI-
governance leads swap notes across enterprise buyers, and a vendor that
publishes agent prompts becomes a reference vendor in that informal
peer network. It also creates a measurable SEO signal: the page is a
canonical dated CollectionPage that Googlebot recrawls on its lastmod
cadence, widening the trust-artifact SEO cluster the site has been
building since ticket 0018.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests
against this list before writing code.

- [ ] A new build-time generator at `scripts/generate-agent-prompts.ts` (new file, under 200 lines) reads every `.claude/agents/*.md` file at the repo root, extracts (a) the full file byte length, (b) the first 2000 characters of the file body (excluding any YAML frontmatter block if present, matching the ticket 0032 generator's frontmatter-stripping regex), (c) the git-tracked last-modified SHA for the file (via a `git log -1 --format=%H -- <path>` child-process call, or a hand-parsed `fs.statSync` fallback if the child-process call fails in a CI runner without git), (d) the file's basename sans extension as the `agentId` (e.g. `gtm-innovation`), and writes a typed `src/data/agentPrompts.ts` file with exported `AGENT_PROMPTS_GENERATED_AT` ISO date, `AGENT_PROMPTS_CAVEAT` explainer string, and `AGENT_PROMPTS` readonly array of `{ agentId, role, filePath, excerpt, fullCharCount, lastModifiedSha }`. The `role` string is a per-agent human-readable role name sourced from a static map inside the generator (NOT from the file body, since the body is the prompt itself); per the 2026-09-12 code-beats-prose lesson the implementer greps the actual agent file set at branch head BEFORE locking the role map, and if the agent file set has changed since 2026-10-02 the row set mirrors the real file list.
- [ ] The generator is wired into the existing `scripts/generate-sitemap.ts` chain so a `npm run build` run invokes it in sequence with the ticket 0032 changelog generator. No `package.json` edit per the GTM queue Hard NO; the sitemap generator imports the new generator as a sibling module. Per the 2026-05-28 inline-assertion-in-the-gated-script lesson, the generator THROWS on any invariant violation (missing agent file for a known agent, unreadable file, excerpt body empty, duplicate agentId) and writes a `src/data/agentPrompts.ts.broken` artifact for debugging.
- [ ] A new page at `src/pages/AgentPrompts.tsx` (new file, under 240 lines) modeled 1:1 on `src/pages/AgentFleet.tsx` from ticket 0090. The page renders (a) a hero H1 "Agent Prompts", (b) a top-of-page "Last reviewed: ${AGENT_PROMPTS_GENERATED_AT}" line, (c) a one-paragraph explainer (`AGENT_PROMPTS_CAVEAT`) naming the build-time byte-equivalence guarantee and the runtime-context caveat, (d) a per-agent table with columns Agent name, Role, Prompt file path, Prompt excerpt, Full-prompt char count, Last modified SHA. One row per entry in `AGENT_PROMPTS`. Each row's "Prompt excerpt" column is a `<pre data-testid="agent-prompt-excerpt" class="whitespace-pre-wrap break-all">` block showing the excerpt. Each row's "Prompt file path" cell is a plain-text path (no clickable link to the raw repo file - per the AGENTS.md posture the repo URL is public but the page's own link to the file points at the GitHub blob at the build SHA for a stable dated reference). A "View full prompt" link in each row points at `https://github.com/<owner>/<repo>/blob/<buildSha>/.claude/agents/<agentId>.md` where `<buildSha>` is the git short SHA at build time (resolved by the generator); the full URL template lives in `src/data/agentPrompts.ts` so the test can import and verify it.
- [ ] A new route entry at `src/App.tsx` mapping `/agent-prompts` to the new page component, lazy-imported through the existing `React.lazy` pattern all other trust pages use per the 2026-09-05 route-code-splitting lesson, wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell. A new entry in `src/data/routes.ts` for `/agent-prompts` placed next to the existing `/agent-fleet` entry (per the 2026-09-12 code-beats-prose lesson the implementer greps the actual ordering at branch head before inserting).
- [ ] The page emits two JSON-LD blocks inside its `<Helmet>` block matching the trust-artifact family shape: (1) `CollectionPage` describing the agent-prompts page as a canonical dated collection of per-agent prompt rows, with `name` "Digital Craft AI Agent Prompts", `url` "https://digitalcraftai.com/agent-prompts", `description` byte-identically matching the page's `meta[name="description"]` per the 2026-05-25 mirror-source rule, `dateModified` equal to `AGENT_PROMPTS_GENERATED_AT`; (2) `BreadcrumbList` positioning the page under the homepage (two levels: Home, Agent Prompts). Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates. Every predecessor CollectionPage block is URL-scoped per the ticket 0102 Implementation log; the sibling scoped to `/agent-prompts` cannot collide. The grep result is documented in the Implementation log.
- [ ] The `/trust` page (`src/pages/Trust.tsx`) gains one new inline cross-link chip inside the existing trust-cluster section pointing at `/agent-prompts` with label "Agent Prompts". The `/agent-fleet` page (`src/pages/AgentFleet.tsx`) gains one new inline cross-link chip pointing at `/agent-prompts` with label "See each agent's committed prompt". These are two additive lines inside shipped pages; the ticket 0018 `/trust` AboutPage JSON-LD and the ticket 0090 `/agent-fleet` CollectionPage JSON-LD stay byte-identical. The site footer (`src/components/Footer.tsx`) gains one new trust-chip link to `/agent-prompts` next to the existing trust-family links per the ticket 0023 footer chip pattern.
- [ ] A new e2e spec at `tests/e2e/agent-prompts-page.spec.ts` (modeled on `tests/e2e/agent-fleet-page.spec.ts` from ticket 0090 and on `tests/e2e/hallucination-safeguards.spec.ts` from ticket 0102) asserts, using a `gotoAgentPrompts(page)` helper that waits for RouteFallback detach per the 2026-09-05 lesson and the H1 mount signal per the 2026-09-10 lesson: (1) `GET /agent-prompts` returns 200, (2) the page renders an H1 containing "Agent Prompts", (3) the page renders a "Last reviewed:" line matching `AGENT_PROMPTS_GENERATED_AT` imported from `src/data/agentPrompts.ts` (mirror-source per the 2026-06-07 rule), (4) the per-agent table renders exactly `AGENT_PROMPTS.length` rows with `data-testid="agent-prompt-row"` per the 2026-09-06 VISIBLE_LIMIT lesson (`toHaveCount(AGENT_PROMPTS.length)` over the imported constant), (5) every row's `filePath` cell text matches `/^\.claude\/agents\/[a-z-]+\.md$/`, (6) every row's `fullCharCount` cell is a positive integer rendered as a plain number (regex `/^\d+$/`), (7) every row's excerpt `<pre>` block is non-empty and its character length is at most 2000, (8) every row's "View full prompt" anchor href matches `/^https:\/\/github\.com\/[^\/]+\/[^\/]+\/blob\/[0-9a-f]{7,40}\/\.claude\/agents\/[a-z-]+\.md$/`, (9) exactly one `CollectionPage` JSON-LD block with `name` byte-matching the page's H1 substring and `dateModified` byte-matching `AGENT_PROMPTS_GENERATED_AT`, (10) exactly one `BreadcrumbList` block with two itemListElement entries named "Home" and "Agent Prompts", (11) the em-dash assertion scopes only to the two owned blocks per the 2026-09-08 filter lesson; the rendered page body (OUTSIDE the `<pre>` excerpt blocks) contains zero `String.fromCharCode(8212)` code points - the excerpt body is NOT em-dash-scrubbed because it is a byte-identical quote of the committed prompt file and the Hard NO applies to copy the agent writes, not to copy the agent is quoting (document this scoping decision in the Implementation log), (12) the page renders cleanly in both light and dark mode (`html.dark` toggle), (13) the `/trust` page shows the new "Agent Prompts" cross-link chip with href `/agent-prompts`, (14) the `/agent-fleet` page shows the new cross-link chip with href `/agent-prompts`, (15) the footer on the homepage shows the new trust-chip link to `/agent-prompts`, (16) per the 2026-06-15 attribute-list regex lesson, any regex in the spec over stringified JSON-LD uses `[^>]*`, not `[^/>]*`.
- [ ] Standard box: no `/api/` change, no new hostname (the GitHub blob URL is a public read-only reference, not a new API endpoint under the site's control), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to any predecessor trust-artifact page beyond the one additive chip line in `Trust.tsx`, the one additive chip line in `AgentFleet.tsx`, and the one additive link line in `Footer.tsx`. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. Auto-emission of `/agent-prompts` into `dist/sitemap.xml` is confirmed via `scripts/generate-sitemap.ts` per the ticket 0022 / 0094 / 0097 / 0102 auto-inclusion pattern; the implementer greps `dist/sitemap.xml` for the route after a local build and records the result in the Implementation log.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem
related.

- Standard anti-goals: no `/api/` changes, no `package.json` changes, no em-dashes in copy, dark-mode required (the excerpt body is quoted from the committed prompt file and is scoped out of the em-dash check per acceptance box 11).
- Publishing the FULL body of every agent prompt inline. The excerpt is capped at 2000 characters per row; a visitor who wants the full body clicks the "View full prompt" link to the GitHub blob at the build SHA. The 2000-character cap is a reader-friendly truncation, not a redaction, and the full char count column makes any truncation auditable.
- Publishing runtime context passed to the agents by the fleet runner (environment variables, branch head SHA, prior PR state, auto-merge configuration). Runtime context is NOT in the committed prompt file and is a distinct observability surface; the page's caveat names this exclusion explicitly.
- Publishing per-agent conversation transcripts, prior tool-call logs, or any output the agents produced. Those are per-run artifacts, not instructions; a transcript page is a distinct ticket.
- Publishing the Claude Code system prompt or any third-party model's internal instructions. The page is scoped to the committed `.claude/agents/*.md` files only, which are Digital Craft's own instructions to its agents; the third-party model instructions are the vendor's IP and are published on `/model-card` (ticket 0088).
- A per-agent "last edit author" column. The commit author data is public via `git log` but adding it adds no diligence value and risks a maintenance burden on the generator; the last-modified SHA is sufficient.
- Rendering a diff view between the current and the prior commit of each agent file. Diff rendering is its own observability surface and risks a 200-line page per diff.
- Fabricating a "model this prompt is run against" column. The generator does not read runtime model configuration; the mapping of agent to model lives on `/model-card` (ticket 0088) and `/agent-fleet` (ticket 0090). Adding a model column here would create a drift risk against the two shipped sources of truth.
- Emitting an `AboutPage`, `TechArticle`, `SoftwareSourceCode`, or `Dataset` JSON-LD block on `/agent-prompts`. `AboutPage` is claimed by `/trust` (ticket 0044); `CollectionPage` is the correct fit for a dated collection of rows per the ticket 0102 precedent.
- Persisting a "I reviewed the agent prompts" visitor flag to localStorage. The ticket 0104 reviewed-trust-pages store transitively picks up `/agent-prompts` once it is added to the `TRUST_PAGE_LABELS` map in `src/data/trustPageLabels.ts`; the implementer adds the one entry to that map in the same PR per the ticket 0104 pattern (one additive line in `src/data/trustPageLabels.ts` plus one `useRecordTrustPageVisit` call in the new page body).
- Server-side rendering the excerpt. The excerpt is a build-time string embedded in `src/data/agentPrompts.ts` and lands in the SPA bundle; no server-side render is needed and no serverless function is touched.
- Adding a search box over the excerpts. Search over prompts is a distinct feature and risks a 200-line scope creep.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't
have to re-discover the architecture.

- New `scripts/generate-agent-prompts.ts` (under 200 lines). Reads every `.claude/agents/*.md` file via `readdirSync` + `readFileSync`; strips any leading YAML frontmatter if present; extracts the first 2000 characters of the body; captures the full byte-length; resolves the last-modified SHA via `child_process.execFileSync('git', ['log', '-1', '--format=%H', '--', filePath])` wrapped in a try/catch (if the child-process call fails because `.git` is not available in the CI runner's checkout mode, fall back to the current `HEAD` SHA from `git rev-parse HEAD` or finally to the string `"unresolved"` which the spec's hex-regex will reject so the local gate fails loudly). Writes `src/data/agentPrompts.ts` on success, `.broken` on validation failure, per the 2026-05-28 encoded-invariant lesson. Wired into the ticket 0032 generator chain so no `package.json` edit is needed.
- The emitted `src/data/agentPrompts.ts` IS committed (not gitignored) so typecheck and lint see a real typed import without needing the generator to run first.
- New `src/pages/AgentPrompts.tsx` (under 240 lines). Mirror the file structure of `src/pages/AgentFleet.tsx` (ticket 0090) verbatim: same imports, same section layout, same top-of-page dated header, same table rendering, same cross-link chips at the bottom. Every Tailwind color class carries its `dark:` variant. The excerpt `<pre>` block uses `whitespace-pre-wrap break-all` so a long prompt line does not horizontally overflow the mobile viewport. Add the `useRecordTrustPageVisit({ path: '/agent-prompts', label: 'Agent Prompts' })` call per the ticket 0104 pattern; add `'/agent-prompts': 'Agent Prompts'` to `src/data/trustPageLabels.ts` (`TRUST_PAGE_LABELS` + `TRUST_ROUTES` are derived from `Object.keys`).
- Per the 2026-09-12 code-beats-prose lesson, the implementer greps `.claude/agents/*.md` at branch head BEFORE locking the role map in the generator; the five-agent enumeration in the ticket prose is placeholder and the real set is whatever the branch head carries. If an agent has been added or renamed, mirror the real file list into the generator's role map.
- Per the 2026-05-25 mirror-source rule, the `AGENT_PROMPTS_CAVEAT` string in the data file is the same string rendered in the visible page body's introduction paragraph AND emitted into the CollectionPage JSON-LD `description` field AND set as the `meta[name="description"]` content. Do NOT hand-roll a second copy.
- Per the 2026-05-30 second-@type lesson, BEFORE writing code grep every `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates. Every predecessor CollectionPage block is URL-scoped per the ticket 0102 Implementation log; document the grep result in the Implementation log.
- Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the spec's em-dash assertion filters the block list to the two `@type`s THIS page emits before iterating; it does NOT loop over every `application/ld+json` script on the page. Separately, the page-body em-dash check scopes to the body text OUTSIDE the `<pre data-testid="agent-prompt-excerpt">` blocks because the excerpt is a byte-identical quote of the committed prompt file and the Hard NO applies to copy the agent writes (ticket prose, blog copy, page copy) not to copy the agent is quoting from version-controlled source material. Document this scoping decision inline in the spec.
- Per the 2026-09-05 route-code-splitting lesson, the new page's e2e helper waits for the RouteFallback to detach AND for the hero H1 to be visible before probing the DOM.
- Per the 2026-09-06 VISIBLE_LIMIT lesson, the row-count assertion in the spec uses `toHaveCount(AGENT_PROMPTS.length)` over the imported constant, NOT `count > 0`.
- Per the 2026-06-07 mirror-source-across-src-tests lesson, the spec imports `AGENT_PROMPTS_GENERATED_AT`, `AGENT_PROMPTS_CAVEAT`, `AGENT_PROMPTS` from `src/data/agentPrompts.ts` directly; do NOT hand-roll copies.
- Per the 2026-06-15 attribute-list regex lesson, any regex in the spec that matches self-closing tags in stringified JSON-LD uses `[^>]*`, not `[^/>]*`.
- Per the 2026-09-26 static-file MIME-shim lesson: NOT applicable here, no new static extension is introduced (the page is an SPA HTML route). Record "no new static extension shipped" in the Implementation log for auditability.
- `src/App.tsx` gains one `<Route path="/agent-prompts" element={<AgentPrompts />} />` after the existing `/agent-fleet` route, wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell and lazy-imported via `React.lazy(() => import('./pages/AgentPrompts'))`.
- `src/data/routes.ts` gains `/agent-prompts` after the existing `/agent-fleet` entry per the 2026-09-12 code-beats-prose convention (verify at branch head).
- `src/pages/Trust.tsx` gains one additive cross-link chip inside the existing trust-cluster section. The chip is additive and does not touch the shipped ticket 0018 JSON-LD.
- `src/pages/AgentFleet.tsx` gains one additive cross-link chip pointing at `/agent-prompts`. The chip is additive and does not touch the shipped ticket 0090 CollectionPage JSON-LD.
- `src/components/Footer.tsx` gains one additive trust-chip link next to the existing trust-family links per the ticket 0023 / 0097 / 0102 footer chip pattern.
- `src/data/trustPageLabels.ts` gains `'/agent-prompts': 'Agent Prompts'` so the ticket 0104 reviewed-trust-pages card picks it up automatically.
- `tests/e2e/agent-prompts-page.spec.ts` (new), one assertion per acceptance box, modeled on `tests/e2e/agent-fleet-page.spec.ts` (ticket 0090) and `tests/e2e/hallucination-safeguards.spec.ts` (ticket 0102).
- Per the 2026-05-22 two-PR ship lesson, ship needs a follow-up `chore/0109-ship-status` PR after the feat PR merges to flip the ticket frontmatter AND its `docs/backlog/README.md` index row to `shipped` together; run `node scripts/check-backlog.mjs` before pushing the second PR.
- New deps: NO. The generator uses `node:fs`, `node:child_process`, and hand-rolled parsing; the page reuses `react-router-dom`, `react-helmet-async`, `lucide-react`, and Tailwind utility classes already in use across the trust-artifact family. Schema migration: no. Privacy / security surface change: no (the page quotes publicly committed `.claude/agents/*.md` files; no new localStorage key, no new outbound network call from the running site). The `trust-chip` link to `/agent-prompts` and the new `TRUST_PAGE_LABELS` entry are additive per the ticket 0104 reviewed-trust-pages precedent.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-10-02 - branch `feat/0109-agent-prompts` opened off `origin/main` (0b5b1e2); frontmatter + docs/backlog/README.md row flipped to `in-progress` in the same commit per the 2026-05-22 check-backlog rule.
- 2026-10-02 - greped `.claude/agents/*.md` at branch head. Exactly five files present: `eng-dev.md`, `gtm-innovation.md`, `implementation-dev.md`, `review.md`, `validation.md`. Matches the ticket prose's five-agent enumeration byte-for-byte, so the generator's role map pins to the real set with no deviation (2026-09-12 code-beats-prose lesson honored).
- 2026-10-02 - greped every `tests/e2e/*.spec.ts` for `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates (2026-05-30 second-@type lesson). Every predecessor CollectionPage block is URL-scoped (0048 /compare, 0057 /case-studies, 0069 /subprocessors, 0071 /ai-for-hospitality, 0079 /blog, 0081 /security, 0088 /model-card, 0090 /agent-fleet, 0094 /ai-risks-we-watch, 0097 /accessibility-statement, 0102 /hallucination-safeguards, 0105 /data-retention, 0108 /roadmap, etc.) — none hard-asserts "exactly one CollectionPage site-wide," they all scope by URL via their own goto helper. A sibling CollectionPage scoped to `/agent-prompts` cannot collide. Same URL-scoping holds for every BreadcrumbList predicate.
- 2026-10-02 - no new static-file extension introduced (page is an SPA HTML route). 2026-09-26 MIME-shim lesson not applicable, recorded for auditability.
- 2026-10-02 - failing Playwright spec written at `tests/e2e/agent-prompts-page.spec.ts` importing `AGENT_PROMPTS`, `AGENT_PROMPTS_GENERATED_AT`, `AGENT_PROMPTS_CAVEAT`, `AGENT_PROMPTS_GITHUB_URL_TEMPLATE` from `src/data/agentPrompts.ts` (does not yet exist — failing-test-first).
- 2026-10-02 - em-dash scoping decision documented in-spec: the body-level em-dash assertion filters the DOM to text outside `<pre data-testid="agent-prompt-excerpt">` blocks because the excerpt is a byte-identical quote of the committed `.claude/agents/*.md` prompt files; the em-dash Hard NO (2026-05-07) applies to copy the agent writes, not to version-controlled source material being quoted. The JSON-LD em-dash assertion filters to the two blocks THIS page emits (CollectionPage, BreadcrumbList) per the 2026-09-08 em-dash-JSON-LD-block-filter lesson.
- 2026-10-02 - PR #N opened, CI [pending]
- 2026-10-02 - merged to main
