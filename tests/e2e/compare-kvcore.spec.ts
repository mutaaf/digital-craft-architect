import { test, expect, type Page } from '@playwright/test';
import { ROUTES, IGNORABLE_ERROR_PATTERNS } from './routes';
import { COMPARE_ENTRIES } from '../../src/data/compareEntries';

// Ticket 0086 - Comparison page "Digital Craft vs kvCORE" for real-estate
// CRM switchers. Each test maps 1:1 to an acceptance-criteria box on the
// ticket. Modeled on tests/e2e/compare-followupboss.spec.ts (ticket 0065,
// the direct real-estate-vertical peer).
//
// Per the 2026-05-30 second-@type lesson the implementer grepped every
// tests/e2e/compare-*.spec.ts and tests/e2e/*-jsonld.spec.ts for
// `=== 'BreadcrumbList'` AND `=== 'WebPage'` predicates BEFORE writing
// code. Every predecessor "exactly one" predicate over either @type is
// URL-scoped to a different route (/compare/{jobber,servicetitan,podium,
// housecallpro,buildertrend,thumbtack,angi,followupboss,jobtread}, /compare,
// /changelog, /trust, /texas, /quiz, /glossary, per-case-study, blog
// collection). None assert "exactly one of either @type site-wide", so a
// fifteenth /compare/kvcore-scoped pair does NOT collide. Recorded in the
// ticket Implementation log.
//
// Per the 2026-05-25 SEO Pilot lesson, /compare/kvcore is NOT in the
// index.html SEO Pilot `pages` table; the spec asserts the LAST
// meta[name="description"] content (the Helmet-appended one) directly,
// NOT `page.toHaveTitle(...)`.
//
// Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the em-dash
// check in this spec scopes ONLY to the two blocks THIS page emits
// (BreadcrumbList, WebPage) filtered by @type BEFORE iterating. The
// homepage Organization block from index.html carries a legitimate
// em-dash and must not be flagged by the /compare/kvcore spec.
//
// Per the 2026-09-05 route-code-splitting + 2026-09-10 mount-signal
// lessons, gotoKvCore waits for the H1 to be visible instead of
// polling root.innerHTML.length > N (which trips on the RouteFallback
// spinner while the lazy chunk is still loading).

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the 2026-05-07 Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const HUB_COLLECTIONPAGE_NAME = 'Digital Craft Comparisons';

async function gotoKvCore(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/compare/kvcore', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /compare/kvcore').not.toBeNull();
  expect(
    response!.status(),
    `/compare/kvcore returned ${response!.status()}`,
  ).toBeLessThan(400);
  // Per the 2026-09-05 route-code-splitting + 2026-09-10 mount-signal
  // lessons: the compare routes are lazy-loaded behind <Suspense>, so
  // waiting only on root.innerHTML.length > N would satisfy on the
  // RouteFallback spinner. Wait for the H1 (real page marker) plus the
  // RouteFallback status role detaching before proceeding.
  await expect(page.locator('[role="status"][aria-label="Loading"]')).toHaveCount(0, {
    timeout: 10_000,
  });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });
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
  url?: string;
};
type ItemList = {
  '@context'?: string;
  '@type': string;
  name?: string;
  numberOfItems?: number;
  itemListElement?: { '@type': string; position?: number; name?: string; url?: string }[];
};
type CollectionPage = {
  '@context'?: string;
  '@type': string;
  name?: string;
  description?: string;
};

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' && d !== null && (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

const isWebPage = (d: unknown): d is WebPage =>
  typeof d === 'object' && d !== null && (d as { '@type'?: unknown })['@type'] === 'WebPage';

const isItemList = (d: unknown): d is ItemList =>
  typeof d === 'object' && d !== null && (d as { '@type'?: unknown })['@type'] === 'ItemList';

const isCollectionPage = (d: unknown): d is CollectionPage =>
  typeof d === 'object' && d !== null && (d as { '@type'?: unknown })['@type'] === 'CollectionPage';

const STATIC_ROUTES = new Set(ROUTES);

