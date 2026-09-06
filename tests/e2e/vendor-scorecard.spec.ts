import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS, ROUTES } from './routes';

// Ticket 0067 - /questions-to-ask-an-ai-vendor/scorecard printable AI vendor
// scoring template. Each test maps 1:1 to a case in the acceptance criteria
// box 10. Modeled on tests/e2e/questions-to-ask-an-ai-vendor.spec.ts (ticket
// 0061, the closest structural peer) and tests/e2e/roi-card-on-dashboard.spec.ts
// (ticket 0062, for the addInitScript print-spy pattern).
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this spec the
// implementer grepped every tests/e2e/*-jsonld.spec.ts AND
// tests/e2e/questions-to-ask-an-ai-vendor.spec.ts for `=== 'FAQPage'` and
// `=== 'BreadcrumbList'` predicates. FAQPage: two matches
// (pricing-faq-structured-data.spec.ts:88 and
// questions-to-ask-an-ai-vendor.spec.ts:87), both URL-scoped to pages other
// than /questions-to-ask-an-ai-vendor/scorecard. The scorecard page emits NO
// FAQPage block so no collision. BreadcrumbList: 30+ matches, every one
// URL-scoped to its own page; the scorecard's own BreadcrumbList (three
// items, URL-scoped) cannot collide. Grep recorded in the ticket's
// Implementation log.
//
// Per the 2026-09-05 route-code-splitting lesson, prefer auto-retrying
// await expect(locator).toBeVisible() / .toBeHidden() over one-shot
// .isVisible() for print-mode assertions - the RouteFallback trips
// root.innerHTML.length before the real page mounts. The gotoPage helper
// polls with a large enough length and then explicitly waits for the H1
// so the spec is stable under lazy loading.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the 2026-05-07 brand-voice Hard NO bans the literal character even in
// tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const PAGE_PATH = '/questions-to-ask-an-ai-vendor/scorecard';
const PAGE_URL = `${ORIGIN}${PAGE_PATH}`;
const SIBLING_PATH = '/questions-to-ask-an-ai-vendor';

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
type FaqPage = { '@type': string; mainEntity?: unknown[] };

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

const isFaqPage = (d: unknown): d is FaqPage =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'FAQPage';

// Case 1 - GET /questions-to-ask-an-ai-vendor/scorecard returns 200 and the
// H1 contains "Scoring Sheet" or "Scorecard" (case-insensitive substring).
test('renders 200 with a Scoring Sheet or Scorecard H1', async ({ page }) => {
  const errors = await gotoPage(page);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const text = ((await h1.textContent()) ?? '').trim();
  expect(/scoring sheet|scorecard/i.test(text)).toBe(true);
  expect(errors).toEqual([]);
});

// Case 2 - the table renders 10-12 data rows, matching the VENDOR_QUESTIONS
// array length. Counting data-testid="scorecard-row" locators.
test('renders 10-12 scorecard rows', async ({ page }) => {
  const errors = await gotoPage(page);
  const rows = page.locator('[data-testid="scorecard-row"]');
  await expect(rows.first()).toBeVisible();
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(10);
  expect(count).toBeLessThanOrEqual(12);
  expect(errors).toEqual([]);
});

// Case 3 - the header row cells contain "Question", "Vendor A", "Vendor B",
// "Vendor C", "Notes" (case-insensitive substring per cell).
test('header row lists Question / Vendor A / Vendor B / Vendor C / Notes', async ({ page }) => {
  const errors = await gotoPage(page);
  const table = page.locator('[data-testid="vendor-scorecard-table"]');
  await expect(table).toBeVisible();
  const headers = await table.locator('thead th').allTextContents();
  const joined = headers.map((h) => h.toLowerCase()).join(' | ');
  expect(joined).toContain('question');
  expect(joined).toContain('vendor a');
  expect(joined).toContain('vendor b');
  expect(joined).toContain('vendor c');
  expect(joined).toContain('notes');
  expect(errors).toEqual([]);
});

