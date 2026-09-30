import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS, ROUTES } from './routes';
import { RETENTION_POSTURE, RETENTION_POLICIES } from '../../src/data/dataRetention';
import { NEW_PERSISTENT_STORES } from '../../src/data/demoDisclosures';

// Ticket 0105 - /data-retention dated per-storage-key retention policy page.
// Each test maps 1:1 to a sub-case in the ticket's acceptance boxes. Modeled
// on `tests/e2e/hallucination-safeguards.spec.ts` (ticket 0102, the freshest
// predecessor in the same dated-trust-artifact family).
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this spec the
// implementer grepped every `tests/e2e/*.spec.ts` for
// `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates. Every
// predecessor CollectionPage predicate is URL-scoped to its own hub path
// (0069 /subprocessors, 0071 /ai-for-hospitality, 0079 /blog, 0088
// /model-card, 0090 /agent-fleet, 0094 /ai-risks-we-watch, 0097
// /accessibility-statement, 0102 /hallucination-safeguards, etc.), so the
// sibling /data-retention-scoped blocks cannot collide. Grep result
// documented in the ticket Implementation log.
//
// Per the 2026-09-05 route-code-splitting lesson `/data-retention` is
// lazy-wrapped in <Suspense>, so `gotoDataRetention` waits for the
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
// canonical RETENTION_POSTURE + RETENTION_POLICIES constants from
// src/data/dataRetention.ts and NEW_PERSISTENT_STORES from
// src/data/demoDisclosures.ts directly, so the visible page and the spec
// cannot drift.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// character (the 2026-05-07 brand-voice Hard NO bans the literal even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const PAGE_PATH = '/data-retention';
const PAGE_URL = `${ORIGIN}${PAGE_PATH}`;
const PAGE_H1 = 'Data Retention Policy';
const LAST_REVIEWED_LINE = `Last reviewed: ${RETENTION_POSTURE.lastReviewed}`;
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

