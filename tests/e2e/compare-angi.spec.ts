import { test, expect, type Page } from '@playwright/test';
import { ROUTES, IGNORABLE_ERROR_PATTERNS } from './routes';
import { COMPARE_ENTRIES } from '../../src/data/compareEntries';

// Ticket 0053 - Comparison page "Digital Craft vs Angi" for high-intent
// home-services lead-marketplace switchers. Each test maps 1:1 to an
// acceptance-criteria box on the ticket. Modeled on
// `tests/e2e/compare-thumbtack.spec.ts` (ticket 0049, the closest peer
// in the compare family because Angi and Thumbtack are the same
// structural class of incumbent - pay-per-lead acquisition marketplaces,
// not field-service software).
//
// Structural mirror of the ticket 0049 spec: this page breadcrumbs
// Home -> Compare -> Digital Craft vs Angi (the middle item links to
// the /compare hub from ticket 0048). The ten pre-hub compare pages
// (0021-0042) breadcrumb directly Home -> Comparison; updating their
// breadcrumbs is its own cross-cutting ticket per the AGENTS.md
// small-focused-PR rule (out of scope here).
//
// Per the 2026-05-30 second-@type lesson the implementer grepped every
// `tests/e2e/compare-*.spec.ts` and `tests/e2e/*-jsonld.spec.ts` for
// `=== 'BreadcrumbList'` AND `=== 'WebPage'` predicates BEFORE writing
// code. Every predecessor "exactly one" predicate is URL-scoped to a
// different route (`/compare/jobber`, `/compare/servicetitan`,
// `/compare/podium`, `/compare/housecallpro`, `/compare/buildertrend`,
// `/compare/thumbtack`, `/my`, plus the `/demos`, `/changelog`,
// `/trust`, `/quiz`, `/roi`, `/ai-for-*` per-page specs). None assert
// "exactly one of either @type site-wide", so a new
// `/compare/angi`-scoped pair does NOT collide. Recorded in the ticket
// Implementation log.
//
// Per the 2026-05-25 SEO Pilot lesson, /compare/angi is NOT in the
// index.html SEO Pilot `pages` table; the spec asserts the LAST
// `meta[name="description"]` content (the Helmet-appended one) directly,
// NOT `page.toHaveTitle(...)`.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the 2026-05-07 Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';

async function gotoAngi(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/compare/angi', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /compare/angi').not.toBeNull();
  expect(
    response!.status(),
    `/compare/angi returned ${response!.status()}`,
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
  await expect
    .poll(
      () => page.$$eval('script[type="application/ld+json"]', (nodes) => nodes.length),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  return raws.map((raw) => ({ raw, data: JSON.parse(raw) as unknown }));
}

type BreadcrumbItem = { '@type': string; position?: number; name?: string; item?: string };
type Breadcrumb = { '@type': string; itemListElement?: BreadcrumbItem[] };
type WebPage = {
  '@context'?: string;
  '@type': string;
  name?: string;
  description?: string;
  isPartOf?: { '@type'?: string; url?: string };
};

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' && d !== null && (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

const isWebPage = (d: unknown): d is WebPage =>
  typeof d === 'object' && d !== null && (d as { '@type'?: unknown })['@type'] === 'WebPage';

const STATIC_ROUTES = new Set(ROUTES);

// Box 1: /compare/angi renders a page whose Helmet meta description
// names BOTH Angi and Digital Craft, and whose H1 names both. The
// page positions Angi as a lead marketplace and Digital Craft as
// the AI agent layer that books the leads you already have. The page
// contains a four-row comparison table for the dimensions named in the
// ticket (Lead source, Exclusivity per lead, Response speed, Cost
// model).
test('renders Helmet meta + H1 naming both Angi and Digital Craft', async ({ page }) => {
  const errors = await gotoAngi(page);

  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const h1Text = ((await h1.textContent()) ?? '').toLowerCase();
  expect(h1Text).toMatch(/angi/);
  expect(h1Text).toMatch(/digitalcraft|digital craft/);

  await expect
    .poll(
      async () =>
        page
          .locator('head meta[name="description"]')
          .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? '')),
      { timeout: 10_000 },
    )
    .toEqual(expect.arrayContaining([expect.stringMatching(/angi/i)]));

  const descriptions = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? ''));
  const helmetDescription = descriptions[descriptions.length - 1];
  expect(helmetDescription.toLowerCase()).toMatch(/angi/);
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
      expect.arrayContaining([expect.stringContaining('/compare/angi')]),
    );

  expect(errors).toEqual([]);
});

