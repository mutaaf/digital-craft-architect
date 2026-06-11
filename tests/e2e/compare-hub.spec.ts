import { test, expect, type Page } from '@playwright/test';
import { ROUTES, IGNORABLE_ERROR_PATTERNS } from './routes';
import { COMPARE_ENTRIES } from '../../src/data/compareEntries';

// Ticket 0048 - Public /compare hub indexing every comparison page with
// CollectionPage and ItemList JSON-LD. Each test maps 1:1 to an acceptance-
// criteria box on the ticket. Modeled on `demos-index-hub.spec.ts` (ticket
// 0011, the closest peer for "hub page listing routes with ItemList JSON-LD")
// and `changelog-itemlist-jsonld.spec.ts` (ticket 0043, the closest peer for
// "ItemList JSON-LD built by mapping a shared constant").
//
// Per the 2026-05-30 second-@type lesson the implementer grepped every
// `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'`,
// `=== 'ItemList'`, AND `=== 'BreadcrumbList'` predicates before writing
// code. CollectionPage: zero predecessor matches (/compare is the first
// emission). ItemList + BreadcrumbList: all predecessor "exactly one"
// predicates are URL-scoped to a different route (/demos, /changelog, /,
// /trust, /my, /quiz, /roi, /ai-for-*, /compare/<tool>), so the new
// /compare-scoped blocks do NOT collide. Recorded in the ticket
// Implementation log.
//
// Per the 2026-05-25 SEO Pilot lesson, /compare is NOT in the index.html
// SEO Pilot `pages` table (no compare-family route is per the prior
// /compare/* specs). The spec asserts the LAST `meta[name="description"]`
// content directly (Helmet appends a second tag) instead of
// `page.toHaveTitle(...)`.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const COMPARE_URL = `${ORIGIN}/compare`;

async function gotoCompareHub(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/compare', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /compare').not.toBeNull();
  expect(response!.status(), `/compare returned ${response!.status()}`).toBeLessThan(400);
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

// Box 1: navigates to /compare, status < 400, H1 contains "Compare".
test('renders /compare with an H1 that contains "Compare"', async ({ page }) => {
  const errors = await gotoCompareHub(page);

  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const h1Text = ((await h1.textContent()) ?? '').toLowerCase();
  expect(h1Text).toContain('compare');

  expect(errors).toEqual([]);
});

// Box 2: ten cards render (each `data-testid="compare-hub-card"`) and the
// count equals COMPARE_ENTRIES.length so appending an eleventh entry
// auto-increments the assertion.
test('renders one card per COMPARE_ENTRIES entry', async ({ page }) => {
  const errors = await gotoCompareHub(page);

  const cards = page.locator('[data-testid="compare-hub-card"]');
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBe(COMPARE_ENTRIES.length);

  expect(errors).toEqual([]);
});

// Box 3: every card link `href` matches a `/compare/*` path present in
// ROUTES (the canonical allow-list per the 2026-06-07 src-imports-tests
// lesson - tests/e2e/routes.ts re-exports it from src/data/routes.ts).
test('every card href resolves to a registered /compare/* route', async ({ page }) => {
  const errors = await gotoCompareHub(page);

  const hrefs = await page
    .locator('[data-testid="compare-hub-card"]')
    .evaluateAll((nodes) =>
      nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
    );
  expect(hrefs.length).toBe(COMPARE_ENTRIES.length);

  const expected = new Set(COMPARE_ENTRIES.map((e) => e.path));
  for (const href of hrefs) {
    expect(href).toMatch(/^\/compare\/[a-z]+$/);
    expect(STATIC_ROUTES.has(href), `${href} not in ROUTES`).toBe(true);
    expect(expected.has(href), `${href} not in COMPARE_ENTRIES`).toBe(true);
  }

  expect(errors).toEqual([]);
});

// Box 4: BreadcrumbList second item names "Compare".
test('emits exactly one BreadcrumbList block whose second item is Compare', async ({
  page,
}) => {
  const errors = await gotoCompareHub(page);
  const blocks = await readJsonLdBlocks(page);

  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(breadcrumbs, 'exactly one BreadcrumbList block expected on /compare').toHaveLength(1);

  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[0].item).toBe(ORIGIN);
  expect(items[1].name).toBe('Compare');
  expect(items[1].item).toBe(COMPARE_URL);

  expect(errors).toEqual([]);
});

