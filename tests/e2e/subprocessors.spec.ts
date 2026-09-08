import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS, ROUTES } from './routes';
import { SUBPROCESSORS } from '../../src/data/subprocessors';

// Ticket 0069 - /subprocessors data recipients page. Each test maps 1:1 to a
// case in the acceptance-criteria box 10. Modeled on
// `tests/e2e/vendor-scorecard.spec.ts` (ticket 0067, the closest structural
// peer for "printable table backed by a `src/data/` constant with print-button
// spy") and `tests/e2e/compare-hub.spec.ts` (ticket 0048, the closest peer
// for CollectionPage + embedded ItemList JSON-LD).
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this spec the
// implementer grepped every tests/e2e/*-jsonld.spec.ts for
// `=== 'CollectionPage'`, `=== 'ItemList'`, and `=== 'BreadcrumbList'`
// predicates and documented the result in the ticket Implementation log.
// Zero predecessor predicates needed widening (all are URL-scoped to a route
// other than /subprocessors), so the sibling /subprocessors-scoped blocks
// cannot collide.
//
// Per the 2026-09-05 route-code-splitting lesson, /subprocessors is
// lazy-wrapped in <Suspense>, so this spec waits for the H1 to be visible
// with an auto-retrying assertion after the length poll instead of relying
// on `root.innerHTML.length > N` for readiness.
// Per the 2026-05-25 SEO Pilot lesson, /subprocessors is NOT in the
// index.html SEO Pilot pages table; the spec asserts the LAST
// meta[name="description"] content directly, never toHaveTitle().

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the 2026-05-07 brand-voice Hard NO bans the literal character even in
// tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const PAGE_PATH = '/subprocessors';
const PAGE_URL = `${ORIGIN}${PAGE_PATH}`;
const TRUST_PATH = '/trust';

async function gotoPage(page: Page, path = PAGE_PATH): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${path}`).not.toBeNull();
  expect(response!.status(), `${path} returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
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
  '@type': string;
  position?: number;
  name?: string;
  description?: string;
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
  hasPart?: ItemList;
};

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

const isCollectionPage = (d: unknown): d is CollectionPage =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'CollectionPage';

// Case 1 - GET /subprocessors returns 200 and the H1 contains "Sub-Processors"
// or "Sub-processors" (case-insensitive substring).
test('renders 200 with a Sub-Processors H1', async ({ page }) => {
  const errors = await gotoPage(page);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const text = ((await h1.textContent()) ?? '').trim();
  expect(/sub-processors/i.test(text)).toBe(true);
  expect(errors).toEqual([]);
});

// Case 2 - the table renders one row per SUBPROCESSORS entry.
test('renders one subprocessor-row per SUBPROCESSORS entry', async ({ page }) => {
  const errors = await gotoPage(page);
  const rows = page.locator('[data-testid="subprocessor-row"]');
  await expect(rows.first()).toBeVisible();
  await expect(rows).toHaveCount(SUBPROCESSORS.length);
  expect(errors).toEqual([]);
});

// Case 3 - header row cells contain Vendor / Category / What we use them for /
// Trust page (case-insensitive substring per cell).
test('header row lists Vendor / Category / What we use them for / Trust page', async ({ page }) => {
  const errors = await gotoPage(page);
  const table = page.locator('[data-testid="subprocessors-table"]');
  await expect(table).toBeVisible();
  const headers = await table.locator('thead th').allTextContents();
  const joined = headers.map((h) => h.toLowerCase()).join(' | ');
  expect(joined).toContain('vendor');
  expect(joined).toContain('category');
  expect(joined).toContain('what we use them for');
  expect(joined).toContain('trust page');
  expect(errors).toEqual([]);
});

// Case 4 - every trust-link anchor's href starts with https:// and matches the
// entry's publicTrustUrl; every anchor has rel="noopener noreferrer" and
// target="_blank".
test('every trust-link anchor is https + noopener noreferrer + _blank', async ({ page }) => {
  const errors = await gotoPage(page);
  const anchors = page.locator('[data-testid="subprocessor-trust-link"]');
  await expect(anchors).toHaveCount(SUBPROCESSORS.length);
  const attrs = await anchors.evaluateAll((nodes) =>
    nodes.map((n) => ({
      href: (n as HTMLAnchorElement).getAttribute('href') ?? '',
      rel: (n as HTMLAnchorElement).getAttribute('rel') ?? '',
      target: (n as HTMLAnchorElement).getAttribute('target') ?? '',
    })),
  );
  const expectedUrls = new Set(SUBPROCESSORS.map((s) => s.publicTrustUrl));
  expect(attrs.length).toBe(SUBPROCESSORS.length);
  for (const a of attrs) {
    expect(a.href.startsWith('https://'), `href must be https: ${a.href}`).toBe(true);
    expect(expectedUrls.has(a.href), `href ${a.href} not in SUBPROCESSORS`).toBe(true);
    expect(a.rel).toContain('noopener');
    expect(a.rel).toContain('noreferrer');
    expect(a.target).toBe('_blank');
  }
  expect(errors).toEqual([]);
});

