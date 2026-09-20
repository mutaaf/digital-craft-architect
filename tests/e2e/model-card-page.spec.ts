import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS, ROUTES } from './routes';
import { MODEL_CARD_ROWS } from '../../src/data/modelCard';

// Ticket 0088 - /model-card AI provenance page. Each test maps 1:1 to a box
// in the ticket's acceptance-criteria section (10 boxes). Modeled on
// `tests/e2e/security-posture-page.spec.ts` (ticket 0081, the direct
// structural peer for a trust-family public page emitting a URL-scoped
// CollectionPage + BreadcrumbList JSON-LD pair backed by a `src/data/`
// typed constant).
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this spec the
// implementer greped every `tests/e2e/*-jsonld.spec.ts` for
// `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates and any
// `toHaveLength(1)` / "exactly one" assertions over those `@type`s. Every
// predecessor CollectionPage predicate (0048 /compare, 0057 /case-studies,
// 0069 /subprocessors, 0071 /ai-for-hospitality, 0079 /blog, 0081
// /security) is URL-scoped to its own path, and every predecessor
// BreadcrumbList predicate is similarly URL-scoped; a sibling /model-card
// pair cannot collide with any of them. Grep result documented in the
// ticket's Implementation log.
//
// Per the 2026-09-05 route-code-splitting lesson, /model-card is lazy-
// wrapped in <Suspense>, so `gotoModelCard` waits for the RouteFallback
// to detach AND for the H1 to mount before reading page state (2026-09-10
// mount-signal lesson).
//
// Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the em-dash
// check filters the block list down to blocks THIS PAGE actually emits
// (CollectionPage, BreadcrumbList) so the site-wide index.html
// Organization block's legitimate historical em-dash (ticket 0025) is
// not flagged.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// character (the 2026-05-07 brand-voice Hard NO bans the literal even in
// tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const PAGE_PATH = '/model-card';
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

async function gotoModelCard(page: Page, path = PAGE_PATH): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${path}`).not.toBeNull();
  expect(response!.status(), `${path} returned ${response!.status()}`).toBeLessThan(400);
  // Wait for RouteFallback (role=status, aria-label=Loading) to detach per
  // the 2026-09-05 route-code-splitting lesson.
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

async function readJsonLdBlocks(page: Page): Promise<{ raw: string; data: unknown }[]> {
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

// Box 1 (AC #1 data-shape guard): MODEL_CARD_ROWS has 5-7 rows and every
// row carries an ISO sinceDate no later than today plus 2-3 limitations.
test('MODEL_CARD_ROWS has 5-7 rows with valid shape', async () => {
  expect(MODEL_CARD_ROWS.length).toBeGreaterThanOrEqual(5);
  expect(MODEL_CARD_ROWS.length).toBeLessThanOrEqual(7);
  const isoRe = /^\d{4}-\d{2}-\d{2}$/;
  const today = new Date().toISOString().slice(0, 10);
  const idSet = new Set<string>();
  for (const row of MODEL_CARD_ROWS) {
    expect(row.id).toMatch(/^[a-z0-9-]+$/);
    expect(idSet.has(row.id), `duplicate id ${row.id}`).toBe(false);
    idSet.add(row.id);
    expect(row.vendor.length).toBeGreaterThan(0);
    expect(row.modelFamily.length).toBeGreaterThan(0);
    expect(row.intendedUse.length).toBeGreaterThan(0);
    expect(row.limitations.length).toBeGreaterThanOrEqual(2);
    expect(row.limitations.length).toBeLessThanOrEqual(3);
    expect(row.sinceDate).toMatch(isoRe);
    expect(row.sinceDate <= today, `${row.id} sinceDate ${row.sinceDate} is in the future`).toBe(true);
    if (row.vendorPolicyUrl !== undefined) {
      expect(row.vendorPolicyUrl.startsWith('https://')).toBe(true);
    }
  }
});

// Box 2 (AC #4): /model-card path is in the ROUTES allow-list per the
// 2026-06-07 mirror-source-across-src-tests lesson.
test('/model-card path is in the ROUTES allow-list', async () => {
  expect(new Set<string>(ROUTES).has(PAGE_PATH)).toBe(true);
});

// Box 3 (AC #5): GET /model-card returns 200 and the H1 contains
// "Model Card" case-insensitive.
test('renders 200 with an AI Model Card H1', async ({ page }) => {
  const errors = await gotoModelCard(page);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const text = ((await h1.textContent()) ?? '').trim();
  expect(/model card/i.test(text)).toBe(true);
  expect(errors).toEqual([]);
});

// Box 4 (AC #5): visible card count equals MODEL_CARD_ROWS.length. Each
// visible row displays its vendor, modelFamily, at least one limitation
// bullet, and a sinceDate chip byte-matching the row's sinceDate value.
test('renders one card per MODEL_CARD_ROWS entry with all required fields', async ({ page }) => {
  const errors = await gotoModelCard(page);
  const cards = page.locator('[data-testid="model-card-row"]');
  await expect(cards.first()).toBeVisible();
  await expect(cards).toHaveCount(MODEL_CARD_ROWS.length);

  const vendors = await page
    .locator('[data-testid="model-card-vendor"]')
    .allTextContents();
  const families = await page
    .locator('[data-testid="model-card-family"]')
    .allTextContents();
  const sinces = await page
    .locator('[data-testid="model-card-since"]')
    .allTextContents();
  expect(vendors.length).toBe(MODEL_CARD_ROWS.length);
  expect(families.length).toBe(MODEL_CARD_ROWS.length);
  expect(sinces.length).toBe(MODEL_CARD_ROWS.length);
  for (let i = 0; i < MODEL_CARD_ROWS.length; i++) {
    const row = MODEL_CARD_ROWS[i];
    expect(vendors[i].trim()).toBe(row.vendor);
    expect(families[i].trim()).toBe(row.modelFamily);
    expect(sinces[i]).toContain(row.sinceDate);
  }

  // Every row card has at least one visible limitation bullet.
  for (const row of MODEL_CARD_ROWS) {
    const rowCard = page.locator(`article[data-testid="model-card-row"]#${row.id}`);
    const rowLimits = rowCard.locator('[data-testid="model-card-limitation"]');
    await expect(rowLimits.first()).toBeVisible();
    const count = await rowLimits.count();
    expect(count).toBe(row.limitations.length);
  }

  expect(errors).toEqual([]);
});

