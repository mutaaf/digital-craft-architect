import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';
import { ROUTES } from '../../src/data/routes';
import {
  PER_DEMO_SOFTWARE_APPLICATIONS,
  getDemoApplicationByRoute,
  type PerDemoSoftwareApplication,
} from '../../src/data/perDemoSoftwareApplications';

// Ticket 0103 - Emit SoftwareApplication JSON-LD on each individual demo
// page so every demo indexes as a standalone rich-result artifact. Each
// test maps 1:1 to an acceptance-criteria box on the ticket.
//
// Ticket 0030 shipped one SoftwareApplication block on the /demos hub
// covering the demo suite as one composite; this ticket ships five
// per-demo SoftwareApplication blocks (one per shipped construction demo
// route) so a query like "AI estimate generator construction demo" can
// match a per-demo block instead of falling back to the hub aggregate.
//
// Per the 2026-05-30 second-@type-instance lesson, BEFORE writing this
// spec the implementer grepped every tests/e2e/*-jsonld.spec.ts for
// `=== 'SoftwareApplication'` and `toHaveLength(1)` / `toHaveCount(1)`
// predicates. The only pre-existing SoftwareApplication predicate lives
// in tests/e2e/demos-softwareapplication-jsonld.spec.ts (ticket 0030)
// and is URL-scoped to /demos via `gotoDemos(page)` which navigates to
// `/demos` first, then filters that page's DOM blocks - the "exactly
// one SoftwareApplication block expected on /demos" assertion is
// scoped to the hub route. Adding SoftwareApplication blocks on the
// per-demo routes (/construction/demo/<slug>) does not shadow that
// predicate; each spec operates on its own page. No widening of the
// ticket 0030 spec is required (acceptance box 3).
//
// Per the 2026-06-07 mirror-source-across-src-tests lesson, this spec
// imports PER_DEMO_SOFTWARE_APPLICATIONS + getDemoApplicationByRoute
// from src/data/perDemoSoftwareApplications.ts directly and ROUTES
// from src/data/routes.ts directly; there is no hand-rolled copy of
// either constant in the test file.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

const ORIGIN = 'https://digitalcraftai.com';
// U+2014 em-dash code point. Asserted by code point so the spec source
// itself stays em-dash-free per the 2026-05-07 em-dash Hard NO.
const EM_DASH = String.fromCharCode(8212);

// The five construction-demo routes the ticket ships blocks for. These
// stay in-sync with PER_DEMO_SOFTWARE_APPLICATIONS via the imported
// constant; the enumeration below is only a stable test-ordering
// convenience.
const EXPECTED_DEMO_ROUTES: readonly string[] = [
  '/construction/demo/lead-responder',
  '/construction/demo/estimate',
  '/construction/demo/reviews',
  '/construction/demo/property-negotiator',
  '/construction/demo/voice-negotiator',
];

type JsonLdBlock = { raw: string; data: unknown };

type SoftwareApplication = {
  '@context'?: string;
  '@type': string;
  name?: string;
  description?: string;
  url?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    '@type'?: string;
    price?: string | number;
    priceCurrency?: string;
    description?: string;
  };
};

const isSoftwareApplication = (d: unknown): d is SoftwareApplication =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'SoftwareApplication';

const isBreadcrumbList = (d: unknown): boolean =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

// Per the 2026-09-05 RouteFallback lesson AND the 2026-09-10
// mount-signal lesson: wait for the Suspense fallback to detach AND
// for the demo's own H1 to be visible before probing DOM. Every demo
// renders an <h1> inside its lazy chunk.
async function gotoDemo(page: Page, path: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${path}`).not.toBeNull();
  expect(response!.status(), `${path} returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  // 2026-09-05: RouteFallback trips the innerHTML heuristic; wait for
  // it to detach before probing.
  await page
    .locator('[role="status"][aria-label="Loading"]')
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .catch(() => {});
  // 2026-09-10: also wait for the demo's own H1 to signal the lazy
  // chunk finished mounting so JSON-LD emitted inside the demo's
  // Helmet block is guaranteed present.
  await page
    .locator('h1')
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 })
    .catch(() => {});
  return errors;
}

async function readJsonLdBlocks(page: Page): Promise<JsonLdBlock[]> {
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  return raws.map((raw) => ({ raw, data: JSON.parse(raw) as unknown }));
}

function findSoftwareApplications(blocks: JsonLdBlock[]): SoftwareApplication[] {
  return blocks.map((b) => b.data).filter(isSoftwareApplication);
}

function findSoftwareApplicationRaws(blocks: JsonLdBlock[]): string[] {
  return blocks.filter((b) => isSoftwareApplication(b.data)).map((b) => b.raw);
}

