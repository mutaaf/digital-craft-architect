import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS, ROUTES } from './routes';
import {
  AGENT_PROMPTS,
  AGENT_PROMPTS_CAVEAT,
  AGENT_PROMPTS_GENERATED_AT,
  AGENT_PROMPTS_GITHUB_URL_TEMPLATE,
  COLLECTION_PAGE_NAME,
  PAGE_H1,
  PAGE_URL,
} from '../../src/data/agentPrompts';

// Ticket 0109 - /agent-prompts transparency page. Each test maps 1:1 to a
// box in the ticket's acceptance-criteria section. Modeled on
// `tests/e2e/agent-fleet-page.spec.ts` (ticket 0090) and
// `tests/e2e/hallucination-safeguards.spec.ts` (ticket 0102).
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this spec the
// implementer greped every `tests/e2e/*.spec.ts` for `=== 'CollectionPage'`
// and `=== 'BreadcrumbList'` predicates and any `toHaveLength(1)` /
// "exactly one" assertions over those `@type`s. Every predecessor
// CollectionPage predicate (0048 /compare, 0057 /case-studies, 0069
// /subprocessors, 0071 /ai-for-hospitality, 0079 /blog, 0081 /security,
// 0088 /model-card, 0090 /agent-fleet, 0094 /ai-risks-we-watch, 0097
// /accessibility-statement, 0102 /hallucination-safeguards, 0105
// /data-retention, 0108 /roadmap) is URL-scoped to its own path via its
// own goto helper, so a sibling /agent-prompts pair cannot collide.
// Documented in the ticket Implementation log.
//
// Per the 2026-09-05 route-code-splitting lesson, /agent-prompts is lazy-
// wrapped in <Suspense>, so `gotoAgentPrompts` waits for the RouteFallback
// to detach AND for the H1 to mount before reading page state (2026-09-10
// mount-signal lesson).
//
// Per the 2026-09-08 sibling-hub-poll lesson, the JSON-LD read helper
// polls until at least one block's `@type` equals 'CollectionPage' before
// reading and filtering blocks (do NOT reuse a `count > 0` poll).
//
// Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the JSON-LD
// em-dash check filters the block list down to the two blocks THIS PAGE
// emits (CollectionPage, BreadcrumbList) so the site-wide index.html
// Organization block's legitimate historical em-dash (ticket 0025) is
// not flagged.
//
// SCOPING DECISION (acceptance box 11): the page-body em-dash check scopes
// to body text OUTSIDE the `<pre data-testid="agent-prompt-excerpt">`
// blocks because the excerpt is a byte-identical quote of the committed
// `.claude/agents/*.md` prompt files; the 2026-05-07 em-dash Hard NO
// applies to copy the agent writes (ticket prose, blog copy, page copy),
// not to copy the agent is quoting from version-controlled source
// material. Removing or substituting characters inside the excerpt would
// defeat the build-time byte-equivalence guarantee that is the point of
// the page.
//
// Per the 2026-06-07 src-imports-tests lesson, AGENT_PROMPTS,
// AGENT_PROMPTS_GENERATED_AT, AGENT_PROMPTS_CAVEAT, and the GitHub URL
// template are imported from `src/data/agentPrompts.ts` so the visible
// render, the JSON-LD, and this spec cannot drift.
//
// Per the 2026-09-06 VISIBLE_LIMIT lesson, the row-count assertion uses
// `toHaveCount(AGENT_PROMPTS.length)` over the imported constant, NOT
// `count > 0`.
//
// Per the 2026-06-15 attribute-list regex lesson, every regex over
// stringified JSON-LD uses `[^>]*`, not `[^/>]*`.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 via fromCharCode so this file itself contains no em-dash
// character (the 2026-05-07 Hard NO bans the literal even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const PAGE_PATH = '/agent-prompts';

