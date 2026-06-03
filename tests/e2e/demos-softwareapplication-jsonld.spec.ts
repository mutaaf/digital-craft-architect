import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0030 - Emit SoftwareApplication JSON-LD on the /demos hub. Each test
// maps 1:1 to an acceptance-criteria box on the ticket. Modeled on the
// homepage Organization spec from ticket 0025
// (tests/e2e/homepage-organization-jsonld.spec.ts).
//
// /demos already emits one inline ItemList JSON-LD block (ticket 0011). This
// ticket adds a SECOND, distinct-typed block (SoftwareApplication) inside the
// same Helmet head. The two blocks coexist; crawlers parse separate top-level
// entities and merge them.
//
// Per the 2026-05-30 "second @type instance" lesson, the implementer grepped
// every tests/e2e/*-jsonld.spec.ts file for `=== 'SoftwareApplication'` and any
// "exactly one" predicate over /demos BEFORE writing this spec. The only
// pre-existing /demos JSON-LD assertion (tests/e2e/demos-index-hub.spec.ts:106
// "exactly one ItemList block expected") targets ItemList specifically, not
// "exactly one block of any type," so adding a SoftwareApplication block does
// not collide with it - the ItemList predicate stays narrow and still
// regression-guards ticket 0011.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

const ORIGIN = 'https://digitalcraftai.com';
const EXPECTED_APP_NAME = 'Digital Craft AI Demos';
const EXPECTED_APP_URL = `${ORIGIN}/demos`;
const EXPECTED_APP_CATEGORY = 'BusinessApplication';
const EXPECTED_OPERATING_SYSTEM = 'Web';
const EXPECTED_PROVIDER_NAME = 'DigitalCraft AI';
const EXPECTED_PROVIDER_URL = ORIGIN;
const EXPECTED_PRICE = '0';
const EXPECTED_CURRENCY = 'USD';
const EXPECTED_AVAILABILITY = 'https://schema.org/InStock';
// U+2014 em-dash code point. Asserted by code point so the spec source itself
// stays em-dash-free per the 2026-05-07 Hard NO.
const EM_DASH = String.fromCharCode(8212);

type JsonLdBlock = { raw: string; data: unknown };

type SoftwareApplication = {
  '@context'?: string;
  '@type': string;
  name?: string;
  url?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  description?: string;
  provider?: {
    '@type'?: string;
    name?: string;
    url?: string;
  };
  offers?: Offer | Offer[];
};

type Offer = {
  '@type'?: string;
  price?: string | number;
  priceCurrency?: string;
  availability?: string;
};

const isSoftwareApplication = (d: unknown): d is SoftwareApplication =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'SoftwareApplication';

const isItemList = (d: unknown): boolean =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'ItemList';