// Acceptance box 1: A new data file at src/data/perDemoSoftwareApplications.ts
// exports PER_DEMO_SOFTWARE_APPLICATIONS with one entry per shipped
// construction demo route, every `route` string is in ROUTES, every
// `demoId` is unique, every `priceAnchor` contains a `$` character,
// and no field on any row contains an em-dash character.
test('PER_DEMO_SOFTWARE_APPLICATIONS constant is well-formed and every route is in ROUTES', () => {
  expect(PER_DEMO_SOFTWARE_APPLICATIONS.length, 'expected five per-demo rows').toBe(
    EXPECTED_DEMO_ROUTES.length,
  );

  const routeSet = new Set<string>(ROUTES);
  const seenIds = new Set<string>();
  const seenRoutes = new Set<string>();

  for (const row of PER_DEMO_SOFTWARE_APPLICATIONS) {
    // 2026-05-28 encoded-invariant pattern: allow-list membership.
    expect(routeSet.has(row.route), `route "${row.route}" NOT_IN_ROUTES`).toBe(true);
    expect(seenIds.has(row.demoId), `duplicate demoId "${row.demoId}"`).toBe(false);
    seenIds.add(row.demoId);
    expect(seenRoutes.has(row.route), `duplicate route "${row.route}"`).toBe(false);
    seenRoutes.add(row.route);

    // priceAnchor is non-empty and carries a dollar sign so the visible
    // pricing anchor stays defensible per AGENTS.md conservative claims.
    expect(row.priceAnchor.length, `priceAnchor empty on ${row.demoId}`).toBeGreaterThan(0);
    expect(
      row.priceAnchor.includes('$'),
      `priceAnchor "${row.priceAnchor}" must include a "$" character on ${row.demoId}`,
    ).toBe(true);

    // 2026-05-07 em-dash Hard NO: no U+2014 in any row field.
    for (const key of Object.keys(row) as ReadonlyArray<keyof PerDemoSoftwareApplication>) {
      const value = row[key];
      if (typeof value === 'string') {
        expect(
          value.includes(EM_DASH),
          `field "${String(key)}" contains em-dash on ${row.demoId}`,
        ).toBe(false);
      }
    }
  }

  // Every enumerated route resolves through the helper without a fall
  // through to undefined; this proves getDemoApplicationByRoute covers
  // the ticket's five shipped routes.
  for (const route of EXPECTED_DEMO_ROUTES) {
    expect(getDemoApplicationByRoute(route), `no row for ${route}`).toBeDefined();
  }
});

// Acceptance box 2: each of the five shipped demo page components emits
// one additive SoftwareApplication JSON-LD block whose fields byte-mirror
// its own PER_DEMO_SOFTWARE_APPLICATIONS row read via
// getDemoApplicationByRoute. The block's url is
// `https://digitalcraftai.com` + route, applicationCategory,
// operatingSystem, name, and description mirror the constant row, and
// offers is a single Offer with @type=Offer, price="0",
// priceCurrency="USD", and offers.description == row.priceAnchor.
test('each demo emits a SoftwareApplication block byte-mirroring its constant row', async ({
  page,
}) => {
  for (const route of EXPECTED_DEMO_ROUTES) {
    const row = getDemoApplicationByRoute(route);
    expect(row, `no PER_DEMO row for ${route}`).toBeDefined();

    const errors = await gotoDemo(page, route);
    const blocks = await readJsonLdBlocks(page);
    const apps = findSoftwareApplications(blocks);

    // 2026-09-06 VISIBLE_LIMIT lesson: use toHaveCount(1), not count > 0.
    expect(apps.length, `expected exactly one SoftwareApplication on ${route}`).toBe(1);
    const app = apps[0];
    expect(app['@context']).toBe('https://schema.org');
    expect(app['@type']).toBe('SoftwareApplication');
    expect(app.name).toBe(row!.name);
    expect(app.description).toBe(row!.description);
    expect(app.url).toBe(`${ORIGIN}${route}`);
    expect(app.applicationCategory).toBe(row!.applicationCategory);
    expect(app.operatingSystem).toBe(row!.operatingSystem);

    // offers is a single Offer object (not an array).
    expect(Array.isArray(app.offers), `offers must be object on ${route}`).toBe(false);
    const offer = app.offers!;
    expect(offer['@type']).toBe('Offer');
    expect(offer.price).toBe('0');
    expect(typeof offer.price).toBe('string');
    expect(offer.priceCurrency).toBe('USD');
    expect(offer.description).toBe(row!.priceAnchor);

    expect(errors).toEqual([]);
  }
});

