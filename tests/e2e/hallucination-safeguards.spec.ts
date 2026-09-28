import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS, ROUTES } from './routes';
import {
  HALLUCINATION_POSTURE,
  PER_DEMO_SAFEGUARDS,
  RECENT_HALLUCINATION_FIXES,
} from '../../src/data/hallucinationSafeguards';

// Ticket 0102 - /hallucination-safeguards dated per-demo grounding + mitigation
// log page. Each test maps 1:1 to a sub-case in the ticket's acceptance box.
// Modeled on `tests/e2e/accessibility-statement.spec.ts` (ticket 0097, the
// freshest predecessor in the same dated-trust-artifact family).
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this spec the
// implementer grepped every `tests/e2e/*-jsonld.spec.ts` for
// `=== 'CollectionPage'`, `=== 'BreadcrumbList'`, and `toHaveLength(1)`
// predicates. Every predecessor CollectionPage predicate is URL-scoped to
// its own hub path (0069 /subprocessors, 0071 /ai-for-hospitality, 0079
// /blog, 0088 /model-card, 0090 /agent-fleet, 0094 /ai-risks-we-watch,
// 0097 /accessibility-statement, etc.), so the sibling
// /hallucination-safeguards-scoped blocks cannot collide. Grep result
// documented in the ticket Implementation log.
//
// Per the 2026-09-05 route-code-splitting lesson `/hallucination-safeguards`
// is lazy-wrapped in <Suspense>, so `gotoSafeguards` waits for the
// RouteFallback (role=status, aria-label=Loading) to detach AND for the H1
// to be visible before probing the DOM (2026-09-10 mount-signal lesson).
//
// Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the em-dash check
// scopes ONLY to the two blocks THIS PAGE emits (CollectionPage +
// BreadcrumbList) filtered by their `@type`, NOT to every application/ld+json
// block on the page (the homepage Organization block from index.html carries
// a legitimate em-dash and must not be flagged).
//
// Per the 2026-06-15 attribute-list regex lesson, any regex in this spec
// that matches an XML/HTML attribute list uses `[^>]*`, not `[^/>]*`.
//
// Per the 2026-06-07 src-imports-tests lesson, the spec imports the
// canonical HALLUCINATION_POSTURE + PER_DEMO_SAFEGUARDS +
// RECENT_HALLUCINATION_FIXES constants from
// src/data/hallucinationSafeguards.ts and ROUTES from src/data/routes.ts
// directly, so the visible page and the spec cannot drift.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// character (the 2026-05-07 brand-voice Hard NO bans the literal even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const PAGE_PATH = '/hallucination-safeguards';
const PAGE_URL = `${ORIGIN}${PAGE_PATH}`;
const PAGE_H1 = 'Hallucination Safeguards';
const LAST_REVIEWED_LINE = `Last reviewed: ${HALLUCINATION_POSTURE.lastReviewed}`;
const SHIPPED_ROUTES_SET = new Set<string>(ROUTES);
const CONTACT_EMAIL = 'mutaaf@digitalcraftai.com';

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

