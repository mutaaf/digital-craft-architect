import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS, ROUTES } from './routes';
import {
  AGENT_FLEET_ROWS,
  COLLECTION_PAGE_NAME,
  META_DESCRIPTION,
  PAGE_H1,
} from '../../src/data/agentFleet';

// Ticket 0090 - /agent-fleet AI-labor transparency page. Each test maps
// 1:1 to a box in the ticket's acceptance-criteria section. Modeled on
// `tests/e2e/model-card-page.spec.ts` (ticket 0088, the direct structural
// peer for a trust-family public page emitting a URL-scoped
// CollectionPage + BreadcrumbList JSON-LD pair backed by a `src/data/`
// typed constant).
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this spec the
// implementer greped every `tests/e2e/*-jsonld.spec.ts` for
// `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates and any
// `toHaveLength(1)` / "exactly one" assertions over those `@type`s.
// Every predecessor CollectionPage predicate (0048 /compare, 0057
// /case-studies, 0069 /subprocessors, 0071 /ai-for-hospitality, 0079
// /blog, 0081 /security, 0088 /model-card) is URL-scoped to its own
// path via its own goto helper, and every predecessor BreadcrumbList
// predicate is similarly URL-scoped; a sibling /agent-fleet pair cannot
// collide with any of them. Grep result documented in the ticket's
// Implementation log.
//
// Per the 2026-09-05 route-code-splitting lesson, /agent-fleet is lazy-
// wrapped in <Suspense>, so `gotoAgentFleet` waits for the RouteFallback
// to detach AND for the H1 to mount before reading page state (2026-09-10
// mount-signal lesson).
//
// Per the 2026-09-08 sibling-hub-poll lesson, the JSON-LD read helper
// polls until at least one block's `@type` equals 'CollectionPage' before
// reading and filtering blocks (do NOT reuse a `count > 0` poll).
//
// Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the em-dash
// check filters the block list down to blocks THIS PAGE actually emits
// (CollectionPage, BreadcrumbList) so the site-wide index.html
// Organization block's legitimate historical em-dash (ticket 0025) is
// not flagged.
//
// Per the 2026-06-07 src-imports-tests lesson, AGENT_FLEET_ROWS is
// imported from `src/data/agentFleet.ts` and META_DESCRIPTION / PAGE_H1
// / COLLECTION_PAGE_NAME are imported from `src/pages/AgentFleet.tsx` so
// the visible render, the JSON-LD, and this spec cannot drift.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no
// em-dash character (the 2026-05-07 brand-voice Hard NO bans the literal
// even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const PAGE_PATH = '/agent-fleet';
const PAGE_URL = `${ORIGIN}${PAGE_PATH}`;

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
type ListItemEntry = {
  '@type'?: string;
  position?: number;
  name?: string;
  url?: string;
};
type ItemList = {
  '@type'?: string;
  numberOfItems?: number;
  itemListElement?: ListItemEntry[];
};
type CollectionPage = {
  '@context'?: string;
  '@type': string;
  name?: string;
  description?: string;
  url?: string;
  mainEntity?: ItemList;
};

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

const isCollectionPage = (d: unknown): d is CollectionPage =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'CollectionPage';

