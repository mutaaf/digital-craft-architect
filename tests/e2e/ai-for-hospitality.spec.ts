import { test, expect, type Page } from '@playwright/test';
import { ROUTES, IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0071 - Public /ai-for-hospitality multi-vertical hub indexing the
// five hospitality-adjacent verticals (events, restaurant, kidsplay, salon,
// fitness) with CollectionPage + ItemList + BreadcrumbList JSON-LD. Each
// test maps 1:1 to an acceptance-criteria box on the ticket. Modeled on
// tests/e2e/compare-hub.spec.ts (ticket 0048, the closest peer for
// "cross-family hub emitting CollectionPage + ItemList over a fixed grid")
// and tests/e2e/case-studies-hub.spec.ts (ticket 0057).
//
// Per the 2026-05-30 second-@type lesson the implementer grepped every
// tests/e2e/*-jsonld.spec.ts for `=== 'CollectionPage'`, `=== 'ItemList'`,
// and `=== 'BreadcrumbList'` predicates BEFORE writing code. All predecessor
// "exactly one" predicates are URL-scoped (compare-hub, case-studies-hub,
// subprocessors, demos-index-hub, changelog-itemlist-jsonld,
// demos-softwareapplication-jsonld, website-sitelinks-jsonld each open
// only their own route via a URL-scoped `gotoX` helper). No predecessor
// predicate is site-wide, so a new /ai-for-hospitality-scoped
// CollectionPage + ItemList block cannot collide. BreadcrumbList grep
// returned many matches, every one URL-scoped per ticket 0063. Recorded
// in the ticket Implementation log.
//
// Per the 2026-09-05 route-code-splitting lesson, /ai-for-hospitality is
// lazy-loaded (mirrors the adjacent /ai-for-small-business lazy import),
// so `gotoHospitality` waits for the RouteFallback spinner to detach
// before returning and every subsequent assertion uses auto-retrying
// `await expect(locator)...` helpers rather than one-shot `.count()` /
// `.textContent()` reads on unresolved DOM.
//
// Per the 2026-05-25 SEO Pilot lesson, /ai-for-hospitality is NOT in the
// index.html SEO Pilot `pages` table. The spec asserts the Helmet-managed
// LAST meta[name="description"] content directly instead of
// `page.toHaveTitle(...)`.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const HUB_URL = `${ORIGIN}/ai-for-hospitality`;

// The five hospitality-adjacent verticals this hub indexes. Kept in the
// spec (not imported from src) so a source rename fails the spec loudly
// rather than silently mirroring. The `path` + `demoPath` strings match
// the entries in src/data/routes.ts by construction; the spec asserts
// STATIC_ROUTES membership below.
const EXPECTED_VERTICALS = [
  { id: 'events', label: 'Events', path: '/events', demoPath: '/events/demo' },
  { id: 'restaurant', label: 'Restaurant', path: '/restaurant', demoPath: '/restaurant/demo' },
  { id: 'kidsplay', label: 'Kids-Play', path: '/kidsplay', demoPath: '/kidsplay/demo' },
  { id: 'salon', label: 'Salon', path: '/salon', demoPath: '/salon/demo' },
  { id: 'fitness', label: 'Fitness', path: '/fitness', demoPath: '/fitness/demo' },
] as const;

// The trust-artifact routes the "Why hospitality buyers pick Digital Craft"
// section links to. The implementer's chosen mapping is asserted as
// STATIC_ROUTES-registered; the ticket lets the implementer pick any three
// but every route in ROUTES today.
const TRUST_ROUTES = ['/trust', '/playbook', '/questions-to-ask-an-ai-vendor'] as const;

const STATIC_ROUTES = new Set(ROUTES);

async function gotoHospitality(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/ai-for-hospitality', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /ai-for-hospitality').not.toBeNull();
  expect(
    response!.status(),
    `/ai-for-hospitality returned ${response!.status()}`,
  ).toBeLessThan(400);
  // Per 2026-09-05 lesson: wait for the RouteFallback spinner to detach so
  // subsequent assertions don't measure the fallback markup.
  await page
    .locator('[role="status"][aria-label="Loading"]')
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .catch(() => undefined);
  await expect
    .poll(
      () => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(500);
  return errors;
}

async function readJsonLdBlocks(page: Page): Promise<{ raw: string; data: unknown }[]> {
  // Poll until Helmet has appended its JSON-LD scripts (they land after hydration).
  await expect
    .poll(
      () => page.$$eval('script[type="application/ld+json"]', (nodes) => nodes.length),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  return raws.map((raw) => ({ raw, data: JSON.parse(raw) as unknown }));
}

type ListItem = {
  '@type': string;
  position?: number;
  name?: string;
  url?: string;
};
type ItemList = {
  '@context'?: string;
  '@type': string;
  name?: string;
  description?: string;
  numberOfItems?: number;
  itemListOrder?: string;
  itemListElement?: ListItem[];
};
type CollectionPage = {
  '@context'?: string;
  '@type': string;
  name?: string;
  description?: string;
  url?: string;
  isPartOf?: { '@type'?: string; url?: string };
};
type BreadcrumbItem = { '@type': string; position?: number; name?: string; item?: string };
type Breadcrumb = {
  '@context'?: string;
  '@type': string;
  itemListElement?: BreadcrumbItem[];
};

const isItemList = (d: unknown): d is ItemList =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'ItemList';

const isCollectionPage = (d: unknown): d is CollectionPage =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'CollectionPage';

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

// Box 1: GET /ai-for-hospitality returns 200 and the H1 contains
// "Hospitality" (case-insensitive substring).
test('renders /ai-for-hospitality with an H1 containing "Hospitality"', async ({ page }) => {
  const errors = await gotoHospitality(page);

  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const h1Text = ((await h1.textContent()) ?? '').toLowerCase();
  expect(h1Text).toContain('hospitality');

  expect(errors).toEqual([]);
});

// Box 2: the grid contains exactly five `data-testid="hospitality-vertical-card"`
// cards; the count is fixed (2026-09-06 VISIBLE_LIMIT lesson: assert
// toHaveCount(5), never > 0 over a sliced source).
test('renders exactly five vertical cards', async ({ page }) => {
  const errors = await gotoHospitality(page);

  const cards = page.locator('[data-testid="hospitality-vertical-card"]');
  await expect(cards).toHaveCount(5);

  expect(errors).toEqual([]);
});

// Box 3: every `data-testid="hospitality-vertical-demo-link"` href resolves
// to a `<vertical>/demo` path present in ROUTES.
test('every demo-link href resolves to a registered <vertical>/demo route', async ({
  page,
}) => {
  const errors = await gotoHospitality(page);

  const demoLinks = page.locator('[data-testid="hospitality-vertical-demo-link"]');
  await expect(demoLinks).toHaveCount(5);
  const hrefs = await demoLinks.evaluateAll((nodes) =>
    nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
  );

  const expected = new Set(EXPECTED_VERTICALS.map((v) => v.demoPath));
  for (const href of hrefs) {
    expect(href, `${href} not in ROUTES`).toMatch(
      /^\/(events|restaurant|kidsplay|salon|fitness)\/demo$/,
    );
    expect(STATIC_ROUTES.has(href), `${href} not in ROUTES`).toBe(true);
    expect(expected.has(href), `${href} not one of the five hospitality demoPaths`).toBe(true);
  }

  expect(errors).toEqual([]);
});

// Box 4: every `data-testid="hospitality-vertical-page-link"` href resolves
// to a `<vertical>` path present in ROUTES.
test('every page-link href resolves to a registered <vertical> route', async ({ page }) => {
  const errors = await gotoHospitality(page);

  const pageLinks = page.locator('[data-testid="hospitality-vertical-page-link"]');
  await expect(pageLinks).toHaveCount(5);
  const hrefs = await pageLinks.evaluateAll((nodes) =>
    nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
  );

  const expected = new Set(EXPECTED_VERTICALS.map((v) => v.path));
  for (const href of hrefs) {
    expect(href, `${href} not in ROUTES`).toMatch(
      /^\/(events|restaurant|kidsplay|salon|fitness)$/,
    );
    expect(STATIC_ROUTES.has(href), `${href} not in ROUTES`).toBe(true);
    expect(expected.has(href), `${href} not one of the five hospitality paths`).toBe(true);
  }

  expect(errors).toEqual([]);
});

// Box 5: the "N live demos" chip per card renders a numeric value matching
// the computed demoCount from ROUTES for that vertical's demoPath prefix
// (2026-09-06 lesson: compute from ROUTES at test time so future demo
// additions absorb automatically).
test('each card renders the correct "N live demos" chip derived from ROUTES', async ({
  page,
}) => {
  const errors = await gotoHospitality(page);

  const cards = page.locator('[data-testid="hospitality-vertical-card"]');
  await expect(cards).toHaveCount(5);

  const expectedByPath = new Map<string, number>();
  for (const v of EXPECTED_VERTICALS) {
    const count = ROUTES.filter((r) => r.startsWith(v.demoPath + '/')).length;
    expectedByPath.set(v.demoPath, count);
  }

  // Walk each card, read its demo-link href to identify the vertical, then
  // assert the card body contains "<count> live demo" (matches both "1 live
  // demo" and "N live demos").
  for (let i = 0; i < 5; i++) {
    const card = cards.nth(i);
    const href = await card
      .locator('[data-testid="hospitality-vertical-demo-link"]')
      .getAttribute('href');
    expect(href).not.toBeNull();
    const expectedCount = expectedByPath.get(href ?? '');
    expect(expectedCount, `no expected count for demoPath ${href}`).toBeDefined();
    const text = ((await card.textContent()) ?? '').toLowerCase();
    expect(
      text,
      `card for ${href} missing "${expectedCount} live demo" chip; got: ${text}`,
    ).toContain(`${expectedCount} live demo`);
  }

  expect(errors).toEqual([]);
});

// Box 6: the CollectionPage JSON-LD block carries the expected name and URL.
test('emits exactly one CollectionPage block with the expected name and url', async ({
  page,
}) => {
  const errors = await gotoHospitality(page);
  const blocks = await readJsonLdBlocks(page);

  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  expect(
    collections,
    'exactly one CollectionPage block expected on /ai-for-hospitality',
  ).toHaveLength(1);

  const cp = collections[0].data;
  expect(cp['@context']).toBe('https://schema.org');
  expect(cp['@type']).toBe('CollectionPage');
  expect(cp.name).toBe('AI for Hospitality Businesses');
  expect(typeof cp.description).toBe('string');
  expect((cp.description ?? '').length).toBeGreaterThan(20);
  expect(cp.url).toBe(HUB_URL);

  expect(errors).toEqual([]);
});

// Box 7: the ItemList JSON-LD block has numberOfItems === 5,
// itemListElement.length === 5, and each element's url matches the
// hospitality demoPath pattern.
test('emits exactly one ItemList block with five hospitality demoPath entries', async ({
  page,
}) => {
  const errors = await gotoHospitality(page);
  const blocks = await readJsonLdBlocks(page);

  const lists = blocks.filter((b): b is { raw: string; data: ItemList } => isItemList(b.data));
  expect(lists, 'exactly one ItemList block expected on /ai-for-hospitality').toHaveLength(1);

  const list = lists[0].data;
  expect(list['@type']).toBe('ItemList');
  expect(list.numberOfItems).toBe(5);
  const items = list.itemListElement ?? [];
  expect(items.length).toBe(5);

  const demoUrlRe = /^https:\/\/digitalcraftai\.com\/(events|restaurant|kidsplay|salon|fitness)\/demo$/;
  for (let i = 0; i < 5; i++) {
    const it = items[i];
    expect(it['@type']).toBe('ListItem');
    expect(it.position).toBe(i + 1);
    expect(typeof it.name).toBe('string');
    expect((it.name ?? '').length).toBeGreaterThan(0);
    expect(it.url).toMatch(demoUrlRe);
  }

  expect(errors).toEqual([]);
});

// Box 8: the BreadcrumbList JSON-LD has two items with the second one
// matching the page H1 substring and linking to HUB_URL.
test('emits exactly one BreadcrumbList block whose second item names Hospitality', async ({
  page,
}) => {
  const errors = await gotoHospitality(page);
  const blocks = await readJsonLdBlocks(page);

  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(
    breadcrumbs,
    'exactly one BreadcrumbList block expected on /ai-for-hospitality',
  ).toHaveLength(1);

  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[0].item).toBe(ORIGIN);
  expect((items[1].name ?? '').toLowerCase()).toContain('hospitality');
  expect(items[1].item).toBe(HUB_URL);

  expect(errors).toEqual([]);
});

// Box 9: the "Why hospitality buyers pick Digital Craft" section links
// resolve to routes in ROUTES.
test('trust-artifact links resolve to registered routes', async ({ page }) => {
  const errors = await gotoHospitality(page);

  const hrefs = await page.$$eval('a[href]', (nodes) =>
    nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
  );

  for (const route of TRUST_ROUTES) {
    expect(hrefs, `hub must link to ${route}`).toContain(route);
    expect(STATIC_ROUTES.has(route), `${route} not in ROUTES`).toBe(true);
  }

  expect(errors).toEqual([]);
});

// Box 10: no U+2014 em-dash in body text or in any of the three
// /ai-for-hospitality-emitted JSON-LD blocks. Per the 2026-09-08 lesson,
// filter blocks down to the @types this page owns before iterating so a
// legitimate em-dash in the site-wide homepage Organization block cannot
// trip this assertion.
test('contains no U+2014 em-dash in body text or in the /ai-for-hospitality JSON-LD', async ({
  page,
}) => {
  const errors = await gotoHospitality(page);

  const visibleBody = await page.locator('body').innerText();
  expect(visibleBody, 'visible body contains an em-dash').not.toContain(EM_DASH);

  const blocks = await readJsonLdBlocks(page);
  const ours = blocks.filter(
    (b) => isBreadcrumb(b.data) || isCollectionPage(b.data) || isItemList(b.data),
  );
  expect(
    ours.length,
    '/ai-for-hospitality must emit BreadcrumbList + CollectionPage + ItemList',
  ).toBe(3);
  for (const b of ours) {
    expect(
      b.raw,
      `/ai-for-hospitality JSON-LD block contains em-dash: ${b.raw}`,
    ).not.toContain(EM_DASH);
  }

  expect(errors).toEqual([]);
});

// Box 11: dark-mode case applies document.documentElement.classList.add('dark')
// and asserts the card grid still renders on a 375px viewport.
test('renders in light and dark mode on a 375px viewport', async ({ page }) => {
  const errors = await gotoHospitality(page);

  const cards = page.locator('[data-testid="hospitality-vertical-card"]');
  await expect(cards).toHaveCount(5);

  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(cards).toHaveCount(5);

  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(cards).toHaveCount(5);

  expect(errors).toEqual([]);
});

// Box 12: sibling-hub regression - navigate to /compare and /case-studies
// and re-run one key CollectionPage `name` and ItemList `numberOfItems`
// assertion per hub to prove the new hub did not silently widen a
// predecessor's site-wide predicate. Poll for the sibling-specific
// CollectionPage.name so we don't race Helmet's per-route swap.
async function assertHubEmits(
  page: Page,
  path: string,
  expectedCpName: string,
): Promise<void> {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${path}`).not.toBeNull();
  expect(response!.status(), `${path} returned ${response!.status()}`).toBeLessThan(400);
  await page
    .locator('[role="status"][aria-label="Loading"]')
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .catch(() => undefined);
  // Poll until Helmet has swapped in the sibling's CollectionPage block.
  await expect
    .poll(
      async () => {
        const names = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
          nodes
            .map((n) => {
              try {
                const d = JSON.parse(n.textContent ?? '') as { '@type'?: string; name?: string };
                return d['@type'] === 'CollectionPage' ? (d.name ?? '') : '';
              } catch {
                return '';
              }
            })
            .filter(Boolean),
        );
        return names;
      },
      { timeout: 10_000 },
    )
    .toContain(expectedCpName);

  const blocks = await readJsonLdBlocks(page);
  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  const withName = collections.filter((c) => c.data.name === expectedCpName);
  expect(withName, `${path} must still emit its CollectionPage block`).toHaveLength(1);
  const lists = blocks.filter((b): b is { raw: string; data: ItemList } =>
    isItemList(b.data),
  );
  expect(lists.length, `${path} must still emit an ItemList block`).toBeGreaterThanOrEqual(1);
  expect((lists[0].data.numberOfItems ?? 0)).toBeGreaterThan(0);
}

test('sibling-hub regression: /compare and /case-studies CollectionPage + ItemList still emit correctly', async ({
  page,
}) => {
  await assertHubEmits(page, '/compare', 'Digital Craft Comparisons');
  await assertHubEmits(page, '/case-studies', 'Digital Craft AI Case Studies');
});
