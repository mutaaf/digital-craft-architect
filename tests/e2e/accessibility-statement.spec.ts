import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS, ROUTES } from './routes';
import {
  CONFORMANCE_TARGET,
  RECENT_REMEDIATIONS,
} from '../../src/data/accessibilityStatement';

// Ticket 0097 - /accessibility-statement dated WCAG conformance + remediation
// log page. Each test maps 1:1 to a sub-case in the ticket's acceptance box.
// Modeled on `tests/e2e/ai-risks-we-watch.spec.ts` (ticket 0094, the freshest
// predecessor in the same dated-trust-artifact family).
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this spec the
// implementer grepped every `tests/e2e/*-jsonld.spec.ts` (and every trust-
// family spec) for `=== 'CollectionPage'`, `=== 'BreadcrumbList'`, and
// `toHaveLength(1)` predicates. Every predecessor is URL-scoped to its own
// hub path (0048 `/compare`, 0057 `/case-studies`, 0069 `/subprocessors`,
// 0071 `/ai-for-hospitality`, 0077 `/ethics`, 0079 `/blog`, 0088
// `/model-card`, 0090 `/agent-fleet`, 0094 `/ai-risks-we-watch`), so the
// sibling `/accessibility-statement`-scoped CollectionPage + BreadcrumbList
// blocks cannot collide. Grep result documented in the ticket Implementation
// log.
//
// Per the 2026-09-05 route-code-splitting lesson `/accessibility-statement`
// is lazy-wrapped in <Suspense>, so `gotoStatement` waits for the
// RouteFallback (role=status, aria-label=Loading) to detach AND for the H1
// to be visible before probing the DOM (2026-09-10 mount-signal lesson).
//
// Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the em-dash-in-
// JSON-LD check scopes ONLY to the two blocks THIS PAGE emits
// (CollectionPage + BreadcrumbList) filtered by their `@type`, NOT to every
// application/ld+json block on the page (the homepage Organization block
// from index.html carries a legitimate em-dash and must not be flagged).
//
// Per the 2026-06-15 attribute-list regex lesson, any regex in this spec
// that matches an XML/HTML attribute list uses `[^>]*`, not `[^/>]*`.
//
// Per the 2026-06-07 src-imports-tests lesson, the spec imports the
// canonical CONFORMANCE_TARGET + RECENT_REMEDIATIONS constants from
// src/data/accessibilityStatement.ts and ROUTES from src/data/routes.ts
// directly, so the visible page and the spec cannot drift.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// character (the 2026-05-07 brand-voice Hard NO bans the literal even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const PAGE_PATH = '/accessibility-statement';
const PAGE_URL = `${ORIGIN}${PAGE_PATH}`;
const PAGE_H1 = 'Accessibility Statement';
const CONFORMANCE_LINE = `Target: WCAG ${CONFORMANCE_TARGET.version} ${CONFORMANCE_TARGET.level}`;
const LAST_REVIEWED_LINE = `Last reviewed: ${CONFORMANCE_TARGET.lastReviewed}`;
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