async function gotoSafeguards(page: Page, path = PAGE_PATH): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${path}`).not.toBeNull();
  expect(response!.status(), `${path} returned ${response!.status()}`).toBeLessThan(400);
  // RouteFallback detach per the 2026-09-05 lesson.
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

// Encoded-invariant hook per the 2026-05-28 sitemap-lastmod lesson: the
// data-file module-load assertion throws on import; this case gives a
// friendlier Playwright error and pins the ticket's row-shape contract.
test('HALLUCINATION_POSTURE + PER_DEMO_SAFEGUARDS + RECENT_HALLUCINATION_FIXES invariants', async () => {
  const isoRe = /^\d{4}-\d{2}-\d{2}$/;
  expect(isoRe.test(HALLUCINATION_POSTURE.lastReviewed)).toBe(true);
  expect(HALLUCINATION_POSTURE.summary.length).toBeGreaterThan(20);
  expect(HALLUCINATION_POSTURE.summary).not.toContain(EM_DASH);

  expect(PER_DEMO_SAFEGUARDS.length).toBeGreaterThan(0);
  const demoIds = new Set<string>();
  for (const row of PER_DEMO_SAFEGUARDS) {
    expect(row.demoId.length).toBeGreaterThan(0);
    expect(demoIds.has(row.demoId), `duplicate demoId "${row.demoId}"`).toBe(false);
    demoIds.add(row.demoId);
    expect(row.demoName.length).toBeGreaterThan(0);
    expect(row.groundingPractice.length).toBeGreaterThan(20);
    expect(row.knownFailureModes.length).toBeGreaterThan(20);
    expect(row.safeguards.length).toBeGreaterThan(20);
    expect(row.groundingPractice).not.toContain(EM_DASH);
    expect(row.knownFailureModes).not.toContain(EM_DASH);
    expect(row.safeguards).not.toContain(EM_DASH);
    expect(row.sourcePaths.length).toBeGreaterThan(0);
    for (const p of row.sourcePaths) {
      // Every cited safeguard path ends in .ts or .tsx.
      expect(/\.(ts|tsx)$/.test(p), `sourcePath "${p}" does not end in .ts/.tsx`).toBe(true);
    }
  }

  expect(RECENT_HALLUCINATION_FIXES.length).toBeGreaterThan(0);
  const fixKeys = new Set<string>();
  for (const row of RECENT_HALLUCINATION_FIXES) {
    expect(isoRe.test(row.date), `bad ISO date "${row.date}"`).toBe(true);
    expect(row.date <= HALLUCINATION_POSTURE.lastReviewed).toBe(true);
    expect(demoIds.has(row.demoId), `fix demoId "${row.demoId}" not in PER_DEMO_SAFEGUARDS`).toBe(true);
    expect(row.summary.length).toBeGreaterThan(20);
    expect(row.summary).not.toContain(EM_DASH);
    const key = `${row.date}::${row.demoId}::${row.summary}`;
    expect(fixKeys.has(key), `duplicate fix row ${key}`).toBe(false);
    fixKeys.add(key);
  }
});

// AC #1.1 + #1.2: GET /hallucination-safeguards returns 200; renders H1.
test('renders 200 with a "Hallucination Safeguards" H1', async ({ page }) => {
  const errors = await gotoSafeguards(page);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const text = ((await h1.textContent()) ?? '').trim();
  expect(/hallucination safeguards/i.test(text)).toBe(true);
  expect(errors).toEqual([]);
});

// AC #1.3: "Last reviewed: 2026-09-28" line matching HALLUCINATION_POSTURE
// (mirror-source per 2026-05-25).
test('renders the "Last reviewed" line matching HALLUCINATION_POSTURE.lastReviewed', async ({
  page,
}) => {
  const errors = await gotoSafeguards(page);
  const chip = page.locator('[data-testid="hallucination-last-reviewed"]');
  await expect(chip).toBeVisible();
  const text = ((await chip.textContent()) ?? '').trim();
  expect(text).toContain(LAST_REVIEWED_LINE);
  expect(errors).toEqual([]);
});

// AC #1.4: per-demo table renders exactly PER_DEMO_SAFEGUARDS.length rows,
// data-testid="hallucination-demo-row" (2026-09-06 VISIBLE_LIMIT lesson).
test('renders one per-demo row per PER_DEMO_SAFEGUARDS entry', async ({ page }) => {
  const errors = await gotoSafeguards(page);
  const rows = page.locator('[data-testid="hallucination-demo-row"]');
  await expect(rows.first()).toBeVisible();
  await expect(rows).toHaveCount(PER_DEMO_SAFEGUARDS.length);
  expect(errors).toEqual([]);
});

// AC #6.5: every row's sourcePaths cell text matches at least one .ts/.tsx
// string.
test('every rendered demo row sourcePaths cell shows a .ts or .tsx path', async ({ page }) => {
  const errors = await gotoSafeguards(page);
  const cells = await page
    .locator('[data-testid="hallucination-demo-source"]')
    .allTextContents();
  expect(cells.length).toBe(PER_DEMO_SAFEGUARDS.length);
  for (const cell of cells) {
    expect(/\.(ts|tsx)/.test(cell), `sourcePaths cell "${cell}" missing .ts/.tsx`).toBe(true);
  }
  expect(errors).toEqual([]);
});

// AC #1.5 + #6.6: recent-fixes table renders exactly N rows with
// data-testid="hallucination-fix-row"; every row's demoId matches a
// PER_DEMO_SAFEGUARDS entry.
test('renders one recent-fixes row per RECENT_HALLUCINATION_FIXES entry', async ({ page }) => {
  const errors = await gotoSafeguards(page);
  const rows = page.locator('[data-testid="hallucination-fix-row"]');
  await expect(rows.first()).toBeVisible();
  await expect(rows).toHaveCount(RECENT_HALLUCINATION_FIXES.length);
  expect(errors).toEqual([]);
});

// AC #6.7: exactly one CollectionPage JSON-LD block with `name` byte-matching
// the H1 substring and `dateModified` byte-matching
// HALLUCINATION_POSTURE.lastReviewed (mirror-source per 2026-05-25).
test('emits exactly one CollectionPage JSON-LD scoped to /hallucination-safeguards', async ({
  page,
}) => {
  const errors = await gotoSafeguards(page);
  const blocks = await readJsonLdBlocks(page);
  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  expect(
    collections,
    'exactly one CollectionPage block expected on /hallucination-safeguards',
  ).toHaveLength(1);

  const cp = collections[0].data;
  expect(cp.url).toBe(PAGE_URL);
  expect(typeof cp.name).toBe('string');
  expect(/hallucination safeguards/i.test(cp.name ?? '')).toBe(true);
  expect(cp.dateModified).toBe(HALLUCINATION_POSTURE.lastReviewed);
  expect(typeof cp.description).toBe('string');
  expect((cp.description ?? '').length).toBeGreaterThan(20);
  expect(errors).toEqual([]);
});

// AC #6.8: exactly one BreadcrumbList with two items (Home, Hallucination
// Safeguards).
test('emits a two-item BreadcrumbList (Home -> Hallucination Safeguards)', async ({ page }) => {
  const errors = await gotoSafeguards(page);
  const blocks = await readJsonLdBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(
    breadcrumbs,
    'exactly one BreadcrumbList block expected on /hallucination-safeguards',
  ).toHaveLength(1);
  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[1].name).toBe(PAGE_H1);
  expect(items[1].item).toBe(PAGE_URL);
  expect(errors).toEqual([]);
});

// AC #6.9a: em-dash-in-JSON-LD assertion scopes ONLY to the two owned
// blocks per 2026-09-08.
test('no em-dash in the CollectionPage or BreadcrumbList blocks this page emits', async ({
  page,
}) => {
  const errors = await gotoSafeguards(page);
  const blocks = await readJsonLdBlocks(page);
  const owned = blocks.filter((b) => isBreadcrumb(b.data) || isCollectionPage(b.data));
  expect(
    owned.length,
    'BreadcrumbList + CollectionPage blocks emitted by /hallucination-safeguards must both render',
  ).toBe(2);
  for (const b of owned) {
    expect(
      b.raw,
      'no em-dash allowed in a /hallucination-safeguards-owned JSON-LD block',
    ).not.toContain(EM_DASH);
  }
  expect(errors).toEqual([]);
});

// AC #6.9b: zero U+2014 code points in the rendered page body.
test('no em-dash character anywhere in visible body copy', async ({ page }) => {
  const errors = await gotoSafeguards(page);
  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(bodyText.length, 'body should have text content').toBeGreaterThan(100);
  expect(bodyText, 'no em-dash allowed in visible copy').not.toContain(EM_DASH);
  expect(errors).toEqual([]);
});

// AC #6.10: renders cleanly in dark mode (html.dark toggle).
test('renders cleanly in dark mode', async ({ page }) => {
  const errors = await gotoSafeguards(page);
  const lightRows = await page
    .locator('[data-testid="hallucination-demo-row"]')
    .count();
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(
    page.locator('[data-testid="hallucination-demo-row"]').first(),
  ).toBeVisible();
  const darkRows = await page
    .locator('[data-testid="hallucination-demo-row"]')
    .count();
  expect(darkRows).toBe(lightRows);
  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(hasDarkClass).toBe(true);
  expect(errors).toEqual([]);
});

// AC #6.11: /trust shows the new "Hallucination Safeguards" cross-link chip.
test('/trust shows the new "Hallucination Safeguards" cross-link chip', async ({ page }) => {
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
  const chip = page.locator('[data-testid="trust-hallucination-safeguards-link"]');
  await expect(chip).toBeVisible();
  const href = await chip.getAttribute('href');
  expect(href).toBe(PAGE_PATH);
  expect(errors).toEqual([]);
});

// AC #6.12: footer trust chip on the homepage links to
// /hallucination-safeguards.
test('footer hallucination-safeguards chip is visible on / and links to the page', async ({
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
  const chip = page.locator('[data-testid="footer-hallucination-safeguards-chip"]');
  await expect(chip).toBeVisible();
  const chipLink = page
    .locator(`a[href="${PAGE_PATH}"]`)
    .filter({ has: page.locator('[data-testid="footer-hallucination-safeguards-chip"]') });
  await expect(chipLink).toHaveCount(1);
  expect(errors).toEqual([]);
});

// AC #6.13: mailto: recipient in the "How to report a wrong output" section
// byte-matches the recipient shipped in Trust.tsx (mirror-source per
// 2026-05-25). Trust.tsx uses mutaaf@digitalcraftai.com; this page reuses.
test('the report-a-wrong-output mailto recipient matches the Trust page contact', async ({
  page,
}) => {
  const errors = await gotoSafeguards(page);
  const mailto = page.locator('[data-testid="hallucination-report-mailto"]');
  await expect(mailto).toBeVisible();
  const href = (await mailto.getAttribute('href')) ?? '';
  expect(href.startsWith(`mailto:${CONTACT_EMAIL}`)).toBe(true);
  expect(errors).toEqual([]);
});

// AC #3: /hallucination-safeguards path is in the ROUTES allow-list.
test('/hallucination-safeguards path is in the ROUTES allow-list', async () => {
  expect(SHIPPED_ROUTES_SET.has(PAGE_PATH)).toBe(true);
});

// AC #5 mirror-source bonus: Helmet meta description byte-matches the
// CollectionPage description (2026-05-25 rule).
test('meta description mirrors the CollectionPage description', async ({ page }) => {
  const errors = await gotoSafeguards(page);
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
