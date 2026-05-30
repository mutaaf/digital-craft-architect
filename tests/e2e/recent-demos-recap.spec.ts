import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0026 - Recently viewed demos recap strip on the /demos hub.
// Each test maps 1:1 to an acceptance-criteria box on the ticket.
//
// The recap is powered by a new client-side store at src/utils/recentDemosStore.ts
// (`dca_recent_demos_v1`) and an inline <section> at the top of src/pages/Demos.tsx.
// Pre-seeding follows the same `addInitScript` pattern as the 0010 resumable
// session spec; SPA-navigation assertion follows tests/e2e/demo-breadcrumbs.spec.ts.

const DEMOS_HUB = '/demos';
const STORAGE_KEY = 'dca_recent_demos_v1';

type SeedEntry = {
  path: string;
  title: string;
  vertical: string;
  viewedAt: number;
};

const SEED_THREE: SeedEntry[] = [
  {
    path: '/construction/demo/lead-responder',
    title: 'AI Lead Responder',
    vertical: 'Construction',
    viewedAt: 1_730_000_000_000,
  },
  {
    path: '/construction/demo/voice-negotiator',
    title: 'Voice Negotiator',
    vertical: 'Construction',
    viewedAt: 1_730_000_001_000,
  },
  {
    path: '/realestate/demo/property-negotiator',
    title: 'Deal Analyzer',
    vertical: 'Real Estate',
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

async function gotoHub(page: Page) {
  const response = await page.goto(DEMOS_HUB, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${DEMOS_HUB}`).not.toBeNull();
  expect(response!.status()).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
}

async function contextWithSeed(
  browser: import('@playwright/test').Browser,
  raw: string,
): Promise<{ ctx: BrowserContext; page: Page; errors: string[] }> {
  const ctx = await browser.newContext();
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

test.describe('recently viewed demos recap', () => {
  // Box: first-visit - empty storage hides the recap section entirely; the
  // page layout matches today's catalog (no empty state, no nag).
  test('first-time visitor sees no recap section', async ({ page }) => {
    const errors = trackErrors(page);
    await gotoHub(page);

    await expect(page.getByText('Recently viewed', { exact: true })).toHaveCount(0);
    await expect(page.getByTestId('recent-demos-recap')).toHaveCount(0);

    // Existing catalog still renders.
    await expect(page.locator('h2', { hasText: 'Construction' }).first()).toBeVisible();

    expect(errors).toEqual([]);
  });

  // Box: returning visitor with seeded entries sees the recap above the
  // demo groups; each entry renders title + muted vertical + "Try it again".
  test('returning visitor sees recap with seeded entries', async ({ browser }) => {
    const { ctx, page, errors } = await contextWithSeed(
      browser,
      JSON.stringify(SEED_THREE),
    );
    await gotoHub(page);

    const recap = page.getByTestId('recent-demos-recap');
    await expect(recap).toBeVisible();
    await expect(recap.locator('h2', { hasText: /^Recently viewed$/ })).toBeVisible();

    // All three seeded titles render in card form.
    await expect(recap.getByText('AI Lead Responder', { exact: true })).toBeVisible();
    await expect(recap.getByText('Voice Negotiator', { exact: true })).toBeVisible();
    await expect(recap.getByText('Deal Analyzer', { exact: true })).toBeVisible();

    // Vertical label appears in muted text.
    await expect(recap.getByText('Construction').first()).toBeVisible();
    await expect(recap.getByText('Real Estate').first()).toBeVisible();

    // Each card has the "Try it again" arrow link copy (no em-dash, no exclamation).
    const tryAgain = recap.getByText('Try it again');
    await expect(tryAgain.first()).toBeVisible();
    expect(await tryAgain.count()).toBe(SEED_THREE.length);

    // Recap renders ABOVE the demo groups (Construction h2).
    const recapBox = await recap.boundingBox();
    const firstGroupBox = await page
      .locator('h2', { hasText: 'Construction' })
      .first()
      .boundingBox();
    expect(recapBox).not.toBeNull();
    expect(firstGroupBox).not.toBeNull();
    expect(recapBox!.y).toBeLessThan(firstGroupBox!.y);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box: clicking a recap card is an SPA navigation to the stored path
  // (no full reload), fires trackCTAClick('recent_demo', 'demos_hub_recap').
  test('recap card click is an SPA navigation to the stored path', async ({ browser }) => {
    const { ctx, page, errors } = await contextWithSeed(
      browser,
      JSON.stringify(SEED_THREE),
    );
    await gotoHub(page);

    await page.evaluate(() => {
      (window as unknown as { __spaMarker: boolean }).__spaMarker = true;
    });

    const recap = page.getByTestId('recent-demos-recap');
    await expect(recap).toBeVisible();
    await recap.getByRole('link', { name: /AI Lead Responder/i }).first().click();

    await expect(page).toHaveURL(/\/construction\/demo\/lead-responder$/);

    const stillSpa = await page.evaluate(
      () => (window as unknown as { __spaMarker?: boolean }).__spaMarker === true,
    );
    expect(stillSpa, 'expected SPA navigation, got full reload').toBe(true);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box: a malformed value in storage does not crash; recap is absent.
  test('malformed storage value is tolerated and recap is absent', async ({ browser }) => {
    const { ctx, page, errors } = await contextWithSeed(browser, '{not json at all');
    await gotoHub(page);

    await expect(page.getByTestId('recent-demos-recap')).toHaveCount(0);
    // Page still works.
    await expect(page.locator('h2', { hasText: 'Construction' }).first()).toBeVisible();

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box: dark mode at 375px renders the recap cleanly.
  test('recap renders in dark mode on a 375px viewport', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
    await ctx.addInitScript(
      ([key, value]) => {
        try {
          window.localStorage.setItem(key, value);
        } catch {
          /* storage unavailable - non-fatal */
        }
      },
      [STORAGE_KEY, JSON.stringify(SEED_THREE)] as const,
    );
    const page = await ctx.newPage();
    const errors = trackErrors(page);
    await gotoHub(page);

    // Toggle dark mode after the page has hydrated so document.documentElement
    // is non-null (an addInitScript here would race with document creation).
    await page.evaluate(() => document.documentElement.classList.add('dark'));

    const recap = page.getByTestId('recent-demos-recap');
    await expect(recap).toBeVisible();
    await expect(recap.locator('h2', { hasText: /^Recently viewed$/ })).toBeVisible();
    await expect(recap.getByText('AI Lead Responder', { exact: true })).toBeVisible();

    // No em-dash in any rendered recap text.
    const recapText = await recap.innerText();
    expect(recapText).not.toContain('—');

    // The .dark class is on the documentElement so Tailwind dark variants apply.
    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(hasDarkClass).toBe(true);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box: cross-route re-visit moves an entry to the front of the recap.
  // Click a demo card on /demos (which records the visit) and verify the
  // store now lists the visited entry at the head with no duplicate. We
  // assert against localStorage directly because Playwright's addInitScript
  // re-seeds the storage on every full navigation, which would otherwise
  // mask the recordDemoVisit side-effect across a goto.
  test('cross-route re-visit moves entry to front, no duplicate', async ({ browser }) => {
    const ctx = await browser.newContext();
    // Seed once via direct localStorage on first navigation, not via
    // addInitScript, so the seed is not re-applied on later goto()s.
    const seed: SeedEntry[] = [
      {
        path: '/construction/demo/voice-negotiator',
        title: 'Voice Negotiator',
        vertical: 'Construction',
        viewedAt: 1_730_000_001_000,
      },
      {
        path: '/realestate/demo/property-negotiator',
        title: 'Deal Analyzer',
        vertical: 'Real Estate',
        viewedAt: 1_730_000_002_000,
      },
    ];
    const page = await ctx.newPage();
    const errors = trackErrors(page);

    await page.goto(DEMOS_HUB, { waitUntil: 'domcontentloaded' });
    await page.evaluate(
      ([key, value]) => {
        window.localStorage.setItem(key, value);
      },
      [STORAGE_KEY, JSON.stringify(seed)] as const,
    );
    await page.goto(DEMOS_HUB, { waitUntil: 'domcontentloaded' });

    const recap0 = page.getByTestId('recent-demos-recap');
    await expect(recap0).toBeVisible();
    const initialTitles = await recap0
      .locator('[data-testid="recent-demo-card"] h3')
      .allTextContents();
    expect(initialTitles[0]).toBe('Voice Negotiator');

    // Catalog click on a NEW path - the AI Lead Responder card in the
    // Construction group - fires recordDemoVisit before SPA navigation. We
    // pick the catalog instance explicitly (not the recap shortcut) because
    // the recap card does not re-record visits in this ticket.
    const constructionGroup = page.locator('#construction');
    await constructionGroup
      .locator('a[href="/construction/demo/lead-responder"]')
      .first()
      .click();
    await expect(page).toHaveURL(/\/construction\/demo\/lead-responder$/);

    // The store now has lead-responder at the front, no duplicate.
    const afterFirstClick = await page.evaluate(
      (k) => window.localStorage.getItem(k),
      STORAGE_KEY,
    );
    expect(afterFirstClick).not.toBeNull();
    const list1 = JSON.parse(afterFirstClick!) as SeedEntry[];
    expect(list1[0].path).toBe('/construction/demo/lead-responder');
    expect(list1.filter((e) => e.path === '/construction/demo/lead-responder').length).toBe(1);

    // Now back to /demos and re-click Voice Negotiator IN THE CATALOG.
    // Already in storage; the entry should move back to the front with no
    // duplicate. (Clicking the recap card would not re-record the visit -
    // by design, the recap is a shortcut surface.)
    await page.goto(DEMOS_HUB, { waitUntil: 'domcontentloaded' });
    await page
      .locator('#construction')
      .locator('a[href="/construction/demo/voice-negotiator"]')
      .first()
      .click();
    await expect(page).toHaveURL(/\/construction\/demo\/voice-negotiator$/);

    const afterSecondClick = await page.evaluate(
      (k) => window.localStorage.getItem(k),
      STORAGE_KEY,
    );
    expect(afterSecondClick).not.toBeNull();
    const list2 = JSON.parse(afterSecondClick!) as SeedEntry[];
    expect(list2[0].path).toBe('/construction/demo/voice-negotiator');
    expect(list2.filter((e) => e.path === '/construction/demo/voice-negotiator').length).toBe(1);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box: a stored unknown path is rejected by the store (so it does not
  // strand a dead recap link); only the valid entries render.
  test('unknown path in storage is rejected; only valid entries render', async ({ browser }) => {
    const seed: SeedEntry[] = [
      {
        path: '/construction/demo/this-was-removed',
        title: 'Ghost Demo',
        vertical: 'Construction',
        viewedAt: 1_730_000_003_000,
      },
      {
        path: '/construction/demo/lead-responder',
        title: 'AI Lead Responder',
        vertical: 'Construction',
        viewedAt: 1_730_000_002_000,
      },
    ];
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(seed));
    await gotoHub(page);

    const recap = page.getByTestId('recent-demos-recap');
    await expect(recap).toBeVisible();
    await expect(recap.getByText('AI Lead Responder', { exact: true })).toBeVisible();
    await expect(recap.getByText('Ghost Demo', { exact: true })).toHaveCount(0);

    expect(errors).toEqual([]);
    await ctx.close();
  });
});
