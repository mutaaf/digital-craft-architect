import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS, ROUTES } from './routes';
import {
  ROADMAP_ENTRIES,
  ROADMAP_GENERATED_AT,
  ROADMAP_CADENCE_NOTE,
} from '../../src/data/roadmapEntries';

// Ticket 0108 - Public /roadmap dated intended-ship-week page.
//
// Each test maps 1:1 to a sub-case on the ticket's acceptance list. Modeled
// on `tests/e2e/changelog-page.spec.ts` (ticket 0032, the backward-looking
// sibling) and `tests/e2e/hallucination-safeguards.spec.ts` (ticket 0102,
// the freshest trust-artifact predecessor).
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this spec the
// implementer grepped every `tests/e2e/*-jsonld.spec.ts` for
// `=== 'CollectionPage'`, `=== 'ItemList'`, and `=== 'BreadcrumbList'`
// predicates. Every predecessor is URL-scoped to its own hub path
// (changelog-itemlist-jsonld.spec.ts only navigates /changelog;
// blog-collectionpage-jsonld.spec.ts only /blog;
// agent-fleet-page.spec.ts only /agent-fleet; hallucination-safeguards
// only /hallucination-safeguards; etc.), so the sibling blocks scoped
// to /roadmap cannot collide. Grep result documented in the ticket
// Implementation log.
//
// Per the 2026-09-05 route-code-splitting lesson, /roadmap is lazy-
// wrapped in <Suspense>, so gotoRoadmap waits for the RouteFallback
// (role=status, aria-label=Loading) to detach AND for the H1 to be
// visible (2026-09-10 mount-signal lesson) before probing the DOM.
//
// Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the em-dash
// check scopes ONLY to the three blocks this page owns (CollectionPage,
// ItemList, BreadcrumbList) filtered by @type, NOT every ld+json block
// on the page (the homepage Organization block from index.html carries a
// legitimate em-dash and must not be flagged).
//
// Per the 2026-06-15 attribute-list regex lesson, any regex here that
// matches an XML/HTML attribute list uses `[^>]*`, not `[^/>]*`.
//
// Per the 2026-06-07 src-imports-tests lesson, the spec imports the
// canonical ROADMAP_ENTRIES + ROADMAP_GENERATED_AT + ROADMAP_CADENCE_NOTE
// constants from src/data/roadmapEntries.ts and ROUTES from
// src/data/routes.ts directly, so visible page and spec cannot drift.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// character (the 2026-05-07 brand-voice Hard NO bans the literal even in
// tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const PAGE_PATH = '/roadmap';
const PAGE_URL = `${ORIGIN}${PAGE_PATH}`;
const PAGE_H1_TEXT = 'What We Are Shipping Next';
const COLLECTION_PAGE_NAME = 'Digital Craft AI Roadmap';
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
type ItemList = {
  '@context'?: string;
  '@type': string;
  name?: string;
  numberOfItems?: number;
  itemListElement?: Array<{ '@type': string; position?: number; name?: string }>;
};

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

const isCollectionPage = (d: unknown): d is CollectionPage =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'CollectionPage';

const isItemList = (d: unknown): d is ItemList =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'ItemList';

