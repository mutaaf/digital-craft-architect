import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS, ROUTES } from './routes';
import { VERTICAL_LABELS } from '../../src/data/verticalLabels';

// Ticket 0100 - Persist the visitor's visited /ai-for-<vertical> landing
// pages and surface a "Verticals you're evaluating" card on /my dashboard.
// Each test maps 1:1 to an acceptance-criteria box on the ticket.
//
// The card is powered by a new client-side store at
// src/utils/recentVerticalsStore.ts (`dca_recent_verticals_v1`) and a
// RecentVerticalsCard component rendered on src/pages/MyDashboard.tsx just
// below the ticket 0093 saved-ROI-scenarios card. Pre-seeding follows the
// same `addInitScript` pattern as tests/e2e/recent-compares-recap.spec.ts
// (ticket 0074, the direct peer for a recap-store dashboard card).

const DASHBOARD_URL = '/my';
const STORAGE_KEY = 'dca_recent_verticals_v1';

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the 2026-05-07 brand-voice Hard NO bans the literal character even in
// tests).
const EM_DASH = String.fromCharCode(8212);

type SeedEntry = {
  path: string;
  label: string;
  lastVisitedAt: number;
};

// Three valid seed paths drawn from VERTICAL_LABELS / ROUTES so the
// allow-list filter always accepts them. Ordering is most-recent-first
// (position 0 is the last visit) matching the store's on-write prepend
// convention.
const SEED_THREE: SeedEntry[] = [
  {
    path: '/ai-for-plumbers',
    label: VERTICAL_LABELS['/ai-for-plumbers'],
    lastVisitedAt: 1_730_000_003_000,
  },
  {
    path: '/ai-for-hvac',
    label: VERTICAL_LABELS['/ai-for-hvac'],
    lastVisitedAt: 1_730_000_002_000,
  },
  {
    path: '/ai-for-roofers',
    label: VERTICAL_LABELS['/ai-for-roofers'],
    lastVisitedAt: 1_730_000_001_000,
  },
];

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  return errors;
}

async function gotoPath(page: Page, path: string): Promise<void> {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${path}`).not.toBeNull();
  expect(response!.status(), `${path} returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  // Per the 2026-09-05 route-code-splitting lesson: RouteFallback trips the
  // innerHTML>500 heuristic before the lazy chunk mounts, so wait for the
  // real page H1 before moving on. Otherwise the on-mount `useEffect` in
  // the AiFor* page may not have written to storage yet, and the /my read
  // that follows will see nothing (write-through case).
  await page
    .locator('h1')
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 })
    .catch(() => {
      /* not every path has an h1; the innerHTML poll is enough */
    });
}

async function contextWithSeed(
  browser: import('@playwright/test').Browser,
  raw: string,
  viewport?: { width: number; height: number },
): Promise<{ ctx: BrowserContext; page: Page; errors: string[] }> {
  const ctx = await browser.newContext(viewport ? { viewport } : undefined);
  await ctx.addInitScript(
    ([key, value]) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* storage unavailable - non-fatal */
      }
    },
    [STORAGE_KEY, raw] as const,
  );
  const page = await ctx.newPage();
  const errors = trackErrors(page);
  return { ctx, page, errors };
}

