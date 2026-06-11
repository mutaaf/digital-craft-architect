import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0046 - Shareable AI ROI calculator producing a branded annual
// savings result link. Each test maps 1:1 to an acceptance-criteria box on
// the ticket. Modeled on tests/e2e/shareable-estimate-link.spec.ts (ticket
// 0009, the closest peer for "encode/decode URL params, copy share-link to
// clipboard") and tests/e2e/quiz-jsonld.spec.ts (ticket 0039, the closest
// peer for "Helmet-managed JSON-LD on a sibling page").
//
// Per the 2026-05-30 second-@type lesson the implementer grepped every
// existing tests/e2e/*-jsonld.spec.ts for `=== 'BreadcrumbList'`,
// `=== 'WebApplication'`, AND `=== 'SoftwareApplication'` BEFORE writing
// code. Result documented in the ticket's Implementation log: all
// BreadcrumbList matches are URL-scoped, no WebApplication predicate exists
// anywhere, and the one SoftwareApplication predicate is URL-scoped to
// /demos. A WebApplication block on /roi does not collide.
//
// The /roi page is a four-input calculator (weekly leads, minutes per lead,
// hourly rate, after-hours percent) with URL rehydration, a Copy share link
// button, and two JSON-LD blocks (BreadcrumbList + WebApplication). The
// formula is intentionally conservative and visible:
//
//   savedHoursPerWeek = leadsPerWeek * (minutesPerLead / 60) * (afterHoursPercent / 100)
//   annualSavings     = savedHoursPerWeek * hourlyRate * 52
//
// The test-side computation below MUST stay byte-identical to the page's
// computeRoi helper so the spec catches any source drift.

const ROUTE = '/roi';
const EM_DASH = String.fromCharCode(8212);
const DEFAULT_INPUTS = { leads: 50, minutes: 8, hourly: 85, afterhours: 35 };

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

function computeAnnualSavings(inputs: {
  leads: number;
  minutes: number;
  hourly: number;
  afterhours: number;
}): number {
  const savedHoursPerWeek =
    inputs.leads * (inputs.minutes / 60) * (inputs.afterhours / 100);
  return Math.round(savedHoursPerWeek * inputs.hourly * 52);
}

async function gotoRoi(page: Page, query = ''): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const url = `${ROUTE}${query}`;
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${url}`).not.toBeNull();
  expect(response!.status(), `${url} returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(
      () => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(500);
  return errors;
}

