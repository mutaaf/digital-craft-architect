import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0028 - Comparison page "Digital Craft vs ServiceTitan". Each test
// maps 1:1 to an acceptance-criteria box on the ticket. Modeled on the
// compare-jobber spec (ticket 0021), the closest peer in the field-service
// category.
//
// IMPORTANT: /compare/servicetitan is NOT in the index.html SEO Pilot
// `pages` table (adding it there is its own SEO ticket, out of scope here).
// Per the 2026-05-25 SEO Pilot lesson in docs/LESSONS.md, document.title is
// owned by the SEO Pilot script on SPA navigation, so we do NOT assert
// expect(page).toHaveTitle(...). We assert the Helmet-managed head elements
// directly (the LAST meta[name="description"], the LAST link[rel="canonical"],
// and the emitted JSON-LD scripts), plus the visible H1 text.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

async function gotoServiceTitan(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/compare/servicetitan', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /compare/servicetitan').not.toBeNull();
  expect(
    response!.status(),
    `/compare/servicetitan returned ${response!.status()}`,
  ).toBeLessThan(400);
  await expect
    .poll(
      () => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(500);
  return errors;
}

async function readJsonLdBlocks(page: Page): Promise<{ raw: string; data: unknown }[]> {
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  return raws.map((raw) => ({ raw, data: JSON.parse(raw) as unknown }));
}

type BreadcrumbItem = { '@type': string; position?: number; name?: string; item?: string };
type Breadcrumb = { '@type': string; itemListElement?: BreadcrumbItem[] };

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' && d !== null && (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

// Box 1: /compare/servicetitan renders a page whose Helmet-emitted
// meta description names BOTH ServiceTitan and DigitalCraft, and whose H1
// names both products.
test('renders Helmet meta description + H1 naming both ServiceTitan and DigitalCraft', async ({
  page,
}) => {
  const errors = await gotoServiceTitan(page);

  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const h1Text = ((await h1.textContent()) ?? '').toLowerCase();
  expect(h1Text).toMatch(/servicetitan/);
  expect(h1Text).toMatch(/digitalcraft|digital craft/);

  await expect
    .poll(
      async () =>
        page
          .locator('head meta[name="description"]')
          .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? '')),
      { timeout: 10_000 },
    )
    .toEqual(expect.arrayContaining([expect.stringMatching(/servicetitan/i)]));

  const descriptions = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? ''));
  const helmetDescription = descriptions[descriptions.length - 1];
  expect(helmetDescription.toLowerCase()).toMatch(/servicetitan/);
  expect(helmetDescription.toLowerCase()).toMatch(/digitalcraft|digital craft/);
  expect(helmetDescription.length).toBeGreaterThan(60);

  await expect
    .poll(
      async () =>
        page
          .locator('head link[rel="canonical"]')
          .evaluateAll((nodes) =>
            nodes.map((n) => (n as HTMLLinkElement).getAttribute('href') ?? ''),
          ),
      { timeout: 10_000 },
    )
    .toEqual(
      expect.arrayContaining([expect.stringContaining('/compare/servicetitan')]),
    );

  expect(errors).toEqual([]);
});

