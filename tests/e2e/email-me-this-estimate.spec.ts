import { test, expect } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0015 - "Email me this estimate" lead capture on the estimate result.
// Each test maps 1:1 to an acceptance-criteria box on the ticket.
//
// The estimate generator at /construction/demo/estimate is a 4-step wizard that
// renders an EstimateCard result on step 5. Beside the existing 0009 action row
// (Print + Copy share link, both print:hidden) the result must expose an
// "Email me this estimate" control with:
//   - data-testid="email-estimate-input"    the email field
//   - data-testid="email-estimate-submit"   the submit button
//   - data-testid="email-estimate-success"  the transient success confirmation
//   - data-testid="email-estimate-error"    the inline network-failure error
//   - data-testid="email-estimate-invalid"  the inline validation error
//
// The submit posts the entered email, the 0009 share link, and the existing UTM
// params to the same Formspree endpoint the email-course optin uses. The fetch is
// stubbed with page.route(); no real network call leaves the browser.

const ESTIMATE_ROUTE = '/construction/demo/estimate';
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xovekqqk';

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

async function gotoEstimate(page: import('@playwright/test').Page, query = '') {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  // Opt this test context out of the submitLead localhost block so the
  // page.route() interception below actually sees the Formspree POST.
  // The preview server runs on 127.0.0.1:4173 which would otherwise short-
  // circuit the real fetch and return a synthetic 200.
  await page.addInitScript(() => {
    (window as Window & { __E2E__?: boolean }).__E2E__ = true;
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
  await page.getByText('Kitchen Remodel', { exact: true }).click();
  await page.getByRole('button', { name: /Next/i }).click();
  await page.getByRole('button', { name: /Next/i }).click();
  await page.getByText('Premium', { exact: true }).click();
  await page.getByRole('button', { name: /Next/i }).click();
  await page.getByText('Permit Management', { exact: true }).click();
  await page.getByRole('button', { name: /Generate Estimate/i }).click();
  await expect(page.getByTestId('estimate-total')).toBeVisible();
}

// Stub the Formspree endpoint. `ok` controls the simulated response status.
// Returns a list that captures each intercepted request body for assertions.
function stubFormspree(
  page: import('@playwright/test').Page,
  { ok = true }: { ok?: boolean } = {}
) {
  const bodies: Array<Record<string, unknown>> = [];
  return page
    .route(FORMSPREE_ENDPOINT, async (route) => {
      const raw = route.request().postData() ?? '{}';
      try {
        bodies.push(JSON.parse(raw));
      } catch {
        bodies.push({ __unparsed: raw });
      }
      await route.fulfill({
        status: ok ? 200 : 500,
        contentType: 'application/json',
        body: JSON.stringify(ok ? { ok: true } : { error: 'fail' }),
      });
    })
    .then(() => bodies);
}

test.describe('email me this estimate', () => {
  // Box 1 + Box 6: a valid submit posts the email, the share link, and the UTM
  // params to the same Formspree endpoint the email-course optin uses; no first
  // -party /api/ call and no PII beyond the typed email.
  test('valid submit posts email + share link + utm to formspree', async ({ page }) => {
    const errors = await gotoEstimate(page, '?utm_source=newsletter&utm_campaign=spring');
    const bodies = await stubFormspree(page);
    const appOrigin = new URL(page.url()).origin;
    const apiCalls: string[] = [];
    page.on('request', (req) => {
      const u = new URL(req.url());
      if (u.origin === appOrigin && u.pathname.startsWith('/api/')) apiCalls.push(req.url());
    });

    await runWizardToEstimate(page);

    const input = page.getByTestId('email-estimate-input');
    const submit = page.getByTestId('email-estimate-submit');
    await expect(input).toBeVisible();
    await input.fill('contractor@example.com');
    await submit.click();

    await expect(page.getByTestId('email-estimate-success')).toBeVisible();

    expect(bodies.length).toBe(1);
    const body = bodies[0];
    expect(body.email).toBe('contractor@example.com');
    // Carries the 0009 share link (same-origin estimate route with encoded params).
    const link = String(body.estimate_link ?? body.message ?? '');
    expect(link).toContain(`${ESTIMATE_ROUTE}?`);
    expect(link).toContain('pt=kitchen');
    // UTM enrichment from getUtmParams().
    expect(body.utm_source).toBe('newsletter');
    expect(body.utm_campaign).toBe('spring');
    // Distinct subject so the lead is identifiable.
    expect(String(body._subject)).toContain('[Estimate]');
    // No PII beyond the email + share link + utm: no name/phone/address keys.
    expect(body).not.toHaveProperty('name');
    expect(body).not.toHaveProperty('phone');
    expect(body).not.toHaveProperty('address');

    expect(apiCalls, `no first-party /api/ call:\n${apiCalls.join('\n')}`).toEqual([]);
    expect(errors).toEqual([]);
  });

  // Box 2 (success half): a valid submission clears the field.
  test('valid submit clears the field', async ({ page }) => {
    const errors = await gotoEstimate(page);
    await stubFormspree(page);
    await runWizardToEstimate(page);

    const input = page.getByTestId('email-estimate-input');
    await input.fill('keep@example.com');
    await page.getByTestId('email-estimate-submit').click();

    await expect(page.getByTestId('email-estimate-success')).toBeVisible();
    // Either the field is cleared, or the success state replaces the form.
    const stillVisible = await input.isVisible().catch(() => false);
    if (stillVisible) {
      await expect(input).toHaveValue('');
    }
    expect(errors).toEqual([]);
  });

  // Box 2 (failure half): a network failure shows an inline error and does NOT
  // clear the field.
  test('network failure shows an inline error and preserves the field', async ({ page }) => {
    const errors = await gotoEstimate(page);
    await stubFormspree(page, { ok: false });
    await runWizardToEstimate(page);

    const input = page.getByTestId('email-estimate-input');
    await input.fill('retry@example.com');
    await page.getByTestId('email-estimate-submit').click();

    await expect(page.getByTestId('email-estimate-error')).toBeVisible();
    await expect(input).toHaveValue('retry@example.com');
    await expect(page.getByTestId('email-estimate-success')).toHaveCount(0);

    expect(await page.getByTestId('email-estimate-error').innerText()).not.toContain('—');
    expect(errors).toEqual([]);
  });

  // Box 3: an invalid email shows an inline validation error and performs NO
  // network request.
  test('invalid email shows inline error and makes no request', async ({ page }) => {
    const errors = await gotoEstimate(page);
    const bodies = await stubFormspree(page);
    await runWizardToEstimate(page);

    const input = page.getByTestId('email-estimate-input');
    await input.fill('not-an-email');
    await page.getByTestId('email-estimate-submit').click();

    await expect(page.getByTestId('email-estimate-invalid')).toBeVisible();
    await expect(page.getByTestId('email-estimate-success')).toHaveCount(0);
    expect(bodies.length).toBe(0);

    expect(await page.getByTestId('email-estimate-invalid').innerText()).not.toContain('—');
    expect(errors).toEqual([]);
  });

  // Box 5: the control renders and works in dark mode, with no em-dash in its
  // copy, and is print:hidden alongside the existing 0009 action row.
  test('control works in dark mode, no em-dash, print:hidden', async ({ page }) => {
    const errors = await gotoEstimate(page);
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await stubFormspree(page);
    await runWizardToEstimate(page);

    const input = page.getByTestId('email-estimate-input');
    const submit = page.getByTestId('email-estimate-submit');
    await expect(input).toBeVisible();
    await expect(submit).toBeVisible();

    // No em-dash anywhere in the capture control's rendered copy.
    const capture = page.getByTestId('email-estimate-capture');
    expect(await capture.innerText()).not.toContain('—');

    // The control is inside a print:hidden subtree (hidden when printing),
    // matching the existing Print / Copy-share-link action row.
    const hiddenInPrint = await capture.evaluate((el) => {
      let node: HTMLElement | null = el as HTMLElement;
      while (node) {
        if (node.className && /print:hidden/.test(node.className)) return true;
        node = node.parentElement;
      }
      return false;
    });
    expect(hiddenInPrint).toBe(true);

    await input.fill('darkmode@example.com');
    await submit.click();
    await expect(page.getByTestId('email-estimate-success')).toBeVisible();
    expect(await page.getByTestId('email-estimate-success').innerText()).not.toContain('—');

    expect(errors).toEqual([]);
  });
});