// Case 5 - CollectionPage JSON-LD block has the required name + url, and its
// embedded ItemList's itemListElement length equals SUBPROCESSORS.length.
test('emits a CollectionPage JSON-LD with an ItemList mirroring SUBPROCESSORS', async ({ page }) => {
  const errors = await gotoPage(page);
  const blocks = await readJsonLdBlocks(page);
  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  expect(collections, 'exactly one CollectionPage block expected').toHaveLength(1);

  const cp = collections[0].data;
  expect(cp.name).toBe('Digital Craft AI Sub-Processors and Data Recipients');
  expect(cp.url).toBe(PAGE_URL);
  expect(typeof cp.description).toBe('string');
  expect((cp.description ?? '').length).toBeGreaterThan(20);

  const list = cp.hasPart;
  expect(list, 'CollectionPage.hasPart must be present').toBeTruthy();
  expect(list!['@type']).toBe('ItemList');
  const items = list!.itemListElement ?? [];
  expect(items.length).toBe(SUBPROCESSORS.length);
  expect(list!.numberOfItems).toBe(SUBPROCESSORS.length);

  const expectedNames = new Set(SUBPROCESSORS.map((s) => s.name));
  const expectedUrls = new Set(SUBPROCESSORS.map((s) => s.publicTrustUrl));
  for (const item of items) {
    expect(item['@type']).toBe('ListItem');
    expect(typeof item.position).toBe('number');
    expect(typeof item.name).toBe('string');
    expect(expectedNames.has(item.name ?? '')).toBe(true);
    expect(typeof item.url).toBe('string');
    expect(expectedUrls.has(item.url ?? '')).toBe(true);
  }

  expect(errors).toEqual([]);
});

// Case 6 - BreadcrumbList JSON-LD has two items with the second one matching
// the page H1 and linking to https://digitalcraftai.com/subprocessors.
test('emits a two-item BreadcrumbList ending on the subprocessors URL', async ({ page }) => {
  const errors = await gotoPage(page);
  const blocks = await readJsonLdBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(breadcrumbs, 'exactly one BreadcrumbList block expected').toHaveLength(1);
  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[0].item).toBe(ORIGIN);
  expect(/sub-processors/i.test(items[1].name ?? '')).toBe(true);
  expect(items[1].item).toBe(PAGE_URL);
  expect(errors).toEqual([]);
});

// Case 7 - print-media case: page.emulateMedia({ media: 'print' }) and assert
// the sub-processor table is visible while the site nav and footer elements
// are hidden. Auto-retrying assertions per the 2026-09-05 route-code-splitting
// lesson.
test('print media hides site chrome and keeps the table visible', async ({ page }) => {
  const errors = await gotoPage(page);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('[data-testid="subprocessors-table"]')).toBeVisible();
  await expect(page.locator('nav').first()).toBeHidden();
  await expect(page.locator('footer').first()).toBeHidden();
  expect(errors).toEqual([]);
});

// Case 8 - print-button case: override window.print via page.addInitScript
// BEFORE navigation (init scripts run before every document load) so a
// browser without a print dialog does not stall. Click the print button and
// assert (a) window.print fires exactly once, (b) the subprocessors_print
// beacon fires BEFORE window.print (the print dialog blocks the event loop,
// so post-print beacons are unreliable).
test('print button fires the beacon BEFORE window.print, exactly once', async ({ page }) => {
  await page.addInitScript(() => {
    const win = window as unknown as {
      __events: string[];
      __printCalls: number;
      gtag: (command: string, action: string, params?: Record<string, unknown>) => void;
    };
    win.__events = [];
    win.__printCalls = 0;
    win.gtag = (_command, _action, params) => {
      const label =
        params && typeof params.event_label === 'string' ? params.event_label : '';
      if (label.includes('subprocessors_print')) {
        win.__events.push(`beacon:${label}`);
      }
    };
    window.print = () => {
      win.__printCalls += 1;
      win.__events.push('print');
    };
  });
  const errors = await gotoPage(page);
  await page.locator('[data-testid="subprocessors-print"]').click();
  const state = await page.evaluate(() => ({
    events: (window as unknown as { __events: string[] }).__events,
    calls: (window as unknown as { __printCalls: number }).__printCalls,
  }));
  expect(state.calls, 'window.print must be called exactly once').toBe(1);
  const beaconIdx = state.events.findIndex((e) => e.startsWith('beacon:'));
  const printIdx = state.events.indexOf('print');
  expect(beaconIdx, 'subprocessors_print beacon was not recorded').toBeGreaterThanOrEqual(0);
  expect(printIdx, 'window.print was not recorded').toBeGreaterThanOrEqual(0);
  expect(beaconIdx, 'beacon must fire BEFORE window.print').toBeLessThan(printIdx);
  expect(errors).toEqual([]);
});

