import { test, expect } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0009 - Shareable branded estimate result link.
// Each test maps 1:1 to an acceptance-criteria box on the ticket.
//
// The estimate generator at /construction/demo/estimate is a 4-step wizard that
// renders an EstimateCard result on step 5. The result view must expose:
//   - data-testid="copy-share-link"   the "Copy share link" button
//   - data-testid="copy-confirmation" the transient "Copied" confirmation
//   - data-testid="estimate-total"    the total low-high range span
// Opening the page with encoded params (?pt=&sqft=&fin=&extras=) must rehydrate
// the result view directly; malformed / absent / out-of-range params fall back
// to the step-1 wizard with no thrown error.

const ESTIMATE_ROUTE = '/construction/demo/estimate';

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

async function gotoEstimate(page: import('@playwright/test').Page, query = '') {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
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
  return errors;
}

// Drive the 4-step wizard to the result view with a deterministic selection:
// Kitchen Remodel -> default sqft -> Premium finish -> Permit Management extra.
async function runWizardToEstimate(page: import('@playwright/test').Page) {
  // Step 1: project type.
  await page.getByText('Kitchen Remodel', { exact: true }).click();
  // Step 2: size (default sqft pre-filled on type select).
  await page.getByRole('button', { name: /Next/i }).click();
  // Step 3: finish.
  await page.getByRole('button', { name: /Next/i }).click();
  await page.getByText('Premium', { exact: true }).click();
  // Step 4: extras.
  await page.getByRole('button', { name: /Next/i }).click();
  await page.getByText('Permit Management', { exact: true }).click();
  // Generate.
  await page.getByRole('button', { name: /Generate Estimate/i }).click();
  await expect(page.getByTestId('estimate-total')).toBeVisible();
}

