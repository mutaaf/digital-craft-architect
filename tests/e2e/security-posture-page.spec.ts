import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS, ROUTES } from './routes';
import { securityControls } from '../../src/data/securityControls';

// Ticket 0081 - /security posture page. Each test maps 1:1 to a box in the
// ticket's acceptance-criteria section (12 boxes). Modeled on
// `tests/e2e/subprocessors.spec.ts` (ticket 0069, the closest structural peer
// for a trust-family public page emitting a URL-scoped CollectionPage +
// BreadcrumbList JSON-LD pair backed by a `src/data/` typed constant).
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this spec the
// implementer greps every `tests/e2e/*-jsonld.spec.ts` for
// `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates and any
// `toHaveLength(1)` / "exactly one" assertions over those `@type`s. Every
// predecessor CollectionPage predicate (0048 /compare, 0057 /case-studies,
// 0069 /subprocessors, 0071 /ai-for-hospitality, 0079 /blog) is URL-scoped
// to its own path, so a sibling /security-scoped CollectionPage block cannot
// collide with any of them. Grep result documented in the ticket's
// Implementation log.
//
// Per the 2026-09-05 route-code-splitting lesson, /security is lazy-wrapped
// in <Suspense>, so `gotoSecurity` waits for the RouteFallback to detach AND
// for the H1 to mount before reading page state.
// Per the 2026-09-10 mount-signal lesson, the H1 visibility wait is the true
// "page ready" signal for a lazy-loaded route with mount-time side effects.
// Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the em-dash check
// filters the block list down to blocks THIS PAGE actually emits
// (CollectionPage, BreadcrumbList) so the site-wide index.html Organization
// block's legitimate historical em-dash (ticket 0025) is not flagged.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// character (the 2026-05-07 brand-voice Hard NO bans the literal even in
// tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const PAGE_PATH = '/security';
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
type CreativeWorkPart = {
  '@type'?: string;
  name?: string;
  description?: string;
  dateModified?: string;
};
type CollectionPage = {
  '@context'?: string;
  '@type': string;
  name?: string;
  description?: string;
  url?: string;
  hasPart?: CreativeWorkPart[];
};

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

const isCollectionPage = (d: unknown): d is CollectionPage =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'CollectionPage';

