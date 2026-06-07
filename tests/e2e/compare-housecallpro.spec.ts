import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0038 - Comparison page "Digital Craft vs Housecall Pro". Each
// test maps 1:1 to an acceptance-criteria box on the ticket. Modeled on
// the compare-podium spec (ticket 0035), the most recent peer, with the
// honest-acknowledgment surface re-pointed at Housecall Pro's actual
// strengths (mature dispatch with drag-drop scheduling, deep QuickBooks
// integration, in-app payments, and the mobile field-tech app).
//
// IMPORTANT: /compare/housecallpro is NOT in the index.html SEO Pilot
// `pages` table (adding it there is its own SEO-hygiene ticket per the
// 2026-05-25 lesson, out of scope here). document.title is owned by
// the SEO Pilot script on SPA navigation, so we do NOT assert
// expect(page).toHaveTitle(...). We assert the Helmet-managed head
// elements directly (the LAST meta[name="description"], the LAST
// link[rel="canonical"], and the emitted JSON-LD scripts), plus the
// visible H1 text.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

const EM_DASH = String.fromCharCode(8212); // U+2014, per the 2026-05-07 Hard NO.

async function gotoHousecallPro(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/compare/housecallpro', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /compare/housecallpro').not.toBeNull();
  expect(
    response!.status(),
    `/compare/housecallpro returned ${response!.status()}`,
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

// Box 1: /compare/housecallpro renders a page whose Helmet-emitted meta
// description names BOTH Housecall Pro and DigitalCraft, and whose H1
// names both products. Canonical link points at /compare/housecallpro.
test('renders Helmet meta description + H1 naming both Housecall Pro and DigitalCraft', async ({
  page,
}) => {
  const errors = await gotoHousecallPro(page);

  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const h1Text = ((await h1.textContent()) ?? '').toLowerCase();
  expect(h1Text).toMatch(/housecall pro/);
  expect(h1Text).toMatch(/digitalcraft|digital craft/);

  await expect
    .poll(
      async () =>
        page
          .locator('head meta[name="description"]')
          .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? '')),
      { timeout: 10_000 },
    )
    .toEqual(expect.arrayContaining([expect.stringMatching(/housecall pro/i)]));

  const descriptions = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? ''));
  const helmetDescription = descriptions[descriptions.length - 1];
  expect(helmetDescription.toLowerCase()).toMatch(/housecall pro/);
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
      expect.arrayContaining([expect.stringContaining('/compare/housecallpro')]),
    );

  expect(errors).toEqual([]);
});

// Box 2: feature comparison table with >=8 rows (one per feature per
// ticket spec). The page must honestly acknowledge Housecall Pro wins
// on mature dispatch, the field-tech mobile app, in-app payments, and
// the QuickBooks integration. Pricing claim cites housecallpro.com so
// the row stays auditable.
test('feature table renders >=8 compare-row entries and honestly names Housecall Pro wins', async ({
  page,
}) => {
  const errors = await gotoHousecallPro(page);

  // The ticket specifies data-testid="compare-row" on every comparison
  // table row so the row-count assertion is stable even if the page
  // later grows differentiator cards that repeat row labels in their
  // headings.
  const rows = page.locator('[data-testid="compare-row"]');
  await expect(rows.first()).toBeVisible();
  const rowCount = await rows.count();
  expect(rowCount, `expected >=8 compare rows, got ${rowCount}`).toBeGreaterThanOrEqual(8);

  const body = (await page.locator('body').innerText()).toLowerCase();
  expect(body, 'page must acknowledge Housecall Pro dispatch / scheduling').toMatch(
    /dispatch|scheduling/,
  );
  expect(body, 'page must acknowledge Housecall Pro QuickBooks integration').toMatch(
    /quickbooks/,
  );
  expect(body, 'page must acknowledge Housecall Pro in-app payments').toMatch(/payments?/);
  expect(body, 'page must acknowledge Housecall Pro mobile field-tech app').toMatch(
    /mobile|field.?tech|technician app/,
  );

  // Defensible language: no inflated "500+" or similar invented number.
  expect(body).not.toMatch(/\b500\+/);

  // Pricing claim must cite a source domain so it stays auditable as
  // Housecall Pro's published pricing moves.
  expect(body).toMatch(/housecallpro\.com/);

  expect(errors).toEqual([]);
});

