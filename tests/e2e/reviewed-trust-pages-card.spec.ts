import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';
import {
  TRUST_PAGE_LABELS,
  TRUST_ROUTES,
} from '../../src/data/trustPageLabels';

// Ticket 0104 - Persist visited trust-family pages and surface a
// "Compliance you've reviewed" card on /my dashboard.
//
// Each test maps 1:1 to an acceptance-criteria box on the ticket. The
// card is powered by a new client-side store at
// src/utils/reviewedTrustPagesStore.ts (`dca_reviewed_trust_pages_v1`)
// and a ReviewedTrustPagesCard component rendered on
// src/pages/MyDashboard.tsx just below the ticket 0100 recent-verticals
// card. Store, label, and allow-list constants are all imported from the
// production source (`src/data/trustPageLabels.ts`) per the 2026-06-07
// mirror-source-across-src-tests rule and the 2026-05-25 mirror-source
// rule.
//
// Per the 2026-09-28 addInitScript-re-runs lesson, any seed that must
// survive a mid-test navigation to a lazy trust page is written via
// `page.evaluate` AFTER the first `/my` visit so the mount-effect write
// on the follow-up trust page is not clobbered by a re-firing init
// script.

const DASHBOARD_URL = '/my';
const STORAGE_KEY = 'dca_reviewed_trust_pages_v1';

// U+2014 spelled via fromCharCode so this file itself contains no
// em-dash (the 2026-05-07 brand-voice Hard NO bans the literal character
// even in tests).
const EM_DASH = String.fromCharCode(8212);

type SeedEntry = {
  path: string;
  label: string;
  lastVisitedAt: number;
};

