import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0075 - Emit Product + nested Offers JSON-LD on the homepage, sourced
// byte-identically from content.pricingTiers so a copy edit to a tier flows
// through to both the visible PricingTiers card AND the structured data in
// one render. Each test maps 1:1 to an acceptance-criteria box.
//
// Per the 2026-05-30 second-@type lesson, pre-code grep of every existing
// homepage/jsonld spec for `=== 'Product'` and `=== 'Offer'` returned zero
// site-wide predicates - no predecessor widening required. The new block is
// identified by name = 'Digital Craft AI Automation'.
//
// Per the 2026-09-08 subprocessors em-dash lesson, the em-dash check is
// scoped to blocks THIS page owns (the Product block plus its nested Offers)
// BEFORE iterating; the shipped homepage Organization block from index.html
// contains a legitimate em-dash and is out of scope.
//
// Per the 2026-09-08 sibling-hub poll lesson, the sibling-page regression
// case polls `page.locator('script[type="application/ld+json"]').evaluateAll`
// until at least one block's name equals 'Digital Craft AI Automation'
// BEFORE reading and filtering blocks.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

const ORIGIN = 'https://digitalcraftai.com';
const PRODUCT_NAME = 'Digital Craft AI Automation';
const BRAND_NAME = 'Digital Craft AI';

type Offer = {
  '@type'?: string;
  name?: string;
  description?: string;
  price?: string | number;
  priceCurrency?: string;
  availability?: string;
  url?: string;
  category?: string;
};

type Product = {
  '@context'?: string;
  '@type'?: string;
  name?: string;
  description?: string;
  url?: string;
  brand?: { '@type'?: string; name?: string };
  offers?: Offer[];
};

type PricingTier = {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
  ctaText: string;
  ctaLink: string;
};

type PricingTiersConfig = {
  headline: string;
  subheadline: string;
  tiers: PricingTier[];
};

type ContentJson = {
  pricingTiers?: PricingTiersConfig;
};

function readContent(): ContentJson {
  return JSON.parse(
    readFileSync(resolve(process.cwd(), 'public/content.json'), 'utf-8'),
  ) as ContentJson;
}

type JsonLdBlock = { raw: string; data: unknown };

const isProduct = (d: unknown): d is Product =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'Product';

// The mirror-source identifier: the new Product block is uniquely named,
// so filtering by name is the safe selector per the 2026-09-08 lessons.
const isOurProduct = (d: unknown): d is Product =>
  isProduct(d) && (d as Product).name === PRODUCT_NAME;