// Box 2: page has the four ticket-named comparison dimensions (Lead
// source, Exclusivity per lead, Response speed, Cost model) AND
// defensibly positions Angi as the acquisition layer rather than
// trashing it.
test('comparison table covers the four Angi-specific dimensions', async ({ page }) => {
  const errors = await gotoAngi(page);

  const rows = page.locator('[data-testid="compare-row"]');
  await expect(rows.first()).toBeVisible();
  const rowCount = await rows.count();
  expect(rowCount, `expected at least 4 compare rows, got ${rowCount}`).toBeGreaterThanOrEqual(4);

  const body = (await page.locator('body').innerText()).toLowerCase();
  expect(body, 'page must name Lead source dimension').toMatch(/lead source/);
  expect(body, 'page must name Exclusivity dimension').toMatch(/exclusivity/);
  expect(body, 'page must name Response speed dimension').toMatch(/response speed/);
  expect(body, 'page must name Cost model dimension').toMatch(/cost model/);

  // Honest positioning: page must acknowledge Angi is an acquisition
  // marketplace, not trash it.
  expect(body, 'page must position Angi as a lead marketplace').toMatch(
    /lead marketplace|pay-per-lead|pay per lead|shared lead/,
  );
  expect(body, 'page must include "use both" complementary stack framing').toMatch(
    /use both|complement|together/,
  );

  // Defensible language: no inflated "500+" or similar invented number.
  expect(body).not.toMatch(/\b500\+/);

  expect(errors).toEqual([]);
});

// Box 3: BreadcrumbList JSON-LD has three items, the middle one is named
// "Compare" and links to /compare (the hub from ticket 0048).
test('emits BreadcrumbList whose middle item is Compare linking to /compare', async ({ page }) => {
  const errors = await gotoAngi(page);
  const blocks = await readJsonLdBlocks(page);

  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(
    breadcrumbs,
    'exactly one BreadcrumbList block expected on /compare/angi',
  ).toHaveLength(1);

  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(3);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[0].item).toBe(ORIGIN);
  expect(items[1].name).toBe('Compare');
  // The middle item points at the canonical /compare hub from ticket 0048.
  expect(items[1].item).toBeDefined();
  expect((items[1].item ?? '').endsWith('/compare')).toBe(true);
  expect(items[2].name).toMatch(/Angi/);
  expect(items[2].item).toBe(`${ORIGIN}/compare/angi`);

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

// Box 4: WebPage JSON-LD carries name + description (mirrored from the
// META_DESCRIPTION constant per the 2026-05-25 mirror-source rule) and
// `isPartOf` pointing at the existing WebSite block.
test('emits WebPage JSON-LD with name, description, and isPartOf WebSite', async ({ page }) => {
  const errors = await gotoAngi(page);
  const blocks = await readJsonLdBlocks(page);

  const webpages = blocks.filter((b): b is { raw: string; data: WebPage } =>
    isWebPage(b.data),
  );
  // The page may emit one WebPage block; the homepage WebSite block is a
  // different @type. Only assert the per-URL one carries the right name.
  const ours = webpages.filter((w) =>
    (w.data.name ?? '').toLowerCase().includes('angi'),
  );
  expect(
    ours.length,
    'exactly one WebPage block naming Angi expected on /compare/angi',
  ).toBe(1);

  const wp = ours[0].data;
  expect(typeof wp.name).toBe('string');
  expect((wp.name ?? '').toLowerCase()).toMatch(/angi/);
  expect(typeof wp.description).toBe('string');
  expect((wp.description ?? '').length).toBeGreaterThan(40);
  expect(wp.isPartOf?.['@type']).toBe('WebSite');
  expect(wp.isPartOf?.url).toBe(ORIGIN);

  // Description mirror-source: the WebPage.description string is byte-
  // for-byte the same as the LAST meta[name="description"] (the Helmet
  // one).
  const descriptions = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? ''));
  const helmetDescription = descriptions[descriptions.length - 1];
  expect(wp.description).toBe(helmetDescription);

  for (const b of webpages) {
    expect(b.raw).not.toContain(EM_DASH);
  }

  expect(errors).toEqual([]);
});