async function gotoDataRetention(page: Page, path = PAGE_PATH): Promise<string[]> {
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

// Encoded-invariant hook per the 2026-05-28 lesson: the data-file module-
// load assertion throws on import; this case gives a friendlier Playwright
// error and pins the ticket's row-shape contract.
test('RETENTION_POSTURE + RETENTION_POLICIES invariants', async () => {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  expect(iso.test(RETENTION_POSTURE.lastReviewed)).toBe(true);
  expect(RETENTION_POSTURE.summary.length).toBeGreaterThan(40);
  expect(RETENTION_POSTURE.summary).not.toContain(EM_DASH);

  expect(RETENTION_POLICIES.length).toBeGreaterThan(0);
  const disclosedKeys = new Set<string>(NEW_PERSISTENT_STORES.map((s) => s.storageKey));
  const seenKeys = new Set<string>();
  for (const row of RETENTION_POLICIES) {
    expect(seenKeys.has(row.storageKey), `duplicate storageKey "${row.storageKey}"`).toBe(false);
    seenKeys.add(row.storageKey);
    expect(
      disclosedKeys.has(row.storageKey),
      `storageKey "${row.storageKey}" NOT_IN_DISCLOSURES`,
    ).toBe(true);
    expect(row.purpose.length).toBeGreaterThan(20);
    expect(row.retentionWindow.length).toBeGreaterThan(20);
    expect(row.allowListValidation.length).toBeGreaterThan(20);
    expect(row.purpose).not.toContain(EM_DASH);
    expect(row.retentionWindow).not.toContain(EM_DASH);
    expect(row.allowListValidation).not.toContain(EM_DASH);
    expect(iso.test(row.nextReview), `bad nextReview "${row.nextReview}"`).toBe(true);
    expect(row.nextReview > RETENTION_POSTURE.lastReviewed).toBe(true);
    expect(row.sourcePath.endsWith('.ts')).toBe(true);
  }
});

// AC (a): GET /data-retention returns 200.
// AC (b): renders an H1 containing "Data Retention Policy".
test('renders 200 with a "Data Retention Policy" H1', async ({ page }) => {
  const errors = await gotoDataRetention(page);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const text = ((await h1.textContent()) ?? '').trim();
  expect(/data retention policy/i.test(text)).toBe(true);
  expect(errors).toEqual([]);
});

// AC (c): "Last reviewed: 2026-09-30" line matching
// RETENTION_POSTURE.lastReviewed (mirror-source per 2026-05-25).
test('renders the "Last reviewed" line matching RETENTION_POSTURE.lastReviewed', async ({
  page,
}) => {
  const errors = await gotoDataRetention(page);
  const chip = page.locator('[data-testid="data-retention-last-reviewed"]');
  await expect(chip).toBeVisible();
  const text = ((await chip.textContent()) ?? '').trim();
  expect(text).toContain(LAST_REVIEWED_LINE);
  expect(errors).toEqual([]);
});

// AC (d): per-key table renders exactly RETENTION_POLICIES.length rows,
// data-testid="retention-policy-row" (2026-09-06 VISIBLE_LIMIT lesson).
test('renders one row per RETENTION_POLICIES entry', async ({ page }) => {
  const errors = await gotoDataRetention(page);
  const rows = page.locator('[data-testid="retention-policy-row"]');
  await expect(rows.first()).toBeVisible();
  await expect(rows).toHaveCount(RETENTION_POLICIES.length);
  expect(errors).toEqual([]);
});

// AC (5): every row's `storageKey` cell text is present in
// NEW_PERSISTENT_STORES (mirror-source assertion across two source files
// per the 2026-06-07 rule).
test('every rendered row storageKey is in NEW_PERSISTENT_STORES', async ({ page }) => {
  const errors = await gotoDataRetention(page);
  const cells = await page
    .locator('[data-testid="retention-policy-key"]')
    .allTextContents();
  expect(cells.length).toBe(RETENTION_POLICIES.length);
  const disclosedKeys = new Set<string>(NEW_PERSISTENT_STORES.map((s) => s.storageKey));
  for (const cell of cells) {
    const key = cell.trim();
    expect(
      disclosedKeys.has(key),
      `rendered storageKey "${key}" is not in NEW_PERSISTENT_STORES`,
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

// AC (6): exactly one CollectionPage JSON-LD block with `name` byte-matching
// the H1 substring and `dateModified` byte-matching
// RETENTION_POSTURE.lastReviewed (mirror-source per 2026-05-25).
test('emits exactly one CollectionPage JSON-LD scoped to /data-retention', async ({
  page,
}) => {
  const errors = await gotoDataRetention(page);
  const blocks = await readJsonLdBlocks(page);
  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  expect(
    collections,
    'exactly one CollectionPage block expected on /data-retention',
  ).toHaveLength(1);

  const cp = collections[0].data;
  expect(cp.url).toBe(PAGE_URL);
  expect(typeof cp.name).toBe('string');
  expect(/data retention/i.test(cp.name ?? '')).toBe(true);
  expect(cp.dateModified).toBe(RETENTION_POSTURE.lastReviewed);
  expect(typeof cp.description).toBe('string');
  expect((cp.description ?? '').length).toBeGreaterThan(40);
  expect(errors).toEqual([]);
});

// AC (7): exactly one BreadcrumbList with two items (Home, Data Retention).
test('emits a two-item BreadcrumbList (Home -> Data Retention)', async ({ page }) => {
  const errors = await gotoDataRetention(page);
  const blocks = await readJsonLdBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(
    breadcrumbs,
    'exactly one BreadcrumbList block expected on /data-retention',
  ).toHaveLength(1);
  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[1].name).toBe(PAGE_H1);
  expect(items[1].item).toBe(PAGE_URL);
  expect(errors).toEqual([]);
});

// AC (8a): em-dash-in-JSON-LD assertion scopes ONLY to the two owned blocks
// per 2026-09-08.
test('no em-dash in the CollectionPage or BreadcrumbList blocks this page emits', async ({
  page,
}) => {
  const errors = await gotoDataRetention(page);
  const blocks = await readJsonLdBlocks(page);
  const owned = blocks.filter((b) => isBreadcrumb(b.data) || isCollectionPage(b.data));
  expect(
    owned.length,
    'BreadcrumbList + CollectionPage blocks emitted by /data-retention must both render',
  ).toBe(2);
  for (const b of owned) {
    expect(
      b.raw,
      'no em-dash allowed in a /data-retention-owned JSON-LD block',
    ).not.toContain(EM_DASH);
  }
  expect(errors).toEqual([]);
});

// AC (8b): zero U+2014 code points in the rendered page body.
test('no em-dash character anywhere in visible body copy', async ({ page }) => {
  const errors = await gotoDataRetention(page);
  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(bodyText.length, 'body should have text content').toBeGreaterThan(100);
  expect(bodyText, 'no em-dash allowed in visible copy').not.toContain(EM_DASH);
  expect(errors).toEqual([]);
});

// AC (9): renders cleanly in dark mode (html.dark toggle).
test('renders cleanly in dark mode', async ({ page }) => {
  const errors = await gotoDataRetention(page);
  const lightRows = await page.locator('[data-testid="retention-policy-row"]').count();
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.locator('[data-testid="retention-policy-row"]').first()).toBeVisible();
  const darkRows = await page.locator('[data-testid="retention-policy-row"]').count();
  expect(darkRows).toBe(lightRows);
  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(hasDarkClass).toBe(true);
  expect(errors).toEqual([]);
});

// AC (10): /trust shows the new "Data Retention" cross-link chip.
test('/trust shows the new "Data Retention" cross-link chip', async ({ page }) => {
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
  const chip = page.locator('[data-testid="trust-data-retention-link"]');
  await expect(chip).toBeVisible();
  const href = await chip.getAttribute('href');
  expect(href).toBe(PAGE_PATH);
  expect(errors).toEqual([]);
});

// AC (11): footer trust chip on the homepage links to /data-retention.
test('footer data-retention chip is visible on / and links to the page', async ({
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
  const chip = page.locator('[data-testid="footer-data-retention-chip"]');
  await expect(chip).toBeVisible();
  const chipLink = page
    .locator(`a[href="${PAGE_PATH}"]`)
    .filter({ has: page.locator('[data-testid="footer-data-retention-chip"]') });
  await expect(chipLink).toHaveCount(1);
  expect(errors).toEqual([]);
});

// AC (12): after seeding two arbitrary dca_* localStorage keys, clicking
// the "Clear all Digital Craft keys" button plus accepting the
// window.confirm dialog clears every dca_* key, an "unrelated_key" survives
// (defensible-scope belt), and the acknowledgment renders exactly once
// (2026-09-06 VISIBLE_LIMIT lesson).
test('clear-dca-keys button clears every dca_* key and leaves foreign keys alone', async ({
  page,
}) => {
  const errors = await gotoDataRetention(page);

  // Accept every confirm dialog fired during this test.
  page.on('dialog', (d) => {
    void d.accept();
  });

  await page.evaluate(() => {
    try {
      window.localStorage.setItem('dca_test_key_alpha', 'a');
      window.localStorage.setItem('dca_test_key_beta', 'b');
      window.localStorage.setItem('unrelated_key', 'foreign');
    } catch {
      /* storage unavailable - non-fatal */
    }
  });

  const before = await page.evaluate(() =>
    Object.keys(window.localStorage).filter((k) => k.startsWith('dca_')),
  );
  expect(before).toContain('dca_test_key_alpha');
  expect(before).toContain('dca_test_key_beta');

  const btn = page.locator('[data-testid="clear-dca-keys-button"]');
  await expect(btn).toBeVisible();
  await btn.click();

  const remaining = await page.evaluate(() =>
    Object.keys(window.localStorage).filter((k) => k.startsWith('dca_')),
  );
  expect(remaining).toEqual([]);

  const foreign = await page.evaluate(() => window.localStorage.getItem('unrelated_key'));
  expect(foreign).toBe('foreign');

  const ack = page.locator('[data-testid="clear-dca-keys-ack"]');
  await expect(ack).toHaveCount(1);
  await expect(ack).toBeVisible();

  expect(errors).toEqual([]);
});

// AC (13): mailto: recipient in the "How to report a retention concern"
// section byte-matches the recipient shipped in Trust.tsx (mirror-source
// per 2026-05-25). Trust.tsx uses mutaaf@digitalcraftai.com; this page
// reuses.
test('the report-a-retention-concern mailto recipient matches the Trust page contact', async ({
  page,
}) => {
  const errors = await gotoDataRetention(page);
  const mailto = page.locator('[data-testid="data-retention-report-mailto"]');
  await expect(mailto).toBeVisible();
  const href = (await mailto.getAttribute('href')) ?? '';
  expect(href.startsWith(`mailto:${CONTACT_EMAIL}`)).toBe(true);
  expect(errors).toEqual([]);
});

// AC (3): /data-retention path is in the ROUTES allow-list.
test('/data-retention path is in the ROUTES allow-list', async () => {
  expect(SHIPPED_ROUTES_SET.has(PAGE_PATH)).toBe(true);
});

// AC mirror-source bonus: Helmet meta description byte-matches the
// CollectionPage description (2026-05-25 rule).
test('meta description mirrors the CollectionPage description', async ({ page }) => {
  const errors = await gotoDataRetention(page);
  const descriptions = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) => nodes.map((n) => (n as HTMLMetaElement).content));
  const helmetDescription = descriptions[descriptions.length - 1];
  expect(typeof helmetDescription).toBe('string');
  expect(helmetDescription.length).toBeGreaterThan(40);
  expect(helmetDescription).not.toContain(EM_DASH);

  const blocks = await readJsonLdBlocks(page);
  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  expect(collections).toHaveLength(1);
  expect(collections[0].data.description).toBe(helmetDescription);
  expect(errors).toEqual([]);
});

// AC (14): per the 2026-06-15 attribute-list regex lesson, any regex over
// stringified JSON-LD uses `[^>]*`. This case asserts the two owned blocks
// serialize as expected script tags via a `[^>]*` regex (never `[^/>]*`).
test('owned JSON-LD blocks serialize as script[type="application/ld+json"] tags', async ({
  page,
}) => {
  const errors = await gotoDataRetention(page);
  const html = await page.content();
  // 2026-06-15: use [^>]* not [^/>]* to tolerate every attribute-list byte.
  const scriptRe = /<script[^>]*type="application\/ld\+json"[^>]*>/g;
  const matches = html.match(scriptRe) ?? [];
  // The page owns 2 blocks, the app renders at least 1 (homepage
  // Organization from index.html); expect at least the two owned.
  expect(matches.length).toBeGreaterThanOrEqual(2);
  expect(errors).toEqual([]);
});
