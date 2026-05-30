import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0025 - Emit Organization JSON-LD with sameAs and contactPoint on the
// homepage. Each test maps 1:1 to an acceptance-criteria box on the ticket.
//
// index.html already emits one inline <script type="application/ld+json"> of
// type Organization (the existing site-wide block). This ticket adds a SECOND
// Organization block inside the homepage <Helmet> in src/pages/Index.tsx that
// is richer: contactPoint with the published phone number, sameAs to LinkedIn
// and Calendly, a description mirroring content.seo.description, and a logo
// sourced from a single shared constant. Both Organization blocks coexist;
// crawlers tolerate duplicate @type entries and merge them.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

const ORIGIN = 'https://digitalcraftai.com';
const EXPECTED_NAME = 'DigitalCraft AI';
const EXPECTED_URL = ORIGIN;
const EXPECTED_LOGO = `${ORIGIN}/og-default.png`;
const EXPECTED_PHONE_DIGITS = '9723523293';
const EXPECTED_PHONE_E164 = '+1-972-352-3293';
const EXPECTED_SAME_AS = [
  'https://linkedin.com/in/mutaaf',
  'https://calendly.com/mutaaf',
];

type JsonLdBlock = { raw: string; data: unknown };

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

type Organization = {
  '@context'?: string;
  '@type': string;
  name?: string;
  url?: string;
  logo?: string | { url?: string };
  description?: string;
  sameAs?: string[];
  contactPoint?: ContactPoint | ContactPoint[];
};

type ContactPoint = {
  '@type'?: string;
  telephone?: string;
  contactType?: string;
  areaServed?: string;
};

const isOrganization = (d: unknown): d is Organization =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'Organization';

// The homepage now emits TWO Organization blocks: the original index.html one
// (kept intact per box 1's "untouched" guarantee for ticket 0016's adjacent
// schema) and the new Helmet-injected one with contactPoint + sameAs. This
// helper finds the new one by its contactPoint signature.
function findOrgWithContactPoint(blocks: JsonLdBlock[]): Organization | undefined {
  return blocks
    .map((b) => b.data)
    .filter(isOrganization)
    .find((o) => o.contactPoint !== undefined);
}

function findOrgRawWithContactPoint(blocks: JsonLdBlock[]): string | undefined {
  return blocks
    .find((b) => isOrganization(b.data) && (b.data as Organization).contactPoint !== undefined)
    ?.raw;
}

// Box 1: the homepage at / emits exactly one NEW Organization JSON-LD block
// (identifiable by its contactPoint field) whose @context is schema.org and
// @type is Organization. The block lives in the Helmet head, not as a
// useEffect DOM injection. The existing WebSite JSON-LD from ticket 0016 is
// untouched (still present, still parseable).
test('emits one new Organization JSON-LD block with contactPoint inside Helmet', async ({
  page,
}) => {
  const errors = await gotoHome(page);
  const blocks = await readJsonLdBlocks(page);

  const newOrg = findOrgWithContactPoint(blocks);
  expect(newOrg, 'new Organization block with contactPoint missing from /').toBeDefined();
  expect(newOrg!['@context']).toBe('https://schema.org');
  expect(newOrg!['@type']).toBe('Organization');

  // Regression check: the WebSite block from ticket 0016 still present.
  const websites = blocks.filter(
    (b) =>
      typeof b.data === 'object' &&
      b.data !== null &&
      (b.data as { '@type'?: unknown })['@type'] === 'WebSite',
  );
  expect(websites, 'ticket 0016 WebSite block must remain on /').toHaveLength(1);

  expect(errors).toEqual([]);
});

// Box 2: the new Organization object has name=DigitalCraft AI,
// url=https://digitalcraftai.com, logo matching the BlogPosting publisher
// logo URL, and description mirroring content.seo.description (so a future
// homepage copy edit cannot leave the schema stale).
test('the new Organization block carries name, url, logo, and description sourced from content.seo', async ({
  page,
}) => {
  const errors = await gotoHome(page);
  const blocks = await readJsonLdBlocks(page);

  const newOrg = findOrgWithContactPoint(blocks);
  expect(newOrg).toBeDefined();

  expect(newOrg!.name).toBe(EXPECTED_NAME);
  expect(newOrg!.url).toBe(EXPECTED_URL);

  const logoUrl =
    typeof newOrg!.logo === 'string'
      ? newOrg!.logo
      : (newOrg!.logo?.url ?? '');
  expect(logoUrl).toBe(EXPECTED_LOGO);

  // The schema description must equal content.seo.description verbatim.
  // We pull both from the same source (content.json) the page hydrates from,
  // so a homepage copy edit propagates to the schema in one render.
  const contentJson = JSON.parse(
    readFileSync(resolve(process.cwd(), 'public/content.json'), 'utf-8'),
  ) as { seo: { description: string } };
  expect(newOrg!.description).toBe(contentJson.seo.description);

  // The page's rendered meta[name=description] is set from the same source, so
  // the schema description should equal the (last) meta description tag too.
  const metaDescriptions = await page.$$eval(
    'meta[name="description"]',
    (nodes) => nodes.map((n) => n.getAttribute('content') ?? ''),
  );
  expect(metaDescriptions.length).toBeGreaterThan(0);
  expect(metaDescriptions).toContain(newOrg!.description ?? '');

  expect(errors).toEqual([]);
});