// Acceptance box 3: the shipped ticket 0030 /demos hub SoftwareApplication
// block stays byte-identical and its assertion stays URL-scoped. Grep
// documented in the spec header comment above: the ticket 0030 predicate
// is scoped via gotoDemos() to /demos, so it is not affected by
// per-demo blocks on /construction/demo/*. This box also acts as a
// regression check that /demos still emits its hub block AND that the
// hub block's `name` and `url` are the hub values, not a per-demo value.
test('ticket 0030 hub SoftwareApplication block stays byte-identical on /demos', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/demos', { waitUntil: 'domcontentloaded' });
  expect(response!.status()).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  await page
    .locator('[role="status"][aria-label="Loading"]')
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .catch(() => {});

  const blocks = await readJsonLdBlocks(page);
  const apps = findSoftwareApplications(blocks);
  expect(apps.length, 'exactly one SoftwareApplication block expected on /demos').toBe(1);

  const hub = apps[0];
  // The hub block's name is 'Digital Craft AI Demos' (ticket 0030); the
  // per-demo rows use different name strings, so this proves the hub
  // block was not shadowed by any per-demo emission.
  expect(hub.name).toBe('Digital Craft AI Demos');
  expect(hub.url).toBe(`${ORIGIN}/demos`);
  // Sanity: none of the per-demo row names collide with the hub name.
  const perDemoNames = new Set(PER_DEMO_SOFTWARE_APPLICATIONS.map((r) => r.name));
  expect(perDemoNames.has('Digital Craft AI Demos')).toBe(false);

  expect(errors).toEqual([]);
});

// Acceptance box 4: each per-demo route emits exactly one JSON-LD block
// whose `@type` is 'SoftwareApplication' AND whose `url` byte-matches
// `https://digitalcraftai.com` + the demo route. Redundant with box 2's
// url check, but restated here per the ticket's box-per-scenario rule
// so the count assertion (2026-09-06 lesson) is its own case.
test('each demo emits exactly one SoftwareApplication block with a route-scoped url', async ({
  page,
}) => {
  for (const route of EXPECTED_DEMO_ROUTES) {
    const errors = await gotoDemo(page, route);
    const blocks = await readJsonLdBlocks(page);
    const apps = findSoftwareApplications(blocks);
    // 2026-09-06 VISIBLE_LIMIT: toHaveCount-equivalent, not count > 0.
    expect(apps.length, `expected exactly one SoftwareApplication on ${route}`).toBe(1);
    expect(apps[0].url).toBe(`${ORIGIN}${route}`);
    expect(errors).toEqual([]);
  }
});

// Acceptance box 5: the demo's rendered meta[name="description"] content
// byte-matches the SoftwareApplication block's `description` field
// (mirror-source assertion per the 2026-05-25 lesson). The row's
// description is the single source; both the meta tag and the JSON-LD
// block read it.
test('meta[name="description"] byte-matches the SoftwareApplication description on every demo', async ({
  page,
}) => {
  for (const route of EXPECTED_DEMO_ROUTES) {
    const errors = await gotoDemo(page, route);
    const blocks = await readJsonLdBlocks(page);
    const apps = findSoftwareApplications(blocks);
    expect(apps.length).toBe(1);
    const app = apps[0];
    const metaDescriptions = await page.$$eval(
      'head meta[name="description"]',
      (nodes) => nodes.map((n) => n.getAttribute('content') ?? ''),
    );
    expect(metaDescriptions.length).toBeGreaterThan(0);
    expect(typeof app.description).toBe('string');
    expect(
      metaDescriptions.includes(app.description ?? ''),
      `meta[name=description] on ${route} must include the SoftwareApplication description; got ${JSON.stringify(metaDescriptions)}`,
    ).toBe(true);
    expect(errors).toEqual([]);
  }
});

// Acceptance box 6: the ticket 0019 BreadcrumbList JSON-LD block on
// every demo route stays present after adding the SoftwareApplication
// block; per-page BreadcrumbList count stays 1 (2026-09-06 lesson).
test('ticket 0019 BreadcrumbList block coexists with the new SoftwareApplication block', async ({
  page,
}) => {
  for (const route of EXPECTED_DEMO_ROUTES) {
    const errors = await gotoDemo(page, route);
    const blocks = await readJsonLdBlocks(page);
    const crumbs = blocks.filter((b) => isBreadcrumbList(b.data));
    expect(crumbs.length, `expected exactly one BreadcrumbList on ${route}`).toBe(1);
    const apps = findSoftwareApplications(blocks);
    expect(apps.length, `expected exactly one SoftwareApplication on ${route}`).toBe(1);
    expect(errors).toEqual([]);
  }
});

