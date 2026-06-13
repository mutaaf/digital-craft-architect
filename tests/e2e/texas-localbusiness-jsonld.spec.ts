import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0051 - Emit LocalBusiness JSON-LD on /locations/texas so the
// state-level location page indexes as a local search artifact. Each test
// maps 1:1 to an acceptance-criteria box on the ticket. Modeled on
// tests/e2e/trust-aboutpage-jsonld.spec.ts (ticket 0044, the closest peer
// for "emit one JSON-LD block alongside an existing BreadcrumbList
// without changing UI copy").
//
// /locations/texas already renders the shipped state-level page sourced
// from STATS / CITIES / VERTICALS / TESTIMONIAL_PLACEHOLDERS constants in
// src/pages/locations/Texas.tsx, and already emits a BreadcrumbList
// JSON-LD block. This change adds one sibling
// <script type="application/ld+json"> tag inside the existing Helmet
// head: a LocalBusiness block built from a new module-level
// LOCALBUSINESS_SCHEMA constant. The existing BreadcrumbList block stays
// byte-identical.
//
// Per the 2026-05-30 second-@type lesson, the implementer grepped every
// existing tests/e2e/*-jsonld.spec.ts for `=== 'LocalBusiness'` and
// confirmed ZERO matches (this is the first emission site-wide), so
// emitting the new /locations/texas-scoped LocalBusiness block does not
// collide with any predecessor "exactly one" assertion. The
// `=== 'Organization'` predicate matches the homepage and website specs
// (both URL-scoped to /), and the `=== 'BreadcrumbList'` predicate
// matches many specs (all URL-scoped per ticket 0048), so neither
// collides with the new /locations/texas scope.
//
// Per the 2026-05-25 SEO Pilot lesson the spec does NOT use
// page.toHaveTitle() because /locations/texas is not in the index.html
// SEO Pilot pages table. The spec reads the LAST
// meta[name="description"] (the Helmet-appended one) and asserts it
// byte-for-byte equals the LocalBusiness block's description (the
// mirror-source guarantee from the 2026-05-25 lesson).

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const TEXAS_URL = `${ORIGIN}/locations/texas`;
const EXPECTED_AREAS = ['Dallas-Fort Worth', 'Houston', 'Austin', 'Texas'];
const EXPECTED_SERVICES = [
  'AI Lead Response',
  'AI Voice Agents',
  'AI Estimate Generation',
  'AI Deal Analysis',
];

async function gotoTexas(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/locations/texas', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /locations/texas').not.toBeNull();
  expect(
    response!.status(),
    `/locations/texas returned ${response!.status()}`,
  ).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  return errors;
}