// Case 4 - each data row contains at least three data-testid="score-cell"
// elements (one per vendor column).
test('each row has at least three score-cell elements', async ({ page }) => {
  const errors = await gotoPage(page);
  const rows = page.locator('[data-testid="scorecard-row"]');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const cells = rows.nth(i).locator('[data-testid="score-cell"]');
    const cellCount = await cells.count();
    expect(cellCount, `row ${i + 1} should have >= 3 score cells`).toBeGreaterThanOrEqual(3);
  }
  expect(errors).toEqual([]);
});

// Case 5 - the BreadcrumbList JSON-LD has three items with the last one named
// matching the page H1 substring and linking to
// https://digitalcraftai.com/questions-to-ask-an-ai-vendor/scorecard.
test('emits a three-item BreadcrumbList ending on the scorecard URL', async ({ page }) => {
  const errors = await gotoPage(page);
  const blocks = await readJsonLdBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(breadcrumbs, 'exactly one BreadcrumbList expected').toHaveLength(1);
  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(3);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[0].item).toBe(ORIGIN);
  expect(/questions to ask/i.test(items[1].name ?? '')).toBe(true);
  expect(items[1].item).toBe(`${ORIGIN}${SIBLING_PATH}`);
  expect(/scoring sheet|scorecard/i.test(items[2].name ?? '')).toBe(true);
  expect(items[2].item).toBe(PAGE_URL);
  expect(errors).toEqual([]);
});

// Case 6 - NO FAQPage JSON-LD block is emitted on this page. The sibling
// page already owns the FAQPage schema for these questions; duplicating it
// risks a Google structured-data duplicate-content flag.
test('emits no FAQPage JSON-LD block', async ({ page }) => {
  const errors = await gotoPage(page);
  const blocks = await readJsonLdBlocks(page);
  const faqs = blocks.filter((b) => isFaqPage(b.data));
  expect(faqs, 'scorecard page must NOT emit a FAQPage block').toHaveLength(0);
  expect(errors).toEqual([]);
});

// Case 7 - print-view case: emulate media 'print' and assert (a) the
// scorecard table is visible, (b) the site nav element is hidden, (c) the
// site footer element is hidden. Uses auto-retrying assertions per the
// 2026-09-05 route-code-splitting lesson.
test('print media hides site chrome and keeps the scorecard visible', async ({ page }) => {
  const errors = await gotoPage(page);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('[data-testid="vendor-scorecard-table"]')).toBeVisible();
  await expect(page.locator('nav').first()).toBeHidden();
  await expect(page.locator('footer').first()).toBeHidden();
  expect(errors).toEqual([]);
});

// Case 8 - print-button case: override window.print via page.addInitScript
// BEFORE navigation (init scripts run before every document load) so a
// browser without a print dialog does not stall. Click the print button and
// assert the print call fires exactly once.
test('print button calls window.print exactly once', async ({ page }) => {
  await page.addInitScript(() => {
    const win = window as unknown as { __printCalls: number };
    win.__printCalls = 0;
    window.print = () => {
      win.__printCalls += 1;
    };
  });
  const errors = await gotoPage(page);
  await page.locator('[data-testid="scorecard-print"]').click();
  const calls = await page.evaluate(
    () => (window as unknown as { __printCalls: number }).__printCalls,
  );
  expect(calls).toBe(1);
  expect(errors).toEqual([]);
});