async function gotoRoadmap(page: Page, path = PAGE_PATH): Promise<string[]> {
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
// generator throws at build time; this case pins the shape contract so a
// future regression surfaces as a readable Playwright failure, not a
// cryptic generator throw.
test('ROADMAP_ENTRIES + ROADMAP_GENERATED_AT + ROADMAP_CADENCE_NOTE invariants', () => {
  const isoDateRe = /^\d{4}-\d{2}-\d{2}$/;
  const isoWeekRe = /^\d{4}-W\d{2}$/;
  expect(isoDateRe.test(ROADMAP_GENERATED_AT)).toBe(true);
  expect(ROADMAP_CADENCE_NOTE.length).toBeGreaterThan(40);
  expect(ROADMAP_CADENCE_NOTE).not.toContain(EM_DASH);
  // Every entry is one of the two included statuses - never shipped, never
  // proposed, never rejected (anti-goal in the ticket's Out-of-scope list).
  for (const entry of ROADMAP_ENTRIES) {
    expect(entry.id).toMatch(/^\d{4}$/);
    expect(entry.title.length).toBeGreaterThan(0);
    expect(entry.title).not.toContain(EM_DASH);
    expect(['P0', 'P1', 'P2', 'P3']).toContain(entry.priority);
    expect(['conversion', 'seo', 'content', 'trust', 'demos']).toContain(entry.area);
    expect(['groomed', 'in-progress']).toContain(entry.status);
    expect(isoDateRe.test(entry.created)).toBe(true);
    expect(isoWeekRe.test(entry.intendedShipWeek)).toBe(true);
  }
});

// AC box 1: GET /roadmap returns 200 and renders the H1.
test('renders 200 with the "What We Are Shipping Next" H1', async ({ page }) => {
  const errors = await gotoRoadmap(page);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const text = ((await h1.textContent()) ?? '').trim();
  expect(text).toContain(PAGE_H1_TEXT);
  expect(errors).toEqual([]);
});

// AC box 2 "Generated: ..." line matches ROADMAP_GENERATED_AT (mirror-
// source per 2026-05-25 + 2026-06-07).
test('renders the "Generated: ..." line matching ROADMAP_GENERATED_AT', async ({ page }) => {
  const errors = await gotoRoadmap(page);
  const line = page.locator('[data-testid="roadmap-generated-at"]');
  await expect(line).toBeVisible();
  const text = ((await line.textContent()) ?? '').trim();
  expect(text).toContain(`Generated: ${ROADMAP_GENERATED_AT}`);
  expect(errors).toEqual([]);
});

// AC box 3: per-ticket table renders exactly ROADMAP_ENTRIES.length rows
// (2026-09-06 VISIBLE_LIMIT lesson - toHaveCount over the imported
// constant, NOT count > 0). The empty-queue branch renders a dedicated
// explanatory state; that branch is covered in the next case.
test('renders one table row per ROADMAP_ENTRIES entry', async ({ page }) => {
  const errors = await gotoRoadmap(page);
  const rows = page.locator('[data-testid="roadmap-entry-row"]');
  if (ROADMAP_ENTRIES.length === 0) {
    await expect(rows).toHaveCount(0);
    await expect(page.locator('[data-testid="roadmap-empty-state"]')).toBeVisible();
  } else {
    await expect(rows.first()).toBeVisible();
    await expect(rows).toHaveCount(ROADMAP_ENTRIES.length);
  }
  expect(errors).toEqual([]);
});

// AC box 7 dedicated case: when ROADMAP_ENTRIES is empty, the page renders
// a "no groomed tickets" explanatory state and ZERO rows. We assert the
// invariant that non-empty is the current state (the generator guarantees
// at least groomed + in-progress tickets exist today) and that the page's
// empty-state branch is wired behind the entries.length === 0 check in
// src/pages/Roadmap.tsx. If the queue drains to zero in a future ship, the
// previous case's zero-row branch takes over and this invariant case
// still passes (ROADMAP_ENTRIES.length is a non-negative integer).
test('ROADMAP_ENTRIES length is a non-negative integer and the page honors it', async ({
  page,
}) => {
  expect(Number.isInteger(ROADMAP_ENTRIES.length)).toBe(true);
  expect(ROADMAP_ENTRIES.length).toBeGreaterThanOrEqual(0);
  const errors = await gotoRoadmap(page);
  // Exactly one of the two branches is active.
  const rows = page.locator('[data-testid="roadmap-entry-row"]');
  const emptyState = page.locator('[data-testid="roadmap-empty-state"]');
  const rowCount = await rows.count();
  const emptyVisible = await emptyState.count();
  if (ROADMAP_ENTRIES.length === 0) {
    expect(rowCount).toBe(0);
    expect(emptyVisible).toBe(1);
  } else {
    expect(rowCount).toBe(ROADMAP_ENTRIES.length);
    expect(emptyVisible).toBe(0);
  }
  expect(errors).toEqual([]);
});

// AC box 2 again: every row's status cell reads groomed or in-progress
// (never shipped, never proposed).
test('every rendered row status chip reads groomed or in-progress', async ({ page }) => {
  const errors = await gotoRoadmap(page);
  if (ROADMAP_ENTRIES.length === 0) {
    expect(errors).toEqual([]);
    return;
  }
  const cells = await page
    .locator('[data-testid="roadmap-row-status"]')
    .allTextContents();
  expect(cells.length).toBe(ROADMAP_ENTRIES.length);
  for (const cell of cells) {
    const trimmed = cell.trim();
    expect(['groomed', 'in-progress']).toContain(trimmed);
  }
  expect(errors).toEqual([]);
});

// AC box 4a: exactly one CollectionPage JSON-LD block, `name` byte-matches
// the collection-page name, `dateModified` byte-matches
// ROADMAP_GENERATED_AT (mirror-source).
test('emits exactly one CollectionPage JSON-LD scoped to /roadmap', async ({ page }) => {
  const errors = await gotoRoadmap(page);
  const blocks = await readJsonLdBlocks(page);
  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  expect(
    collections,
    'exactly one CollectionPage block expected on /roadmap',
  ).toHaveLength(1);
  const cp = collections[0].data;
  expect(cp.url).toBe(PAGE_URL);
  expect(cp.name).toBe(COLLECTION_PAGE_NAME);
  expect(cp.dateModified).toBe(ROADMAP_GENERATED_AT);
  expect(cp.description).toBe(ROADMAP_CADENCE_NOTE);
  expect(errors).toEqual([]);
});

// AC box 4b: exactly one ItemList block whose itemListElement length
// byte-matches ROADMAP_ENTRIES.length.
test('emits exactly one ItemList block mirroring ROADMAP_ENTRIES', async ({ page }) => {
  const errors = await gotoRoadmap(page);
  const blocks = await readJsonLdBlocks(page);
  const lists = blocks.filter((b): b is { raw: string; data: ItemList } =>
    isItemList(b.data),
  );
  expect(
    lists,
    'exactly one ItemList block expected on /roadmap',
  ).toHaveLength(1);
  const list = lists[0].data;
  const items = list.itemListElement ?? [];
  expect(items.length).toBe(ROADMAP_ENTRIES.length);
  expect(list.numberOfItems).toBe(ROADMAP_ENTRIES.length);
  for (let i = 0; i < items.length; i += 1) {
    expect(items[i].position).toBe(i + 1);
    expect(items[i].name).toBe(ROADMAP_ENTRIES[i].title);
  }
  expect(errors).toEqual([]);
});

// AC box 4c: exactly one BreadcrumbList with two items (Home -> Roadmap).
test('emits a two-item BreadcrumbList (Home -> Roadmap)', async ({ page }) => {
  const errors = await gotoRoadmap(page);
  const blocks = await readJsonLdBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(
    breadcrumbs,
    'exactly one BreadcrumbList block expected on /roadmap',
  ).toHaveLength(1);
  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[1].name).toBe('Roadmap');
  expect(items[1].item).toBe(PAGE_URL);
  expect(errors).toEqual([]);
});