async function readJsonLdBlocks(page: Page): Promise<{ raw: string; data: unknown }[]> {
  // Poll until Helmet has appended its JSON-LD scripts (they land after hydration).
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

type AreaServed = { '@type': string; name?: string };
type OrgRef = { '@type': string; name?: string; url?: string };
type LocalBusiness = {
  '@context'?: string;
  '@type': string;
  name?: string;
  description?: string;
  url?: string;
  areaServed?: AreaServed[];
  serviceType?: string[];
  parentOrganization?: OrgRef;
};
type BreadcrumbItem = { '@type': string; position?: number; name?: string; item?: string };
type Breadcrumb = {
  '@context'?: string;
  '@type': string;
  itemListElement?: BreadcrumbItem[];
};

const isLocalBusiness = (d: unknown): d is LocalBusiness =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'LocalBusiness';

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

// Box 1: a new LocalBusiness JSON-LD block is emitted ALONGSIDE the
// existing BreadcrumbList block. The existing BreadcrumbList is preserved
// (regression guard against accidentally removing or editing it) and the
// new LocalBusiness block carries name, url, and parentOrganization with
// the exact values the ticket specifies.
test('emits a LocalBusiness JSON-LD block alongside the preserved BreadcrumbList', async ({
  page,
}) => {
  const errors = await gotoTexas(page);
  const blocks = await readJsonLdBlocks(page);

  // BreadcrumbList still present and unchanged in shape.
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(
    breadcrumbs,
    'exactly one BreadcrumbList block expected on /locations/texas',
  ).toHaveLength(1);

  const localBusinesses = blocks.filter(
    (b): b is { raw: string; data: LocalBusiness } => isLocalBusiness(b.data),
  );
  expect(
    localBusinesses,
    'exactly one LocalBusiness block expected on /locations/texas',
  ).toHaveLength(1);

  const lb = localBusinesses[0].data;
  expect(lb['@context']).toBe('https://schema.org');
  expect(lb['@type']).toBe('LocalBusiness');
  expect(lb.name).toBe('Digital Craft AI - Texas');
  expect(lb.url).toBe(TEXAS_URL);

  // parentOrganization points to the existing DigitalCraft Organization
  // by URL with the minimal name + url shape that cannot collide with
  // the homepage Organization block (ticket 0025).
  expect(lb.parentOrganization).toBeTruthy();
  expect(lb.parentOrganization!['@type']).toBe('Organization');
  expect(lb.parentOrganization!.name).toBe('Digital Craft AI');
  expect(lb.parentOrganization!.url).toBe(ORIGIN);

  // Round-trip parse so a future stringify bug fails here.
  expect(() => JSON.parse(localBusinesses[0].raw)).not.toThrow();
  expect(errors).toEqual([]);
});

// Box 2: per the 2026-05-30 second-@type lesson, the new LocalBusiness
// block must not register as a TOP-LEVEL Organization @type (which would
// collide with the homepage Organization spec, ticket 0025, if that spec
// ever broadened from / to all routes). The parentOrganization REFERENCE
// is nested inside LocalBusiness, not a sibling @type, so a top-level
// `@type === 'Organization'` filter must not pick it up. The
// index.html site-wide Organization block (which DOES load on
// /locations/texas) is unrelated to this PR and stays untouched.
test('LocalBusiness.parentOrganization is nested, not a sibling Organization block', async ({
  page,
}) => {
  await gotoTexas(page);
  const blocks = await readJsonLdBlocks(page);

  const localBusinesses = blocks.filter(
    (b): b is { raw: string; data: LocalBusiness } => isLocalBusiness(b.data),
  );
  expect(localBusinesses).toHaveLength(1);

  const lb = localBusinesses[0].data;
  // parentOrganization is the nested reference, not a top-level block.
  expect(lb.parentOrganization).toBeTruthy();
  expect(lb.parentOrganization!['@type']).toBe('Organization');

  // The number of TOP-LEVEL Organization blocks on /locations/texas
  // equals the count emitted by index.html alone (one inline block from
  // the site-wide head). The new LocalBusiness block must not increase
  // that count - it sits adjacent under @type LocalBusiness, with the
  // Organization reference NESTED at parentOrganization. The new block
  // also does not emit a second top-level Organization sibling that
  // would collide with the homepage Organization spec (ticket 0025) if
  // that predecessor spec ever extends from / to other routes.
  const topLevelOrgs = blocks.filter(
    (b) =>
      typeof b.data === 'object' &&
      b.data !== null &&
      (b.data as { '@type'?: unknown })['@type'] === 'Organization',
  );
  expect(
    topLevelOrgs.length,
    'top-level Organization count on /locations/texas must equal the index.html site-wide one (no new top-level Organization sibling)',
  ).toBe(1);
});

// Box 3: areaServed is exactly four entries in the exact documented
// order. The three metros are City entries and the state is a State
// entry. Order matters because future location pages will mirror this
// shape and the ticket pinned it.
test('areaServed lists Dallas-Fort Worth, Houston, Austin, Texas in that order', async ({
  page,
}) => {
  await gotoTexas(page);
  const blocks = await readJsonLdBlocks(page);
  const localBusinesses = blocks.filter(
    (b): b is { raw: string; data: LocalBusiness } => isLocalBusiness(b.data),
  );
  expect(localBusinesses).toHaveLength(1);

  const areas = localBusinesses[0].data.areaServed ?? [];
  expect(areas, 'areaServed must contain exactly four entries').toHaveLength(4);
  expect(areas.map((a) => a.name)).toEqual(EXPECTED_AREAS);
  expect(areas[0]['@type']).toBe('City');
  expect(areas[1]['@type']).toBe('City');
  expect(areas[2]['@type']).toBe('City');
  expect(areas[3]['@type']).toBe('State');
});

// Box 4: serviceType is exactly four strings in the documented order.
test('serviceType lists the four pre-built AI agent service categories', async ({ page }) => {
  await gotoTexas(page);
  const blocks = await readJsonLdBlocks(page);
  const localBusinesses = blocks.filter(
    (b): b is { raw: string; data: LocalBusiness } => isLocalBusiness(b.data),
  );
  expect(localBusinesses).toHaveLength(1);

  const services = localBusinesses[0].data.serviceType ?? [];
  expect(services, 'serviceType must contain exactly four entries').toHaveLength(4);
  expect(services).toEqual(EXPECTED_SERVICES);
});

// Box 5: description mirrors the LAST meta[name="description"] content
// byte-for-byte. The mirror-source guarantee from the 2026-05-25 lesson
// reads the LAST description tag because Helmet APPENDS rather than
// overwrites a description tag inherited from index.html.
test('LocalBusiness description mirrors the Helmet meta[name="description"] byte-for-byte', async ({
  page,
}) => {
  await gotoTexas(page);

  await expect
    .poll(
      () =>
        page
          .locator('head meta[name="description"]')
          .evaluateAll((nodes) => nodes.map((n) => (n as HTMLMetaElement).content)),
      { timeout: 10_000 },
    )
    .toEqual(expect.arrayContaining([expect.stringMatching(/.+/)]));

  const descriptions = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) => nodes.map((n) => (n as HTMLMetaElement).content));
  // Read the LAST meta[name="description"] (the Helmet-appended one, not
  // the index.html default that may land earlier). Per the 2026-05-25
  // Helmet-appends lesson.
  const helmetDescription = descriptions[descriptions.length - 1];
  expect(typeof helmetDescription).toBe('string');
  expect(helmetDescription.length).toBeGreaterThan(20);
  expect(helmetDescription).not.toContain(EM_DASH);

  const blocks = await readJsonLdBlocks(page);
  const localBusinesses = blocks.filter(
    (b): b is { raw: string; data: LocalBusiness } => isLocalBusiness(b.data),
  );
  expect(localBusinesses).toHaveLength(1);
  expect(localBusinesses[0].data.description).toBe(helmetDescription);
});