// Box 5: page renders in light AND dark mode on a 375px mobile viewport;
// table is wrapped in overflow-x-auto; no em-dash anywhere visible or in
// this page's JSON-LD.
test('renders light/dark on 375px mobile and has no em-dash', async ({ page }) => {
  const errors = await gotoAngi(page);

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

  expect(errors).toEqual([]);
});

// Box 6: three demo CTAs route to registered /homeservices/demo/* routes.
// Strategy-call CTA opens calendly with target=_blank and
// rel="noopener noreferrer". Each demo CTA fires a trackCTAClick with a
// compareangi_ event_label.
test('three demo CTAs route to homeservices demos; strategy CTA opens calendly safely', async ({
  page,
}) => {
  const errors = await gotoAngi(page);

  const demoCTAs = page.locator('[data-testid="compareangi-demo-cta"]');
  const ctaCount = await demoCTAs.count();
  expect(ctaCount, 'expected three compareangi-demo-cta CTAs').toBe(3);

  const hrefs = await demoCTAs.evaluateAll((nodes) =>
    nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
  );
  const expectedDemoRoutes = [
    '/homeservices/demo/lead-responder',
    '/homeservices/demo/voice-followup',
    '/homeservices/demo/estimate',
  ];
  for (const href of hrefs) {
    expect(href, `demo CTA href ${href} must be in ROUTES`).toMatch(/^\/homeservices\/demo\//);
    expect(STATIC_ROUTES.has(href), `${href} not in ROUTES`).toBe(true);
  }
  // Every expected target is covered by at least one CTA.
  for (const target of expectedDemoRoutes) {
    expect(hrefs, `expected one CTA pointing at ${target}`).toContain(target);
  }

  // Strategy-call CTA: calendly.com link with target=_blank and
  // rel="noopener noreferrer".
  const strategyCTA = page
    .locator('a[href*="calendly.com/mutaaf"]')
    .first();
  await expect(strategyCTA).toBeVisible();
  expect(await strategyCTA.getAttribute('target')).toBe('_blank');
  const rel = (await strategyCTA.getAttribute('rel')) ?? '';
  expect(rel).toContain('noopener');
  expect(rel).toContain('noreferrer');

  // Analytics: stub gtag and click the first demo CTA; assert at least
  // one event_label contains the "compareangi_" prefix.
  await page.evaluate(() => {
    (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents = [];
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (
      ...args: unknown[]
    ) => {
      (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents.push(args);
    };
  });

  const firstCTA = demoCTAs.first();
  await firstCTA.evaluate((el) =>
    el.addEventListener('click', (e) => e.preventDefault(), { capture: true, once: true }),
  );
  await firstCTA.click();

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
    labels.some((l) => /compareangi_/i.test(l)),
    `expected at least one cta_click event_label to contain "compareangi_", got: ${labels.join(' | ')}`,
  ).toBe(true);

  expect(errors).toEqual([]);
});

// Box 7: makes no first-party /api/ call when rendering (composition
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

  const errors = await gotoAngi(page);

  expect(
    apiCalls,
    `the Angi comparison page should make no first-party /api/ call:\n${apiCalls.join('\n')}`,
  ).toEqual([]);
  expect(errors).toEqual([]);
});

// Box 8: shared Navbar + Footer; route present in sitemap.xml.
test('renders Navbar + Footer and appears in sitemap.xml', async ({ page }) => {
  const errors = await gotoAngi(page);

  await expect(page.locator('nav').first()).toBeVisible();
  await expect(page.locator('footer').first()).toBeVisible();

  const sitemap = await page.goto('/sitemap.xml', { waitUntil: 'domcontentloaded' });
  expect(sitemap, 'no response for /sitemap.xml').not.toBeNull();
  expect(sitemap!.status()).toBeLessThan(400);
  const xml = await sitemap!.text();
  expect(xml).toContain('https://digitalcraftai.com/compare/angi');

  expect(errors).toEqual([]);
});

// Box 9: COMPARE_ENTRIES has an entry with id "angi" whose path is
// /compare/angi and whose tagline contains no em-dash.
test('COMPARE_ENTRIES contains the angi entry', () => {
  const entry = COMPARE_ENTRIES.find((e) => e.id === 'angi');
  expect(entry, 'COMPARE_ENTRIES must contain an angi entry').toBeDefined();
  expect(entry?.tool).toBe('Angi');
  expect(entry?.path).toBe('/compare/angi');
  expect(entry?.tagline ?? '').not.toContain(EM_DASH);
  expect((entry?.tagline ?? '').length).toBeGreaterThan(20);
});