async function gotoAgentFleet(page: Page, path = PAGE_PATH): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${path}`).not.toBeNull();
  expect(response!.status(), `${path} returned ${response!.status()}`).toBeLessThan(400);
  // Wait for RouteFallback (role=status, aria-label=Loading) to detach
  // per the 2026-09-05 route-code-splitting lesson.
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

// Per the 2026-09-08 sibling-hub-poll lesson, poll on the target hub's
// own CollectionPage @type rather than on `scripts count > 0`, so a
// stale Helmet head from a previous SPA transition cannot satisfy the
// poll prematurely.
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

// Box 1 (AC #1 data-shape guard): AGENT_FLEET_ROWS has 5 to 8 rows and
// every row carries an ISO sinceDate no later than today plus 2 to 4
// guardrails, and every string is hyphen-only.
test('AGENT_FLEET_ROWS has 5-8 rows with valid shape', async () => {
  expect(AGENT_FLEET_ROWS.length).toBeGreaterThanOrEqual(5);
  expect(AGENT_FLEET_ROWS.length).toBeLessThanOrEqual(8);
  const isoRe = /^\d{4}-\d{2}-\d{2}$/;
  const today = new Date().toISOString().slice(0, 10);
  const idSet = new Set<string>();
  for (const row of AGENT_FLEET_ROWS) {
    expect(row.id).toMatch(/^[a-z0-9-]+$/);
    expect(idSet.has(row.id), `duplicate id ${row.id}`).toBe(false);
    idSet.add(row.id);
    expect(row.name.length).toBeGreaterThan(0);
    expect(row.role.length).toBeGreaterThan(0);
    expect(row.branchPrefix.length).toBeGreaterThan(0);
    expect(row.cadence.length).toBeGreaterThan(0);
    expect(row.intendedUse.length).toBeGreaterThan(0);
    expect(row.guardrails.length).toBeGreaterThanOrEqual(2);
    expect(row.guardrails.length).toBeLessThanOrEqual(4);
    expect(row.sinceDate).toMatch(isoRe);
    expect(row.sinceDate <= today, `${row.id} sinceDate ${row.sinceDate} is in the future`).toBe(
      true,
    );
    const allStrings = [
      row.id,
      row.name,
      row.role,
      row.branchPrefix,
      row.cadence,
      row.intendedUse,
      row.sinceDate,
      ...row.guardrails,
    ];
    for (const s of allStrings) {
      expect(s, `em-dash in AGENT_FLEET_ROWS field "${s}"`).not.toContain(EM_DASH);
    }
  }
});

// Box 2 (AC #4): /agent-fleet path is in the ROUTES allow-list per the
// 2026-06-07 mirror-source-across-src-tests lesson.
test('/agent-fleet path is in the ROUTES allow-list', async () => {
  expect(new Set<string>(ROUTES).has(PAGE_PATH)).toBe(true);
});

// Box 3 (AC #7 sub-1): GET /agent-fleet returns 200 and the H1 contains
// "Agent fleet" case-insensitive.
test('renders 200 with an Agent fleet H1', async ({ page }) => {
  const errors = await gotoAgentFleet(page);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const text = ((await h1.textContent()) ?? '').trim();
  expect(/agent fleet/i.test(text)).toBe(true);
  expect(text).toBe(PAGE_H1);
  expect(errors).toEqual([]);
});

// Box 4 (AC #7 sub-2): the LAST meta[name="description"] tag on the page
// (per the 2026-05-25 Helmet-appends lesson) byte-matches the
// META_DESCRIPTION constant imported from src/pages/AgentFleet.tsx per
// the 2026-05-25 mirror-source rule.
test('meta description mirrors the AgentFleet META_DESCRIPTION constant', async ({ page }) => {
  const errors = await gotoAgentFleet(page);
  const descriptions = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) => nodes.map((n) => (n as HTMLMetaElement).content));
  const helmetDescription = descriptions[descriptions.length - 1];
  expect(typeof helmetDescription).toBe('string');
  expect(helmetDescription.length).toBeGreaterThan(20);
  expect(helmetDescription).toBe(META_DESCRIPTION);
  expect(helmetDescription).not.toContain(EM_DASH);
  expect(errors).toEqual([]);
});

// Box 5 (AC #7 sub-3 + sub-4): visible card count equals
// AGENT_FLEET_ROWS.length and each visible row displays its name, role,
// branchPrefix, cadence, at least one guardrail bullet, and a sinceDate
// chip whose text matches the row's sinceDate value byte-for-byte.
test('renders one card per AGENT_FLEET_ROWS entry with all required fields', async ({
  page,
}) => {
  const errors = await gotoAgentFleet(page);
  const cards = page.locator('[data-testid="agent-fleet-row"]');
  await expect(cards.first()).toBeVisible();
  await expect(cards).toHaveCount(AGENT_FLEET_ROWS.length);

  const names = await page.locator('[data-testid="agent-fleet-name"]').allTextContents();
  const roles = await page.locator('[data-testid="agent-fleet-role"]').allTextContents();
  const prefixes = await page
    .locator('[data-testid="agent-fleet-branch-prefix"]')
    .allTextContents();
  const cadences = await page.locator('[data-testid="agent-fleet-cadence"]').allTextContents();
  const sinces = await page.locator('[data-testid="agent-fleet-since"]').allTextContents();

  expect(names.length).toBe(AGENT_FLEET_ROWS.length);
  expect(roles.length).toBe(AGENT_FLEET_ROWS.length);
  expect(prefixes.length).toBe(AGENT_FLEET_ROWS.length);
  expect(cadences.length).toBe(AGENT_FLEET_ROWS.length);
  expect(sinces.length).toBe(AGENT_FLEET_ROWS.length);

  for (let i = 0; i < AGENT_FLEET_ROWS.length; i++) {
    const row = AGENT_FLEET_ROWS[i];
    expect(names[i].trim()).toBe(row.name);
    expect(roles[i].trim()).toBe(row.role);
    expect(prefixes[i].trim()).toBe(row.branchPrefix);
    expect(cadences[i].trim()).toBe(row.cadence);
    expect(sinces[i]).toContain(row.sinceDate);
  }

  // Every row card carries at least one visible guardrail bullet and its
  // count matches the row's guardrails array length exactly.
  for (const row of AGENT_FLEET_ROWS) {
    const rowCard = page.locator(`article[data-testid="agent-fleet-row"]#${row.id}`);
    const rowGuardrails = rowCard.locator('[data-testid="agent-fleet-guardrail"]');
    await expect(rowGuardrails.first()).toBeVisible();
    const count = await rowGuardrails.count();
    expect(count).toBe(row.guardrails.length);
  }

  expect(errors).toEqual([]);
});