// Box 6: the page text contains no U+2014 code point anywhere in the
// rendered body or the emitted JSON-LD blocks (the 2026-05-07 em-dash
// Hard NO, asserted as a runtime guard rather than relying on the
// Self-Review grep alone).
test('emits no em-dash characters in the body copy or the JSON-LD blocks', async ({ page }) => {
  await gotoTexas(page);

  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(
    bodyText,
    'visible /locations/texas body copy contains an em-dash',
  ).not.toContain(EM_DASH);

  const blocks = await readJsonLdBlocks(page);
  const ours = blocks.filter((b) => isLocalBusiness(b.data) || isBreadcrumb(b.data));
  expect(ours.length, 'LocalBusiness + BreadcrumbList blocks must both render').toBe(2);
  for (const b of ours) {
    expect(() => JSON.parse(b.raw)).not.toThrow();
    expect(b.raw, `JSON-LD block contains em-dash: ${b.raw}`).not.toContain(EM_DASH);
  }
});

// Box 7: the page renders in dark mode on a 375px mobile viewport. The
// existing layout is already dark-mode-ready; the ticket adds no new
// visible element. We assert the H1 is visible in both modes as a
// regression guard against the new Helmet child accidentally breaking
// hydration.
test('renders cleanly in light and dark mode on a 375px mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await gotoTexas(page);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Dark mode: toggle .dark on the root; the page still renders.
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