// Case 9 - sibling-page-regression case: navigate to /trust and re-run the
// key ticket 0018 assertions (H1 substring "How Our Demos Handle Your Data"
// and every SUBPROCESSORS name rendered in the DOM) to prove the mechanical
// extraction to src/data/subprocessors.ts did not break the /trust narrative.
test('sibling /trust page still passes its key ticket 0018 assertions', async ({ page }) => {
  const errors = await gotoPage(page, TRUST_PATH);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const text = ((await h1.textContent()) ?? '').trim().replace(/\s+/g, ' ');
  expect(text).toBe('How Our Demos Handle Your Data');

  const bodyText = (await page.locator('body').textContent()) ?? '';
  for (const s of SUBPROCESSORS) {
    expect(
      bodyText,
      `provider "${s.name}" must remain in the visible /trust page`,
    ).toContain(s.name);
  }
  expect(errors).toEqual([]);
});

// Case 10 - dark-mode case: apply document.documentElement.classList.add('dark')
// and assert the table renders.
test('renders in dark mode', async ({ page }) => {
  const errors = await gotoPage(page);
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.locator('[data-testid="subprocessors-table"]')).toBeVisible();
  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(hasDarkClass).toBe(true);
  expect(errors).toEqual([]);
});

// Case 11 - no-em-dash case: read page.textContent('body') and assert no
// String.fromCharCode(8212) anywhere on the rendered page. Also spot-check
// every emitted JSON-LD block string.
test('no em-dash characters on the subprocessors page or its JSON-LD', async ({ page }) => {
  const errors = await gotoPage(page);
  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(bodyText.length, 'body should have text content').toBeGreaterThan(100);
  expect(bodyText, 'no em-dash allowed in visible copy').not.toContain(EM_DASH);
  const blocks = await readJsonLdBlocks(page);
  for (const b of blocks) {
    expect(b.raw, 'no em-dash allowed in emitted JSON-LD').not.toContain(EM_DASH);
  }
  expect(errors).toEqual([]);
});

// Case bonus - path is in ROUTES allow-list per the 2026-06-07
// src-imports-tests lesson. Sanity check that the wire-up landed.
test('subprocessors path is in the ROUTES allow-list', async () => {
  expect(new Set<string>(ROUTES).has(PAGE_PATH)).toBe(true);
});

// Case 12 - Helmet meta[name="description"] assertion. Per the 2026-05-25 SEO
// Pilot lesson /subprocessors is NOT in the index.html SEO Pilot pages table,
// so we assert the LAST meta[name="description"] content (Helmet appends its
// tag after the index.html default) directly instead of toHaveTitle().
test('Helmet emits a non-empty meta description for /subprocessors', async ({ page }) => {
  const errors = await gotoPage(page);
  await expect
    .poll(
      () =>
        page
          .locator('head meta[name="description"]')
          .evaluateAll((nodes) => nodes.map((n) => (n as HTMLMetaElement).content)),
      { timeout: 10_000 },
    )
    .toEqual(
      expect.arrayContaining([
        expect.stringMatching(/(sub-processor|third-party|vendor|data recipient)/i),
      ]),
    );

  const descriptions = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) => nodes.map((n) => (n as HTMLMetaElement).content));
  const helmetDescription = descriptions[descriptions.length - 1];
  expect(typeof helmetDescription).toBe('string');
  expect(helmetDescription.length).toBeGreaterThan(20);
  expect(helmetDescription).not.toContain(EM_DASH);

  // Mirror-source: the last meta[name="description"] equals the CollectionPage
  // schema's description byte-for-byte.
  const blocks = await readJsonLdBlocks(page);
  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  expect(collections).toHaveLength(1);
  expect(collections[0].data.description).toBe(helmetDescription);

  expect(errors).toEqual([]);
});