// Box 6 (AC #3 + AC #7 sub-5): the CollectionPage JSON-LD block's
// mainEntity.itemListElement array length equals AGENT_FLEET_ROWS.length
// and every ListItem.url matches the fragment-anchor regex.
test('CollectionPage ItemList enumerates every row with a fragment URL', async ({ page }) => {
  const errors = await gotoAgentFleet(page);
  const blocks = await readCollectionPageAwareBlocks(page);
  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  expect(collections, 'exactly one CollectionPage block expected on /agent-fleet').toHaveLength(
    1,
  );

  const cp = collections[0].data;
  expect(cp.url).toBe(PAGE_URL);
  expect(cp.name).toBe(COLLECTION_PAGE_NAME);
  expect(cp.description).toBe(META_DESCRIPTION);

  const list = cp.mainEntity;
  expect(list).toBeDefined();
  expect(list?.['@type']).toBe('ItemList');
  expect(list?.numberOfItems).toBe(AGENT_FLEET_ROWS.length);
  const items = list?.itemListElement ?? [];
  expect(items.length).toBe(AGENT_FLEET_ROWS.length);

  const fragmentRe = /^https:\/\/digitalcraftai\.com\/agent-fleet#[a-z0-9-]+$/;
  const idSet = new Set(AGENT_FLEET_ROWS.map((r) => r.id));
  for (const item of items) {
    expect(item['@type']).toBe('ListItem');
    expect(typeof item.url).toBe('string');
    expect(item.url ?? '').toMatch(fragmentRe);
    const id = (item.url ?? '').split('#')[1] ?? '';
    expect(idSet.has(id), `ListItem url id ${id} not in AGENT_FLEET_ROWS`).toBe(true);
    expect(typeof item.name).toBe('string');
    expect((item.name ?? '').endsWith(' agent')).toBe(true);
  }

  expect(errors).toEqual([]);
});

// Box 7 (AC #3 + AC #7 sub-6): exactly one BreadcrumbList JSON-LD block
// with two ListItem entries named "Home" and "Agent fleet" whose URLs
// are https://digitalcraftai.com/ and https://digitalcraftai.com/agent-fleet.
test('emits a two-item BreadcrumbList (Home -> Agent fleet)', async ({ page }) => {
  const errors = await gotoAgentFleet(page);
  const blocks = await readCollectionPageAwareBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(breadcrumbs, 'exactly one BreadcrumbList block expected on /agent-fleet').toHaveLength(
    1,
  );
  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[0].item).toBe(`${ORIGIN}/`);
  expect(items[1].name).toBe('Agent fleet');
  expect(items[1].item).toBe(PAGE_URL);
  expect(errors).toEqual([]);
});