test.describe('shareable estimate link', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  // Box 1: Copy share link button writes an encoded URL to the clipboard and
  // shows a transient "Copied" confirmation.
  test('copy button writes an encoded URL and shows a Copied confirmation', async ({ page }) => {
    const errors = await gotoEstimate(page);
    await runWizardToEstimate(page);

    const copyButton = page.getByTestId('copy-share-link');
    await expect(copyButton).toBeVisible();
    await copyButton.click();

    // Transient confirmation appears.
    await expect(page.getByTestId('copy-confirmation')).toBeVisible();

    // Clipboard holds a same-origin URL to the estimate route with encoded params.
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    const url = new URL(clip);
    expect(url.origin).toBe(new URL(page.url()).origin);
    expect(url.pathname).toBe(ESTIMATE_ROUTE);
    expect(url.searchParams.get('pt')).toBe('kitchen');
    expect(url.searchParams.get('fin')).toBe('premium');
    expect(url.searchParams.get('extras')).toContain('permit');
    expect(Number(url.searchParams.get('sqft'))).toBeGreaterThan(0);

    // No em-dash in the copy of the button or confirmation.
    expect(await copyButton.innerText()).not.toContain('—');
    expect(await page.getByTestId('copy-confirmation').innerText()).not.toContain('—');

    expect(errors).toEqual([]);
  });

  // Box 2: opening an encoded URL rehydrates the result view directly (skips the
  // wizard) and renders the same EstimateBreakdown totals as the original run.
  test('opening a share link rehydrates the same totals in a fresh context', async ({ browser }) => {
    const ctxA = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    const pageA = await ctxA.newPage();
    await gotoEstimate(pageA);
    await runWizardToEstimate(pageA);
    const originalTotal = (await pageA.getByTestId('estimate-total').innerText()).trim();
    await pageA.getByTestId('copy-share-link').click();
    const shareUrl = await pageA.evaluate(() => navigator.clipboard.readText());
    await ctxA.close();

    // Fresh context: no wizard interaction, open the link cold.
    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    const errors: string[] = [];
    pageB.on('pageerror', (e) => {
      const msg = `pageerror: ${e.message}`;
      if (!isIgnorable(msg)) errors.push(msg);
    });
    await pageB.goto(shareUrl, { waitUntil: 'domcontentloaded' });

    // Result view renders directly: total visible, step indicator (wizard) absent.
    await expect(pageB.getByTestId('estimate-total')).toBeVisible();
    const rehydratedTotal = (await pageB.getByTestId('estimate-total').innerText()).trim();
    expect(rehydratedTotal).toBe(originalTotal);
    await expect(pageB.getByText('What type of project?')).toHaveCount(0);

    expect(errors).toEqual([]);
    await ctxB.close();
  });

  // Box 3: no estimate params (or malformed params) falls back to the step-1
  // wizard with no error thrown.
  test('absent params fall back to the step-1 wizard', async ({ page }) => {
    const errors = await gotoEstimate(page);
    await expect(page.getByText('What type of project?')).toBeVisible();
    await expect(page.getByTestId('estimate-total')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('malformed params fall back to the step-1 wizard', async ({ page }) => {
    const errors = await gotoEstimate(page, '?pt=&sqft=abc&fin=%%%&extras=,,');
    await expect(page.getByText('What type of project?')).toBeVisible();
    await expect(page.getByTestId('estimate-total')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  // Box 4: parse-safety. Unknown project-type or out-of-range sqft falls back to
  // the wizard rather than rendering a broken card.
  test('unknown project type falls back to the wizard', async ({ page }) => {
    const errors = await gotoEstimate(page, '?pt=spaceship&sqft=200&fin=premium&extras=permit');
    await expect(page.getByText('What type of project?')).toBeVisible();
    await expect(page.getByTestId('estimate-total')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('out-of-range sqft falls back to the wizard', async ({ page }) => {
    // Kitchen maxSqft is 800; 99999 is out of range.
    const errors = await gotoEstimate(page, '?pt=kitchen&sqft=99999&fin=premium&extras=permit');
    await expect(page.getByText('What type of project?')).toBeVisible();
    await expect(page.getByTestId('estimate-total')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  // Box 5: copy and confirmation work in dark mode (and box also covers no
  // em-dash, asserted in box 1). Toggle the .dark class and re-run the copy.
  test('copy and confirmation work in dark mode', async ({ page }) => {
    const errors = await gotoEstimate(page);
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await runWizardToEstimate(page);

    const copyButton = page.getByTestId('copy-share-link');
    await expect(copyButton).toBeVisible();
    await copyButton.click();
    await expect(page.getByTestId('copy-confirmation')).toBeVisible();

    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain(`${ESTIMATE_ROUTE}?`);
    expect(await page.getByTestId('copy-confirmation').innerText()).not.toContain('—');

    expect(errors).toEqual([]);
  });

  // Box 6: same origin, same route, no first-party /api/ request triggered by
  // the share flow. (Third-party hosts whose path happens to start with /api/,
  // e.g. Sentry's ingest endpoint, are not our serverless /api/ and are ignored.)
  test('share link stays on the same origin and route, no /api/ call', async ({ page }) => {
    const errors = await gotoEstimate(page);
    const appOrigin = new URL(page.url()).origin;

    const apiCalls: string[] = [];
    page.on('request', (req) => {
      const u = new URL(req.url());
      if (u.origin === appOrigin && u.pathname.startsWith('/api/')) apiCalls.push(req.url());
    });

    await runWizardToEstimate(page);
    await page.getByTestId('copy-share-link').click();

    const clip = await page.evaluate(() => navigator.clipboard.readText());
    const url = new URL(clip);
    expect(url.origin).toBe(appOrigin);
    expect(url.pathname).toBe(ESTIMATE_ROUTE);
    expect(apiCalls, `share flow should make no first-party /api/ call:\n${apiCalls.join('\n')}`).toEqual([]);

    expect(errors).toEqual([]);
  });
});