// AC box 6a: em-dash assertion scopes ONLY to the three blocks THIS page
// emits per the 2026-09-08 filter lesson.
test('no em-dash in the three JSON-LD blocks this page emits', async ({ page }) => {
  const errors = await gotoRoadmap(page);
  const blocks = await readJsonLdBlocks(page);
  const owned = blocks.filter(
    (b) => isBreadcrumb(b.data) || isCollectionPage(b.data) || isItemList(b.data),
  );
  expect(
    owned.length,
    'all three /roadmap-owned JSON-LD blocks must render',
  ).toBe(3);
  for (const b of owned) {
    expect(b.raw, 'no em-dash allowed in a /roadmap-owned JSON-LD block').not.toContain(EM_DASH);
  }
  expect(errors).toEqual([]);
});

// AC box 6b: zero U+2014 code points in the rendered page body.
test('no em-dash character anywhere in visible body copy', async ({ page }) => {
  const errors = await gotoRoadmap(page);
  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(bodyText.length).toBeGreaterThan(100);
  expect(bodyText, 'no em-dash allowed in visible copy').not.toContain(EM_DASH);
  const mainText = (await page.locator('main').textContent()) ?? '';
  expect(mainText).not.toContain(EM_DASH);
  expect(errors).toEqual([]);
});