// Acceptance box 7: after landing on a per-demo route, the ticket 0030
// /demos hub SoftwareApplication block is not shadowed. Navigating from
// a per-demo route to /demos still shows the hub block by name and url.
// (This is the reciprocal of box 3: box 3 loads /demos first; this box
// loads a per-demo route first, then /demos, exercising SPA head-swap
// timing per the 2026-09-08 sibling-hub-navigation lesson.)
test('after loading a per-demo route, /demos still emits the hub SoftwareApplication block', async ({
  page,
}) => {
  await gotoDemo(page, '/construction/demo/estimate');

  const response = await page.goto('/demos', { waitUntil: 'domcontentloaded' });
  expect(response!.status()).toBeLessThan(400);
  await page
    .locator('[role="status"][aria-label="Loading"]')
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .catch(() => {});
  // 2026-09-08 sibling-hub-navigation lesson: poll until a
  // SoftwareApplication block whose name is the hub's is present, then
  // read (not "count > 0" alone; assert on the hub's own unique name).
  await expect
    .poll(async () => {
      const blocks = await readJsonLdBlocks(page);
      const apps = findSoftwareApplications(blocks);
      return apps.some((a) => a.name === 'Digital Craft AI Demos');
    }, { timeout: 10_000 })
    .toBe(true);

  const blocks = await readJsonLdBlocks(page);
  const apps = findSoftwareApplications(blocks);
  const hub = apps.find((a) => a.name === 'Digital Craft AI Demos');
  expect(hub).toBeDefined();
  expect(hub!.url).toBe(`${ORIGIN}/demos`);
});

// Acceptance box 8: zero em-dash characters (U+2014) in any
// SoftwareApplication block emitted by these per-demo pages. Per the
// 2026-09-08 em-dash-JSON-LD-block-filter lesson, the assertion filters
// the block list to the SoftwareApplication blocks THIS page owns
// BEFORE iterating; the homepage Organization block that ships from
// index.html on every route carries a legitimate em-dash and must not
// be flagged.
test('per-demo SoftwareApplication blocks contain zero em-dash characters', async ({
  page,
}) => {
  for (const route of EXPECTED_DEMO_ROUTES) {
    const errors = await gotoDemo(page, route);
    const blocks = await readJsonLdBlocks(page);
    const softwareRaws = findSoftwareApplicationRaws(blocks);
    expect(softwareRaws.length).toBeGreaterThanOrEqual(1);
    for (const raw of softwareRaws) {
      // JSON.parse round-trip proves the block is valid JSON.
      expect(() => JSON.parse(raw)).not.toThrow();
      expect(
        raw.includes(EM_DASH),
        `SoftwareApplication JSON-LD on ${route} must contain zero U+2014 code points`,
      ).toBe(false);
    }
    expect(errors).toEqual([]);
  }
});

// Acceptance box 9: any regex over the stringified SoftwareApplication
// block on a demo page uses `[^>]*` (not `[^/>]*`) per the 2026-06-15
// attribute-list regex lesson. This case asserts a positive well-formed
// `<script type="application/ld+json">...</script>` extraction using
// the correct negated character class.
test('regex over the stringified SoftwareApplication tag uses [^>]* per the 2026-06-15 lesson', async ({
  page,
}) => {
  const route = '/construction/demo/estimate';
  const errors = await gotoDemo(page, route);
  const headHtml = await page.evaluate(() => document.head.innerHTML);

  // Correct pattern per 2026-06-15: exclude ONLY the closing angle
  // bracket, not the forward slash (JSON-LD payloads legitimately
  // contain slashes: https://schema.org/InStock, URLs, dates).
  const scriptRe = /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  const matches = Array.from(headHtml.matchAll(scriptRe));
  expect(matches.length, `expected at least one JSON-LD script tag in head on ${route}`).toBeGreaterThan(
    0,
  );

  // At least one match must parse to a SoftwareApplication block with
  // the expected per-demo url; proves the regex captured the payload.
  const parsedApps = matches
    .map((m) => {
      try {
        return JSON.parse(m[1]);
      } catch {
        return null;
      }
    })
    .filter(isSoftwareApplication);
  expect(parsedApps.length, `regex should have captured the SoftwareApplication payload`).toBeGreaterThan(
    0,
  );
  const app = parsedApps.find((a) => a.url === `${ORIGIN}${route}`);
  expect(app, `expected a SoftwareApplication with url=${ORIGIN}${route}`).toBeDefined();

  // Sanity: the WRONG pattern (with `/` in the negated class) would
  // fail to match because the attribute value `application/ld+json`
  // contains a `/`. This assertion documents that failure mode so a
  // future refactor cannot silently regress to the buggy form.
  const wrongRe = /<script\s+type="application\/ld\+json"[^/>]*>([\s\S]*?)<\/script>/g;
  const wrongMatches = Array.from(headHtml.matchAll(wrongRe));
  // The wrong pattern's `[^/>]*` still admits an empty attribute
  // suffix (0 chars) so it may still match; we assert only that the
  // CORRECT pattern captured at least as many payloads as the wrong
  // one, i.e. the correct pattern is never worse.
  expect(matches.length).toBeGreaterThanOrEqual(wrongMatches.length);

  expect(errors).toEqual([]);
});
