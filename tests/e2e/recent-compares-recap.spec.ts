import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS, ROUTES } from './routes';

// Ticket 0074 - Persist the visitor's viewed comparison pages and surface a
// "Comparisons you're weighing" card on /my dashboard. Each test maps 1:1 to
// an acceptance-criteria box on the ticket.
//
// The card is powered by a new client-side store at
// src/utils/recentComparesStore.ts (`dca_recent_compares_v1`) and an inline
// <article> block at the top of src/pages/MyDashboard.tsx. Pre-seeding
// follows the same `addInitScript` pattern as tests/e2e/recent-demos-recap.spec.ts
// (ticket 0026, the direct peer for a recap store) and
// tests/e2e/roi-card-on-dashboard.spec.ts (ticket 0062, the direct peer for
// a dashboard-card retention surface).

const DASHBOARD_URL = '/my';
const STORAGE_KEY = 'dca_recent_compares_v1';

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the 2026-05-07 brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

type SeedEntry = {
  path: string;
  tool: string;
  viewedAt: number;
};

// Two valid seed paths drawn from COMPARE_ENTRIES / ROUTES so the allow-list
// filter always accepts them. Ordering is oldest-first here because the store
// prepends new visits to the front; a seeded array in that shape lets the
// test assert both entries render as-is.
const SEED_TWO: SeedEntry[] = [
  {
    path: '/compare/buildertrend',
    tool: 'Buildertrend',
    viewedAt: 1_730_000_001_000,
  },
  {
    path: '/compare/jobber',
    tool: 'Jobber',
    viewedAt: 1_730_000_002_000,
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
  // Per the 2026-09-05 route-code-splitting lesson: the RouteFallback trips
  // the innerHTML>500 heuristic before a lazy chunk actually mounts. For
  // pages whose useEffect writes to storage on mount, we must wait for the
  // real page H1 before the test moves on or the write-through will lose
  // the visit. This waits up to 10s; a route with no <h1> still resolves
  // when the fallback detaches and Helmet-managed titles hydrate.
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

test.describe('recent compares recap card', () => {
  // Box (1): empty storage hides the RecentComparesCard entirely.
  test('empty storage: card is absent', async ({ page }) => {
    const errors = trackErrors(page);
    await gotoPath(page, DASHBOARD_URL);

    await expect(page.getByTestId('recent-compares-card')).toHaveCount(0);
    // Existing dashboard still renders (empty-state case).
    await expect(page.locator('h1')).toContainText(/pick up where you/i);

    expect(errors).toEqual([]);
  });

  // Box (2): with two valid seeded entries, the card renders exactly two
  // rows with the tool names visible.
  test('seeded two entries: card renders exactly two rows with tool names', async ({
    browser,
  }) => {
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(SEED_TWO));
    await gotoPath(page, DASHBOARD_URL);

    const card = page.getByTestId('recent-compares-card');
    await expect(card).toBeVisible();

    const rows = page.getByTestId('recent-compare-row');
    await expect(rows).toHaveCount(2);

    await expect(card.getByText('Buildertrend', { exact: true }).first()).toBeVisible();
    await expect(card.getByText('Jobber', { exact: true }).first()).toBeVisible();

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (3): each Reopen comparison anchor href matches /compare/<tool> and
  // resolves to a path in ROUTES.
  test('reopen anchor hrefs match /compare/<tool> and are in ROUTES', async ({ browser }) => {
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(SEED_TWO));
    await gotoPath(page, DASHBOARD_URL);

    const rows = page.getByTestId('recent-compare-row');
    await expect(rows).toHaveCount(2);

    const hrefs = await rows.evaluateAll((els) =>
      els
        .map((el) => el.querySelector('a[href^="/compare/"]'))
        .map((a) => (a ? a.getAttribute('href') : null)),
    );
    expect(hrefs.length).toBe(2);
    for (const href of hrefs) {
      expect(href, 'each row must expose a reopen anchor').not.toBeNull();
      expect(href!).toMatch(/^\/compare\//);
      expect(ROUTES.includes(href!), `${href} must be in ROUTES`).toBe(true);
    }

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (4): navigating to a /compare/<tool> route and then to /my writes the
  // path to storage at position 1 (write-through case).
  test('write-through: visiting /compare/jobber then /my lists jobber at position 1', async ({
    browser,
  }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors = trackErrors(page);

    await gotoPath(page, '/compare/jobber');
    await gotoPath(page, DASHBOARD_URL);

    const raw = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
    expect(raw, 'storage should have been written').not.toBeNull();
    const list = JSON.parse(raw!) as SeedEntry[];
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0].path).toBe('/compare/jobber');

    const rows = page.getByTestId('recent-compare-row');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Jobber');

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (5): a duplicate visit to the same compare path does NOT create a
  // second row (dedup case).
  test('dedup: duplicate visit does not create a second row', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors = trackErrors(page);

    await gotoPath(page, '/compare/jobber');
    await gotoPath(page, '/compare/jobber');
    await gotoPath(page, DASHBOARD_URL);

    const rows = page.getByTestId('recent-compare-row');
    await expect(rows).toHaveCount(1);

    const raw = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
    const list = JSON.parse(raw!) as SeedEntry[];
    expect(list.filter((e) => e.path === '/compare/jobber').length).toBe(1);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (6): a seeded entry whose path is NOT in COMPARE_ENTRIES is filtered
  // at read time and does NOT render (allow-list case).
  test('allow-list: invalid path is filtered at read time and does not render', async ({
    browser,
  }) => {
    const seed: SeedEntry[] = [
      {
        path: '/compare/this-was-removed',
        tool: 'Ghost',
        viewedAt: 1_730_000_003_000,
      },
      {
        path: '/compare/hubspot',
        tool: 'HubSpot',
        viewedAt: 1_730_000_002_000,
      },
    ];
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(seed));
    await gotoPath(page, DASHBOARD_URL);

    const rows = page.getByTestId('recent-compare-row');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('HubSpot');
    await expect(page.getByText('Ghost', { exact: true })).toHaveCount(0);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (7): when at least one entry is stored AND at least one COMPARE_ENTRIES
  // entry is unvisited, exactly one compare-suggest-chip renders pointing at a
  // valid /compare/<tool> route.
  test('suggest chip: one chip renders with valid /compare href when unvisited entries remain', async ({
    browser,
  }) => {
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(SEED_TWO));
    await gotoPath(page, DASHBOARD_URL);

    const chip = page.getByTestId('compare-suggest-chip');
    await expect(chip).toHaveCount(1);

    const href = await chip.getAttribute('href');
    expect(href, 'suggest chip must have an href').not.toBeNull();
    expect(href!).toMatch(/^\/compare\//);
    expect(ROUTES.includes(href!)).toBe(true);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (8): when every COMPARE_ENTRIES entry has been visited, the suggest
  // chip is absent (toHaveCount(0)).
  test('suggest chip absent when every entry has been visited', async ({ browser }) => {
    // Build a seed containing every compare path in ROUTES so the store's
    // suggestNextCompare returns null. This matches the 2026-09-06 lesson:
    // assert over the seeded state's contract, not over the live-dashboard
    // window.
    const allComparePaths = ROUTES.filter(
      (r) => r.startsWith('/compare/') && r !== '/compare',
    );
    const seed: SeedEntry[] = allComparePaths.map((path, i) => ({
      path,
      tool: path.split('/').pop() ?? 'Compare',
      viewedAt: 1_730_000_000_000 + i,
    }));
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(seed));
    await gotoPath(page, DASHBOARD_URL);

    // Card renders because entries are stored, but no chip because nothing is
    // unvisited. Row count is capped at MAX_ENTRIES = 5 by the store's slice.
    await expect(page.getByTestId('recent-compares-card')).toBeVisible();
    await expect(page.getByTestId('compare-suggest-chip')).toHaveCount(0);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (9): the seeded /my page text contains no U+2014 code point in any
  // RecentComparesCard string.
  test('no em-dash characters anywhere on the seeded /my page', async ({ browser }) => {
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(SEED_TWO));
    await gotoPath(page, DASHBOARD_URL);

    const bodyText = (await page.textContent('body')) ?? '';
    expect(bodyText.length).toBeGreaterThan(100);
    expect(bodyText, 'no em-dash (U+2014) allowed on seeded /my').not.toContain(EM_DASH);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (10): dark mode renders cleanly via
  // document.documentElement.classList.add('dark') and the card is still
  // visible.
  test('dark mode: card renders with dark class on documentElement', async ({ browser }) => {
    const { ctx, page, errors } = await contextWithSeed(
      browser,
      JSON.stringify(SEED_TWO),
      { width: 375, height: 800 },
    );
    await gotoPath(page, DASHBOARD_URL);
    await page.evaluate(() => document.documentElement.classList.add('dark'));

    await expect(page.getByTestId('recent-compares-card')).toBeVisible();
    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(hasDarkClass).toBe(true);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (11): sibling-page-regression case navigates to /compare/jobber, then
  // /compare/buildertrend, then /my, and asserts both rows appear in
  // reverse-visit order (most-recent-first).
  test('reverse-visit order: last visited /compare page appears at position 1', async ({
    browser,
  }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors = trackErrors(page);

    await gotoPath(page, '/compare/jobber');
    await gotoPath(page, '/compare/buildertrend');
    await gotoPath(page, DASHBOARD_URL);

    const rows = page.getByTestId('recent-compare-row');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText('Buildertrend');
    await expect(rows.nth(1)).toContainText('Jobber');

    expect(errors).toEqual([]);
    await ctx.close();
  });
});