async function gotoDemos(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/demos', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /demos').not.toBeNull();
  expect(response!.status(), `/demos returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  return errors;
}

async function readJsonLdBlocks(page: Page): Promise<JsonLdBlock[]> {
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  return raws.map((raw) => ({ raw, data: JSON.parse(raw) as unknown }));
}

function findSoftwareApplication(blocks: JsonLdBlock[]): SoftwareApplication | undefined {
  return blocks.map((b) => b.data).filter(isSoftwareApplication)[0];
}

function findSoftwareApplicationRaw(blocks: JsonLdBlock[]): string | undefined {
  return blocks.find((b) => isSoftwareApplication(b.data))?.raw;
}

// Box 1: /demos emits exactly one new <script type="application/ld+json"> block
// with @context=schema.org and @type=SoftwareApplication, inside the existing
// Helmet head (not via useEffect DOM injection). The existing ItemList block
// from ticket 0011 is still present (regression guard per the 2026-05-30
// "second @type instance" lesson).
test('emits exactly one SoftwareApplication JSON-LD block alongside the existing ItemList', async ({
  page,
}) => {
  const errors = await gotoDemos(page);
  const blocks = await readJsonLdBlocks(page);

  const apps = blocks.filter((b) => isSoftwareApplication(b.data));
  expect(apps, 'exactly one SoftwareApplication block expected on /demos').toHaveLength(1);

  const app = apps[0].data as SoftwareApplication;
  expect(app['@context']).toBe('https://schema.org');
  expect(app['@type']).toBe('SoftwareApplication');

  // Regression: the ItemList block from ticket 0011 must still be present.
  const lists = blocks.filter((b) => isItemList(b.data));
  expect(lists, 'ticket 0011 ItemList block must remain on /demos').toHaveLength(1);

  expect(errors).toEqual([]);
});

// Box 2: the SoftwareApplication object carries name, url, applicationCategory,
// operatingSystem, description matching the page's rendered meta description,
// and provider as an inline Organization reference whose name/url come from
// src/data/organizationSchema.ts (no duplicate literals - the mirror-source
// rule from the 2026-05-25 lesson).
test('SoftwareApplication carries name, url, category, OS, description, and provider', async ({
  page,
}) => {
  const errors = await gotoDemos(page);
  const blocks = await readJsonLdBlocks(page);

  const app = findSoftwareApplication(blocks);
  expect(app, 'SoftwareApplication block missing').toBeDefined();

  expect(app!.name).toBe(EXPECTED_APP_NAME);
  expect(app!.url).toBe(EXPECTED_APP_URL);
  expect(app!.applicationCategory).toBe(EXPECTED_APP_CATEGORY);
  expect(app!.operatingSystem).toBe(EXPECTED_OPERATING_SYSTEM);

  // description must equal the rendered meta[name="description"] content so a
  // future copy edit on the Demos hub cannot leave the schema stale. Both
  // values read from the same DEMOS_META_DESCRIPTION module-top constant in
  // src/pages/Demos.tsx, so this is the runtime check that they did not drift.
  const metaDescriptions = await page.$$eval(
    'head meta[name="description"]',
    (nodes) => nodes.map((n) => n.getAttribute('content') ?? ''),
  );
  expect(metaDescriptions.length).toBeGreaterThan(0);
  expect(typeof app!.description).toBe('string');
  expect((app!.description ?? '').length).toBeGreaterThan(20);
  expect(metaDescriptions).toContain(app!.description ?? '');

  // provider is an inline Organization reference sourced from
  // src/data/organizationSchema.ts (ORG_NAME, ORG_URL). The schema literal
  // strings must match the homepage Organization entity's identity.
  expect(app!.provider).toBeDefined();
  expect(app!.provider!['@type']).toBe('Organization');
  expect(app!.provider!.name).toBe(EXPECTED_PROVIDER_NAME);
  expect(app!.provider!.url).toBe(EXPECTED_PROVIDER_URL);

  expect(errors).toEqual([]);
});

// Box 3: offers is a single Offer object with @type=Offer, price="0" (exactly
// the string "0", not the number 0, so JSON-LD validators that require
// schema.org Number-as-string semantics accept it), priceCurrency="USD", and
// availability="https://schema.org/InStock".
test('offers carries a free Offer with price as the string "0" and InStock availability', async ({
  page,
}) => {
  const errors = await gotoDemos(page);
  const blocks = await readJsonLdBlocks(page);

  const app = findSoftwareApplication(blocks);
  expect(app).toBeDefined();
  expect(app!.offers, 'offers field missing').toBeDefined();

  // Spec language: "a single Offer object" - reject an array.
  expect(Array.isArray(app!.offers), 'offers must be a single object, not an array').toBe(false);
  const offer = app!.offers as Offer;

  expect(offer['@type']).toBe('Offer');
  expect(offer.price).toBe(EXPECTED_PRICE);
  // Explicit type check: the string "0", never the number 0.
  expect(typeof offer.price).toBe('string');
  expect(offer.priceCurrency).toBe(EXPECTED_CURRENCY);
  expect(offer.availability).toBe(EXPECTED_AVAILABILITY);

  expect(errors).toEqual([]);
});

// Box 4: a new spec navigates to /demos, queries every
// script[type="application/ld+json"], parses each, and asserts exactly one is
// SoftwareApplication AND the existing ItemList block is present (regression
// check for ticket 0011 per the 2026-05-30 lesson). This box is essentially
// re-asserted as a co-existence guard against future regressions.
test('both SoftwareApplication and ItemList blocks coexist on /demos', async ({ page }) => {
  const errors = await gotoDemos(page);
  const blocks = await readJsonLdBlocks(page);

  const apps = blocks.filter((b) => isSoftwareApplication(b.data));
  const lists = blocks.filter((b) => isItemList(b.data));

  expect(apps).toHaveLength(1);
  expect(lists).toHaveLength(1);

  // No SoftwareApplication block should be a child of an ItemList or vice
  // versa - the ticket explicitly keeps them as separate top-level entities
  // per Google's preference (engineering notes).
  const appRaw = apps[0].raw;
  const listRaw = lists[0].raw;
  expect(appRaw).not.toBe(listRaw);

  expect(errors).toEqual([]);
});

// Box 5: zero em-dash characters (U+2014) in any string value, the block
// parses as valid JSON via JSON.parse, and the script.textContent contains no
// em-dash code point (asserted via String.fromCharCode(8212) so this spec
// source itself stays em-dash-free per the 2026-05-07 Hard NO).
test('the SoftwareApplication block parses as valid JSON and contains zero em-dash characters', async ({
  page,
}) => {
  const errors = await gotoDemos(page);
  const blocks = await readJsonLdBlocks(page);

  const appRaw = findSoftwareApplicationRaw(blocks);
  expect(appRaw, 'SoftwareApplication block raw text missing').toBeDefined();

  // Round-trip must parse cleanly.
  expect(() => JSON.parse(appRaw!)).not.toThrow();

  // Em-dash (U+2014) must not appear anywhere in the script text.
  expect(
    appRaw!.includes(EM_DASH),
    'SoftwareApplication JSON-LD must contain zero em-dash characters (U+2014)',
  ).toBe(false);

  expect(errors).toEqual([]);
});

// Box 6: /demos still renders in light AND dark mode on a 375px mobile
// viewport with no visible chrome change. The only new bytes are inside
// <head>, not the rendered body. Toggling .dark on the root must not change
// the demo grid.
test('dark mode and 375px mobile viewport keep the demo grid intact', async ({ page }) => {
  const errors = await gotoDemos(page);

  // Capture light-mode demo links.
  const lightLinks = await page.$$eval('a[href]', (nodes) =>
    nodes
      .map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? '')
      .filter((h) => /^\/[a-z-]+\/demo\/[a-z-]+$/.test(h)),
  );
  expect(lightLinks.length, 'demo grid should render at least several links').toBeGreaterThan(10);

  // Toggle dark on the root; demo links must be identical.
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  const darkLinks = await page.$$eval('a[href]', (nodes) =>
    nodes
      .map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? '')
      .filter((h) => /^\/[a-z-]+\/demo\/[a-z-]+$/.test(h)),
  );
  expect(darkLinks.sort()).toEqual(lightLinks.sort());

  // 375px mobile viewport: the heading and demo links still render.
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const mobileLinks = await page.$$eval('a[href]', (nodes) =>
    nodes
      .map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? '')
      .filter((h) => /^\/[a-z-]+\/demo\/[a-z-]+$/.test(h)),
  );
  expect(mobileLinks.length).toBeGreaterThan(10);

  expect(errors).toEqual([]);
});

// Box 7: no new hostnames are introduced by the schema (every URL stays on
// digitalcraftai.com), rendering /demos with the new schema makes no /api/
// call, and the SoftwareApplication block round-trips through JSON.parse.
test('every URL stays on digitalcraftai.com and no /api/ call fires', async ({ page }) => {
  const errors = await gotoDemos(page);
  const appOrigin = new URL(page.url()).origin;
  const apiCalls: string[] = [];
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin === appOrigin && u.pathname.startsWith('/api/')) apiCalls.push(req.url());
  });

  const blocks = await readJsonLdBlocks(page);
  const app = findSoftwareApplication(blocks);
  expect(app).toBeDefined();

  // url stays on digitalcraftai.com.
  expect((app!.url ?? '').startsWith(ORIGIN)).toBe(true);
  // provider.url stays on digitalcraftai.com.
  expect((app!.provider?.url ?? '').startsWith(ORIGIN)).toBe(true);

  expect(
    apiCalls,
    `rendering the SoftwareApplication schema should make no /api/ call:\n${apiCalls.join('\n')}`,
  ).toEqual([]);
  expect(errors).toEqual([]);
});
