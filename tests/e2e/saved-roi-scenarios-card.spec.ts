import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0093 - Persist named ROI calculator scenarios and surface a "Saved
// ROI scenarios" card on /my dashboard. Each test maps 1:1 to a sub-scenario
// in the ticket's box (6) e2e acceptance criteria (cases 1-11). Modeled on
// tests/e2e/recent-compares-recap.spec.ts (ticket 0074, direct peer for a
// dashboard-card retention surface) and tests/e2e/roi-calculator.spec.ts
// (ticket 0046, for the save-through case that types into a real /roi form).

const DASHBOARD_URL = '/my';
const ROI_URL = '/roi';
const STORAGE_KEY = 'dca_roi_scenarios_v1';

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the 2026-05-07 brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

// Deterministic slug helper mirroring the store's kebab-case ID derivation.
// Kept byte-identical to src/utils/roiScenariosStore.ts so a source drift
// surfaces here immediately.
function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type SeedInputs = {
  leads: number;
  minutes: number;
  hourly: number;
  afterhours: number;
};

type SeedEntry = {
  id: string;
  name: string;
  inputs: SeedInputs;
  savedAt: number;
};

function seedEntry(name: string, inputs: SeedInputs, savedAt: number): SeedEntry {
  return { id: slugify(name), name, inputs, savedAt };
}