async function readJsonLdBlocks(page: Page): Promise<{ raw: string; data: unknown }[]> {
  await expect
    .poll(
      () =>
        page.$$eval('script[type="application/ld+json"]', (nodes) => nodes.length),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  return raws.map((raw) => ({ raw, data: JSON.parse(raw) as unknown }));
}

type BreadcrumbItem = { '@type': string; position?: number; name?: string; item?: string };
type Breadcrumb = {
  '@context'?: string;
  '@type': string;
  itemListElement?: BreadcrumbItem[];
};
type Offer = { '@type'?: string; price?: string | number; priceCurrency?: string };
type WebApp = {
  '@context'?: string;
  '@type': string;
  name?: string;
  applicationCategory?: string;
  description?: string;
  operatingSystem?: string;
  offers?: Offer;
};

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

const isWebApp = (d: unknown): d is WebApp =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'WebApplication';

test.describe('shareable ROI calculator', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  // Box 1: /roi with no query params renders the four defaults and the
  // computed annual savings card. The H1 contains "ROI".
  test('defaults: /roi renders four defaults and computed annual savings', async ({ page }) => {
    const errors = await gotoRoi(page);

    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    expect(((await h1.textContent()) ?? '').toLowerCase()).toContain('roi');

    // Four number inputs are present and pre-filled to defaults.
    const leads = page.getByTestId('roi-input-leads');
    const minutes = page.getByTestId('roi-input-minutes');
    const hourly = page.getByTestId('roi-input-hourly');
    const afterhours = page.getByTestId('roi-input-afterhours');
    await expect(leads).toHaveValue(String(DEFAULT_INPUTS.leads));
    await expect(minutes).toHaveValue(String(DEFAULT_INPUTS.minutes));
    await expect(hourly).toHaveValue(String(DEFAULT_INPUTS.hourly));
    await expect(afterhours).toHaveValue(String(DEFAULT_INPUTS.afterhours));

    // Result card renders the default-input computation.
    const expected = computeAnnualSavings(DEFAULT_INPUTS);
    const annual = page.getByTestId('roi-annual-savings');
    await expect(annual).toBeVisible();
    expect((await annual.innerText()).replace(/[$,]/g, '')).toContain(String(expected));

    expect(errors).toEqual([]);
  });

  // Box 2: filling the four inputs to specific values updates the result
  // card live (within one render).
  test('input: changing the four inputs updates the result card live', async ({ page }) => {
    const errors = await gotoRoi(page);

    const inputs = { leads: 90, minutes: 12, hourly: 110, afterhours: 50 };
    await page.getByTestId('roi-input-leads').fill(String(inputs.leads));
    await page.getByTestId('roi-input-minutes').fill(String(inputs.minutes));
    await page.getByTestId('roi-input-hourly').fill(String(inputs.hourly));
    await page.getByTestId('roi-input-afterhours').fill(String(inputs.afterhours));

    const expected = computeAnnualSavings(inputs);
    const annual = page.getByTestId('roi-annual-savings');
    await expect(annual).toBeVisible();
    expect((await annual.innerText()).replace(/[$,]/g, '')).toContain(String(expected));

    expect(errors).toEqual([]);
  });

  // Box 3: opening /roi?leads=120&minutes=10&hourly=95&afterhours=45
  // rehydrates the four inputs and the result without any control touch.
  test('URL rehydration: encoded params render the matching result', async ({ page }) => {
    const inputs = { leads: 120, minutes: 10, hourly: 95, afterhours: 45 };
    const errors = await gotoRoi(
      page,
      `?leads=${inputs.leads}&minutes=${inputs.minutes}&hourly=${inputs.hourly}&afterhours=${inputs.afterhours}`,
    );

    await expect(page.getByTestId('roi-input-leads')).toHaveValue(String(inputs.leads));
    await expect(page.getByTestId('roi-input-minutes')).toHaveValue(String(inputs.minutes));
    await expect(page.getByTestId('roi-input-hourly')).toHaveValue(String(inputs.hourly));
    await expect(page.getByTestId('roi-input-afterhours')).toHaveValue(String(inputs.afterhours));

    const expected = computeAnnualSavings(inputs);
    const annual = page.getByTestId('roi-annual-savings');
    expect((await annual.innerText()).replace(/[$,]/g, '')).toContain(String(expected));

    expect(errors).toEqual([]);
  });

  // Box 4: parse-safe. A malformed ?leads=foo falls back to the default for
  // that input only and does NOT reset the other three.
  test('parse-safe: malformed leads falls back to default, others honored', async ({ page }) => {
    const others = { minutes: 10, hourly: 95, afterhours: 45 };
    const errors = await gotoRoi(
      page,
      `?leads=foo&minutes=${others.minutes}&hourly=${others.hourly}&afterhours=${others.afterhours}`,
    );

    await expect(page.getByTestId('roi-input-leads')).toHaveValue(String(DEFAULT_INPUTS.leads));
    await expect(page.getByTestId('roi-input-minutes')).toHaveValue(String(others.minutes));
    await expect(page.getByTestId('roi-input-hourly')).toHaveValue(String(others.hourly));
    await expect(page.getByTestId('roi-input-afterhours')).toHaveValue(String(others.afterhours));

    expect(errors).toEqual([]);
  });

  // Box 5: Copy share link writes the four encoded params to the clipboard.
  test('copy: Copy share link puts the four-param URL on the clipboard', async ({ page }) => {
    const errors = await gotoRoi(page);

    const inputs = { leads: 90, minutes: 12, hourly: 110, afterhours: 50 };
    await page.getByTestId('roi-input-leads').fill(String(inputs.leads));
    await page.getByTestId('roi-input-minutes').fill(String(inputs.minutes));
    await page.getByTestId('roi-input-hourly').fill(String(inputs.hourly));
    await page.getByTestId('roi-input-afterhours').fill(String(inputs.afterhours));

    const copyBtn = page.getByTestId('roi-copy-share-link');
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(page.getByTestId('roi-copy-confirmation')).toBeVisible();

    const clip = await page.evaluate(() => navigator.clipboard.readText());
    const url = new URL(clip);
    expect(url.origin).toBe(new URL(page.url()).origin);
    expect(url.pathname).toBe(ROUTE);
    expect(url.searchParams.get('leads')).toBe(String(inputs.leads));
    expect(url.searchParams.get('minutes')).toBe(String(inputs.minutes));
    expect(url.searchParams.get('hourly')).toBe(String(inputs.hourly));
    expect(url.searchParams.get('afterhours')).toBe(String(inputs.afterhours));

    // No em-dash in the copy of the button or confirmation.
    expect(await copyBtn.innerText()).not.toContain(EM_DASH);
    expect(await page.getByTestId('roi-copy-confirmation').innerText()).not.toContain(EM_DASH);

    expect(errors).toEqual([]);
  });

  // Box 6: JSON-LD. Exactly one BreadcrumbList block names "ROI Calculator"
  // and exactly one WebApplication block carries applicationCategory:
  // BusinessApplication. The implementer grepped existing JSON-LD specs for
  // collisions (see ticket Implementation log).
  test('JSON-LD: BreadcrumbList + WebApplication blocks render with the documented fields', async ({
    page,
  }) => {
    const errors = await gotoRoi(page);
    const blocks = await readJsonLdBlocks(page);

    const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
      isBreadcrumb(b.data),
    );
    expect(breadcrumbs, 'exactly one BreadcrumbList block expected on /roi').toHaveLength(1);
    const items = breadcrumbs[0].data.itemListElement ?? [];
    expect(items.length).toBe(2);
    expect((items[0].name ?? '').toLowerCase()).toBe('home');
    expect(items[1].name).toBe('ROI Calculator');
    expect(items[1].item).toBe('https://digitalcraftai.com/roi');

    const apps = blocks.filter((b): b is { raw: string; data: WebApp } => isWebApp(b.data));
    expect(apps, 'exactly one WebApplication block expected on /roi').toHaveLength(1);
    const app = apps[0].data;
    expect(app['@context']).toBe('https://schema.org');
    expect(app['@type']).toBe('WebApplication');
    expect(app.name).toBe('AI ROI Calculator');
    expect(app.applicationCategory).toBe('BusinessApplication');
    expect(app.operatingSystem).toBe('Web');
    expect(typeof app.description).toBe('string');
    expect((app.description ?? '').length).toBeGreaterThan(20);
    expect(app.offers).toBeDefined();
    expect(app.offers!['@type']).toBe('Offer');
    expect(app.offers!.price).toBe('0');
    expect(app.offers!.priceCurrency).toBe('USD');

    // description mirrors the LAST meta[name="description"] (the
    // Helmet-appended one) byte-for-byte per the 2026-05-25 Helmet-appends
    // and mirror-source rules.
    const descriptions = await page
      .locator('head meta[name="description"]')
      .evaluateAll((nodes) => nodes.map((n) => (n as HTMLMetaElement).content));
    const helmetDescription = descriptions[descriptions.length - 1];
    expect(app.description).toBe(helmetDescription);

    // Each block parses cleanly.
    expect(() => JSON.parse(breadcrumbs[0].raw)).not.toThrow();
    expect(() => JSON.parse(apps[0].raw)).not.toThrow();

    expect(errors).toEqual([]);
  });

  // Box 7: page renders in dark mode (and at 375px) with the result card
  // still showing the default annual savings number.
  test('dark mode: applying .dark on the root keeps the page rendering', async ({ page }) => {
    const errors = await gotoRoi(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.evaluate(() => document.documentElement.classList.add('dark'));

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByTestId('roi-annual-savings')).toBeVisible();
    await expect(page.getByTestId('roi-copy-share-link')).toBeVisible();

    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(hasDarkClass).toBe(true);

    expect(errors).toEqual([]);
  });

  // Box 8: no em-dash (U+2014) in any rendered body text, no em-dash in
  // any JSON-LD serialized string.
  test('no em-dash: body text and JSON-LD blocks contain zero em-dash characters', async ({
    page,
  }) => {
    const errors = await gotoRoi(page);
    const bodyText = (await page.textContent('body')) ?? '';
    expect(bodyText, 'rendered body contains an em-dash').not.toContain(EM_DASH);

    const blocks = await readJsonLdBlocks(page);
    const ours = blocks.filter((b) => isBreadcrumb(b.data) || isWebApp(b.data));
    expect(ours.length, 'BreadcrumbList + WebApplication blocks must both render').toBe(2);
    for (const b of ours) {
      expect(b.raw, `JSON-LD block contains em-dash: ${b.raw}`).not.toContain(EM_DASH);
    }

    expect(errors).toEqual([]);
  });
});