test.describe('recent verticals card on /my', () => {
  // Box (1): empty storage hides the RecentVerticalsCard entirely.
  test('empty storage: card is absent', async ({ page }) => {
    const errors = trackErrors(page);
    await gotoPath(page, DASHBOARD_URL);

    await expect(page.getByTestId('recent-verticals-card')).toHaveCount(0);
    // Existing dashboard shell still renders.
    await expect(page.locator('h1')).toContainText(/pick up where you/i);

    expect(errors).toEqual([]);
  });

  // Box (2): with three valid seeded entries, the card renders exactly three
  // rows with the labels visible.
  test('seeded three entries: card renders exactly three rows with labels', async ({
    browser,
  }) => {
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(SEED_THREE));
    await gotoPath(page, DASHBOARD_URL);

    const card = page.getByTestId('recent-verticals-card');
    await expect(card).toBeVisible();

    const rows = page.getByTestId('recent-vertical-row');
    await expect(rows).toHaveCount(3);

    await expect(card.getByText(SEED_THREE[0].label, { exact: true }).first()).toBeVisible();
    await expect(card.getByText(SEED_THREE[1].label, { exact: true }).first()).toBeVisible();
    await expect(card.getByText(SEED_THREE[2].label, { exact: true }).first()).toBeVisible();

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (3): each Reopen anchor href matches a path in the imported ROUTES
  // allow-list (mirror-source assertion per the 2026-06-07 rule).
  test('reopen anchor hrefs match /ai-for-* and are in ROUTES', async ({ browser }) => {
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(SEED_THREE));
    await gotoPath(page, DASHBOARD_URL);

    const rows = page.getByTestId('recent-vertical-row');
    await expect(rows).toHaveCount(3);

    const hrefs = await rows.evaluateAll((els) =>
      els
        .map((el) => el.querySelector('a[href^="/ai-for-"]'))
        .map((a) => (a ? a.getAttribute('href') : null)),
    );
    expect(hrefs.length).toBe(3);
    for (const href of hrefs) {
      expect(href, 'each row must expose a reopen anchor').not.toBeNull();
      expect(href!).toMatch(/^\/ai-for-/);
      expect(ROUTES.includes(href!), `${href} must be in ROUTES`).toBe(true);
    }

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (4): visiting /ai-for-plumbers then /my writes the shared label
  // constant to storage at position 1 (write-through case).
  test('write-through: visiting /ai-for-plumbers then /my lists Plumbers at position 1', async ({
    browser,
  }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors = trackErrors(page);

    await gotoPath(page, '/ai-for-plumbers');
    await gotoPath(page, DASHBOARD_URL);

    const raw = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
    expect(raw, 'storage should have been written').not.toBeNull();
    const list = JSON.parse(raw!) as SeedEntry[];
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0].path).toBe('/ai-for-plumbers');
    expect(list[0].label).toBe(VERTICAL_LABELS['/ai-for-plumbers']);

    const rows = page.getByTestId('recent-vertical-row');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(VERTICAL_LABELS['/ai-for-plumbers']);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (5): revisiting an already-recorded path moves the row to the top
  // and does NOT create a duplicate (dedup case).
  test('dedup: revisit moves row to top and does not duplicate', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors = trackErrors(page);

    await gotoPath(page, '/ai-for-plumbers');
    await gotoPath(page, '/ai-for-hvac');
    await gotoPath(page, '/ai-for-plumbers');
    await gotoPath(page, DASHBOARD_URL);

    const rows = page.getByTestId('recent-vertical-row');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText(VERTICAL_LABELS['/ai-for-plumbers']);
    await expect(rows.nth(1)).toContainText(VERTICAL_LABELS['/ai-for-hvac']);

    const raw = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
    const list = JSON.parse(raw!) as SeedEntry[];
    expect(list.filter((e) => e.path === '/ai-for-plumbers').length).toBe(1);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (6): when the store holds 5 entries and a sixth vertical is visited,
  // the oldest entry is evicted (FIFO evict case). Seeded via `page.evaluate`
  // after the first navigation (rather than via `addInitScript`) so a
  // subsequent same-context navigation does not overwrite the store's own
  // write with the pre-load seed script.
  test('FIFO evict: sixth visit evicts the oldest entry', async ({ browser }) => {
    // Five valid entries most-recent-first. After seeding, visit a sixth
    // vertical page whose on-mount hook writes to the store. The evicted
    // entry should be the oldest seed.
    const fiveSeed: SeedEntry[] = [
      { path: '/ai-for-hvac', label: VERTICAL_LABELS['/ai-for-hvac'], lastVisitedAt: 1_730_000_005_000 },
      { path: '/ai-for-roofers', label: VERTICAL_LABELS['/ai-for-roofers'], lastVisitedAt: 1_730_000_004_000 },
      { path: '/ai-for-electricians', label: VERTICAL_LABELS['/ai-for-electricians'], lastVisitedAt: 1_730_000_003_000 },
      { path: '/ai-for-painters', label: VERTICAL_LABELS['/ai-for-painters'], lastVisitedAt: 1_730_000_002_000 },
      { path: '/ai-for-landscapers', label: VERTICAL_LABELS['/ai-for-landscapers'], lastVisitedAt: 1_730_000_001_000 },
    ];

    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors = trackErrors(page);

    // First, navigate to /my so we can write to same-origin localStorage.
    await gotoPath(page, DASHBOARD_URL);
    await page.evaluate(
      ([key, value]) => {
        try {
          window.localStorage.setItem(key, value);
        } catch {
          /* storage unavailable - non-fatal */
        }
      },
      [STORAGE_KEY, JSON.stringify(fiveSeed)] as const,
    );

    // Re-hit /my to confirm the seeded five render as expected.
    await gotoPath(page, DASHBOARD_URL);
    await expect(page.getByTestId('recent-vertical-row')).toHaveCount(5);

    // Visit a sixth vertical whose mount effect writes to the same store.
    await gotoPath(page, '/ai-for-plumbers');
    await gotoPath(page, DASHBOARD_URL);

    const rows = page.getByTestId('recent-vertical-row');
    await expect(rows).toHaveCount(5);

    const raw = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
    const list = JSON.parse(raw!) as SeedEntry[];
    const paths = list.map((e) => e.path);
    expect(paths).toContain('/ai-for-plumbers');
    expect(paths).not.toContain('/ai-for-landscapers');

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (7): a seeded entry whose path is not in ROUTES or does not start
  // with /ai-for- is filtered at read time and does NOT render.
  test('allow-list: invalid paths are filtered at read time and do not render', async ({
    browser,
  }) => {
    const seed: SeedEntry[] = [
      {
        path: '/ai-for-this-was-removed',
        label: 'Ghost Vertical',
        lastVisitedAt: 1_730_000_004_000,
      },
      {
        path: '/compare/jobber',
        label: 'Wrong Prefix',
        lastVisitedAt: 1_730_000_003_000,
      },
      {
        path: '/ai-for-plumbers',
        label: VERTICAL_LABELS['/ai-for-plumbers'],
        lastVisitedAt: 1_730_000_002_000,
      },
    ];
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(seed));
    await gotoPath(page, DASHBOARD_URL);

    const rows = page.getByTestId('recent-vertical-row');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(VERTICAL_LABELS['/ai-for-plumbers']);
    await expect(page.getByText('Ghost Vertical', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Wrong Prefix', { exact: true })).toHaveCount(0);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (8): the rendered card body contains zero U+2014 code points per the
  // 2026-05-07 em-dash Hard NO.
  test('no em-dash characters anywhere in the seeded card', async ({ browser }) => {
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(SEED_THREE));
    await gotoPath(page, DASHBOARD_URL);

    const cardText = (await page.getByTestId('recent-verticals-card').textContent()) ?? '';
    expect(cardText.length).toBeGreaterThan(20);
    expect(cardText, 'no em-dash (U+2014) allowed in the recent-verticals card').not.toContain(EM_DASH);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (9): dark mode renders cleanly via
  // document.documentElement.classList.add('dark') on a 375px viewport and
  // the card is still visible.
  test('dark mode: card renders with dark class on documentElement at 375px', async ({
    browser,
  }) => {
    const { ctx, page, errors } = await contextWithSeed(
      browser,
      JSON.stringify(SEED_THREE),
      { width: 375, height: 800 },
    );
    await gotoPath(page, DASHBOARD_URL);
    await page.evaluate(() => document.documentElement.classList.add('dark'));

    await expect(page.getByTestId('recent-verticals-card')).toBeVisible();
    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(hasDarkClass).toBe(true);

    expect(errors).toEqual([]);
    await ctx.close();
  });
});