// Case 9 - analytics-fire-order case: assert the vendor_scorecard_print
// beacon fires BEFORE the print call. The print dialog blocks the event
// loop so any beacon after window.print may not flush; the fire order is
// contractual. Records events in a window-level array in call order by
// stubbing window.gtag (the sink trackCTAClick / trackEvent write to) so
// the recorder works regardless of whether real GA is initialized in the
// test env.
test('analytics beacon fires before window.print', async ({ page }) => {
  await page.addInitScript(() => {
    const win = window as unknown as {
      __events: string[];
      gtag: (command: string, action: string, params?: Record<string, unknown>) => void;
    };
    win.__events = [];
    win.gtag = (_command, _action, params) => {
      const label =
        params && typeof params.event_label === 'string' ? params.event_label : '';
      if (label.includes('vendor_scorecard_print')) {
        win.__events.push(`beacon:${label}`);
      }
    };
    window.print = () => {
      (window as unknown as { __events: string[] }).__events.push('print');
    };
  });
  const errors = await gotoPage(page);
  await page.locator('[data-testid="scorecard-print"]').click();
  const events = await page.evaluate(
    () => (window as unknown as { __events: string[] }).__events,
  );
  const beaconIdx = events.findIndex((e) => e.startsWith('beacon:'));
  const printIdx = events.indexOf('print');
  expect(beaconIdx, 'vendor_scorecard_print beacon was not recorded').toBeGreaterThanOrEqual(0);
  expect(printIdx, 'window.print was not called').toBeGreaterThanOrEqual(0);
  expect(beaconIdx, 'beacon must fire BEFORE window.print').toBeLessThan(printIdx);
  expect(errors).toEqual([]);
});

// Case 10 - sibling-page-still-passes-ticket-0061-spec regression: navigate
// to /questions-to-ask-an-ai-vendor and re-run the key assertions from
// tests/e2e/questions-to-ask-an-ai-vendor.spec.ts (H1 substring, FAQPage
// block present with mainEntity length matching the visible rendering) to
// prove the VENDOR_QUESTIONS mechanical extraction did not break the
// sibling.
test('sibling page (ticket 0061) still passes its key assertions', async ({ page }) => {
  const errors = await gotoPage(page, SIBLING_PATH);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const text = ((await h1.textContent()) ?? '').trim();
  expect(/questions to ask/i.test(text)).toBe(true);

  const blocks = await readJsonLdBlocks(page);
  const faqs = blocks.filter((b): b is { raw: string; data: FaqPage } => isFaqPage(b.data));
  expect(faqs, 'sibling FAQPage block must still be emitted').toHaveLength(1);
  const entities = faqs[0].data.mainEntity ?? [];
  expect(entities.length).toBeGreaterThanOrEqual(10);
  expect(entities.length).toBeLessThanOrEqual(12);

  const visibleQuestionCount = await page
    .locator('[data-testid="vendor-question"]')
    .count();
  expect(entities.length).toBe(visibleQuestionCount);
  expect(errors).toEqual([]);
});

// Case 11 - dark mode case: apply document.documentElement.classList.add('dark')
// and assert the table renders.
test('renders in dark mode', async ({ page }) => {
  const errors = await gotoPage(page);
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.locator('[data-testid="vendor-scorecard-table"]')).toBeVisible();
  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(hasDarkClass).toBe(true);
  expect(errors).toEqual([]);
});

// Case 12 - no-em-dash case: read page.textContent('body') and assert no
// String.fromCharCode(8212) character anywhere on the rendered page. Also
// spot-check the JSON-LD block for the same character.
test('no em-dash characters on the scorecard page', async ({ page }) => {
  const errors = await gotoPage(page);
  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(bodyText.length, 'body should have text content').toBeGreaterThan(100);
  expect(bodyText, 'no em-dash allowed in visible copy').not.toContain(EM_DASH);
  const blocks = await readJsonLdBlocks(page);
  for (const b of blocks) {
    if (!isBreadcrumb(b.data)) continue;
    expect(b.raw, 'no em-dash allowed in BreadcrumbList JSON-LD').not.toContain(EM_DASH);
  }
  expect(errors).toEqual([]);
});

// Case bonus - path is in ROUTES allow-list per the 2026-06-07
// src-imports-tests lesson. Sanity check that the extraction wire-up landed.
test('scorecard path is in the ROUTES allow-list', async () => {
  expect(new Set<string>(ROUTES).has(PAGE_PATH)).toBe(true);
});