// Box 1: /compare/kvcore renders a page whose Helmet meta description
// names BOTH kvCORE and Digital Craft, and whose H1 names both. The
// page positions kvCORE as a real-estate operating system bundling IDX
// websites, squeeze pages, and CRM and Digital Craft as the AI agent
// layer that answers the leads a real-estate CRM stores.
test('renders Helmet meta + H1 naming both kvCORE and Digital Craft', async ({ page }) => {
  const errors = await gotoKvCore(page);

  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const h1Text = ((await h1.textContent()) ?? '').toLowerCase();
  expect(h1Text).toMatch(/kvcore/);
  expect(h1Text).toMatch(/digitalcraft|digital craft/);

  await expect
    .poll(
      async () =>
        page
          .locator('head meta[name="description"]')
          .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? '')),
      { timeout: 10_000 },
    )
    .toEqual(expect.arrayContaining([expect.stringMatching(/kvcore/i)]));

  const descriptions = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? ''));
  const helmetDescription = descriptions[descriptions.length - 1];
  expect(helmetDescription.toLowerCase()).toMatch(/kvcore/);
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
      expect.arrayContaining([expect.stringContaining('/compare/kvcore')]),
    );

  expect(errors).toEqual([]);
});

// Box 2: page has the four ticket-named comparison dimensions (Lead
// capture, First response, Qualification, Voice negotiation) AND
// defensibly positions kvCORE as an IDX-plus-CRM real-estate operating
// system rather than trashing it.
test('comparison table covers the four kvCORE-specific dimensions', async ({ page }) => {
  const errors = await gotoKvCore(page);

  const rows = page.locator('[data-testid="kvcore-comparison-row"]');
  await expect(rows.first()).toBeVisible();
  await expect(rows).toHaveCount(4);

  const body = (await page.locator('body').innerText()).toLowerCase();
  expect(body, 'page must name Lead capture dimension').toMatch(/lead capture/);
  expect(body, 'page must name First response dimension').toMatch(/first response/);
  expect(body, 'page must name Qualification dimension').toMatch(/qualification/);
  expect(body, 'page must name Voice negotiation dimension').toMatch(/voice negotiation/);

  // Honest positioning: page must acknowledge kvCORE bundles IDX +
  // squeeze pages + CRM (its actual real-estate-operating-system value
  // prop), not trash it.
  expect(body, 'page must position kvCORE as a real-estate operating system').toMatch(
    /idx|squeeze|smart plan|drip|crm/,
  );
  expect(body, 'page must include "use both" complementary stack framing').toMatch(
    /use both|complement|together|alongside/,
  );

  // Defensible language: no inflated "500+" or similar invented number.
  expect(body).not.toMatch(/\b500\+/);

  expect(errors).toEqual([]);
});