// Box 5: exactly one CollectionPage block exists with the expected name.
// First CollectionPage emission site-wide; no predecessor "exactly one"
// predicate to widen (2026-05-30 lesson).
test('emits exactly one CollectionPage block with the expected name', async ({ page }) => {
  const errors = await gotoCompareHub(page);
  const blocks = await readJsonLdBlocks(page);

  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  expect(collections, 'exactly one CollectionPage block expected on /compare').toHaveLength(1);

  const cp = collections[0].data;
  expect(cp['@context']).toBe('https://schema.org');
  expect(cp['@type']).toBe('CollectionPage');
  expect(cp.name).toBe('Digital Craft Comparisons');
  expect(typeof cp.description).toBe('string');
  expect((cp.description ?? '').length).toBeGreaterThan(20);
  expect(cp.url).toBe(COMPARE_URL);
  expect(cp.isPartOf?.['@type']).toBe('WebSite');
  expect(cp.isPartOf?.url).toBe(ORIGIN);

  expect(errors).toEqual([]);
});

// Box 6: exactly one ItemList block exists with `itemListElement.length`
// equal to `COMPARE_ENTRIES.length`, and each ListItem's `url` field is the
// expected absolute URL (`https://digitalcraftai.com` + entry.path).
test('emits exactly one ItemList block mirroring COMPARE_ENTRIES with absolute URLs', async ({
  page,
}) => {
  const errors = await gotoCompareHub(page);
  const blocks = await readJsonLdBlocks(page);

  const lists = blocks.filter((b): b is { raw: string; data: ItemList } =>
    isItemList(b.data),
  );
  expect(lists, 'exactly one ItemList block expected on /compare').toHaveLength(1);

  const items = lists[0].data.itemListElement ?? [];
  expect(items.length).toBe(COMPARE_ENTRIES.length);

  for (let i = 0; i < COMPARE_ENTRIES.length; i++) {
    const it = items[i];
    const entry = COMPARE_ENTRIES[i];
    expect(it['@type']).toBe('ListItem');
    expect(it.position).toBe(i + 1);
    expect(it.name).toBe(`Digital Craft vs ${entry.tool}`);
    expect(it.url).toBe(`${ORIGIN}${entry.path}`);
    // The URL field is an absolute https://digitalcraftai.com URL.
    expect((it.url ?? '').startsWith(`${ORIGIN}/`)).toBe(true);
  }

  expect(errors).toEqual([]);
});

// Box 7: the page text contains no U+2014 code point in the visible body or
// in the three JSON-LD blocks this PR emits (BreadcrumbList,
// CollectionPage, ItemList). Site-wide blocks injected from index.html
// (Organization, WebSite) are out of scope - they predate this ticket and
// any em-dash in them is a separate brand-voice concern. Per the
// 2026-05-07 em-dash Hard NO.
test('contains no U+2014 em-dash in body text or in the /compare-emitted JSON-LD', async ({
  page,
}) => {
  const errors = await gotoCompareHub(page);

  const visibleBody = await page.locator('body').innerText();
  expect(visibleBody, 'visible body contains an em-dash').not.toContain(EM_DASH);

  const blocks = await readJsonLdBlocks(page);
  const ours = blocks.filter(
    (b) => isBreadcrumb(b.data) || isCollectionPage(b.data) || isItemList(b.data),
  );
  // All three /compare-emitted blocks must be present.
  expect(ours.length, '/compare must emit BreadcrumbList + CollectionPage + ItemList').toBe(3);
  for (const b of ours) {
    expect(b.raw, `/compare JSON-LD block contains em-dash: ${b.raw}`).not.toContain(EM_DASH);
  }

  expect(errors).toEqual([]);
});

// Box 8: page renders in light AND dark mode on a 375px mobile viewport.
// All cards remain visible after toggling .dark and reducing the viewport.
test('renders in light and dark mode on a 375px viewport', async ({ page }) => {
  const errors = await gotoCompareHub(page);

  // Light mode baseline.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const lightCount = await page.locator('[data-testid="compare-hub-card"]').count();
  expect(lightCount).toBe(COMPARE_ENTRIES.length);

  // Dark mode: toggle .dark on the root, the page still renders.
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const darkCount = await page.locator('[data-testid="compare-hub-card"]').count();
  expect(darkCount).toBe(COMPARE_ENTRIES.length);

  // 375px mobile viewport: heading and cards still render.
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.locator('[data-testid="compare-hub-card"]').count()).toBe(
    COMPARE_ENTRIES.length,
  );

  expect(errors).toEqual([]);
});

// Box 9: the LAST `meta[name="description"]` content (the Helmet-appended
// one per the 2026-05-25 Helmet-appends lesson) equals the
// CollectionPage.description field byte-for-byte (mirror-source
// guarantee per the 2026-05-25 lesson).
test('CollectionPage.description mirrors the Helmet meta[name="description"] byte-for-byte', async ({
  page,
}) => {
  const errors = await gotoCompareHub(page);

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