// Three valid seed paths drawn from TRUST_PAGE_LABELS / TRUST_ROUTES so
// the allow-list filter always accepts them. Ordering is most-recent-
// first (position 0 is the last visit) matching the store's on-write
// prepend convention.
const SEED_THREE: SeedEntry[] = [
  {
    path: '/security',
    label: TRUST_PAGE_LABELS['/security'],
    lastVisitedAt: 1_730_000_003_000,
  },
  {
    path: '/subprocessors',
    label: TRUST_PAGE_LABELS['/subprocessors'],
    lastVisitedAt: 1_730_000_002_000,
  },
  {
    path: '/accessibility-statement',
    label: TRUST_PAGE_LABELS['/accessibility-statement'],
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
  // Per the 2026-09-05 route-code-splitting lesson RouteFallback trips
  // the innerHTML>500 heuristic before the lazy chunk mounts. Wait for
  // the real page H1 before returning so the trust page's on-mount
  // `useEffect` has fired its `recordTrustPageVisit` write before the
  // follow-up /my read reads localStorage (write-through case). The
  // .catch swallows the wait on routes that never emit an <h1>.
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

test.describe('reviewed trust pages card on /my', () => {
  // Box (1): empty storage hides the ReviewedTrustPagesCard entirely.
  test('empty storage: card is absent', async ({ page }) => {
    const errors = trackErrors(page);
    await gotoPath(page, DASHBOARD_URL);

    await expect(page.getByTestId('reviewed-trust-pages-card')).toHaveCount(0);
    // Existing dashboard shell still renders.
    await expect(page.locator('h1')).toContainText(/pick up where you/i);

    expect(errors).toEqual([]);
  });

  // Box (2): with three valid seeded entries, the card renders exactly
  // three rows with the labels visible.
  test('seeded three entries: card renders exactly three rows with labels', async ({
    browser,
  }) => {
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(SEED_THREE));
    await gotoPath(page, DASHBOARD_URL);

    const card = page.getByTestId('reviewed-trust-pages-card');
    await expect(card).toBeVisible();

    const rows = page.getByTestId('reviewed-trust-page-row');
    await expect(rows).toHaveCount(3);

    await expect(card.getByText(SEED_THREE[0].label, { exact: true }).first()).toBeVisible();
    await expect(card.getByText(SEED_THREE[1].label, { exact: true }).first()).toBeVisible();
    await expect(card.getByText(SEED_THREE[2].label, { exact: true }).first()).toBeVisible();

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (3): each Reopen anchor href matches a path in the imported
  // TRUST_ROUTES allow-list (mirror-source assertion per the 2026-06-07
  // rule).
  test('reopen anchor hrefs match TRUST_ROUTES', async ({ browser }) => {
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(SEED_THREE));
    await gotoPath(page, DASHBOARD_URL);

    const rows = page.getByTestId('reviewed-trust-page-row');
    await expect(rows).toHaveCount(3);

    const hrefs = await rows.evaluateAll((els) =>
      els
        .map((el) => el.querySelector('a[href^="/"]'))
        .map((a) => (a ? a.getAttribute('href') : null)),
    );
    expect(hrefs.length).toBe(3);
    for (const href of hrefs) {
      expect(href, 'each row must expose a reopen anchor').not.toBeNull();
      expect(TRUST_ROUTES.includes(href!), `${href} must be in TRUST_ROUTES`).toBe(true);
    }

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (4): visiting /security then /my writes the shared label
  // constant to storage at position 1 (write-through case). The lazy
  // trust chunk mount is the signal the on-mount effect fires, which
  // gotoPath waits for via the H1 visible check per the 2026-09-10
  // mount-signal lesson.
  test('write-through: visiting /security then /my lists Security at position 1', async ({
    browser,
  }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors = trackErrors(page);

    await gotoPath(page, '/security');
    await gotoPath(page, DASHBOARD_URL);

    const raw = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
    expect(raw, 'storage should have been written').not.toBeNull();
    const list = JSON.parse(raw!) as SeedEntry[];
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0].path).toBe('/security');
    expect(list[0].label).toBe(TRUST_PAGE_LABELS['/security']);

    const rows = page.getByTestId('reviewed-trust-page-row');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(TRUST_PAGE_LABELS['/security']);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (5): revisiting an already-recorded path moves the row to the
  // top and does NOT create a duplicate (dedup case).
  test('dedup: revisit moves row to top and does not duplicate', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors = trackErrors(page);

    await gotoPath(page, '/security');
    await gotoPath(page, '/subprocessors');
    await gotoPath(page, '/security');
    await gotoPath(page, DASHBOARD_URL);

    const rows = page.getByTestId('reviewed-trust-page-row');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText(TRUST_PAGE_LABELS['/security']);
    await expect(rows.nth(1)).toContainText(TRUST_PAGE_LABELS['/subprocessors']);

    const raw = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
    const list = JSON.parse(raw!) as SeedEntry[];
    expect(list.filter((e) => e.path === '/security').length).toBe(1);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (6): when the store holds 6 entries and a seventh trust page is
  // visited, the oldest entry is evicted (FIFO evict case,
  // toHaveCount(6) before and after). Seeded via `page.evaluate` AFTER
  // the first `/my` navigation per the 2026-09-28 addInitScript-re-runs
  // lesson so the intermediate `/hallucination-safeguards` navigation's
  // mount-effect write is not overwritten by a re-firing init script.
  test('FIFO evict: seventh visit evicts the oldest entry', async ({ browser }) => {
    const sixSeed: SeedEntry[] = [
      { path: '/security', label: TRUST_PAGE_LABELS['/security'], lastVisitedAt: 1_730_000_006_000 },
      { path: '/subprocessors', label: TRUST_PAGE_LABELS['/subprocessors'], lastVisitedAt: 1_730_000_005_000 },
      { path: '/accessibility-statement', label: TRUST_PAGE_LABELS['/accessibility-statement'], lastVisitedAt: 1_730_000_004_000 },
      { path: '/model-card', label: TRUST_PAGE_LABELS['/model-card'], lastVisitedAt: 1_730_000_003_000 },
      { path: '/ai-risks-we-watch', label: TRUST_PAGE_LABELS['/ai-risks-we-watch'], lastVisitedAt: 1_730_000_002_000 },
      { path: '/ethics', label: TRUST_PAGE_LABELS['/ethics'], lastVisitedAt: 1_730_000_001_000 },
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
      [STORAGE_KEY, JSON.stringify(sixSeed)] as const,
    );

    // Re-hit /my to confirm the seeded six render as expected.
    await gotoPath(page, DASHBOARD_URL);
    await expect(page.getByTestId('reviewed-trust-page-row')).toHaveCount(6);

    // Visit a seventh trust page whose mount effect writes to the same
    // store. The seed lives in localStorage (written via page.evaluate,
    // not addInitScript) so this navigation preserves the seed and the
    // mount-effect write prepends /hallucination-safeguards, evicting
    // /ethics as the oldest entry.
    await gotoPath(page, '/hallucination-safeguards');
    await gotoPath(page, DASHBOARD_URL);

    const rows = page.getByTestId('reviewed-trust-page-row');
    await expect(rows).toHaveCount(6);

    const raw = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
    const list = JSON.parse(raw!) as SeedEntry[];
    const paths = list.map((e) => e.path);
    expect(paths).toContain('/hallucination-safeguards');
    expect(paths).not.toContain('/ethics');

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (7): a seeded entry whose path is not in TRUST_ROUTES is
  // filtered at read time and does NOT render (allow-list case).
  test('allow-list: invalid paths are filtered at read time and do not render', async ({
    browser,
  }) => {
    const seed: SeedEntry[] = [
      {
        path: '/this-trust-page-was-removed',
        label: 'Ghost Trust Page',
        lastVisitedAt: 1_730_000_004_000,
      },
      {
        path: '/compare/jobber',
        label: 'Wrong Family',
        lastVisitedAt: 1_730_000_003_000,
      },
      {
        path: '/security',
        label: TRUST_PAGE_LABELS['/security'],
        lastVisitedAt: 1_730_000_002_000,
      },
    ];
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(seed));
    await gotoPath(page, DASHBOARD_URL);

    const rows = page.getByTestId('reviewed-trust-page-row');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(TRUST_PAGE_LABELS['/security']);
    await expect(page.getByText('Ghost Trust Page', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Wrong Family', { exact: true })).toHaveCount(0);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (8): the rendered card body contains zero U+2014 code points
  // per the 2026-05-07 em-dash Hard NO.
  test('no em-dash characters anywhere in the seeded card', async ({ browser }) => {
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(SEED_THREE));
    await gotoPath(page, DASHBOARD_URL);

    const cardText = (await page.getByTestId('reviewed-trust-pages-card').textContent()) ?? '';
    expect(cardText.length).toBeGreaterThan(20);
    expect(cardText, 'no em-dash (U+2014) allowed in the reviewed-trust-pages card').not.toContain(EM_DASH);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (9): dark mode renders cleanly via
  // document.documentElement.classList.add('dark') on a 375px viewport
  // and the card is still visible.
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

    await expect(page.getByTestId('reviewed-trust-pages-card')).toBeVisible();
    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(hasDarkClass).toBe(true);

    expect(errors).toEqual([]);
    await ctx.close();
  });
});
