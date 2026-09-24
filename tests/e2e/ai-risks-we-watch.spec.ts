import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS, ROUTES } from './routes';
import { AI_RISKS_WATCHLIST } from '../../src/data/aiRisksWatchlist';

// Ticket 0094 - /ai-risks-we-watch dated risk-watchlist page. Each test maps
// 1:1 to a sub-case in the ticket's acceptance-criteria box #10 (11 sub-cases).
// Modeled on `tests/e2e/security-posture-page.spec.ts` (ticket 0081, the
// closest structural peer for a trust-family page emitting CollectionPage +
// BreadcrumbList JSON-LD backed by a `src/data/` typed constant of dated rows).
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this spec the
// implementer grepped every `tests/e2e/*jsonld*.spec.ts` for
// `=== 'CollectionPage'`, `=== 'BreadcrumbList'`, `=== 'ItemList'`, and
// `toHaveLength(1)` predicates. Every predecessor is URL-scoped (each spec
// asserts blocks on its own page only), so the sibling /ai-risks-we-watch-
// scoped CollectionPage + BreadcrumbList blocks cannot collide. Grep result
// documented in the ticket Implementation log.
//
// Per the 2026-09-05 route-code-splitting lesson, /ai-risks-we-watch is lazy-
// wrapped in <Suspense>, so `gotoRisks` waits for the RouteFallback to detach
// AND for the H1 to be visible before probing the DOM.
// Per the 2026-09-10 mount-signal lesson, the H1 visibility wait is the true
// "page ready" signal for a lazy-loaded route with mount-time side effects.
// Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the em-dash-in-JSON-
// LD check scopes ONLY to the two blocks THIS PAGE emits (CollectionPage,
// BreadcrumbList) filtered by their `@type`, NOT to every application/ld+json
// block on the page (the homepage Organization block from index.html carries
// a legitimate em-dash and must not be flagged).
// Per the 2026-06-15 attribute-list regex lesson, any regex in this spec that
// matches an XML/HTML attribute list uses `[^>]*`, not `[^/>]*`, so slashes
// inside MIME types or paths do not break the match.
// Per the 2026-06-07 src-imports-tests lesson, the spec imports
// AI_RISKS_WATCHLIST from src/data/aiRisksWatchlist.ts directly, so the
// visible row count and the spec cannot drift.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// character (the 2026-05-07 brand-voice Hard NO bans the literal even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const PAGE_PATH = '/ai-risks-we-watch';
const PAGE_URL = `${ORIGIN}${PAGE_PATH}`;
const PAGE_H1 = 'AI risks we watch';
// 2026-09-24 is the ticket's stated authoring floor for `lastReviewed`.
const MAX_REVIEW_DATE = '2026-09-24';
// Trust-family routes that a relatedLink may point at. Sourced from the
// shipped ROUTES allow-list; the spec keys the assertion on ROUTES so a
// future route rename cannot silently break this filter.
const SHIPPED_ROUTES_SET = new Set<string>(ROUTES);

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
type ListItem = {
  '@type'?: string;
  position?: number;
  name?: string;
  url?: string;
};
type ItemList = {
  '@type'?: string;
  numberOfItems?: number;
  itemListElement?: ListItem[];
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

async function gotoRisks(page: Page, path = PAGE_PATH): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${path}`).not.toBeNull();
  expect(response!.status(), `${path} returned ${response!.status()}`).toBeLessThan(400);
  // Wait for RouteFallback (role=status, aria-label=Loading) to detach per the
  // 2026-09-05 route-code-splitting lesson.
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

// Sub-case 0 (data-file invariants): AI_RISKS_WATCHLIST has 8 to 12 rows;
// every id is kebab-case; every lastReviewed is ISO YYYY-MM-DD on or before
// 2026-09-24; every relatedLink.href (when present) is in the shipped
// ROUTES allow-list.
test('AI_RISKS_WATCHLIST has 8 to 12 defensible rows', async () => {
  expect(AI_RISKS_WATCHLIST.length).toBeGreaterThanOrEqual(8);
  expect(AI_RISKS_WATCHLIST.length).toBeLessThanOrEqual(12);
  const kebabRe = /^[a-z][a-z0-9-]*$/;
  const isoRe = /^\d{4}-\d{2}-\d{2}$/;
  const seenIds = new Set<string>();
  for (const row of AI_RISKS_WATCHLIST) {
    expect(kebabRe.test(row.id), `id "${row.id}" is not kebab-case`).toBe(true);
    expect(seenIds.has(row.id), `duplicate id "${row.id}"`).toBe(false);
    seenIds.add(row.id);
    expect(isoRe.test(row.lastReviewed), `bad ISO date "${row.lastReviewed}" on ${row.id}`).toBe(true);
    expect(
      row.lastReviewed <= MAX_REVIEW_DATE,
      `lastReviewed ${row.lastReviewed} on ${row.id} must be on or before ${MAX_REVIEW_DATE}`,
    ).toBe(true);
    if (row.relatedLink) {
      expect(
        SHIPPED_ROUTES_SET.has(row.relatedLink.href),
        `relatedLink.href "${row.relatedLink.href}" on ${row.id} not in ROUTES`,
      ).toBe(true);
      expect(row.relatedLink.label.length).toBeGreaterThan(0);
    }
    expect(row.name.length).toBeGreaterThan(0);
    expect(row.mitigation.length).toBeGreaterThan(20);
  }
});

// Sub-case 1 (AC #10.1): GET /ai-risks-we-watch returns 200.
test('renders 200 with an "AI risks we watch" H1', async ({ page }) => {
  const errors = await gotoRisks(page);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const text = ((await h1.textContent()) ?? '').trim();
  // Sub-case 2 (AC #10.2): case-insensitive substring check on the H1.
  expect(/ai risks we watch/i.test(text)).toBe(true);
  expect(errors).toEqual([]);
});

// Sub-case 3 (AC #10.3): exactly N ai-risk-row rows where N equals
// AI_RISKS_WATCHLIST.length. Mirror-source per the 2026-05-25 rule.
test('renders one ai-risk-row per AI_RISKS_WATCHLIST entry', async ({ page }) => {
  const errors = await gotoRisks(page);
  const rows = page.locator('[data-testid="ai-risk-row"]');
  await expect(rows.first()).toBeVisible();
  await expect(rows).toHaveCount(AI_RISKS_WATCHLIST.length);
  expect(errors).toEqual([]);
});

// Sub-case 4 (AC #10.4): every row's lastReviewed string parses as ISO
// YYYY-MM-DD and represents a date on or before 2026-09-24. Asserted from the
// rendered DOM so the visible text and the data source cannot drift.
test('every rendered lastReviewed date is ISO and on or before 2026-09-24', async ({ page }) => {
  const errors = await gotoRisks(page);
  const dateChips = await page
    .locator('[data-testid="ai-risk-last-reviewed"]')
    .allTextContents();
  expect(dateChips.length).toBe(AI_RISKS_WATCHLIST.length);
  const isoCapture = /(\d{4}-\d{2}-\d{2})/;
  for (const text of dateChips) {
    const match = isoCapture.exec(text);
    expect(match, `no ISO date in "${text}"`).not.toBeNull();
    const iso = match![1];
    expect(iso <= MAX_REVIEW_DATE, `${iso} must be on or before ${MAX_REVIEW_DATE}`).toBe(true);
  }
  expect(errors).toEqual([]);
});

// Sub-case 5 (AC #10.5): every relatedLink.href in the data is one of the
// shipped ROUTES. Data-level assertion (also checked in Sub-case 0 above) plus
// a DOM-level assertion that every rendered chip anchor's href is in ROUTES.
test('every rendered related-link anchor points at a shipped ROUTE', async ({ page }) => {
  const errors = await gotoRisks(page);
  const rowsWithLink = AI_RISKS_WATCHLIST.filter((r) => r.relatedLink);
  expect(rowsWithLink.length).toBeGreaterThan(0);
  const anchors = page.locator('[data-testid="ai-risk-related-link"]');
  await expect(anchors).toHaveCount(rowsWithLink.length);
  const hrefs = await anchors.evaluateAll((nodes) =>
    nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
  );
  for (const href of hrefs) {
    expect(SHIPPED_ROUTES_SET.has(href), `href ${href} not in ROUTES`).toBe(true);
  }
  expect(errors).toEqual([]);
});

// Sub-case 6 (AC #10.6): exactly one CollectionPage JSON-LD block on the page
// with a name field containing "AI risks we watch" and a
// mainEntity.itemListElement array whose length equals
// AI_RISKS_WATCHLIST.length.
test('emits exactly one CollectionPage JSON-LD with mainEntity mirroring the watchlist', async ({
  page,
}) => {
  const errors = await gotoRisks(page);
  const blocks = await readJsonLdBlocks(page);
  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  expect(collections, 'exactly one CollectionPage block expected on /ai-risks-we-watch').toHaveLength(1);

  const cp = collections[0].data;
  expect(cp.url).toBe(PAGE_URL);
  expect(typeof cp.name).toBe('string');
  expect(/ai risks we watch/i.test(cp.name ?? '')).toBe(true);
  expect(typeof cp.description).toBe('string');
  expect((cp.description ?? '').length).toBeGreaterThan(20);

  const list = cp.mainEntity;
  expect(list, 'CollectionPage.mainEntity must be present').toBeTruthy();
  expect(list!['@type']).toBe('ItemList');
  const items = list!.itemListElement ?? [];
  expect(items.length).toBe(AI_RISKS_WATCHLIST.length);
  expect(list!.numberOfItems).toBe(AI_RISKS_WATCHLIST.length);

  const expectedNames = new Set(AI_RISKS_WATCHLIST.map((r) => r.name));
  for (const item of items) {
    expect(item['@type']).toBe('ListItem');
    expect(typeof item.position).toBe('number');
    expect(typeof item.name).toBe('string');
    expect(expectedNames.has(item.name ?? '')).toBe(true);
    expect(typeof item.url).toBe('string');
    // Fragment anchors use `#risk-<id>` shape.
    expect((item.url ?? '').startsWith(`${PAGE_URL}#risk-`)).toBe(true);
  }
  expect(errors).toEqual([]);
});