// Box 3: BreadcrumbList JSON-LD has three items, the middle one is named
// "Compare" and links to /compare (the hub from ticket 0048).
test('emits BreadcrumbList whose middle item is Compare linking to /compare', async ({ page }) => {
  const errors = await gotoKvCore(page);
  const blocks = await readJsonLdBlocks(page);

  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(
    breadcrumbs,
    'exactly one BreadcrumbList block expected on /compare/kvcore',
  ).toHaveLength(1);

  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(3);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[0].item).toBe(ORIGIN);
  expect(items[1].name).toBe('Compare');
  expect(items[1].item).toBeDefined();
  expect((items[1].item ?? '').endsWith('/compare')).toBe(true);
  expect(items[2].name).toMatch(/kvCORE/i);
  expect(items[2].item).toBe(`${ORIGIN}/compare/kvcore`);

  // Mirror-source: every JSON-LD itemListElement name must also be
  // present in the visible breadcrumb DOM (per the 2026-05-25
  // mirror-source lesson).
  const visibleCrumbs = await page
    .locator('[data-breadcrumb-item]')
    .evaluateAll((nodes) => nodes.map((n) => (n.textContent ?? '').trim()));
  for (const item of items) {
    const name = item.name ?? '';
    expect(
      visibleCrumbs.some((v) => v.toLowerCase().includes(name.toLowerCase())),
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
  const errors = await gotoKvCore(page);
  const blocks = await readJsonLdBlocks(page);

  const webpages = blocks.filter((b): b is { raw: string; data: WebPage } =>
    isWebPage(b.data),
  );
  const ours = webpages.filter((w) =>
    (w.data.name ?? '').toLowerCase().includes('kvcore'),
  );
  expect(
    ours.length,
    'exactly one WebPage block naming kvCORE expected on /compare/kvcore',
  ).toBe(1);

  const wp = ours[0].data;
  expect(typeof wp.name).toBe('string');
  expect((wp.name ?? '').toLowerCase()).toMatch(/kvcore/);
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
// this page's JSON-LD (filtered to only BreadcrumbList + WebPage blocks
// THIS page emits, per the 2026-09-08 em-dash-JSON-LD-block-filter
// lesson - the homepage Organization block from index.html carries a
// legitimate em-dash and must not be flagged here).
test('renders light/dark on 375px mobile and has no em-dash', async ({ page }) => {
  const errors = await gotoKvCore(page);

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
  // Per the 2026-09-08 lesson: filter to the two @type values THIS page
  // emits BEFORE iterating. Never `for (const b of allBlocks)`.
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

// Box 6: three demo CTAs route to registered /realestate/demo/* routes.
// Strategy-call CTA opens calendly with target=_blank and
// rel="noopener noreferrer". Each demo CTA fires a trackCTAClick with a
// comparekvcore_ event_label.
test('three demo CTAs route to realestate demos; strategy CTA opens calendly safely', async ({
  page,
}) => {
  const errors = await gotoKvCore(page);

  const demoCTAs = page.locator('[data-testid="comparekvcore-demo-cta"]');
  await expect(demoCTAs).toHaveCount(3);

  const hrefs = await demoCTAs.evaluateAll((nodes) =>
    nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
  );
  const expectedDemoRoutes = [
    '/realestate/demo/lead-responder',
    '/realestate/demo/property-negotiator',
    '/realestate/demo/voice-negotiator',
  ];
  for (const href of hrefs) {
    expect(href, `demo CTA href ${href} must be in ROUTES`).toMatch(/^\/realestate\/demo\//);
    expect(STATIC_ROUTES.has(href), `${href} not in ROUTES`).toBe(true);
  }
  for (const target of expectedDemoRoutes) {
    expect(hrefs, `expected one CTA pointing at ${target}`).toContain(target);
  }

  const strategyCTA = page
    .locator('a[href*="calendly.com/mutaaf"]')
    .first();
  await expect(strategyCTA).toBeVisible();
  expect(await strategyCTA.getAttribute('target')).toBe('_blank');
  const rel = (await strategyCTA.getAttribute('rel')) ?? '';
  expect(rel).toContain('noopener');
  expect(rel).toContain('noreferrer');

  // Analytics: stub gtag and click the first demo CTA; assert at least
  // one event_label contains the "comparekvcore_" prefix.
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
    labels.some((l) => /comparekvcore_/i.test(l)),
    `expected at least one cta_click event_label to contain "comparekvcore_", got: ${labels.join(' | ')}`,
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

  const errors = await gotoKvCore(page);

  expect(
    apiCalls,
    `the kvCORE comparison page should make no first-party /api/ call:\n${apiCalls.join('\n')}`,
  ).toEqual([]);
  expect(errors).toEqual([]);
});

// Box 8: shared Navbar + Footer; route present in sitemap.xml.
test('renders Navbar + Footer and appears in sitemap.xml', async ({ page }) => {
  const errors = await gotoKvCore(page);

  await expect(page.locator('nav').first()).toBeVisible();
  await expect(page.locator('footer').first()).toBeVisible();

  const sitemap = await page.goto('/sitemap.xml', { waitUntil: 'domcontentloaded' });
  expect(sitemap, 'no response for /sitemap.xml').not.toBeNull();
  expect(sitemap!.status()).toBeLessThan(400);
  const xml = await sitemap!.text();
  expect(xml).toContain('https://digitalcraftai.com/compare/kvcore');

  expect(errors).toEqual([]);
});

// Box 9: COMPARE_ENTRIES has an entry with id "kvcore" whose path is
// /compare/kvcore and whose tagline contains no em-dash.
test('COMPARE_ENTRIES contains the kvcore entry', () => {
  const entry = COMPARE_ENTRIES.find((e) => e.id === 'kvcore');
  expect(entry, 'COMPARE_ENTRIES must contain a kvcore entry').toBeDefined();
  expect(entry?.tool).toBe('kvCORE');
  expect(entry?.path).toBe('/compare/kvcore');
  expect(entry?.tagline ?? '').not.toContain(EM_DASH);
  expect((entry?.tagline ?? '').length).toBeGreaterThan(20);
});

// Box 10: Sibling-hub regression. Navigate to /compare and prove the
// additive edit widened both the hub render AND the ItemList JSON-LD.
// Per the 2026-09-08 sibling-hub SPA-navigation lesson: poll until at
// least one JSON-LD block's `name` equals the hub's expected
// CollectionPage.name before reading the ItemList, so an in-flight
// Helmet head swap can't return the previous hub's blocks.
test('sibling-hub regression: /compare card count and ItemList reflect kvcore entry', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });

  const response = await page.goto('/compare', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /compare').not.toBeNull();
  expect(response!.status()).toBeLessThan(400);

  await expect(page.locator('[role="status"][aria-label="Loading"]')).toHaveCount(0, {
    timeout: 10_000,
  });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });

  // Poll until the hub's OWN CollectionPage block is present (name
  // equals the expected hub name), per the 2026-09-08 sibling-hub
  // lesson. Never read on "count > 0" alone during an SPA transition.
  await expect
    .poll(
      async () => {
        const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
          nodes.map((n) => n.textContent ?? ''),
        );
        const names: string[] = [];
        for (const raw of raws) {
          try {
            const parsed = JSON.parse(raw) as { '@type'?: unknown; name?: unknown };
            if (
              parsed &&
              typeof parsed === 'object' &&
              parsed['@type'] === 'CollectionPage' &&
              typeof parsed.name === 'string'
            ) {
              names.push(parsed.name);
            }
          } catch {
            // ignore malformed blocks during in-flight swap
          }
        }
        return names;
      },
      { timeout: 10_000 },
    )
    .toEqual(expect.arrayContaining([HUB_COLLECTIONPAGE_NAME]));

  // (a) hub card count equals COMPARE_ENTRIES.length (auto-widened by
  // appending the kvcore entry).
  const cards = page.locator('[data-testid="compare-hub-card"]');
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBe(COMPARE_ENTRIES.length);

  // (b) a card whose visible text names "kvCORE" is present.
  const kvcoreCard = page
    .locator('[data-testid="compare-hub-card"]')
    .filter({ hasText: 'kvCORE' });
  await expect(kvcoreCard).toHaveCount(1);
  const kvcoreCardHref = await kvcoreCard.getAttribute('href');
  expect(kvcoreCardHref).toBe('/compare/kvcore');

  // (c) the hub's ItemList JSON-LD numberOfItems equals
  // COMPARE_ENTRIES.length. Read AFTER the CollectionPage-name poll has
  // resolved so the DOM is in a settled post-swap state.
  const blocks = await readJsonLdBlocks(page);
  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  const ourHubCollection = collections.find((c) => c.data.name === HUB_COLLECTIONPAGE_NAME);
  expect(
    ourHubCollection,
    'sibling-hub regression must find the CollectionPage block for the /compare hub',
  ).toBeDefined();

  const lists = blocks.filter((b): b is { raw: string; data: ItemList } =>
    isItemList(b.data),
  );
  expect(lists.length).toBeGreaterThanOrEqual(1);
  const hubList = lists.find(
    (l) => (l.data.itemListElement ?? []).length === COMPARE_ENTRIES.length,
  );
  expect(
    hubList,
    'the hub ItemList itemListElement count must equal COMPARE_ENTRIES.length',
  ).toBeDefined();
  expect(hubList!.data.numberOfItems).toBe(COMPARE_ENTRIES.length);

  const kvcoreItem = (hubList!.data.itemListElement ?? []).find(
    (it) => (it.name ?? '').toLowerCase().includes('kvcore'),
  );
  expect(
    kvcoreItem,
    'ItemList must include a ListItem naming kvCORE',
  ).toBeDefined();
  expect(kvcoreItem?.url).toBe(`${ORIGIN}/compare/kvcore`);

  expect(errors).toEqual([]);
});