// Box 2: feature comparison table with >=12 rows; >=3 honest ServiceTitan
// wins (field-service CRM with dispatching, integrated payments, deep
// QuickBooks/accounting integrations). Defensible numbers (no "500+").
test('feature table renders >=12 rows and shows ServiceTitan winning on >=3 honest rows', async ({
  page,
}) => {
  const errors = await gotoServiceTitan(page);

  const rows = page.locator('table tbody tr');
  await expect(rows.first()).toBeVisible();
  const rowCount = await rows.count();
  expect(rowCount, `expected >=12 comparison rows, got ${rowCount}`).toBeGreaterThanOrEqual(12);

  const body = (await page.locator('body').innerText()).toLowerCase();
  expect(body, 'page must acknowledge ServiceTitan built-in field-service CRM').toMatch(
    /built-in field-service crm|field-service crm/,
  );
  expect(body, 'page must acknowledge ServiceTitan integrated payments').toMatch(
    /integrated payments|payment processing/,
  );
  expect(body, 'page must acknowledge ServiceTitan accounting integrations').toMatch(
    /quickbooks|accounting integration/,
  );

  // Defensible language: no inflated "500+" or similar invented number.
  expect(body).not.toMatch(/\b500\+/);

  // Pricing claim must NOT fabricate a per-seat number; cite the source
  // domain so the row stays auditable as ServiceTitan's pricing moves.
  expect(body).toMatch(/servicetitan\.com/);
  // Defensible range language as called out in the ticket Out-of-Scope rule.
  expect(body).toMatch(/high 3-figure|custom.?quote|custom quoted/);

  expect(errors).toEqual([]);
});

// Box 3: >=4 differentiator cards naming DCA advantages in defensible
// language with no em-dash character.
test('renders >=4 differentiator cards naming defensible DCA advantages', async ({ page }) => {
  const errors = await gotoServiceTitan(page);

  const body = (await page.locator('body').innerText()).toLowerCase();
  expect(body).toMatch(/ai voice agent|ai voice/);
  expect(body).toMatch(/trade|industry|plumbing|hvac/);
  expect(body).toMatch(/48.?hour|48 hour/);
  expect(body).toMatch(/flat pricing|flat monthly|no implementation fee/);

  expect(errors).toEqual([]);
});

// Box 4: shared Navbar + Footer (the ticket 0006 useContent pattern),
// Helmet drives title/description/canonical/OG, route present in sitemap.
test('renders Navbar + Footer, has Helmet canonical + OG, appears in sitemap.xml', async ({
  page,
}) => {
  const errors = await gotoServiceTitan(page);

  await expect(page.locator('nav').first()).toBeVisible();
  await expect(page.locator('footer').first()).toBeVisible();

  await expect
    .poll(
      async () =>
        page
          .locator('head meta[property="og:title"]')
          .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? '')),
      { timeout: 10_000 },
    )
    .toEqual(
      expect.arrayContaining([expect.stringMatching(/servicetitan/i)]),
    );

  const sitemap = await page.goto('/sitemap.xml', { waitUntil: 'domcontentloaded' });
  expect(sitemap, 'no response for /sitemap.xml').not.toBeNull();
  expect(sitemap!.status()).toBeLessThan(400);
  const xml = await sitemap!.text();
  expect(xml).toContain('https://digitalcraftai.com/compare/servicetitan');

  expect(errors).toEqual([]);
});

// Box 5: exactly one BreadcrumbList JSON-LD block (Home -> Compare ->
// ServiceTitan), parses as valid JSON, mirrors the visible breadcrumb.
test('emits BreadcrumbList JSON-LD whose names mirror the visible breadcrumb', async ({
  page,
}) => {
  const errors = await gotoServiceTitan(page);
  const blocks = await readJsonLdBlocks(page);

  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(
    breadcrumbs,
    'exactly one BreadcrumbList block expected on /compare/servicetitan',
  ).toHaveLength(1);

  const crumb = breadcrumbs[0].data;
  expect(() => JSON.parse(breadcrumbs[0].raw)).not.toThrow();
  const items = crumb.itemListElement ?? [];
  expect(items.length).toBe(3);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect((items[1].name ?? '').toLowerCase()).toBe('compare');
  expect((items[2].name ?? '').toLowerCase()).toBe('servicetitan');
  expect(items[2].item).toBe('https://digitalcraftai.com/compare/servicetitan');

  // Mirror-source: every JSON-LD itemListElement name must also be present
  // in the visible breadcrumb DOM (per the 2026-05-25 mirror-source lesson).
  const visibleCrumbs = await page
    .locator('[data-breadcrumb-item]')
    .evaluateAll((nodes) => nodes.map((n) => (n.textContent ?? '').trim()));
  for (const item of items) {
    const name = item.name ?? '';
    expect(
      visibleCrumbs.some((v) => v.includes(name)),
      `JSON-LD crumb "${name}" must also appear in visible breadcrumb: ${visibleCrumbs.join(' | ')}`,
    ).toBe(true);
  }

  for (const b of breadcrumbs) {
    expect(b.raw).not.toContain('—');
  }

  expect(errors).toEqual([]);
});