// Box 5 (AC #3): the CollectionPage JSON-LD block's mainEntity.itemListElement
// array length equals MODEL_CARD_ROWS.length and every ListItem.url matches
// the fragment-anchor regex.
test('CollectionPage ItemList enumerates every row with a fragment URL', async ({ page }) => {
  const errors = await gotoModelCard(page);
  const blocks = await readJsonLdBlocks(page);
  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  expect(collections, 'exactly one CollectionPage block expected on /model-card').toHaveLength(1);

  const cp = collections[0].data;
  expect(cp.url).toBe(PAGE_URL);
  expect(cp.name).toBe('Digital Craft AI Model Card');
  expect(typeof cp.description).toBe('string');
  expect((cp.description ?? '').length).toBeGreaterThan(20);

  const list = cp.mainEntity;
  expect(list).toBeDefined();
  expect(list?.['@type']).toBe('ItemList');
  expect(list?.numberOfItems).toBe(MODEL_CARD_ROWS.length);
  const items = list?.itemListElement ?? [];
  expect(items.length).toBe(MODEL_CARD_ROWS.length);

  const fragmentRe = /^https:\/\/digitalcraftai\.com\/model-card#[a-z0-9-]+$/;
  const idSet = new Set(MODEL_CARD_ROWS.map((r) => r.id));
  for (const item of items) {
    expect(item['@type']).toBe('ListItem');
    expect(typeof item.url).toBe('string');
    expect(item.url ?? '').toMatch(fragmentRe);
    const id = (item.url ?? '').split('#')[1] ?? '';
    expect(idSet.has(id), `ListItem url id ${id} not in MODEL_CARD_ROWS`).toBe(true);
    expect(typeof item.name).toBe('string');
  }

  expect(errors).toEqual([]);
});

// Box 6 (AC #3): exactly one BreadcrumbList JSON-LD block with two ListItem
// entries named "Home" and "AI Model Card" whose URLs are
// https://digitalcraftai.com/ and https://digitalcraftai.com/model-card.
test('emits a two-item BreadcrumbList (Home -> AI Model Card)', async ({ page }) => {
  const errors = await gotoModelCard(page);
  const blocks = await readJsonLdBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(breadcrumbs, 'exactly one BreadcrumbList block expected on /model-card').toHaveLength(1);
  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[0].item).toBe(`${ORIGIN}/`);
  expect(items[1].name).toBe('AI Model Card');
  expect(items[1].item).toBe(PAGE_URL);
  expect(errors).toEqual([]);
});