// Sub-case 7 (AC #10.7): exactly one BreadcrumbList block with two
// itemListElement entries whose names are "Home" and "AI risks we watch".
test('emits a two-item BreadcrumbList (Home -> AI risks we watch)', async ({ page }) => {
  const errors = await gotoRisks(page);
  const blocks = await readJsonLdBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(breadcrumbs, 'exactly one BreadcrumbList block expected on /ai-risks-we-watch').toHaveLength(1);
  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[1].name).toBe(PAGE_H1);
  expect(items[1].item).toBe(PAGE_URL);
  expect(errors).toEqual([]);
});

// Sub-case 8 (AC #10.8 + AC #6 + AC #7): the em-dash-in-JSON-LD assertion
// scopes ONLY to the two blocks THIS PAGE emits (CollectionPage +
// BreadcrumbList), NEVER to every application/ld+json block on the page. The
// homepage Organization block from index.html carries a legitimate em-dash
// and must not be flagged per the 2026-09-08 lesson.
test('no em-dash in the CollectionPage or BreadcrumbList blocks this page emits', async ({
  page,
}) => {
  const errors = await gotoRisks(page);
  const blocks = await readJsonLdBlocks(page);
  const owned = blocks.filter((b) => isBreadcrumb(b.data) || isCollectionPage(b.data));
  expect(
    owned.length,
    'BreadcrumbList + CollectionPage blocks emitted by /ai-risks-we-watch must both render',
  ).toBe(2);
  for (const b of owned) {
    expect(b.raw, 'no em-dash allowed in an /ai-risks-we-watch-owned JSON-LD block').not.toContain(
      EM_DASH,
    );
  }
  expect(errors).toEqual([]);
});