async function gotoStatement(page: Page, path = PAGE_PATH): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${path}`).not.toBeNull();
  expect(response!.status(), `${path} returned ${response!.status()}`).toBeLessThan(400);
  // Wait for RouteFallback (role=status, aria-label=Loading) to detach per
  // the 2026-09-05 lesson.
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

// Data-file invariants: RECENT_REMEDIATIONS is non-empty; every id shape,
// route allow-list membership, and ISO date invariant matches the ticket's
// engineering-notes contract. This is the encoded-invariant hook per the
// 2026-05-28 sitemap-lastmod lesson (the data file's module-load assertion
// throws on import; this Playwright case gives the failure a friendlier
// error message).
test('CONFORMANCE_TARGET + RECENT_REMEDIATIONS pass their invariants', async () => {
  expect(CONFORMANCE_TARGET.level).toBe('AA');
  expect(CONFORMANCE_TARGET.version).toBe('2.1');
  const isoRe = /^\d{4}-\d{2}-\d{2}$/;
  expect(isoRe.test(CONFORMANCE_TARGET.lastReviewed)).toBe(true);
  expect(CONFORMANCE_TARGET.summary.length).toBeGreaterThan(20);
  expect(CONFORMANCE_TARGET.summary).not.toContain(EM_DASH);

  expect(RECENT_REMEDIATIONS.length).toBeGreaterThan(0);
  const seenKeys = new Set<string>();
  for (const row of RECENT_REMEDIATIONS) {
    expect(isoRe.test(row.date), `bad ISO date "${row.date}" on ${row.summary}`).toBe(true);
    expect(row.date <= CONFORMANCE_TARGET.lastReviewed).toBe(true);
    expect(
      SHIPPED_ROUTES_SET.has(row.route),
      `route "${row.route}" NOT_IN_ROUTES for remediation "${row.summary}"`,
    ).toBe(true);
    expect(row.summary.length).toBeGreaterThan(20);
    expect(row.summary).not.toContain(EM_DASH);
    const key = `${row.date}::${row.route}::${row.summary}`;
    expect(seenKeys.has(key), `duplicate remediation row ${key}`).toBe(false);
    seenKeys.add(key);
  }
});

// AC #7.1: GET /accessibility-statement returns 200.
// AC #7.2: renders an H1 whose text contains "Accessibility Statement".
test('renders 200 with an "Accessibility Statement" H1', async ({ page }) => {
  const errors = await gotoStatement(page);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const text = ((await h1.textContent()) ?? '').trim();
  expect(/accessibility statement/i.test(text)).toBe(true);
  expect(errors).toEqual([]);
});

// AC #7.3: the page renders a "Last reviewed: <ISO date>" line whose date
// matches CONFORMANCE_TARGET.lastReviewed (mirror-source per 2026-05-25).
test('renders the "Last reviewed" line matching CONFORMANCE_TARGET.lastReviewed', async ({
  page,
}) => {
  const errors = await gotoStatement(page);
  const chip = page.locator('[data-testid="accessibility-last-reviewed"]');
  await expect(chip).toBeVisible();
  const text = ((await chip.textContent()) ?? '').trim();
  expect(text).toContain(LAST_REVIEWED_LINE);
  expect(errors).toEqual([]);
});

// AC #7.4: the page renders a "Target: WCAG 2.1 AA" line matching
// CONFORMANCE_TARGET.version + .level (mirror-source per 2026-05-25).
test('renders the "Target: WCAG 2.1 AA" conformance line', async ({ page }) => {
  const errors = await gotoStatement(page);
  const chip = page.locator('[data-testid="accessibility-conformance-target"]');
  await expect(chip).toBeVisible();
  const text = ((await chip.textContent()) ?? '').trim();
  expect(text).toContain(CONFORMANCE_LINE);
  expect(errors).toEqual([]);
});

// AC #7.5: remediation table renders exactly RECENT_REMEDIATIONS.length rows
// with data-testid="accessibility-remediation-row". Uses toHaveCount(N) over
// the imported constant per the 2026-09-06 VISIBLE_LIMIT lesson (not
// `count > 0`).
test('renders one remediation row per RECENT_REMEDIATIONS entry', async ({ page }) => {
  const errors = await gotoStatement(page);
  const rows = page.locator('[data-testid="accessibility-remediation-row"]');
  await expect(rows.first()).toBeVisible();
  await expect(rows).toHaveCount(RECENT_REMEDIATIONS.length);
  expect(errors).toEqual([]);
});

// AC #7.6: every rendered row's route cell text matches a route in the
// ROUTES allow-list (imported directly from src/data/routes.ts per the
// 2026-06-07 lesson).
test('every rendered remediation route is in the ROUTES allow-list', async ({ page }) => {
  const errors = await gotoStatement(page);
  const routeCells = await page
    .locator('[data-testid="accessibility-remediation-route"]')
    .allTextContents();
  expect(routeCells.length).toBe(RECENT_REMEDIATIONS.length);
  for (const cell of routeCells) {
    const route = cell.trim();
    expect(SHIPPED_ROUTES_SET.has(route), `route "${route}" not in ROUTES`).toBe(true);
  }
  expect(errors).toEqual([]);
});

// AC #7.7: exactly one CollectionPage JSON-LD block on the page whose `name`
// contains the page H1 substring and whose `dateModified` byte-matches
// CONFORMANCE_TARGET.lastReviewed (mirror-source per 2026-05-25).
test('emits exactly one CollectionPage JSON-LD scoped to /accessibility-statement', async ({
  page,
}) => {
  const errors = await gotoStatement(page);
  const blocks = await readJsonLdBlocks(page);
  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  expect(
    collections,
    'exactly one CollectionPage block expected on /accessibility-statement',
  ).toHaveLength(1);

  const cp = collections[0].data;
  expect(cp.url).toBe(PAGE_URL);
  expect(typeof cp.name).toBe('string');
  expect(/accessibility statement/i.test(cp.name ?? '')).toBe(true);
  expect(cp.dateModified).toBe(CONFORMANCE_TARGET.lastReviewed);
  expect(typeof cp.description).toBe('string');
  expect((cp.description ?? '').length).toBeGreaterThan(20);
  expect(errors).toEqual([]);
});

// AC #7.8: exactly one BreadcrumbList block with two itemListElement entries
// whose names are "Home" and "Accessibility Statement".
test('emits a two-item BreadcrumbList (Home -> Accessibility Statement)', async ({ page }) => {
  const errors = await gotoStatement(page);
  const blocks = await readJsonLdBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(
    breadcrumbs,
    'exactly one BreadcrumbList block expected on /accessibility-statement',
  ).toHaveLength(1);
  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[1].name).toBe(PAGE_H1);
  expect(items[1].item).toBe(PAGE_URL);
  expect(errors).toEqual([]);
});

// AC #7.9: the em-dash-in-JSON-LD assertion scopes ONLY to the two blocks
// THIS PAGE emits (CollectionPage + BreadcrumbList), NEVER to every
// application/ld+json block on the page. The homepage Organization block
// from index.html carries a legitimate em-dash per 2026-09-08.
test('no em-dash in the CollectionPage or BreadcrumbList blocks this page emits', async ({
  page,
}) => {
  const errors = await gotoStatement(page);
  const blocks = await readJsonLdBlocks(page);
  const owned = blocks.filter((b) => isBreadcrumb(b.data) || isCollectionPage(b.data));
  expect(
    owned.length,
    'BreadcrumbList + CollectionPage blocks emitted by /accessibility-statement must both render',
  ).toBe(2);
  for (const b of owned) {
    expect(b.raw, 'no em-dash allowed in an /accessibility-statement-owned JSON-LD block').not.toContain(
      EM_DASH,
    );
  }
  expect(errors).toEqual([]);
});

// AC #7.10 (also from AC #6 body-copy): zero U+2014 code points in the
// rendered page body.
test('no em-dash character anywhere in visible body copy', async ({ page }) => {
  const errors = await gotoStatement(page);
  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(bodyText.length, 'body should have text content').toBeGreaterThan(100);
  expect(bodyText, 'no em-dash allowed in visible copy').not.toContain(EM_DASH);
  expect(errors).toEqual([]);
});

// AC #8: renders cleanly in dark mode (html.dark toggle).
test('renders cleanly in dark mode', async ({ page }) => {
  const errors = await gotoStatement(page);
  const lightRows = await page
    .locator('[data-testid="accessibility-remediation-row"]')
    .count();
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(
    page.locator('[data-testid="accessibility-remediation-row"]').first(),
  ).toBeVisible();
  const darkRows = await page
    .locator('[data-testid="accessibility-remediation-row"]')
    .count();
  expect(darkRows).toBe(lightRows);
  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(hasDarkClass).toBe(true);
  expect(errors).toEqual([]);
});

// AC #6 (Trust cross-link chip): /trust renders a chip whose href is
// /accessibility-statement.
test('/trust shows the new "Accessibility Statement" cross-link chip', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/trust', { waitUntil: 'domcontentloaded' });
  expect(response!.status()).toBeLessThan(400);
  await page
    .locator('[role="status"][aria-label="Loading"]')
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .catch(() => {});
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });
  const chip = page.locator('[data-testid="trust-accessibility-statement-link"]');
  await expect(chip).toBeVisible();
  const href = await chip.getAttribute('href');
  expect(href).toBe(PAGE_PATH);
  expect(errors).toEqual([]);
});

// AC #7 (footer chip): the homepage footer surfaces the new trust chip and
// it navigates to /accessibility-statement.
test('footer accessibility-statement chip is visible on / and links to the page', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response!.status()).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  const chip = page.locator('[data-testid="footer-accessibility-statement-chip"]');
  await expect(chip).toBeVisible();
  const chipLink = page
    .locator(`a[href="${PAGE_PATH}"]`)
    .filter({ has: page.locator('[data-testid="footer-accessibility-statement-chip"]') });
  await expect(chipLink).toHaveCount(1);
  expect(errors).toEqual([]);
});

// AC #3: /accessibility-statement is present in the ROUTES allow-list per
// 2026-06-07 src-imports-tests.
test('/accessibility-statement path is in the ROUTES allow-list', async () => {
  expect(SHIPPED_ROUTES_SET.has(PAGE_PATH)).toBe(true);
});

// AC #5 (mirror-source bonus): the Helmet-managed meta description equals
// the CollectionPage description byte-for-byte per 2026-05-25.
test('meta description mirrors the CollectionPage description', async ({ page }) => {
  const errors = await gotoStatement(page);
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
