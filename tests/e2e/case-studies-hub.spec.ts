import { test, expect, type Page } from '@playwright/test';
import { ROUTES, IGNORABLE_ERROR_PATTERNS } from './routes';
import { caseStudies } from '../../src/data/caseStudies';

// Ticket 0057 - Public /case-studies index hub listing every detailed
// case study with CollectionPage + ItemList + BreadcrumbList JSON-LD.
// Each test maps 1:1 to an acceptance-criteria box on the ticket. Modeled
// on `tests/e2e/compare-hub.spec.ts` (ticket 0048, the closest peer for
// "hub page emitting CollectionPage + ItemList") and
// `tests/e2e/case-study-article-jsonld.spec.ts` (ticket 0054, the closest
// peer for "spec reads `caseStudies` from the shared data file").
//
// Per the 2026-05-30 second-@type lesson the implementer grepped every
// `tests/e2e/*-jsonld.spec.ts` AND the sibling hub spec
// `tests/e2e/compare-hub.spec.ts` for `=== 'CollectionPage'`,
// `=== 'ItemList'`, AND `=== 'BreadcrumbList'` predicates BEFORE
// writing code. CollectionPage: one predecessor in
// `compare-hub.spec.ts`, URL-scoped to `/compare` via `gotoCompareHub`.
// ItemList: predecessors in `compare-hub.spec.ts`, `demos-index-hub.spec.ts`,
// `changelog-itemlist-jsonld.spec.ts`, `demos-softwareapplication-jsonld.spec.ts`,
// `website-sitelinks-jsonld.spec.ts` - all URL-scoped to a route this
// PR does NOT touch. BreadcrumbList: many predecessors across `/compare/*`,
// `/ai-for-*`, `/quiz`, `/roi`, `/trust`, `/my`, `/case-studies/:slug`,
// `/locations/texas` - all URL-scoped to a different route from the hub.
// Zero predecessor predicates need widening. Recorded in the ticket
// Implementation log.
//
// Per the 2026-05-25 SEO Pilot lesson, `/case-studies` is NOT in the
// index.html SEO Pilot `pages` table. The spec asserts the LAST
// `meta[name="description"]` content directly (Helmet appends a second
// tag) instead of `page.toHaveTitle(...)`.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const HUB_URL = `${ORIGIN}/case-studies`;