async function gotoHome(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /').not.toBeNull();
  expect(response!.status(), `/ returned ${response!.status()}`).toBeLessThan(400);
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

// The sibling-hub poll helper. Waits until at least one JSON-LD block on the
// page has name === PRODUCT_NAME before reading them all. This is the
// 2026-09-08 pattern: a `count > 0` poll fires before the Helmet head swap
// finishes on SPA nav, so we poll the parsed name instead.
async function pollForOurProduct(page: Page): Promise<Product> {
  await expect
    .poll(
      async () =>
        page.evaluate((expected) => {
          const nodes = Array.from(
            document.querySelectorAll('script[type="application/ld+json"]'),
          );
          for (const n of nodes) {
            try {
              const parsed = JSON.parse(n.textContent ?? '') as {
                '@type'?: string;
                name?: string;
              };
              if (parsed['@type'] === 'Product' && parsed.name === expected) return true;
            } catch {
              // ignore individual parse errors, keep scanning
            }
          }
          return false;
        }, PRODUCT_NAME),
      { timeout: 10_000 },
    )
    .toBe(true);
  const blocks = await readJsonLdBlocks(page);
  const found = blocks.map((b) => b.data).find(isOurProduct);
  expect(found, `Product block "${PRODUCT_NAME}" not found after poll`).toBeDefined();
  return found!;
}

// ---------------------------------------------------------------------------
// Box 1: src/pages/Index.tsx gains ONE additional Product JSON-LD block
// inside the existing Helmet, with the required fields and a nested
// offers[] array derived from content.pricingTiers.tiers.
// ---------------------------------------------------------------------------
test('emits one Product JSON-LD block inside the homepage Helmet with brand, url, description, offers', async ({
  page,
}) => {
  const errors = await gotoHome(page);
  const blocks = await readJsonLdBlocks(page);

  const products = blocks.map((b) => b.data).filter(isOurProduct);
  expect(
    products,
    `exactly one Product block with name "${PRODUCT_NAME}" expected on /`,
  ).toHaveLength(1);

  const product = products[0];
  expect(product['@context']).toBe('https://schema.org');
  expect(product['@type']).toBe('Product');
  expect(product.name).toBe(PRODUCT_NAME);
  expect(product.url).toBe(ORIGIN);
  expect(product.brand).toBeDefined();
  expect(product.brand!['@type']).toBe('Brand');
  expect(product.brand!.name).toBe(BRAND_NAME);

  // Mirror-source rule: description equals content.pricingTiers.subheadline.
  const content = readContent();
  expect(content.pricingTiers, 'content.json must have pricingTiers').toBeDefined();
  expect(product.description).toBe(content.pricingTiers!.subheadline);

  expect(Array.isArray(product.offers)).toBe(true);
  expect(product.offers!.length).toBe(content.pricingTiers!.tiers.length);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// Box 4 (part 1): every nested offer entry carries @type=Offer, a
// numeric-string price, priceCurrency=USD, availability=InStock, and a url
// starting with http. The offers.length equals content.pricingTiers.tiers
// (three in the shipped content.json).
// ---------------------------------------------------------------------------
test('every nested Offer carries @type, numeric-string price, USD currency, InStock, and http url', async ({
  page,
}) => {
  const errors = await gotoHome(page);
  const blocks = await readJsonLdBlocks(page);

  const product = blocks.map((b) => b.data).find(isOurProduct);
  expect(product, `Product block "${PRODUCT_NAME}" missing`).toBeDefined();

  const offers = product!.offers ?? [];
  const content = readContent();
  const expectedTiers = content.pricingTiers!.tiers;
  expect(offers.length).toBe(expectedTiers.length);
  // Ticket text notes the shipped content.json has three tiers today; the
  // count is sourced from the shipped file so a future tier addition simply
  // updates the source and this assertion stays truthful.
  expect(offers.length).toBeGreaterThanOrEqual(2);

  for (let i = 0; i < offers.length; i++) {
    const offer = offers[i];
    const tier = expectedTiers[i];
    expect(offer['@type'], `offers[${i}] @type`).toBe('Offer');
    expect(offer.name, `offers[${i}] name`).toBe(tier.name);
    expect(offer.description, `offers[${i}] description`).toBe(tier.description);
    // schema.org accepts price as a numeric string; Google's Product docs
    // recommend a string to preserve trailing zeros and locale-free format.
    expect(typeof offer.price, `offers[${i}] price type`).toBe('string');
    expect(offer.price, `offers[${i}] price value`).toBe(String(tier.price));
    expect(/^\d+(\.\d+)?$/.test(String(offer.price ?? '')), `offers[${i}] price numeric-string`).toBe(true);
    expect(offer.priceCurrency, `offers[${i}] priceCurrency`).toBe('USD');
    expect(offer.availability, `offers[${i}] availability`).toBe('https://schema.org/InStock');
    expect(offer.url, `offers[${i}] url`).toBe(tier.ctaLink);
    expect((offer.url ?? '').startsWith('http'), `offers[${i}] url must start with http`).toBe(true);
    expect(offer.category, `offers[${i}] category`).toBe(tier.period);
  }

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// Box 4 (part 2) + Box 3: the block's description byte-matches the visible
// subheadline rendered under #pricing (mirror-source guard), and there are
// zero em-dash characters (U+2014) in the Product block or any nested Offer
// string. The em-dash filter is SCOPED TO THIS PAGE'S BLOCK ONLY per the
// 2026-09-08 lesson - iterating every JSON-LD block on / would trip the
// shipped homepage Organization block from index.html.
// ---------------------------------------------------------------------------
test('description byte-matches the visible #pricing subheadline and the block has zero em-dashes', async ({
  page,
}) => {
  const errors = await gotoHome(page);
  const blocks = await readJsonLdBlocks(page);

  const productBlock = blocks.find((b) => isOurProduct(b.data));
  expect(productBlock, `Product block "${PRODUCT_NAME}" missing`).toBeDefined();
  const product = productBlock!.data as Product;

  // Mirror-source: the visible subheadline text under #pricing equals the
  // block's description. Fetching the paragraph text this way rather than
  // reading content.json a second time proves the render truly mirrors.
  const visibleSubheadline = await page
    .locator('#pricing p')
    .first()
    .innerText();
  expect(product.description).toBe(visibleSubheadline);

  // Scoped em-dash check: iterate ONLY the raw text of the Product block we
  // own (which JSON.stringify-encodes every nested Offer string too), never
  // every JSON-LD block on the page.
  const emDash = String.fromCharCode(8212);
  expect(
    productBlock!.raw.includes(emDash),
    `homepage Product block must contain zero U+2014 characters (found in: ${productBlock!.raw.slice(0, 200)})`,
  ).toBe(false);

  // And every parsed string field in the block and its nested offers.
  const stringsToCheck: string[] = [
    product.name ?? '',
    product.description ?? '',
    product.url ?? '',
    product.brand?.name ?? '',
    ...(product.offers ?? []).flatMap((o) => [
      o.name ?? '',
      o.description ?? '',
      String(o.price ?? ''),
      o.priceCurrency ?? '',
      o.availability ?? '',
      o.url ?? '',
      o.category ?? '',
    ]),
  ];
  for (const s of stringsToCheck) {
    expect(s.includes(emDash), `scoped em-dash check: "${s}" contains U+2014`).toBe(false);
  }

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// Box 5: existing homepage tests stay green. This is a smoke assertion that
// the ticket 0025 Organization block (identified by contactPoint) and the
// ticket 0016 WebSite block (identified by potentialAction) both still
// resolve on / alongside the new Product block.
// ---------------------------------------------------------------------------
test('coexists with the ticket 0025 Organization and ticket 0016 WebSite blocks', async ({
  page,
}) => {
  const errors = await gotoHome(page);
  const blocks = await readJsonLdBlocks(page);

  const products = blocks.map((b) => b.data).filter(isOurProduct);
  expect(products).toHaveLength(1);

  // Ticket 0025 Organization: identified by contactPoint (unique field).
  const orgsWithContactPoint = blocks.filter(
    (b) =>
      typeof b.data === 'object' &&
      b.data !== null &&
      (b.data as { '@type'?: unknown })['@type'] === 'Organization' &&
      (b.data as { contactPoint?: unknown }).contactPoint !== undefined,
  );
  expect(orgsWithContactPoint, 'ticket 0025 Organization block must remain on /').toHaveLength(1);

  // Ticket 0016 WebSite: identified by potentialAction (unique field).
  const websites = blocks.filter(
    (b) =>
      typeof b.data === 'object' &&
      b.data !== null &&
      (b.data as { '@type'?: unknown })['@type'] === 'WebSite' &&
      (b.data as { potentialAction?: unknown }).potentialAction !== undefined,
  );
  expect(websites, 'ticket 0016 WebSite block must remain on /').toHaveLength(1);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// Box 4 (part 6) + engineering notes 2026-09-08 sibling-hub poll: SPA nav
// from /compare to / must land with the Product block present. The poll
// helper waits on the parsed name so a stale head swap can't false-pass.
// ---------------------------------------------------------------------------
test('sibling-page regression: SPA nav from /compare to / still resolves the Product block', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });

  const response = await page.goto('/compare', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /compare').not.toBeNull();
  expect(response!.status(), `/compare returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 15_000,
    })
    .toBeGreaterThan(500);

  // SPA nav to / by clicking the navbar logo (React Router owns the
  // transition; the Helmet head swap lands after the Index component
  // mounts). Clicking a real Link is more faithful than a synthetic
  // popstate because it exercises the exact code path a real visitor
  // takes when hopping from /compare back to the homepage.
  await page.locator('a[href="/"]').first().click();
  await expect
    .poll(() => page.evaluate(() => window.location.pathname), { timeout: 5_000 })
    .toBe('/');

  const product = await pollForOurProduct(page);

  // Assertion (1): still a Product with the expected name.
  expect(product['@type']).toBe('Product');
  expect(product.name).toBe(PRODUCT_NAME);

  // Assertion (2): offers.length matches the shipped content.
  const content = readContent();
  expect(product.offers?.length).toBe(content.pricingTiers!.tiers.length);

  // Assertion (4): description still mirrors the subheadline.
  expect(product.description).toBe(content.pricingTiers!.subheadline);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// Box 6: the Product block is emitted ONLY when content.pricingTiers is
// truthy. Playwright's page.route intercepts /content.json and returns a
// copy with pricingTiers deleted, then asserts the Product block is absent.
// This is the same guard as the visible {content.pricingTiers && ...}
// render in Index.tsx.
// ---------------------------------------------------------------------------
test('no-pricing-content regression: without pricingTiers no Product block is emitted', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });

  // Stub /content.json before the page requests it. useContent fetches
  // /content.json (or VITE_CONTENT_URL if set); the preview server the
  // smoke suite spins up has no VITE_CONTENT_URL, so /content.json is the
  // canonical request path.
  const original = readContent() as Record<string, unknown>;
  const stubbed = { ...original };
  delete (stubbed as { pricingTiers?: unknown }).pricingTiers;

  await page.route('**/content.json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(stubbed),
    });
  });

  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /').not.toBeNull();
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);

  const blocks = await readJsonLdBlocks(page);
  const products = blocks.map((b) => b.data).filter(isOurProduct);
  expect(products, 'Product block must be absent when pricingTiers is missing').toHaveLength(0);

  // Sanity: the visible PricingTiers section is also absent (same guard).
  const pricingSection = await page.locator('#pricing').count();
  expect(pricingSection, '#pricing section absent when pricingTiers missing').toBe(0);

  expect(errors).toEqual([]);
});