// Sub-case 9 (AC #10.9): every string in the rendered page body contains zero
// U+2014 code points. Safe body-scan because index.html's global Organization
// block is a JSON-LD script tag, not visible body text.
test('no em-dash character anywhere in visible body copy', async ({ page }) => {
  const errors = await gotoRisks(page);
  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(bodyText.length, 'body should have text content').toBeGreaterThan(100);
  expect(bodyText, 'no em-dash allowed in visible copy').not.toContain(EM_DASH);
  expect(errors).toEqual([]);
});

// Sub-case 10 (AC #10.10): the page renders cleanly in both light and dark
// mode via the html.dark class toggle.
test('renders cleanly in dark mode', async ({ page }) => {
  const errors = await gotoRisks(page);
  const lightRows = await page.locator('[data-testid="ai-risk-row"]').count();
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.locator('[data-testid="ai-risk-row"]').first()).toBeVisible();
  const darkRows = await page.locator('[data-testid="ai-risk-row"]').count();
  expect(darkRows).toBe(lightRows);
  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(hasDarkClass).toBe(true);
  expect(errors).toEqual([]);
});

// Sub-case 11 (AC #10.11): the shipped footer's /ai-risks-we-watch link is
// visible and clickable from at least one shipped route (`/`), and navigates
// to the new page.
test('footer AI risks watchlist link is visible on / and navigates to the page', async ({
  page,
}) => {
  const errors = await gotoRisks(page, '/');
  const chip = page.locator('[data-testid="footer-ai-risks-chip"]');
  await expect(chip).toBeVisible();
  const chipLink = page
    .locator(`a[href="${PAGE_PATH}"]`)
    .filter({ has: page.locator('[data-testid="footer-ai-risks-chip"]') });
  await expect(chipLink).toHaveCount(1);
  await chipLink.click();
  await expect(page).toHaveURL(/\/ai-risks-we-watch$/);
  expect(errors).toEqual([]);
});

// Bonus (AC #4): /ai-risks-we-watch path is in the ROUTES allow-list per the
// 2026-06-07 src-imports-tests lesson.
test('/ai-risks-we-watch path is in the ROUTES allow-list', async () => {
  expect(new Set<string>(ROUTES).has(PAGE_PATH)).toBe(true);
});

// Bonus (AC #6 mirror-source): the CollectionPage description equals the
// Helmet-managed meta[name="description"] content byte-for-byte per the
// 2026-05-25 mirror-source rule.
test('meta description mirrors the CollectionPage description', async ({ page }) => {
  const errors = await gotoRisks(page);
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