// Box 6: renders in light + dark on 375px mobile; table is wrapped in
// overflow-x-auto; no em-dash anywhere visible or in this page's JSON-LD;
// trackCTAClick fires with a compare_servicetitan_ location label.
test('renders light/dark on 375px mobile, has no em-dash, fires compare_servicetitan_ CTA event', async ({
  page,
}) => {
  const errors = await gotoServiceTitan(page);

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const tableWrapperOverflowCount = await page
    .locator('div.overflow-x-auto')
    .filter({ has: page.locator('table') })
    .count();
  expect(
    tableWrapperOverflowCount,
    'comparison table must be wrapped in overflow-x-auto for 375px readability',
  ).toBeGreaterThan(0);

  const visible = await page.locator('body').innerText();
  expect(visible).not.toContain('—');

  const blocks = await readJsonLdBlocks(page);
  const ourBlocks = blocks.filter((b) => {
    const t = (b.data as { '@type'?: unknown })?.['@type'];
    return t === 'BreadcrumbList' || t === 'WebPage';
  });
  expect(
    ourBlocks.length,
    'page must emit BreadcrumbList + WebPage JSON-LD',
  ).toBeGreaterThanOrEqual(2);
  for (const b of ourBlocks) {
    expect(b.raw).not.toContain('—');
  }

  // Analytics: stub gtag and click the primary CTA; assert at least one
  // event_label contains the "compare_servicetitan_" prefix.
  await page.evaluate(() => {
    (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents = [];
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (
      ...args: unknown[]
    ) => {
      (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents.push(args);
    };
  });

  const primaryCTA = page.locator('a[href="/homeservices/demo"]').first();
  await expect(primaryCTA).toBeVisible();
  await primaryCTA.evaluate((el) =>
    el.addEventListener('click', (e) => e.preventDefault(), { capture: true, once: true }),
  );
  await primaryCTA.click();

  const events = (await page.evaluate(
    () => (window as unknown as { __ctaEvents: unknown[][] }).__ctaEvents,
  )) as unknown[][];
  const ctaEvents = events.filter(
    (e) => Array.isArray(e) && e[0] === 'event' && e[1] === 'cta_click',
  );
  expect(ctaEvents.length, 'at least one cta_click event fired').toBeGreaterThan(0);
  const labels = ctaEvents.map((e) => {
    const params = e[2] as { event_label?: string };
    return params?.event_label ?? '';
  });
  expect(
    labels.some((l) => /compare_servicetitan_/i.test(l)),
    `expected at least one cta_click event_label to contain "compare_servicetitan_", got: ${labels.join(' | ')}`,
  ).toBe(true);

  expect(errors).toEqual([]);
});

// Box 7: no first-party /api/ call fires when rendering (composition only,
// no new hostnames, no dependency).
test('makes no first-party /api/ call when rendering', async ({ page }) => {
  const appOrigin = 'http://127.0.0.1:4173';
  const apiCalls: string[] = [];
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin === appOrigin && u.pathname.startsWith('/api/')) {
      apiCalls.push(req.url());
    }
  });

  const errors = await gotoServiceTitan(page);

  expect(
    apiCalls,
    `the ServiceTitan comparison page should make no first-party /api/ call:\n${apiCalls.join('\n')}`,
  ).toEqual([]);
  expect(errors).toEqual([]);
});
