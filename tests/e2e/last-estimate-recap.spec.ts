import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0014 - Persist and re-offer the visitor's last completed estimate.
// Each test maps 1:1 to an acceptance-criteria box on the ticket.
//
// When a visitor reaches the estimate result view, the completed inputs
// ({ selectedTypeId, sqft, selectedFinishId, selectedExtraIds }) are written to
// localStorage under a versioned, vertical-scoped key. On a later visit (fresh
// session) with a stored estimate, the step-1 screen shows a reusable recap card:
//   - data-testid="last-estimate-recap"     the card wrapper
//   - data-testid="last-estimate-reopen"    the "Reopen" action
//   - data-testid="last-estimate-start-new" the "Start a new estimate" action
// Reopen rehydrates straight to the result view (same EstimateBreakdown totals);
// Start-new clears the stored estimate and shows the normal step-1 wizard. The
// store reuses the 0009 EstimateShareState shape and is parse-safe: a stored
// estimate whose ids no longer exist is treated as absent.

const ESTIMATE_ROUTE = '/construction/demo/estimate';
const STORAGE_KEY = 'dca_last_estimate_v1_construction';

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

async function gotoEstimate(page: Page, query = '') {
  const response = await page.goto(`${ESTIMATE_ROUTE}${query}`, {
    waitUntil: 'domcontentloaded',
  });
  expect(response, `no response for ${ESTIMATE_ROUTE}${query}`).not.toBeNull();
  expect(response!.status()).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
}

// Drive the 4-step wizard to the result view with a deterministic selection:
// Kitchen Remodel -> default sqft -> Premium finish -> Permit Management extra.
async function runWizardToEstimate(page: Page) {
  await page.getByText('Kitchen Remodel', { exact: true }).click();
  await page.getByRole('button', { name: /Next/i }).click();
  await page.getByRole('button', { name: /Next/i }).click();
  await page.getByText('Premium', { exact: true }).click();
  await page.getByRole('button', { name: /Next/i }).click();
  await page.getByText('Permit Management', { exact: true }).click();
  await page.getByRole('button', { name: /Generate Estimate/i }).click();
  await expect(page.getByTestId('estimate-total')).toBeVisible();
}

// Seed a fresh session (new context, empty sessionStorage) that nonetheless has a
// persisted estimate in localStorage, exactly as a real returning visitor would.
// addInitScript runs before app code on every page in the context.
async function freshSessionWithEstimate(
  browser: import('@playwright/test').Browser,
  value: string,
  key: string = STORAGE_KEY,
) {
  const ctx = await browser.newContext();
  await ctx.addInitScript(
    ([k, v]) => {
      try {
        window.localStorage.setItem(k, v);
      } catch {
        /* storage unavailable - non-fatal */
      }
    },
    [key, value] as const,
  );
  const page = await ctx.newPage();
  const errors = trackErrors(page);
  return { ctx, page, errors };
}

// The persisted shape mirrors the 0009 EstimateShareState that the share-link
// helper already encodes; no new data beyond inputs the visitor already entered.
const STORED_ESTIMATE = JSON.stringify({
  selectedTypeId: 'kitchen',
  sqft: 200,
  selectedFinishId: 'premium',
  selectedExtraIds: ['permit'],
});