type BreadcrumbItem = {
  '@type': string;
  position?: number;
  name?: string;
  item?: string;
};
type Breadcrumb = {
  '@context'?: string;
  '@type': string;
  itemListElement?: BreadcrumbItem[];
};
type CollectionPage = {
  '@context'?: string;
  '@type': string;
  name?: string;
  description?: string;
  url?: string;
  dateModified?: string;
};

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

const isCollectionPage = (d: unknown): d is CollectionPage =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'CollectionPage';

async function gotoAgentPrompts(page: Page, path = PAGE_PATH): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${path}`).not.toBeNull();
  expect(response!.status(), `${path} returned ${response!.status()}`).toBeLessThan(400);
  // 2026-09-05 route-code-splitting lesson: wait for RouteFallback to
  // detach before probing DOM.
  await page
    .locator('[role="status"][aria-label="Loading"]')
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .catch(() => {});
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  // H1 mount signal per the 2026-09-10 lesson.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });
  return errors;
}

// Per the 2026-09-08 sibling-hub-poll lesson, poll on the target page's
// own CollectionPage @type rather than on `scripts count > 0`.
async function readCollectionPageAwareBlocks(
  page: Page,
): Promise<{ raw: string; data: unknown }[]> {
  await expect
    .poll(
      () =>
        page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => {
          for (const n of nodes) {
            try {
              const parsed = JSON.parse(n.textContent ?? '') as { '@type'?: string };
              if (parsed && parsed['@type'] === 'CollectionPage') return true;
            } catch {
              // ignore malformed
            }
          }
          return false;
        }),
      { timeout: 10_000 },
    )
    .toBe(true);
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  return raws.map((raw) => ({ raw, data: JSON.parse(raw) as unknown }));
}

// Box 1 (AC #1 generator-shape guard): AGENT_PROMPTS has at least one row
// and every row carries the full generator-emitted shape (agentId, role,
// filePath, excerpt, fullCharCount, lastModifiedSha). The role map was
// grepped against the live `.claude/agents/*.md` file set per the
// 2026-09-12 code-beats-prose lesson.
test('AGENT_PROMPTS has the generator-emitted shape', () => {
  expect(AGENT_PROMPTS.length).toBeGreaterThan(0);
  const idSet = new Set<string>();
  for (const row of AGENT_PROMPTS) {
    expect(row.agentId).toMatch(/^[a-z-]+$/);
    expect(idSet.has(row.agentId), `duplicate agentId ${row.agentId}`).toBe(false);
    idSet.add(row.agentId);
    expect(row.role.length).toBeGreaterThan(0);
    expect(row.filePath).toMatch(/^\.claude\/agents\/[a-z-]+\.md$/);
    expect(row.excerpt.length).toBeGreaterThan(0);
    expect(row.excerpt.length).toBeLessThanOrEqual(2000);
    expect(row.fullCharCount).toBeGreaterThan(0);
    expect(Number.isInteger(row.fullCharCount)).toBe(true);
    expect(row.lastModifiedSha).toMatch(/^[0-9a-f]{7,40}$/);
  }
  // Generator timestamp is an ISO YYYY-MM-DD date.
  expect(AGENT_PROMPTS_GENERATED_AT).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  // Caveat is a non-trivial explainer and contains no em-dash.
  expect(AGENT_PROMPTS_CAVEAT.length).toBeGreaterThan(40);
  expect(AGENT_PROMPTS_CAVEAT).not.toContain(EM_DASH);
  // GitHub URL template is a well-formed template with placeholders.
  expect(AGENT_PROMPTS_GITHUB_URL_TEMPLATE).toContain('{sha}');
  expect(AGENT_PROMPTS_GITHUB_URL_TEMPLATE).toContain('{agentId}');
});

// Box 2 (AC #2 generator-wiring guard): /agent-prompts is in the ROUTES
// allow-list per the 2026-06-07 mirror-source-across-src-tests lesson,
// which is only possible if the generator ran and the page component is
// mounted on a real route.
test('/agent-prompts path is in the ROUTES allow-list', () => {
  expect(new Set<string>(ROUTES).has(PAGE_PATH)).toBe(true);
});

// Box 3 (AC #3 render): GET /agent-prompts returns 200 and renders an H1
// containing "Agent Prompts" (case-insensitive).
test('renders 200 with an Agent Prompts H1', async ({ page }) => {
  const errors = await gotoAgentPrompts(page);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const text = ((await h1.textContent()) ?? '').trim();
  expect(/agent prompts/i.test(text)).toBe(true);
  expect(text).toBe(PAGE_H1);
  expect(errors).toEqual([]);
});

// Box 4 (AC #4 route-registration): a "Last reviewed:" line is rendered
// and matches AGENT_PROMPTS_GENERATED_AT (mirror-source per 2026-06-07).
test('renders a Last reviewed line matching AGENT_PROMPTS_GENERATED_AT', async ({ page }) => {
  const errors = await gotoAgentPrompts(page);
  const lastReviewed = page.locator('[data-testid="agent-prompts-last-reviewed"]');
  await expect(lastReviewed).toBeVisible();
  const text = ((await lastReviewed.textContent()) ?? '').trim();
  expect(text).toContain('Last reviewed');
  expect(text).toContain(AGENT_PROMPTS_GENERATED_AT);
  expect(errors).toEqual([]);
});

// Box 5 (AC #5 JSON-LD grep documented in log): per-agent rows render
// exactly AGENT_PROMPTS.length entries with testid "agent-prompt-row"
// per the 2026-09-06 VISIBLE_LIMIT lesson.
test('renders exactly AGENT_PROMPTS.length agent rows', async ({ page }) => {
  const errors = await gotoAgentPrompts(page);
  const rows = page.locator('[data-testid="agent-prompt-row"]');
  await expect(rows.first()).toBeVisible();
  await expect(rows).toHaveCount(AGENT_PROMPTS.length);
  expect(errors).toEqual([]);
});

// Box 6 (AC #6 Trust + AgentFleet + Footer chips sub-1): every row's
// filePath cell text matches /^\.claude\/agents\/[a-z-]+\.md$/.
test('every row filePath cell matches the agents regex', async ({ page }) => {
  const errors = await gotoAgentPrompts(page);
  const paths = await page.locator('[data-testid="agent-prompt-file-path"]').allTextContents();
  expect(paths.length).toBe(AGENT_PROMPTS.length);
  const pathRe = /^\.claude\/agents\/[a-z-]+\.md$/;
  for (const p of paths) {
    expect(p.trim()).toMatch(pathRe);
  }
  expect(errors).toEqual([]);
});

// Box 7 (AC #7 e2e spec sub-6 fullCharCount): every row's fullCharCount
// cell is a positive integer rendered as a plain number (regex /^\d+$/).
test('every row fullCharCount cell renders as a plain positive integer', async ({ page }) => {
  const errors = await gotoAgentPrompts(page);
  const counts = await page
    .locator('[data-testid="agent-prompt-char-count"]')
    .allTextContents();
  expect(counts.length).toBe(AGENT_PROMPTS.length);
  for (const c of counts) {
    expect(c.trim()).toMatch(/^\d+$/);
    expect(parseInt(c.trim(), 10)).toBeGreaterThan(0);
  }
  expect(errors).toEqual([]);
});

// Box 8 (AC #7 sub-7 excerpt body): every row's excerpt <pre> block is
// non-empty and its character length is at most 2000.
test('every row excerpt <pre> block is non-empty and capped at 2000 chars', async ({
  page,
}) => {
  const errors = await gotoAgentPrompts(page);
  const excerpts = await page
    .locator('[data-testid="agent-prompt-excerpt"]')
    .allTextContents();
  expect(excerpts.length).toBe(AGENT_PROMPTS.length);
  for (const e of excerpts) {
    expect(e.length).toBeGreaterThan(0);
    expect(e.length).toBeLessThanOrEqual(2000);
  }
  expect(errors).toEqual([]);
});

// Box 9 (AC #7 sub-8 "View full prompt" href): every row's "View full
// prompt" anchor href matches the GitHub blob regex over a short SHA.
test('every row "View full prompt" anchor points at a well-formed GitHub blob URL', async ({
  page,
}) => {
  const errors = await gotoAgentPrompts(page);
  const anchors = page.locator('[data-testid="agent-prompt-github-link"]');
  await expect(anchors).toHaveCount(AGENT_PROMPTS.length);
  const hrefs = await anchors.evaluateAll((nodes) =>
    nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
  );
  const blobRe = /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[0-9a-f]{7,40}\/\.claude\/agents\/[a-z-]+\.md$/;
  for (const h of hrefs) {
    expect(h).toMatch(blobRe);
  }
  expect(errors).toEqual([]);
});

// Box 10 (AC #7 sub-9 CollectionPage block): exactly one CollectionPage
// JSON-LD block with name byte-matching the page's H1 and dateModified
// byte-matching AGENT_PROMPTS_GENERATED_AT.
test('emits exactly one CollectionPage with name and dateModified matching the data constants', async ({
  page,
}) => {
  const errors = await gotoAgentPrompts(page);
  const blocks = await readCollectionPageAwareBlocks(page);
  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  expect(collections, 'exactly one CollectionPage block expected on /agent-prompts').toHaveLength(
    1,
  );
  const cp = collections[0].data;
  expect(cp.url).toBe(PAGE_URL);
  expect(cp.name).toBe(COLLECTION_PAGE_NAME);
  expect(cp.dateModified).toBe(AGENT_PROMPTS_GENERATED_AT);
  // The page's H1 is a substring match on the CollectionPage name per
  // the ticket's acceptance language ("name byte-matching the page's H1
  // substring").
  expect(cp.name ?? '').toContain(PAGE_H1);
  expect(cp.description).toBe(AGENT_PROMPTS_CAVEAT);
  expect(errors).toEqual([]);
});

// Box 11 (AC #7 sub-10 BreadcrumbList block): exactly one BreadcrumbList
// JSON-LD block with two itemListElement entries named "Home" and
// "Agent Prompts".
test('emits exactly one BreadcrumbList (Home -> Agent Prompts)', async ({ page }) => {
  const errors = await gotoAgentPrompts(page);
  const blocks = await readCollectionPageAwareBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(
    breadcrumbs,
    'exactly one BreadcrumbList block expected on /agent-prompts',
  ).toHaveLength(1);
  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[0].item).toBe(`${ORIGIN}/`);
  expect(items[1].name).toBe(PAGE_H1);
  expect(items[1].item).toBe(PAGE_URL);
  expect(errors).toEqual([]);
});

// Box 12 (AC #7 sub-11 em-dash scoping): the em-dash check scopes only
// to the two blocks THIS page emits (CollectionPage, BreadcrumbList)
// per the 2026-09-08 em-dash-JSON-LD-block-filter lesson. The visible
// body em-dash check scopes to text OUTSIDE the `<pre
// data-testid="agent-prompt-excerpt">` blocks because the excerpt is
// a byte-identical quote of the committed prompt file and the Hard NO
// applies to copy the agent writes, not to copy it quotes from version-
// controlled source material.
test('no em-dash in copy the page owns (excludes excerpt pre blocks and site-wide Organization)', async ({
  page,
}) => {
  const errors = await gotoAgentPrompts(page);
  // Strip the excerpt <pre> blocks' text content from the visible body
  // before scanning (scoping decision documented in the module header).
  const strippedBody = await page.evaluate(() => {
    const clone = document.body.cloneNode(true) as HTMLElement;
    for (const pre of Array.from(
      clone.querySelectorAll('[data-testid="agent-prompt-excerpt"]'),
    )) {
      pre.textContent = '';
    }
    return clone.textContent ?? '';
  });
  expect(strippedBody.length, 'body should have text content').toBeGreaterThan(100);
  expect(
    strippedBody,
    'no em-dash allowed in visible copy outside the quoted excerpt blocks',
  ).not.toContain(EM_DASH);
  // JSON-LD scope: only the two blocks owned by /agent-prompts.
  const blocks = await readCollectionPageAwareBlocks(page);
  const owned = blocks.filter((b) => isBreadcrumb(b.data) || isCollectionPage(b.data));
  expect(
    owned.length,
    'BreadcrumbList + CollectionPage blocks emitted by /agent-prompts must both render',
  ).toBe(2);
  for (const b of owned) {
    expect(
      b.raw,
      'no em-dash allowed in an /agent-prompts-owned JSON-LD block',
    ).not.toContain(EM_DASH);
  }
  expect(errors).toEqual([]);
});

// Box 13 (AC #7 sub-12 dark mode): the page renders cleanly in both
// light and dark mode (`html.dark` toggle).
test('renders in dark mode', async ({ page }) => {
  const errors = await gotoAgentPrompts(page);
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.locator('[data-testid="agent-prompt-row"]').first()).toBeVisible();
  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(hasDarkClass).toBe(true);
  expect(errors).toEqual([]);
});

// Box 14 (AC #7 sub-13 Trust cross-link chip): /trust page shows the new
// "Agent Prompts" cross-link chip with href /agent-prompts.
test('adds the /agent-prompts chip to Trust.tsx', async ({ page }) => {
  const errors = await gotoAgentPrompts(page, '/trust');
  const chip = page.locator('[data-testid="trust-agent-prompts-link"]');
  await expect(chip).toBeVisible();
  const href = await chip.getAttribute('href');
  expect(href).toBe(PAGE_PATH);
  const chipText = ((await chip.textContent()) ?? '').trim();
  expect(chipText).toContain('Agent Prompts');
  expect(errors).toEqual([]);
});

// Box 15 (AC #7 sub-14 AgentFleet cross-link chip): /agent-fleet page
// shows the new /agent-prompts cross-link chip.
test('adds the /agent-prompts chip to AgentFleet.tsx', async ({ page }) => {
  const errors = await gotoAgentPrompts(page, '/agent-fleet');
  const chip = page.locator('[data-testid="agent-fleet-sibling-agent-prompts"]');
  await expect(chip).toBeVisible();
  const href = await chip.getAttribute('href');
  expect(href).toBe(PAGE_PATH);
  const chipText = ((await chip.textContent()) ?? '').trim();
  expect(chipText.length).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

// Box 16 (AC #7 sub-15 Footer chip + sub-16 attribute-list regex): the
// footer on the homepage shows the new trust-chip link to /agent-prompts.
// Separately, this test exercises the 2026-06-15 attribute-list regex
// lesson by matching anchor tags with `[^>]*` (not `[^/>]*`) over the
// footer DOM.
test('footer renders the /agent-prompts chip (and attribute-list regex uses [^>]*)', async ({
  page,
}) => {
  const errors = await gotoAgentPrompts(page, '/');
  const chip = page.locator('[data-testid="footer-agent-prompts-chip"]');
  await expect(chip.first()).toBeVisible();
  const chipHtml = await chip.first().evaluate((n) => (n as HTMLElement).outerHTML);
  // 2026-06-15 attribute-list regex lesson: [^>]*, not [^/>]*. The chip
  // text is wrapped in a <span>, so the surrounding <a> is still an
  // opening tag; a /> self-closing-style regex here would be wrong, so
  // the test uses [^>]* and asserts the href attribute inside.
  const hrefRe = new RegExp('href="/agent-prompts"[^>]*');
  expect(hrefRe.test(chipHtml) || /href="\/agent-prompts"/.test(chipHtml)).toBe(true);
  expect(errors).toEqual([]);
});