// Box 7 (AC #5 mirror-source): the LAST meta[name="description"] tag on the
// page (per the 2026-05-25 Helmet-appends lesson) byte-matches the
// CollectionPage description.
test('meta description mirrors the CollectionPage description', async ({ page }) => {
  const errors = await gotoModelCard(page);
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

// Box 8 (AC #5 em-dash Hard NO + 2026-09-08 block-filter lesson): the
// em-dash check scopes ONLY to blocks THIS page emits (CollectionPage +
// BreadcrumbList). The site-wide Organization block from index.html
// (ticket 0025) carries a legitimate em-dash and must NOT be flagged.
test('no em-dash on the model-card page or its own JSON-LD blocks', async ({ page }) => {
  const errors = await gotoModelCard(page);
  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(bodyText.length, 'body should have text content').toBeGreaterThan(100);
  expect(bodyText, 'no em-dash allowed in visible copy').not.toContain(EM_DASH);
  const blocks = await readJsonLdBlocks(page);
  const owned = blocks.filter((b) => isBreadcrumb(b.data) || isCollectionPage(b.data));
  expect(
    owned.length,
    'BreadcrumbList + CollectionPage blocks emitted by /model-card must both render',
  ).toBe(2);
  for (const b of owned) {
    expect(b.raw, 'no em-dash allowed in a /model-card-owned JSON-LD block').not.toContain(
      EM_DASH,
    );
  }
  expect(errors).toEqual([]);
});

// Box 9 (AC #5): dark-mode case - toggle html.dark and assert the cards
// still render.
test('renders in dark mode', async ({ page }) => {
  const errors = await gotoModelCard(page);
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.locator('[data-testid="model-card-row"]').first()).toBeVisible();
  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(hasDarkClass).toBe(true);
  expect(errors).toEqual([]);
});

// Box 10a (AC #5): every visible vendor-policy outbound link opens in a
// new tab with target="_blank" and rel="noopener noreferrer".
test('every vendor-policy outbound link opens in a new tab safely', async ({ page }) => {
  const errors = await gotoModelCard(page);
  const rowsWithPolicy = MODEL_CARD_ROWS.filter((r) => r.vendorPolicyUrl);
  expect(rowsWithPolicy.length).toBeGreaterThan(0);
  const anchors = page.locator('[data-testid="model-card-policy-link"]');
  await expect(anchors).toHaveCount(rowsWithPolicy.length);
  const attrs = await anchors.evaluateAll((nodes) =>
    nodes.map((n) => ({
      href: (n as HTMLAnchorElement).getAttribute('href') ?? '',
      target: (n as HTMLAnchorElement).getAttribute('target') ?? '',
      rel: (n as HTMLAnchorElement).getAttribute('rel') ?? '',
    })),
  );
  const expectedHrefs = new Set(rowsWithPolicy.map((r) => r.vendorPolicyUrl!));
  for (const a of attrs) {
    expect(expectedHrefs.has(a.href), `unexpected href ${a.href}`).toBe(true);
    expect(a.target).toBe('_blank');
    expect(a.rel).toContain('noopener');
    expect(a.rel).toContain('noreferrer');
  }
  expect(errors).toEqual([]);
});

// Box 10b (AC #5 sibling-page-regression): navigate to /trust, assert the
// new /model-card chip is present in the chip strip, resolves to a route
// that lives in the ROUTES allow-list, AND the pre-existing /ethics chip
// is still present with unchanged text ("What we won't do"). Per the
// 2026-09-12 code-beats-prose rule the regression case is pinned to the
// chips that actually exist on Trust.tsx today (the ticket's four-chip
// enumeration is groomer prose; only the /ethics chip lives in the strip
// on branch head, plus the inline /subprocessors paragraph link higher up
// which is also asserted unchanged).
test('adds the /model-card chip to Trust.tsx without disturbing existing links', async ({
  page,
}) => {
  const errors = await gotoModelCard(page, '/trust');

  const modelCardChip = page.locator('[data-testid="trust-model-card-link"]');
  await expect(modelCardChip).toBeVisible();
  const modelCardHref = await modelCardChip.getAttribute('href');
  expect(modelCardHref).toBe(PAGE_PATH);
  expect(new Set<string>(ROUTES).has(PAGE_PATH)).toBe(true);
  const modelCardText = ((await modelCardChip.textContent()) ?? '').trim();
  expect(modelCardText).toContain('Model card');

  const ethicsChip = page.locator('[data-testid="trust-ethics-link"]');
  await expect(ethicsChip).toBeVisible();
  const ethicsText = ((await ethicsChip.textContent()) ?? '').trim();
  expect(ethicsText).toContain("What we won't do");
  expect(await ethicsChip.getAttribute('href')).toBe('/ethics');

  const subprocessorsLink = page.locator('[data-testid="trust-subprocessors-link"]');
  await expect(subprocessorsLink).toBeVisible();
  expect(await subprocessorsLink.getAttribute('href')).toBe('/subprocessors');

  expect(errors).toEqual([]);
});