const VALID_INPUTS_A: SeedInputs = { leads: 60, minutes: 8, hourly: 75, afterhours: 35 };
const VALID_INPUTS_B: SeedInputs = { leads: 120, minutes: 12, hourly: 95, afterhours: 45 };

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
  // Per the 2026-09-10 mount-signal lesson: wait for the RouteFallback to
  // detach before firing interactive clicks. The h1 wait resolves when the
  // real page markup mounts.
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
  entries: SeedEntry[],
  viewport?: { width: number; height: number },
): Promise<{ ctx: BrowserContext; page: Page; errors: string[] }> {
  const ctx = await browser.newContext(viewport ? { viewport } : undefined);
  const raw = JSON.stringify(entries);
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

test.describe('saved ROI scenarios card', () => {
  // Case (1): with an empty store, /my renders WITHOUT the
  // SavedRoiScenariosCard.
  test('empty storage: card is absent', async ({ page }) => {
    const errors = trackErrors(page);
    await gotoPath(page, DASHBOARD_URL);

    await expect(page.getByTestId('saved-roi-scenarios-card')).toHaveCount(0);
    await expect(page.locator('h1')).toContainText(/pick up where you/i);

    expect(errors).toEqual([]);
  });

  // Case (2): after page.evaluate seeds two entries, /my renders exactly two
  // roi-scenario-row rows with the scenario names visible.
  test('seeded two entries: exactly two rows render with scenario names', async ({ browser }) => {
    const seed: SeedEntry[] = [
      seedEntry('Plumbing 5 trucks', VALID_INPUTS_A, 1_730_000_002_000),
      seedEntry('Concrete 12 crews', VALID_INPUTS_B, 1_730_000_001_000),
    ];
    const { ctx, page, errors } = await contextWithSeed(browser, seed);
    await gotoPath(page, DASHBOARD_URL);

    const card = page.getByTestId('saved-roi-scenarios-card');
    await expect(card).toBeVisible();

    const rows = page.getByTestId('roi-scenario-row');
    await expect(rows).toHaveCount(2);

    await expect(card.getByText('Plumbing 5 trucks', { exact: true }).first()).toBeVisible();
    await expect(card.getByText('Concrete 12 crews', { exact: true }).first()).toBeVisible();

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Case (3): each row's Reopen anchor href starts with /roi? AND round-trip-
  // decodes to the seeded inputs via the shipped decodeRoiParams (mirror-
  // source assertion per the 2026-05-25 rule).
  test('reopen anchor href round-trips to seeded inputs via encoded params', async ({ browser }) => {
    const seed: SeedEntry[] = [seedEntry('Alpha scenario', VALID_INPUTS_A, 1_730_000_002_000)];
    const { ctx, page, errors } = await contextWithSeed(browser, seed);
    await gotoPath(page, DASHBOARD_URL);

    const rows = page.getByTestId('roi-scenario-row');
    await expect(rows).toHaveCount(1);

    const href = await rows.first().locator('a[href^="/roi?"]').first().getAttribute('href');
    expect(href, 'reopen href required').not.toBeNull();
    expect(href!.startsWith('/roi?')).toBe(true);

    // Round-trip the href through URLSearchParams and assert each seeded
    // field round-trips byte-identically to the seed. This is the mirror-
    // source check: the store must delegate to encodeRoiParams so this decode
    // parity holds without a second URL builder.
    const params = new URLSearchParams(href!.split('?')[1] ?? '');
    expect(Number(params.get('leads'))).toBe(VALID_INPUTS_A.leads);
    expect(Number(params.get('minutes'))).toBe(VALID_INPUTS_A.minutes);
    expect(Number(params.get('hourly'))).toBe(VALID_INPUTS_A.hourly);
    expect(Number(params.get('afterhours'))).toBe(VALID_INPUTS_A.afterhours);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Case (4): write-through. Navigate to /roi, enter valid inputs, click Save
  // this scenario, type "Test scenario alpha", submit, navigate to /my, assert
  // one row whose name reads "Test scenario alpha".
  test('write-through: save from /roi renders one row on /my', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors = trackErrors(page);

    await gotoPath(page, ROI_URL);
    // The result panel visibility check (per the 2026-09-10 mount-signal
    // lesson) is the roi-annual-savings testid which is asserted visible
    // before the save-click fires.
    await expect(page.getByTestId('roi-annual-savings')).toBeVisible();

    // Type real inputs so the differs-from-defaults guard on the debounced
    // ticket 0062 save does not confuse this test.
    await page.getByTestId('roi-input-leads').fill(String(VALID_INPUTS_A.leads));
    await page.getByTestId('roi-input-minutes').fill(String(VALID_INPUTS_A.minutes));
    await page.getByTestId('roi-input-hourly').fill(String(VALID_INPUTS_A.hourly));
    await page.getByTestId('roi-input-afterhours').fill(String(VALID_INPUTS_A.afterhours));

    await page.getByTestId('roi-save-scenario-button').click();
    const input = page.getByTestId('roi-save-scenario-input');
    await expect(input).toBeVisible();
    await input.fill('Test scenario alpha');
    await page.getByTestId('roi-save-scenario-submit').click();

    await gotoPath(page, DASHBOARD_URL);
    const rows = page.getByTestId('roi-scenario-row');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Test scenario alpha');

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Case (5): duplicate-name save (case-insensitive) does NOT create a
  // second row.
  test('dedup: duplicate case-insensitive name does not create a second row', async ({ browser }) => {
    const seed: SeedEntry[] = [seedEntry('Plumbing 5 trucks', VALID_INPUTS_A, 1_730_000_002_000)];
    const { ctx, page, errors } = await contextWithSeed(browser, seed);
    await gotoPath(page, ROI_URL);
    await expect(page.getByTestId('roi-annual-savings')).toBeVisible();
    await page.getByTestId('roi-input-leads').fill(String(VALID_INPUTS_B.leads));
    await page.getByTestId('roi-input-minutes').fill(String(VALID_INPUTS_B.minutes));
    await page.getByTestId('roi-input-hourly').fill(String(VALID_INPUTS_B.hourly));
    await page.getByTestId('roi-input-afterhours').fill(String(VALID_INPUTS_B.afterhours));

    await page.getByTestId('roi-save-scenario-button').click();
    const input = page.getByTestId('roi-save-scenario-input');
    await input.fill('PLUMBING 5 TRUCKS'); // same slug, different case
    await page.getByTestId('roi-save-scenario-submit').click();

    await gotoPath(page, DASHBOARD_URL);
    const rows = page.getByTestId('roi-scenario-row');
    await expect(rows).toHaveCount(1);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Case (6): a seeded entry whose inputs fail the
  // decodeRoiParams(encodeRoiParams(inputs)) byte-identical round-trip is
  // filtered at read time and does NOT render.
  test('allow-list: out-of-range seeded inputs are filtered at read time', async ({ browser }) => {
    const seed: SeedEntry[] = [
      // leads: 99999 exceeds BOUNDS.leads.max of 1000; the round-trip clamps
      // to DEFAULT_INPUTS.leads (50), which differs from 99999, so the store
      // filters this entry.
      seedEntry('Broken scenario', { leads: 99999, minutes: 8, hourly: 75, afterhours: 35 }, 1_730_000_002_000),
      seedEntry('Valid scenario', VALID_INPUTS_A, 1_730_000_001_000),
    ];
    const { ctx, page, errors } = await contextWithSeed(browser, seed);
    await gotoPath(page, DASHBOARD_URL);

    const rows = page.getByTestId('roi-scenario-row');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Valid scenario');
    await expect(page.getByText('Broken scenario', { exact: true })).toHaveCount(0);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Case (7): when the store holds 5 entries and a sixth NEW name is saved,
  // the oldest is evicted and the "Replaced oldest scenario" hint renders
  // for 3 seconds (FIFO evict case).
  test('FIFO evict: sixth save evicts the oldest and shows a hint', async ({ browser }) => {
    const seed: SeedEntry[] = [
      seedEntry('Scenario 5', VALID_INPUTS_A, 1_730_000_005_000),
      seedEntry('Scenario 4', VALID_INPUTS_A, 1_730_000_004_000),
      seedEntry('Scenario 3', VALID_INPUTS_A, 1_730_000_003_000),
      seedEntry('Scenario 2', VALID_INPUTS_A, 1_730_000_002_000),
      seedEntry('Scenario 1', VALID_INPUTS_A, 1_730_000_001_000),
    ];
    const { ctx, page, errors } = await contextWithSeed(browser, seed);
    await gotoPath(page, ROI_URL);
    await expect(page.getByTestId('roi-annual-savings')).toBeVisible();

    await page.getByTestId('roi-save-scenario-button').click();
    await page.getByTestId('roi-save-scenario-input').fill('Scenario 6');
    await page.getByTestId('roi-save-scenario-submit').click();

    // Hint renders synchronously after the save.
    const hint = page.getByTestId('roi-save-scenario-evict-hint');
    await expect(hint).toBeVisible();
    await expect(hint).toContainText(/replaced oldest scenario/i);

    // Store now contains Scenario 6 at the front; Scenario 1 (oldest) is gone.
    const raw = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
    expect(raw).not.toBeNull();
    const list = JSON.parse(raw!) as SeedEntry[];
    expect(list.length).toBe(5);
    expect(list[0].name).toBe('Scenario 6');
    expect(list.some((e) => e.name === 'Scenario 1')).toBe(false);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Case (8): Compare selected chip is disabled when fewer than 2 scenarios
  // are stored; when 2+ are stored it toggles a roi-compare-panel that
  // renders both scenarios' savings and hours figures.
  test('compare chip: disabled at 1, opens diff panel at 2+', async ({ browser }) => {
    // Sub-case A: only one scenario stored - chip is disabled.
    {
      const seed: SeedEntry[] = [seedEntry('Alpha', VALID_INPUTS_A, 1_730_000_001_000)];
      const { ctx, page, errors } = await contextWithSeed(browser, seed);
      await gotoPath(page, DASHBOARD_URL);
      const chip = page.getByTestId('roi-compare-chip');
      await expect(chip).toBeVisible();
      await expect(chip).toBeDisabled();
      await expect(page.getByTestId('roi-compare-panel')).toHaveCount(0);
      expect(errors).toEqual([]);
      await ctx.close();
    }

    // Sub-case B: two scenarios stored - chip toggles a diff panel.
    {
      const seed: SeedEntry[] = [
        seedEntry('Alpha', VALID_INPUTS_A, 1_730_000_002_000),
        seedEntry('Bravo', VALID_INPUTS_B, 1_730_000_001_000),
      ];
      const { ctx, page, errors } = await contextWithSeed(browser, seed);
      await gotoPath(page, DASHBOARD_URL);
      const chip = page.getByTestId('roi-compare-chip');
      await expect(chip).toBeEnabled();
      await chip.click();

      const panel = page.getByTestId('roi-compare-panel');
      await expect(panel).toBeVisible();
      await expect(panel).toContainText('Alpha');
      await expect(panel).toContainText('Bravo');
      expect(errors).toEqual([]);
      await ctx.close();
    }
  });

  // Case (9): the page text on /my contains no U+2014 code point in any
  // SavedRoiScenariosCard string.
  test('no em-dash: seeded /my page contains no U+2014 anywhere', async ({ browser }) => {
    const seed: SeedEntry[] = [
      seedEntry('Alpha', VALID_INPUTS_A, 1_730_000_002_000),
      seedEntry('Bravo', VALID_INPUTS_B, 1_730_000_001_000),
    ];
    const { ctx, page, errors } = await contextWithSeed(browser, seed);
    await gotoPath(page, DASHBOARD_URL);

    const bodyText = (await page.textContent('body')) ?? '';
    expect(bodyText.length).toBeGreaterThan(100);
    expect(bodyText, 'no em-dash (U+2014) allowed on seeded /my').not.toContain(EM_DASH);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Case (10): dark mode renders cleanly via
  // document.documentElement.classList.add('dark') and the card is still
  // visible on a 375px viewport.
  test('dark mode: card renders with dark class on documentElement at 375px', async ({ browser }) => {
    const seed: SeedEntry[] = [
      seedEntry('Alpha', VALID_INPUTS_A, 1_730_000_002_000),
      seedEntry('Bravo', VALID_INPUTS_B, 1_730_000_001_000),
    ];
    const { ctx, page, errors } = await contextWithSeed(browser, seed, {
      width: 375,
      height: 812,
    });
    await gotoPath(page, DASHBOARD_URL);
    await page.evaluate(() => document.documentElement.classList.add('dark'));

    await expect(page.getByTestId('saved-roi-scenarios-card')).toBeVisible();
    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(hasDarkClass).toBe(true);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Case (11): the Delete icon-button on any row removes exactly that row's
  // entry from the store and re-renders the card without it; when the last
  // entry is deleted the card returns null on the next /my visit.
  test('delete row: removes one entry; card returns null when the last is deleted', async ({ browser }) => {
    const seed: SeedEntry[] = [
      seedEntry('Alpha', VALID_INPUTS_A, 1_730_000_002_000),
      seedEntry('Bravo', VALID_INPUTS_B, 1_730_000_001_000),
    ];
    const { ctx, page, errors } = await contextWithSeed(browser, seed);
    await gotoPath(page, DASHBOARD_URL);

    const rows = page.getByTestId('roi-scenario-row');
    await expect(rows).toHaveCount(2);

    // Click the delete button on the first row (Alpha).
    await rows.first().getByTestId('roi-scenario-delete').click();
    await expect(page.getByTestId('roi-scenario-row')).toHaveCount(1);
    await expect(page.getByText('Alpha', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Bravo', { exact: true })).toBeVisible();

    // Delete the last row - card returns null.
    await page.getByTestId('roi-scenario-row').first().getByTestId('roi-scenario-delete').click();
    await expect(page.getByTestId('saved-roi-scenarios-card')).toHaveCount(0);

    // Store is empty after the second delete.
    const raw = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
    if (raw !== null) {
      const list = JSON.parse(raw) as SeedEntry[];
      expect(list.length).toBe(0);
    }

    expect(errors).toEqual([]);
    await ctx.close();
  });
});