async function gotoCaseStudiesHub(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/case-studies', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /case-studies').not.toBeNull();
  expect(response!.status(), `/case-studies returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
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

const STATIC_ROUTES = new Set(ROUTES);

// Box 1: navigates to /case-studies, status < 400, H1 contains "Case Studies".
test('renders /case-studies with an H1 that contains "Case Studies"', async ({ page }) => {
  const errors = await gotoCaseStudiesHub(page);

  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const h1Text = ((await h1.textContent()) ?? '').toLowerCase();
  expect(h1Text).toContain('case studies');

  expect(errors).toEqual([]);
});

// Box 2: one card per entry in `caseStudies` (each
// `data-testid="case-study-hub-card"`); the count equals
// caseStudies.length so a fourth entry auto-increments the assertion.
test('renders one card per caseStudies entry', async ({ page }) => {
  const errors = await gotoCaseStudiesHub(page);

  const cards = page.locator('[data-testid="case-study-hub-card"]');
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBe(caseStudies.length);

  expect(errors).toEqual([]);
});

// Box 3: every card link `href` matches a `/case-studies/<slug>` path
// present in ROUTES (the canonical allow-list per the 2026-06-07
// src-imports-tests lesson).
test('every card href resolves to a registered /case-studies/<slug> route', async ({ page }) => {
  const errors = await gotoCaseStudiesHub(page);

  const hrefs = await page
    .locator('[data-testid="case-study-hub-card"]')
    .evaluateAll((nodes) =>
      nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
    );
  expect(hrefs.length).toBe(caseStudies.length);

  const expected = new Set(caseStudies.map((c) => `/case-studies/${c.slug}`));
  for (const href of hrefs) {
    expect(href).toMatch(/^\/case-studies\/[a-z0-9-]+$/);
    expect(STATIC_ROUTES.has(href), `${href} not in ROUTES`).toBe(true);
    expect(expected.has(href), `${href} not in caseStudies`).toBe(true);
  }

  expect(errors).toEqual([]);
});

// Box 4: exactly one CollectionPage block exists on /case-studies with
// `name: 'Digital Craft AI Case Studies'`.
test('emits exactly one CollectionPage block with the expected name', async ({ page }) => {
  const errors = await gotoCaseStudiesHub(page);
  const blocks = await readJsonLdBlocks(page);

  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  expect(
    collections,
    'exactly one CollectionPage block expected on /case-studies',
  ).toHaveLength(1);

  const cp = collections[0].data;
  expect(cp['@context']).toBe('https://schema.org');
  expect(cp['@type']).toBe('CollectionPage');
  expect(cp.name).toBe('Digital Craft AI Case Studies');
  expect(typeof cp.description).toBe('string');
  expect((cp.description ?? '').length).toBeGreaterThan(20);
  expect(cp.url).toBe(HUB_URL);

  expect(errors).toEqual([]);
});

// Box 5: ItemList block has numberOfItems and itemListElement length both
// equal to caseStudies.length, and each ListItem url/name mirror the
// caseStudies entry.
test('emits exactly one ItemList block mirroring caseStudies with absolute URLs', async ({
  page,
}) => {
  const errors = await gotoCaseStudiesHub(page);
  const blocks = await readJsonLdBlocks(page);

  const lists = blocks.filter((b): b is { raw: string; data: ItemList } => isItemList(b.data));
  expect(lists, 'exactly one ItemList block expected on /case-studies').toHaveLength(1);

  const list = lists[0].data;
  expect(list.numberOfItems).toBe(caseStudies.length);
  const items = list.itemListElement ?? [];
  expect(items.length).toBe(caseStudies.length);

  for (let i = 0; i < caseStudies.length; i++) {
    const it = items[i];
    const entry = caseStudies[i];
    expect(it['@type']).toBe('ListItem');
    expect(it.position).toBe(i + 1);
    expect(it.name).toBe(entry.title);
    expect(it.url).toBe(`${ORIGIN}/case-studies/${entry.slug}`);
    expect((it.url ?? '').startsWith(`${ORIGIN}/`)).toBe(true);
  }

  expect(errors).toEqual([]);
});

// Box 6: BreadcrumbList second item names "Case Studies" and points to
// https://digitalcraftai.com/case-studies.
test('emits exactly one BreadcrumbList block whose second item is Case Studies', async ({
  page,
}) => {
  const errors = await gotoCaseStudiesHub(page);
  const blocks = await readJsonLdBlocks(page);

  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(
    breadcrumbs,
    'exactly one BreadcrumbList block expected on /case-studies',
  ).toHaveLength(1);

  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[0].item).toBe(ORIGIN);
  expect(items[1].name).toBe('Case Studies');
  expect(items[1].item).toBe(HUB_URL);

  expect(errors).toEqual([]);
});

// Box 7: page text and the three /case-studies-emitted JSON-LD blocks
// contain no U+2014 em-dash code point. Site-wide blocks injected from
// index.html are out of scope per the 2026-05-07 em-dash Hard NO scoping
// applied in the ticket 0048 sibling spec.
test('contains no U+2014 em-dash in body text or in the /case-studies-emitted JSON-LD', async ({
  page,
}) => {
  const errors = await gotoCaseStudiesHub(page);

  const visibleBody = await page.locator('body').innerText();
  expect(visibleBody, 'visible body contains an em-dash').not.toContain(EM_DASH);

  const blocks = await readJsonLdBlocks(page);
  const ours = blocks.filter(
    (b) => isBreadcrumb(b.data) || isCollectionPage(b.data) || isItemList(b.data),
  );
  expect(
    ours.length,
    '/case-studies must emit BreadcrumbList + CollectionPage + ItemList',
  ).toBe(3);
  for (const b of ours) {
    expect(b.raw, `/case-studies JSON-LD block contains em-dash: ${b.raw}`).not.toContain(
      EM_DASH,
    );
  }

  expect(errors).toEqual([]);
});

// Box 8: page renders in light AND dark mode on a 375px mobile viewport.
test('renders in light and dark mode on a 375px viewport', async ({ page }) => {
  const errors = await gotoCaseStudiesHub(page);

  // Light mode baseline.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const lightCount = await page.locator('[data-testid="case-study-hub-card"]').count();
  expect(lightCount).toBe(caseStudies.length);

  // Dark mode: toggle .dark on the root, the page still renders.
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const darkCount = await page.locator('[data-testid="case-study-hub-card"]').count();
  expect(darkCount).toBe(caseStudies.length);

  // 375px mobile viewport: heading and cards still render.
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.locator('[data-testid="case-study-hub-card"]').count()).toBe(
    caseStudies.length,
  );

  expect(errors).toEqual([]);
});

// Box 9: the LAST `meta[name="description"]` content (the Helmet-appended
// one per the 2026-05-25 Helmet-appends lesson) equals the
// CollectionPage.description field byte-for-byte (mirror-source guarantee
// per the 2026-05-25 lesson).
test('CollectionPage.description mirrors the Helmet meta[name="description"] byte-for-byte', async ({
  page,
}) => {
  const errors = await gotoCaseStudiesHub(page);

  await expect
    .poll(
      () =>
        page
          .locator('head meta[name="description"]')
          .evaluateAll((nodes) => nodes.map((n) => (n as HTMLMetaElement).content)),
      { timeout: 10_000 },
    )
    .toEqual(expect.arrayContaining([expect.stringMatching(/.+/)]));

  const descriptions = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) => nodes.map((n) => (n as HTMLMetaElement).content));
  const helmetDescription = descriptions[descriptions.length - 1];
  expect(typeof helmetDescription).toBe('string');
  expect(helmetDescription.length).toBeGreaterThan(20);
  expect(helmetDescription).not.toContain(EM_DASH);

  const blocks = await readJsonLdBlocks(page);
  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  expect(collections).toHaveLength(1);
  expect(collections[0].data.description).toBe(helmetDescription);

  expect(errors).toEqual([]);
});