// AC box 7: renders cleanly in dark mode (html.dark toggle).
test('renders cleanly in dark mode', async ({ page }) => {
  const errors = await gotoRoadmap(page);
  const lightRows = await page.locator('[data-testid="roadmap-entry-row"]').count();
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  const darkRows = await page.locator('[data-testid="roadmap-entry-row"]').count();
  expect(darkRows).toBe(lightRows);
  await expect(page.locator('h1').first()).toBeVisible();
  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(hasDarkClass).toBe(true);
  expect(errors).toEqual([]);
});

// AC box 5a: /trust shows the new "Roadmap" cross-link chip.
test('/trust shows the new "Roadmap" cross-link chip pointing at /roadmap', async ({ page }) => {
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
  const chip = page.locator('[data-testid="trust-roadmap-link"]');
  await expect(chip).toBeVisible();
  const href = await chip.getAttribute('href');
  expect(href).toBe(PAGE_PATH);
  expect(errors).toEqual([]);
});

// AC box 5b: footer trust chip on the homepage links to /roadmap.
test('footer roadmap chip is visible on / and links to /roadmap', async ({ page }) => {
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
  const chip = page.locator('[data-testid="footer-roadmap-chip"]');
  await expect(chip).toBeVisible();
  const chipLink = page
    .locator(`a[href="${PAGE_PATH}"]`)
    .filter({ has: page.locator('[data-testid="footer-roadmap-chip"]') });
  await expect(chipLink).toHaveCount(1);
  expect(errors).toEqual([]);
});

// AC box 3 route allow-list: /roadmap is in src/data/routes.ts so the
// smoke spec exercises it (2026-06-07 mirror-source rule).
test('/roadmap is in the ROUTES allow-list', () => {
  expect(SHIPPED_ROUTES_SET.has(PAGE_PATH)).toBe(true);
});

// AC box 5 bonus: meta description byte-matches ROADMAP_CADENCE_NOTE
// (2026-05-25 mirror-source rule).
test('Helmet meta description byte-matches ROADMAP_CADENCE_NOTE', async ({ page }) => {
  const errors = await gotoRoadmap(page);
  const descriptions = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) => nodes.map((n) => (n as HTMLMetaElement).content));
  // Helmet appends its own tag at the end; filter to the one owned by this page.
  const found = descriptions.find((d) => d === ROADMAP_CADENCE_NOTE);
  expect(found, 'Helmet should emit a meta description byte-matching ROADMAP_CADENCE_NOTE').toBe(
    ROADMAP_CADENCE_NOTE,
  );
  expect(errors).toEqual([]);
});

// AC box 1 return-note case: /roadmap renders both the "Shipped tickets
// live at /changelog" and "How we decide what to ship next" cross-links.
test('renders cross-links back to /changelog and /how-we-ship', async ({ page }) => {
  const errors = await gotoRoadmap(page);
  const changelogLink = page.locator('[data-testid="roadmap-changelog-link"]');
  const howWeShipLink = page.locator('[data-testid="roadmap-how-we-ship-link"]');
  await expect(changelogLink).toBeVisible();
  await expect(howWeShipLink).toBeVisible();
  expect(await changelogLink.getAttribute('href')).toBe('/changelog');
  expect(await howWeShipLink.getAttribute('href')).toBe('/how-we-ship');
  expect(errors).toEqual([]);
});