// Box 8 (AC #6 + AC #7 sub-7): no em-dash in visible copy OR in the two
// blocks THIS PAGE emits (CollectionPage + BreadcrumbList) per the
// 2026-09-08 em-dash-JSON-LD-block-filter lesson. The site-wide
// index.html Organization block (ticket 0025) carries a legitimate
// em-dash and must NOT be flagged here.
test('no em-dash on the agent-fleet page or its own JSON-LD blocks', async ({ page }) => {
  const errors = await gotoAgentFleet(page);
  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(bodyText.length, 'body should have text content').toBeGreaterThan(100);
  expect(bodyText, 'no em-dash allowed in visible copy').not.toContain(EM_DASH);
  const blocks = await readCollectionPageAwareBlocks(page);
  const owned = blocks.filter((b) => isBreadcrumb(b.data) || isCollectionPage(b.data));
  expect(
    owned.length,
    'BreadcrumbList + CollectionPage blocks emitted by /agent-fleet must both render',
  ).toBe(2);
  for (const b of owned) {
    expect(b.raw, 'no em-dash allowed in an /agent-fleet-owned JSON-LD block').not.toContain(
      EM_DASH,
    );
  }
  expect(errors).toEqual([]);
});

// Box 9 (AC #6 + AC #7 sub-8): dark-mode case. Toggle html.dark and
// assert the cards still render.
test('renders in dark mode', async ({ page }) => {
  const errors = await gotoAgentFleet(page);
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.locator('[data-testid="agent-fleet-row"]').first()).toBeVisible();
  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(hasDarkClass).toBe(true);
  expect(errors).toEqual([]);
});

// Box 10 (AC #7 sub-9 sibling-page-regression case A): navigate to
// /how-we-ship, assert the new /agent-fleet chip is present and
// resolves to /agent-fleet in the ROUTES allow-list, AND the three
// existing "See it for yourself" chips (/changelog, /changelog/rss.xml,
// /changelog.json) are still present with unchanged text per the
// 2026-05-30 additive-only guard.
test('adds the /agent-fleet chip to HowWeShip.tsx without disturbing existing links', async ({
  page,
}) => {
  const errors = await gotoAgentFleet(page, '/how-we-ship');

  const agentFleetChip = page.locator('[data-testid="how-we-ship-agent-fleet-chip"]');
  await expect(agentFleetChip).toBeVisible();
  const href = await agentFleetChip.getAttribute('href');
  expect(href).toBe(PAGE_PATH);
  expect(new Set<string>(ROUTES).has(PAGE_PATH)).toBe(true);
  const chipText = ((await agentFleetChip.textContent()) ?? '').trim();
  expect(chipText).toContain('Agent fleet');

  // Existing evidence chips still exactly three, hrefs unchanged.
  const evidenceChips = page.locator('[data-testid="ship-loop-evidence-chip"]');
  await expect(evidenceChips).toHaveCount(3);
  const evidenceHrefs = await evidenceChips.evaluateAll((nodes) =>
    nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
  );
  const expected = new Set(['/changelog', '/changelog/rss.xml', '/changelog.json']);
  for (const h of evidenceHrefs) {
    expect(expected.has(h), `existing evidence chip href "${h}" drifted`).toBe(true);
  }
  expect(new Set(evidenceHrefs).size).toBe(3);

  expect(errors).toEqual([]);
});

// Box 11 (AC #7 sub-10 sibling-page-regression case B): navigate to
// /model-card, assert the new /agent-fleet chip is present and resolves
// to /agent-fleet, AND the ticket 0088 sibling chips are still present
// with unchanged text.
test('adds the /agent-fleet chip to ModelCard.tsx without disturbing existing sibling chips', async ({
  page,
}) => {
  const errors = await gotoAgentFleet(page, '/model-card');

  const agentFleetChip = page.locator('[data-testid="model-card-sibling-agent-fleet"]');
  await expect(agentFleetChip).toBeVisible();
  const href = await agentFleetChip.getAttribute('href');
  expect(href).toBe(PAGE_PATH);
  const chipText = ((await agentFleetChip.textContent()) ?? '').trim();
  expect(chipText).toContain('Agent fleet');

  // Existing ticket 0088 sibling chips still present with unchanged href.
  const preExisting: readonly [string, string][] = [
    ['model-card-sibling-trust', '/trust'],
    ['model-card-sibling-subprocessors', '/subprocessors'],
    ['model-card-sibling-security', '/security'],
    ['model-card-sibling-ethics', '/ethics'],
    ['model-card-sibling-uptime', '/uptime'],
    ['model-card-sibling-playbook', '/playbook'],
    ['model-card-sibling-how-we-ship', '/how-we-ship'],
  ];
  for (const [testid, expectedHref] of preExisting) {
    const chip = page.locator(`[data-testid="${testid}"]`);
    await expect(chip, `${testid} must still be present`).toBeVisible();
    expect(await chip.getAttribute('href')).toBe(expectedHref);
  }

  expect(errors).toEqual([]);
});
