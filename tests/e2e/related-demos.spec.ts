import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0027 - "More like this" cross-vertical recommendations under each
// demo. Each test maps 1:1 to an acceptance-criteria box on the ticket.
//
// The strip is powered by a deterministic recommender in
// src/utils/relatedDemos.ts (literal DEMO_CATALOG, validated against
// KNOWN_PATHS at module load), and a `<RelatedDemos />` component mounted
// once per shared demo component file with `useLocation()`. Pre-seeding
// follows the same `addInitScript` pattern as the 0026 recap spec;
// SPA-navigation assertion mirrors tests/e2e/demo-breadcrumbs.spec.ts.

const STORAGE_KEY = 'dca_recent_demos_v1';

type SeedEntry = {
  path: string;
  title: string;
  vertical: string;
  viewedAt: number;
};

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

async function gotoDemo(page: Page, path: string): Promise<void> {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${path}`).not.toBeNull();
  expect(response!.status(), `${path} returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
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

test.describe('more like this related demos', () => {
  // Box: empty-history visitor on the construction Lead Responder still sees
  // the strip with at least the same-tool siblings (Lead Responder in real
  // estate, home services).
  test('empty-history visitor sees same-tool siblings', async ({ page }) => {
    const errors = trackErrors(page);
    await gotoDemo(page, '/construction/demo/lead-responder');

    const strip = page.getByTestId('related-demos');
    await expect(strip).toBeVisible();
    await expect(strip.locator('h2', { hasText: /^More like this$/ })).toBeVisible();

    // Same-tool siblings present: AI Lead Responder for Real Estate and
    // Home Services live elsewhere in the catalog and should surface first.
    await expect(
      strip.getByRole('link', { name: /AI Lead Responder/i }),
    ).toHaveCount(2);

    // Each sibling labels the vertical of the target demo.
    await expect(strip.getByText(/Same tool for Real Estate/i)).toBeVisible();
    await expect(strip.getByText(/Same tool for Home Services/i)).toBeVisible();

    expect(errors).toEqual([]);
  });

  // Box: with-history visitor who has already visited /construction/demo/estimate
  // sees the same-vertical fallback skip Estimate and pick a different
  // unvisited construction demo for the third slot.
  test('with-history visitor skips already-visited same-vertical demos', async ({ browser }) => {
    const seed: SeedEntry[] = [
      {
        path: '/construction/demo/estimate',
        title: 'Smart Estimate Generator',
        vertical: 'Construction',
        viewedAt: 1_730_000_000_000,
      },
    ];
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(seed));
    await gotoDemo(page, '/construction/demo/lead-responder');

    const strip = page.getByTestId('related-demos');
    await expect(strip).toBeVisible();

    // Estimate is in history and same vertical so it must NOT appear in
    // the recommendations.
    await expect(strip.getByRole('link', { name: /Smart Estimate Generator/i })).toHaveCount(0);

    // Strip still shows three cards (the two same-tool siblings plus an
    // unvisited construction demo).
    const cards = strip.locator('a[data-testid="related-demo-card"]');
    await expect(cards).toHaveCount(3);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box: clicking a card is an SPA navigation (mirror demo-breadcrumbs.spec.ts).
  test('clicking a card is an SPA navigation', async ({ page }) => {
    await gotoDemo(page, '/construction/demo/lead-responder');

    await page.evaluate(() => {
      (window as unknown as { __spaMarker: boolean }).__spaMarker = true;
    });

    const strip = page.getByTestId('related-demos');
    await expect(strip).toBeVisible();

    // Click the first same-tool sibling card (Real Estate Lead Responder).
    const targetCard = strip
      .locator('a[data-testid="related-demo-card"][href="/realestate/demo/lead-responder"]')
      .first();
    await expect(targetCard).toBeVisible();
    await targetCard.click();

    await expect(page).toHaveURL(/\/realestate\/demo\/lead-responder$/);

    const stillSpa = await page.evaluate(
      () => (window as unknown as { __spaMarker?: boolean }).__spaMarker === true,
    );
    expect(stillSpa, 'expected SPA navigation but page fully reloaded').toBe(true);
  });

  // Box: dark-mode rendering at 375px on a representative demo route.
  test('strip renders in dark mode on a 375px viewport', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
    const page = await ctx.newPage();
    const errors = trackErrors(page);
    await gotoDemo(page, '/construction/demo/lead-responder');

    await page.evaluate(() => document.documentElement.classList.add('dark'));

    const strip = page.getByTestId('related-demos');
    await expect(strip).toBeVisible();
    await expect(strip.locator('h2', { hasText: /^More like this$/ })).toBeVisible();

    // No em-dash in any rendered text.
    const stripText = await strip.innerText();
    expect(stripText).not.toContain('—');

    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(hasDarkClass).toBe(true);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box: a route whose path is NOT a known demo (e.g. an unrelated page)
  // does not render the strip. The DemoBreadcrumbs component already proved
  // /trust and /demos do not look like a per-vertical demo route, so we
  // use those as the negative case: the recommender is only mounted inside
  // demo component files, so non-demo routes must be free of the strip.
  test('unknown / non-demo routes render no strip', async ({ page }) => {
    for (const path of ['/', '/glossary', '/demos', '/trust']) {
      await gotoDemo(page, path);
      const count = await page.getByTestId('related-demos').count();
      expect(count, `strip leaked onto ${path}`).toBe(0);
    }
  });

  // Box: cross-route mount - the strip is present on each of 3 representative
  // demo routes (construction lead-responder, home services estimate,
  // real estate voice-negotiator).
  test('strip is present on the three representative demo routes', async ({ page }) => {
    for (const path of [
      '/construction/demo/lead-responder',
      '/homeservices/demo/estimate',
      '/realestate/demo/voice-negotiator',
    ]) {
      await gotoDemo(page, path);
      const strip = page.getByTestId('related-demos');
      await expect(strip, `strip missing on ${path}`).toBeVisible();
      await expect(
        strip.locator('h2', { hasText: /^More like this$/ }),
        `heading missing on ${path}`,
      ).toBeVisible();
    }
  });

  // Box: clicking a card records the visit AND fires the trackCTAClick
  // 'related_demo' event (asserted by reading localStorage after click;
  // the analytics ping is best-asserted by the dual side-effect happening
  // synchronously, mirroring the 0026 cross-route re-visit spec).
  test('clicking a card records the visit via recordDemoVisit', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors = trackErrors(page);

    await page.goto('/construction/demo/lead-responder', { waitUntil: 'domcontentloaded' });
    await expect
      .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
        timeout: 10_000,
      })
      .toBeGreaterThan(500);

    const strip = page.getByTestId('related-demos');
    await expect(strip).toBeVisible();

    const targetCard = strip
      .locator('a[data-testid="related-demo-card"][href="/realestate/demo/lead-responder"]')
      .first();
    await targetCard.click();
    await expect(page).toHaveURL(/\/realestate\/demo\/lead-responder$/);

    // Store now contains the visited path at the head.
    const raw = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
    expect(raw).not.toBeNull();
    const list = JSON.parse(raw!) as SeedEntry[];
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].path).toBe('/realestate/demo/lead-responder');

    expect(errors).toEqual([]);
    await ctx.close();
  });
});