test.describe('persist last completed estimate', () => {
  // Box 1: reaching the result view writes the completed inputs to localStorage
  // under a versioned, vertical-scoped key.
  test('completing an estimate writes the inputs to a versioned, vertical-scoped key', async ({ page }) => {
    const errors = trackErrors(page);
    await gotoEstimate(page);
    await runWizardToEstimate(page);

    const stored = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
    expect(stored, `expected an estimate persisted under ${STORAGE_KEY}`).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.selectedTypeId).toBe('kitchen');
    expect(parsed.selectedFinishId).toBe('premium');
    expect(parsed.selectedExtraIds).toContain('permit');
    expect(Number(parsed.sqft)).toBeGreaterThan(0);

    // Stores no data beyond the wizard inputs (no PII, no scraped profile fields).
    expect(Object.keys(parsed).sort()).toEqual(
      ['selectedExtraIds', 'selectedFinishId', 'selectedTypeId', 'sqft'],
    );

    expect(errors).toEqual([]);
  });

  // Box 2: on a later visit (fresh session) with a stored estimate, step 1 shows a
  // "Reopen your last estimate" card naming the project type and ballpark total,
  // with a Reopen action and a Start-new action.
  test('fresh session with a stored estimate shows the recap card on step 1', async ({ browser }) => {
    const { ctx, page, errors } = await freshSessionWithEstimate(browser, STORED_ESTIMATE);
    await gotoEstimate(page);

    const card = page.getByTestId('last-estimate-recap');
    await expect(card).toBeVisible();
    await expect(card).toContainText(/Reopen your last estimate/i);
    // Names the project type.
    await expect(card).toContainText('Kitchen Remodel');
    // Shows a ballpark total (a dollar figure).
    await expect(card).toContainText(/\$[\d,]+/);
    await expect(page.getByTestId('last-estimate-reopen')).toBeVisible();
    await expect(page.getByTestId('last-estimate-start-new')).toBeVisible();

    // The wizard step 1 is still present underneath (the card is additive).
    await expect(page.getByText('What type of project?')).toBeVisible();

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box 3: "Reopen" rehydrates straight to the result view with the same totals;
  // "Start new" clears the stored estimate and shows the normal step-1 wizard.
  test('Reopen rehydrates the same totals; Start new clears storage and shows the wizard', async ({ browser }) => {
    // First derive the canonical total for this selection from a real run.
    const fresh = await browser.newContext();
    const fp = await fresh.newPage();
    await gotoEstimate(fp);
    await runWizardToEstimate(fp);
    const canonicalTotal = (await fp.getByTestId('estimate-total').innerText()).trim();
    await fresh.close();

    // Reopen: jumps to the result view with the same EstimateBreakdown totals.
    {
      const { ctx, page, errors } = await freshSessionWithEstimate(browser, STORED_ESTIMATE);
      await gotoEstimate(page);
      await page.getByTestId('last-estimate-reopen').click();
      await expect(page.getByTestId('estimate-total')).toBeVisible();
      const reopenedTotal = (await page.getByTestId('estimate-total').innerText()).trim();
      expect(reopenedTotal).toBe(canonicalTotal);
      // The recap card is gone once reopened.
      await expect(page.getByTestId('last-estimate-recap')).toHaveCount(0);
      expect(errors).toEqual([]);
      await ctx.close();
    }

    // Start new: clears the stored estimate and shows the normal step-1 wizard.
    {
      const { ctx, page, errors } = await freshSessionWithEstimate(browser, STORED_ESTIMATE);
      await gotoEstimate(page);
      await page.getByTestId('last-estimate-start-new').click();
      await expect(page.getByTestId('last-estimate-recap')).toHaveCount(0);
      await expect(page.getByText('What type of project?')).toBeVisible();
      const stored = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
      expect(stored).toBeNull();
      expect(errors).toEqual([]);
      await ctx.close();
    }
  });

  // Box 4: with no stored estimate, no card renders and the wizard behaves exactly
  // as it does today (regression check).
  test('no card renders when storage is empty; wizard behaves as today', async ({ page }) => {
    const errors = trackErrors(page);
    await gotoEstimate(page);

    await expect(page.getByTestId('last-estimate-recap')).toHaveCount(0);
    // Wizard still works end to end (regression).
    await runWizardToEstimate(page);
    await expect(page.getByTestId('estimate-total')).toBeVisible();

    expect(errors).toEqual([]);
  });

  // Box 5: a stored estimate whose ids no longer exist is treated as absent
  // (parse-safe); dismissing the card is remembered for the session; the card has
  // no em-dash and renders in light and dark mode.
  test('stale ids are parse-safe; dismissal sticks for the session; no em-dash, dark mode', async ({ browser }) => {
    // Stale: an unknown project type is treated as absent, no card, no error.
    {
      const stale = JSON.stringify({
        selectedTypeId: 'spaceship',
        sqft: 200,
        selectedFinishId: 'premium',
        selectedExtraIds: ['permit'],
      });
      const { ctx, page, errors } = await freshSessionWithEstimate(browser, stale);
      await gotoEstimate(page);
      await expect(page.getByTestId('last-estimate-recap')).toHaveCount(0);
      await expect(page.getByText('What type of project?')).toBeVisible();
      expect(errors).toEqual([]);
      await ctx.close();
    }

    // Garbage JSON is also parse-safe.
    {
      const { ctx, page, errors } = await freshSessionWithEstimate(browser, '{not valid json');
      await gotoEstimate(page);
      await expect(page.getByTestId('last-estimate-recap')).toHaveCount(0);
      expect(errors).toEqual([]);
      await ctx.close();
    }

    // No em-dash, dark mode, then dismissal stays dismissed across a same-session reload.
    {
      const { ctx, page, errors } = await freshSessionWithEstimate(browser, STORED_ESTIMATE);
      await gotoEstimate(page);
      const card = page.getByTestId('last-estimate-recap');
      await expect(card).toBeVisible();

      expect(await card.innerText()).not.toContain('—');

      await page.evaluate(() => document.documentElement.classList.add('dark'));
      await expect(card).toBeVisible();
      await page.evaluate(() => document.documentElement.classList.remove('dark'));
      await expect(card).toBeVisible();

      // Dismiss, the card disappears, the stored estimate stays (only dismissed).
      await page.getByTestId('last-estimate-dismiss').click();
      await expect(card).toHaveCount(0);
      const stillStored = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
      expect(stillStored).not.toBeNull();

      // Reload within the SAME context (same session) - stays dismissed.
      await gotoEstimate(page);
      await expect(page.getByTestId('last-estimate-recap')).toHaveCount(0);

      expect(errors).toEqual([]);
      await ctx.close();
    }
  });

  // Box 6: no new hostnames, no first-party /api/ call; persistence is browser-local
  // only and stores no data beyond the estimate inputs the visitor already entered.
  test('persisting and reopening makes no first-party /api/ call', async ({ browser }) => {
    const { ctx, page, errors } = await freshSessionWithEstimate(browser, STORED_ESTIMATE);
    await page.goto(ESTIMATE_ROUTE, { waitUntil: 'domcontentloaded' });
    const appOrigin = new URL(page.url()).origin;

    const apiCalls: string[] = [];
    page.on('request', (req) => {
      const u = new URL(req.url());
      if (u.origin === appOrigin && u.pathname.startsWith('/api/')) apiCalls.push(req.url());
    });

    await expect(page.getByTestId('last-estimate-recap')).toBeVisible();
    await page.getByTestId('last-estimate-reopen').click();
    await expect(page.getByTestId('estimate-total')).toBeVisible();

    expect(apiCalls, `recap flow should make no first-party /api/ call:\n${apiCalls.join('\n')}`).toEqual([]);
    expect(errors).toEqual([]);
    await ctx.close();
  });

  // The generator is reused across verticals via the route table; the store key is
  // vertical-scoped, so a construction estimate must not surface on another vertical.
  test('the stored estimate is vertical-scoped (construction key does not leak)', async ({ browser }) => {
    const { ctx, page, errors } = await freshSessionWithEstimate(browser, STORED_ESTIMATE);
    // homeservices/demo/estimate reuses EstimateGenerator under a different vertical.
    const response = await page.goto('/homeservices/demo/estimate', { waitUntil: 'domcontentloaded' });
    expect(response!.status()).toBeLessThan(400);
    await expect
      .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
        timeout: 10_000,
      })
      .toBeGreaterThan(500);

    // The construction-scoped estimate must NOT show on the homeservices estimate.
    await expect(page.getByTestId('last-estimate-recap')).toHaveCount(0);

    expect(errors).toEqual([]);
    await ctx.close();
  });
});