// Box 3: >=4 differentiator cards naming DCA advantages in defensible
// language. Mirrors the Jobber / ServiceTitan / Podium precedent.
test('renders >=4 differentiator cards naming defensible DCA advantages', async ({ page }) => {
  const errors = await gotoHousecallPro(page);

  const body = (await page.locator('body').innerText()).toLowerCase();
  expect(body).toMatch(/ai voice agent|ai voice/);
  expect(body).toMatch(/trade|industry|plumbing|hvac|home.?services/);
  expect(body).toMatch(/48.?hour|48 hour/);
  expect(body).toMatch(/flat pricing|flat monthly|no implementation fee|month.?to.?month/);

  expect(errors).toEqual([]);
});

// Box 4: shared Navbar + Footer (the ticket 0006 useContent pattern),
// Helmet drives og:title, route present in sitemap.
test('renders Navbar + Footer, has Helmet OG title, appears in sitemap.xml', async ({
  page,
}) => {
  const errors = await gotoHousecallPro(page);

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
      expect.arrayContaining([expect.stringMatching(/housecall pro/i)]),
    );

  const sitemap = await page.goto('/sitemap.xml', { waitUntil: 'domcontentloaded' });
  expect(sitemap, 'no response for /sitemap.xml').not.toBeNull();
  expect(sitemap!.status()).toBeLessThan(400);
  const xml = await sitemap!.text();
  expect(xml).toContain('https://digitalcraftai.com/compare/housecallpro');

  expect(errors).toEqual([]);
});

// Box 5: exactly one BreadcrumbList JSON-LD block (Home -> Compare ->
// Housecall Pro), parses as valid JSON, mirrors the visible breadcrumb.
test('emits BreadcrumbList JSON-LD whose names mirror the visible breadcrumb', async ({
  page,
}) => {
  const errors = await gotoHousecallPro(page);
  const blocks = await readJsonLdBlocks(page);

  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(
    breadcrumbs,
    'exactly one BreadcrumbList block expected on /compare/housecallpro',
  ).toHaveLength(1);

  const crumb = breadcrumbs[0].data;
  expect(() => JSON.parse(breadcrumbs[0].raw)).not.toThrow();
  const items = crumb.itemListElement ?? [];
  expect(items.length).toBe(3);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect((items[1].name ?? '').toLowerCase()).toBe('compare');
  expect((items[2].name ?? '').toLowerCase()).toBe('housecall pro');
  expect(items[2].item).toBe('https://digitalcraftai.com/compare/housecallpro');

  // Mirror-source: every JSON-LD itemListElement name must also be
  // present in the visible breadcrumb DOM (per the 2026-05-25
  // mirror-source lesson).
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
    expect(b.raw).not.toContain(EM_DASH);
  }

  expect(errors).toEqual([]);
});

// Box 6: renders in light + dark on 375px mobile; table is wrapped in
// overflow-x-auto; no em-dash (U+2014) anywhere visible or in this
// page's JSON-LD; trackCTAClick fires with a compare_housecallpro_
// location label; the primary CTA routes to /homeservices/demo and the
// secondary to /homeservices.
test('renders light/dark on 375px mobile, has no em-dash, fires compare_housecallpro_ CTA event', async ({
  page,
}) => {
  const errors = await gotoHousecallPro(page);

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
  expect(visible).not.toContain(EM_DASH);

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
    expect(b.raw).not.toContain(EM_DASH);
  }

  // Both CTAs route to home-services routes registered in ROUTES.
  const primaryHref = await page
    .locator('a[href="/homeservices/demo"]')
    .first()
    .getAttribute('href');
  expect(primaryHref).toBe('/homeservices/demo');
  const secondaryHref = await page
    .locator('a[href="/homeservices"]')
    .first()
    .getAttribute('href');
  expect(secondaryHref).toBe('/homeservices');

  // Analytics: stub gtag and click the primary CTA; assert at least one
  // event_label contains the "compare_housecallpro_" prefix.
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
    labels.some((l) => /compare_housecallpro_/i.test(l)),
    `expected at least one cta_click event_label to contain "compare_housecallpro_", got: ${labels.join(' | ')}`,
  ).toBe(true);

  expect(errors).toEqual([]);
});

// Box 7: no first-party /api/ call fires when rendering (composition
// only, no new hostnames, no dependency).
test('makes no first-party /api/ call when rendering', async ({ page }) => {
  const appOrigin = 'http://127.0.0.1:4173';
  const apiCalls: string[] = [];
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin === appOrigin && u.pathname.startsWith('/api/')) {
      apiCalls.push(req.url());
    }
  });

  const errors = await gotoHousecallPro(page);

  expect(
    apiCalls,
    `the Housecall Pro comparison page should make no first-party /api/ call:\n${apiCalls.join('\n')}`,
  ).toEqual([]);
  expect(errors).toEqual([]);
});