// Box 3: the sameAs field is a non-empty array containing at least the
// LinkedIn and Calendly profiles. Each URL must also appear in
// public/content.json so the schema cannot drift past what the site links to.
test('sameAs covers LinkedIn and Calendly and every entry is mirrored in content.json', async ({
  page,
}) => {
  const errors = await gotoHome(page);
  const blocks = await readJsonLdBlocks(page);

  const newOrg = findOrgWithContactPoint(blocks);
  expect(newOrg).toBeDefined();

  expect(Array.isArray(newOrg!.sameAs)).toBe(true);
  expect((newOrg!.sameAs ?? []).length).toBeGreaterThan(0);
  for (const url of EXPECTED_SAME_AS) {
    expect(newOrg!.sameAs, `sameAs missing required url ${url}`).toContain(url);
  }

  const contentRaw = readFileSync(
    resolve(process.cwd(), 'public/content.json'),
    'utf-8',
  );
  for (const url of newOrg!.sameAs ?? []) {
    expect(
      contentRaw.includes(url),
      `sameAs entry ${url} not found in public/content.json (drift guard)`,
    ).toBe(true);
  }

  expect(errors).toEqual([]);
});

// Box 4: the contactPoint field is an array containing one entry with
// @type=ContactPoint, telephone in E.164 format, contactType=sales, and
// areaServed=US. The phone digits must match the footer tel: href so a
// future phone change in the footer fails the test until the schema updates.
test('contactPoint carries the E.164 phone matching the footer tel href', async ({ page }) => {
  const errors = await gotoHome(page);
  const blocks = await readJsonLdBlocks(page);

  const newOrg = findOrgWithContactPoint(blocks);
  expect(newOrg).toBeDefined();

  const cps = Array.isArray(newOrg!.contactPoint)
    ? newOrg!.contactPoint
    : [newOrg!.contactPoint!];
  expect(cps.length).toBeGreaterThanOrEqual(1);

  const cp = cps[0];
  expect(cp['@type']).toBe('ContactPoint');
  expect(cp.telephone).toBe(EXPECTED_PHONE_E164);
  expect(cp.contactType).toBe('sales');
  expect(cp.areaServed).toBe('US');

  // Source-of-truth assertion: the digits in the schema phone must match the
  // digits in the rendered footer tel: href. This is the mirror-source guard.
  const telHrefs = await page.$$eval('a[href^="tel:"]', (nodes) =>
    nodes.map((n) => n.getAttribute('href') ?? ''),
  );
  expect(telHrefs.length, 'footer must render a tel: link').toBeGreaterThan(0);
  const footerDigits = (telHrefs[0] ?? '').replace(/\D/g, '');
  const schemaDigits = (cp.telephone ?? '').replace(/\D/g, '');
  expect(
    schemaDigits.endsWith(EXPECTED_PHONE_DIGITS),
    `schema telephone digits must end with ${EXPECTED_PHONE_DIGITS}`,
  ).toBe(true);
  expect(
    footerDigits.endsWith(EXPECTED_PHONE_DIGITS),
    `footer tel href digits must end with ${EXPECTED_PHONE_DIGITS}`,
  ).toBe(true);

  expect(errors).toEqual([]);
});

// Box 5: the new block contains zero em-dash characters in any string value,
// parses as valid JSON via JSON.parse on the script tag text, and exactly one
// of the parsed blocks satisfies our "new Organization" signature
// (contactPoint present).
test('the new block has no em-dash, parses as valid JSON, and appears exactly once', async ({
  page,
}) => {
  const errors = await gotoHome(page);
  const blocks = await readJsonLdBlocks(page);

  const newOrgRaw = findOrgRawWithContactPoint(blocks);
  expect(newOrgRaw, 'new Organization block raw text missing').toBeDefined();

  expect(() => JSON.parse(newOrgRaw!)).not.toThrow();
  expect(
    newOrgRaw!.includes('—'),
    'new Organization JSON-LD must contain zero em-dash characters',
  ).toBe(false);

  const matching = blocks.filter(
    (b) => isOrganization(b.data) && (b.data as Organization).contactPoint !== undefined,
  );
  expect(matching, 'exactly one Organization block with contactPoint expected').toHaveLength(1);

  expect(errors).toEqual([]);
});

// Box 6: no new hostnames - every URL in the new block is already rendered
// elsewhere on / (LinkedIn/Calendly already in the footer, phone already in
// the footer, logo already used by BlogPost publisher). Rendering the home
// page with the new schema makes no /api/ call.
test('every url stays on already-rendered hosts and no /api/ call fires', async ({ page }) => {
  const errors = await gotoHome(page);
  const appOrigin = new URL(page.url()).origin;
  const apiCalls: string[] = [];
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin === appOrigin && u.pathname.startsWith('/api/')) apiCalls.push(req.url());
  });

  const blocks = await readJsonLdBlocks(page);
  const newOrg = findOrgWithContactPoint(blocks);
  expect(newOrg).toBeDefined();

  // url stays on digitalcraftai.com.
  expect((newOrg!.url ?? '').startsWith(ORIGIN)).toBe(true);

  // logo stays on digitalcraftai.com.
  const logoUrl =
    typeof newOrg!.logo === 'string'
      ? newOrg!.logo
      : (newOrg!.logo?.url ?? '');
  expect(logoUrl.startsWith(ORIGIN)).toBe(true);

  // Each sameAs URL must already appear as an anchor href somewhere on the
  // rendered home page (LinkedIn + Calendly are in the footer). No new
  // hostname is introduced by the schema.
  const anchorHrefs = await page.$$eval('a[href]', (nodes) =>
    nodes.map((n) => n.getAttribute('href') ?? ''),
  );
  for (const url of newOrg!.sameAs ?? []) {
    expect(
      anchorHrefs.some((h) => h.startsWith(url)),
      `sameAs ${url} should already appear as a rendered anchor href on /`,
    ).toBe(true);
  }

  expect(
    apiCalls,
    `rendering the Organization schema should make no /api/ call:\n${apiCalls.join('\n')}`,
  ).toEqual([]);
  expect(errors).toEqual([]);
});