async function gotoSecurity(page: Page, path = PAGE_PATH): Promise<string[]> {
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

// Box 1 (AC #1 + AC #12 status enum guard + AC #11 eight-row minimum):
// securityControls has at least eight rows and every row's status is one of
// the three enum values.
test('securityControls has >= 8 rows with valid status enum values', async () => {
  expect(securityControls.length).toBeGreaterThanOrEqual(8);
  const validStatuses = new Set(['in-place', 'in-progress', 'aspirational']);
  for (const c of securityControls) {
    expect(validStatuses.has(c.status), `invalid status "${c.status}" on ${c.id}`).toBe(true);
    expect(c.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  }
});

// Box 2 (AC #4): /security path is in the ROUTES allow-list per the
// 2026-06-07 mirror-source-across-src-tests lesson.
test('/security path is in the ROUTES allow-list', async () => {
  expect(new Set<string>(ROUTES).has(PAGE_PATH)).toBe(true);
});

// Box 3 (AC #2): GET /security returns 200 and renders an H1 whose text
// contains "Security Posture" case-insensitive.
test('renders 200 with a Security Posture H1', async ({ page }) => {
  const errors = await gotoSecurity(page);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const text = ((await h1.textContent()) ?? '').trim();
  expect(/security posture/i.test(text)).toBe(true);
  expect(errors).toEqual([]);
});

// Box 4 (AC #2 + AC #11): renders exactly securityControls.length control
// cards. Count is derived from the mirror-source constant per the 2026-05-25
// rule, not hard-coded.
test('renders one security-control card per securityControls entry', async ({ page }) => {
  const errors = await gotoSecurity(page);
  const cards = page.locator('[data-testid="security-control-card"]');
  await expect(cards.first()).toBeVisible();
  await expect(cards).toHaveCount(securityControls.length);
  expect(errors).toEqual([]);
});

// Box 5 (AC #2): every card renders a "Last reviewed: YYYY-MM-DD" line whose
// date matches the ISO regex.
test('every card renders an ISO YYYY-MM-DD last-reviewed date', async ({ page }) => {
  const errors = await gotoSecurity(page);
  const dates = await page
    .locator('[data-testid="security-control-last-reviewed"]')
    .allTextContents();
  expect(dates.length).toBe(securityControls.length);
  const isoRe = /\d{4}-\d{2}-\d{2}/;
  for (const d of dates) {
    expect(isoRe.test(d), `expected ISO date in "${d}"`).toBe(true);
  }
  expect(errors).toEqual([]);
});

// Box 6 (AC #6): exactly one CollectionPage JSON-LD block whose url is the
// /security URL and whose hasPart array length equals securityControls.length.
// Every hasPart element is a CreativeWork with name / description /
// dateModified matching a real securityControls row.
test('emits exactly one CollectionPage JSON-LD with hasPart mirroring securityControls', async ({
  page,
}) => {
  const errors = await gotoSecurity(page);
  const blocks = await readJsonLdBlocks(page);
  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  expect(collections, 'exactly one CollectionPage block expected on /security').toHaveLength(1);

  const cp = collections[0].data;
  expect(cp.url).toBe(PAGE_URL);
  expect(typeof cp.description).toBe('string');
  expect((cp.description ?? '').length).toBeGreaterThan(20);

  const parts = cp.hasPart ?? [];
  expect(parts.length).toBe(securityControls.length);

  const expectedNames = new Set(securityControls.map((c) => c.name));
  const expectedDescriptions = new Set(securityControls.map((c) => c.description));
  const expectedDates = new Set(securityControls.map((c) => c.lastReviewed));
  for (const part of parts) {
    expect(part['@type']).toBe('CreativeWork');
    expect(typeof part.name).toBe('string');
    expect(expectedNames.has(part.name ?? '')).toBe(true);
    expect(typeof part.description).toBe('string');
    expect(expectedDescriptions.has(part.description ?? '')).toBe(true);
    expect(typeof part.dateModified).toBe('string');
    expect(expectedDates.has(part.dateModified ?? '')).toBe(true);
  }

  expect(errors).toEqual([]);
});

// Box 7 (AC #6): exactly one BreadcrumbList JSON-LD block with two ListItem
// entries named "Home" and "Security".
test('emits a two-item BreadcrumbList (Home -> Security)', async ({ page }) => {
  const errors = await gotoSecurity(page);
  const blocks = await readJsonLdBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(breadcrumbs, 'exactly one BreadcrumbList block expected on /security').toHaveLength(1);
  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[1].name).toBe('Security');
  expect(items[1].item).toBe(PAGE_URL);
  expect(errors).toEqual([]);
});

// Box 8 (AC #2): every cross-link chip whose seeAlso.href is set renders as
// an <a> element pointing at that href.
test('every seeAlso cross-link renders as an anchor with the expected href', async ({ page }) => {
  const errors = await gotoSecurity(page);
  const rowsWithSeeAlso = securityControls.filter((c) => c.seeAlso);
  expect(rowsWithSeeAlso.length).toBeGreaterThan(0);
  const anchors = page.locator('[data-testid="security-control-seealso"]');
  await expect(anchors).toHaveCount(rowsWithSeeAlso.length);
  const hrefs = await anchors.evaluateAll((nodes) =>
    nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
  );
  const expected = new Set(rowsWithSeeAlso.map((c) => c.seeAlso!.href));
  for (const href of hrefs) {
    expect(expected.has(href), `href ${href} not in seeAlso set`).toBe(true);
  }
  expect(errors).toEqual([]);
});

// Box 9 (AC #8): the "Security posture" footer chip renders on / and clicking
// it fires trackCTAClick('footer_security_chip', <current-route>) before
// navigating to /security. Following the ticket 0023 footer-providers-chip
// pattern, gtag is stubbed AFTER page load (page.evaluate rather than
// addInitScript) so the Google Analytics loader script cannot overwrite the
// stub, and click's default navigation is suppressed once so the captured
// events survive past the click and can be read back.
test('footer Security posture chip fires the beacon on click', async ({ page }) => {
  const errors = await gotoSecurity(page, '/');

  await page.evaluate(() => {
    (window as unknown as { __ctaEvents: unknown[][] }).__ctaEvents = [];
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (
      ...args: unknown[]
    ) => {
      (window as unknown as { __ctaEvents: unknown[][] }).__ctaEvents.push(args);
    };
  });

  const chip = page.locator('[data-testid="footer-security-chip"]');
  await expect(chip).toBeVisible();
  const chipLink = page
    .locator('a[href="/security"]')
    .filter({ has: page.locator('[data-testid="footer-security-chip"]') });
  await expect(chipLink).toHaveCount(1);
  await chipLink.evaluate((el) =>
    el.addEventListener('click', (e) => e.preventDefault(), { capture: true, once: true }),
  );
  await chipLink.click();

  const events = (await page.evaluate(
    () => (window as unknown as { __ctaEvents: unknown[][] }).__ctaEvents,
  )) as unknown[][];
  const ctaEvents = events.filter(
    (e) => Array.isArray(e) && e[0] === 'event' && e[1] === 'cta_click',
  );
  const labels = ctaEvents.map((e) => {
    const params = e[2] as { event_label?: string };
    return params?.event_label ?? '';
  });
  expect(
    labels.some((l) => /footer_security_chip/.test(l) && /\//.test(l)),
    `expected cta_click event_label "footer_security_chip - <route>", got: ${labels.join(' | ')}`,
  ).toBe(true);
  expect(errors).toEqual([]);
});

// Box 9b (AC #8): clicking the chip actually navigates to /security (SPA
// transition, no full reload).
test('footer Security posture chip navigates to /security', async ({ page }) => {
  const errors = await gotoSecurity(page, '/');
  const chipLink = page
    .locator('a[href="/security"]')
    .filter({ has: page.locator('[data-testid="footer-security-chip"]') });
  await expect(chipLink).toBeVisible();
  await chipLink.click();
  await expect(page).toHaveURL(/\/security$/);
  expect(errors).toEqual([]);
});

// Box 10 (AC #9): dark-mode case - add document.documentElement.classList.add('dark')
// and assert the control cards still render.
test('renders in dark mode', async ({ page }) => {
  const errors = await gotoSecurity(page);
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.locator('[data-testid="security-control-card"]').first()).toBeVisible();
  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(hasDarkClass).toBe(true);
  expect(errors).toEqual([]);
});

// Box 11 (AC #8): no-em-dash case. Read page.textContent('body') and assert
// no U+2014 anywhere in visible copy. Then spot-check ONLY the JSON-LD blocks
// THIS PAGE emits (CollectionPage + BreadcrumbList) per the 2026-09-08 lesson.
// The homepage Organization block from index.html (ticket 0025) carries a
// legitimate em-dash and must NOT be flagged.
test('no em-dash on the security page or the blocks it emits', async ({ page }) => {
  const errors = await gotoSecurity(page);
  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(bodyText.length, 'body should have text content').toBeGreaterThan(100);
  expect(bodyText, 'no em-dash allowed in visible copy').not.toContain(EM_DASH);
  const blocks = await readJsonLdBlocks(page);
  const owned = blocks.filter((b) => isBreadcrumb(b.data) || isCollectionPage(b.data));
  expect(
    owned.length,
    'BreadcrumbList + CollectionPage blocks emitted by /security must both render',
  ).toBe(2);
  for (const b of owned) {
    expect(b.raw, 'no em-dash allowed in a /security-owned JSON-LD block').not.toContain(EM_DASH);
  }
  expect(errors).toEqual([]);
});

// Box 12 (AC #6 mirror-source): the CollectionPage description equals the
// Helmet-managed meta[name="description"] content byte-for-byte per the
// 2026-05-25 mirror-source rule.
test('meta description mirrors the CollectionPage description', async ({ page }) => {
  const errors = await gotoSecurity(page);
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
