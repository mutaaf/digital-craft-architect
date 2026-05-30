import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0016 - Emit WebSite + SiteNavigationElement JSON-LD for the Google
// sitelinks search box and branded sitelinks. Each test maps 1:1 to an
// acceptance-criteria box on the ticket.
//
// index.html already emits one inline <script type="application/ld+json"> of
// type Organization (lines 26-48). After this change it must ALSO emit:
//   1. one WebSite block with a SearchAction potentialAction whose urlTemplate
//      points at the existing /glossary surface, and
//   2. one block carrying SiteNavigationElement entries (either a top-level
//      array of SiteNavigationElements or an ItemList of them) covering the
//      site's primary hubs.
// The existing Organization block stays byte-identical; no per-route page is
// edited; no new hostname is introduced.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

const ORIGIN = 'https://digitalcraftai.com';

// Canonical hub URLs the ticket enumerates. Every one of these must appear as
// a SiteNavigationElement entry. The schema may list MORE hubs than this
// (e.g. the locations page); the test only enforces the minimum set.
const REQUIRED_HUBS: ReadonlyArray<string> = [
  `${ORIGIN}/`,
  `${ORIGIN}/construction`,
  `${ORIGIN}/realestate`,
  `${ORIGIN}/events`,
  `${ORIGIN}/demos`,
  `${ORIGIN}/industries`,
  `${ORIGIN}/glossary`,
  `${ORIGIN}/ai-for-small-business`,
  `${ORIGIN}/locations/texas`,
];

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

async function readJsonLdBlocks(page: Page): Promise<{ raw: string; data: unknown }[]> {
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  return raws.map((raw) => ({ raw, data: JSON.parse(raw) as unknown }));
}

type SearchAction = {
  '@type': string;
  target?: { '@type'?: string; urlTemplate?: string } | string;
  'query-input'?: string;
};

type WebSite = {
  '@type': string;
  url?: string;
  name?: string;
  potentialAction?: SearchAction | SearchAction[];
};

type SiteNavEntry = { '@type': string; name?: string; url?: string };

type ItemList = {
  '@type': string;
  itemListElement?: Array<SiteNavEntry | { '@type': string; item?: SiteNavEntry }>;
};

const isWebSite = (d: unknown): d is WebSite =>
  typeof d === 'object' && d !== null && (d as { '@type'?: unknown })['@type'] === 'WebSite';

const isSiteNavEntry = (d: unknown): d is SiteNavEntry =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'SiteNavigationElement';

const isItemList = (d: unknown): d is ItemList =>
  typeof d === 'object' && d !== null && (d as { '@type'?: unknown })['@type'] === 'ItemList';

// A block "carries SiteNavigationElement entries" when its top-level @type is
// SiteNavigationElement (single or array of them) OR an ItemList whose items
// are all SiteNavigationElements. Either shape is valid schema.org.
function extractSiteNavEntries(data: unknown): SiteNavEntry[] {
  if (Array.isArray(data)) {
    return data.filter(isSiteNavEntry);
  }
  if (isSiteNavEntry(data)) return [data];
  if (isItemList(data)) {
    const items = data.itemListElement ?? [];
    const out: SiteNavEntry[] = [];
    for (const it of items) {
      if (isSiteNavEntry(it)) out.push(it);
      else if (
        typeof it === 'object' &&
        it !== null &&
        'item' in it &&
        isSiteNavEntry((it as { item: unknown }).item)
      ) {
        out.push((it as { item: SiteNavEntry }).item);
      }
    }
    return out;
  }
  return [];
}

function findWebSite(blocks: { raw: string; data: unknown }[]): { raw: string; data: WebSite }[] {
  return blocks.filter((b): b is { raw: string; data: WebSite } => isWebSite(b.data));
}

function findSiteNavBlocks(
  blocks: { raw: string; data: unknown }[],
): { raw: string; entries: SiteNavEntry[] }[] {
  return blocks
    .map((b) => ({ raw: b.raw, entries: extractSiteNavEntries(b.data) }))
    .filter((b) => b.entries.length > 0);
}

// Box 1: index.html emits one WebSite JSON-LD block whose url is
// https://digitalcraftai.com, whose name matches the existing Organization
// name, and whose potentialAction is a SearchAction with the expected
// /glossary?q={search_term_string} urlTemplate.
test('emits one WebSite JSON-LD block with a SearchAction targeting /glossary', async ({
  page,
}) => {
  const errors = await gotoHome(page);
  const blocks = await readJsonLdBlocks(page);

  const sites = findWebSite(blocks);
  expect(sites, 'exactly one WebSite block expected in the head').toHaveLength(1);

  const site = sites[0].data;
  expect(site.url).toBe(ORIGIN);
  // Mirrors the existing Organization.name in the same index.html head.
  expect(site.name).toBe('DigitalCraft AI');

  const action = Array.isArray(site.potentialAction)
    ? site.potentialAction[0]
    : site.potentialAction;
  expect(action, 'WebSite must declare a potentialAction').toBeTruthy();
  expect(action!['@type']).toBe('SearchAction');

  const target = action!.target;
  const urlTemplate =
    typeof target === 'string' ? target : (target?.urlTemplate ?? '');
  expect(urlTemplate).toBe(
    `${ORIGIN}/glossary?q={search_term_string}`,
  );
  expect(action!['query-input']).toBe('required name=search_term_string');

  expect(errors).toEqual([]);
});

// Box 2: index.html emits a second JSON-LD block whose entries cover one
// SiteNavigationElement per primary hub (/, /construction, /realestate,
// /events, /demos, /industries, /glossary, /ai-for-small-business,
// /locations/texas). Each entry has a name and an absolute url.
test('emits SiteNavigationElement entries covering every required hub', async ({ page }) => {
  const errors = await gotoHome(page);
  const blocks = await readJsonLdBlocks(page);

  const navBlocks = findSiteNavBlocks(blocks);
  expect(navBlocks.length, 'at least one SiteNavigationElement block expected').toBeGreaterThan(0);

  const allEntries = navBlocks.flatMap((b) => b.entries);
  for (const entry of allEntries) {
    expect(entry['@type']).toBe('SiteNavigationElement');
    expect(typeof entry.name, 'each nav entry must carry a string name').toBe('string');
    expect((entry.name ?? '').length).toBeGreaterThan(0);
    expect(typeof entry.url, 'each nav entry must carry a string url').toBe('string');
    expect((entry.url ?? '').startsWith(`${ORIGIN}/`) || entry.url === ORIGIN).toBe(true);
  }

  const urls = allEntries.map((e) => (e.url ?? '').replace(/\/$/, '') || ORIGIN);
  for (const hub of REQUIRED_HUBS) {
    const normalized = hub.replace(/\/$/, '') || ORIGIN;
    expect(
      urls,
      `SiteNavigationElement block is missing required hub url ${hub}`,
    ).toContain(normalized);
  }

  expect(errors).toEqual([]);
});

// Box 3: both new blocks are valid JSON when parsed (no trailing commas, no
// shell-escaped quotes) and contain no em-dash character in any string.
test('the new blocks parse as valid JSON and contain no em-dash', async ({ page }) => {
  const errors = await gotoHome(page);
  const blocks = await readJsonLdBlocks(page);

  const sites = findWebSite(blocks);
  expect(sites).toHaveLength(1);
  expect(() => JSON.parse(sites[0].raw)).not.toThrow();
  expect(sites[0].raw).not.toContain('—');

  const navBlocks = findSiteNavBlocks(blocks);
  expect(navBlocks.length).toBeGreaterThan(0);
  for (const b of navBlocks) {
    expect(() => JSON.parse(b.raw)).not.toThrow();
    expect(b.raw).not.toContain('—');
    for (const e of b.entries) {
      expect(e.name ?? '').not.toContain('—');
      expect(e.url ?? '').not.toContain('—');
    }
  }

  expect(errors).toEqual([]);
});

// Box 4: the original index.html Organization JSON-LD block stays intact.
// We can't easily diff bytes from a test, but we CAN assert the post-change
// head still emits an Organization block whose canonical fields are
// unchanged - that is what a byte-identical edit guarantees from a consumer's
// perspective. NOTE: ticket 0025 adds a SECOND Organization block (in the
// homepage Helmet, with contactPoint + sameAs to LinkedIn/Calendly) that
// coexists with the original. We identify the original by its unique
// knowsAbout array (the new block does not carry knowsAbout).
test('keeps the existing Organization JSON-LD block intact', async ({ page }) => {
  const errors = await gotoHome(page);
  const blocks = await readJsonLdBlocks(page);

  type Org = {
    '@type': string;
    name?: string;
    alternateName?: string;
    url?: string;
    logo?: string;
    sameAs?: string[];
    knowsAbout?: string[];
  };
  const orgs = blocks.filter(
    (b): b is { raw: string; data: Org } =>
      typeof b.data === 'object' &&
      b.data !== null &&
      (b.data as { '@type'?: unknown })['@type'] === 'Organization',
  );
  // Two Organization blocks coexist: the original index.html one and the
  // ticket 0025 Helmet-injected one. The original is the one carrying
  // knowsAbout (a field exclusive to it).
  expect(orgs.length, 'at least one Organization block expected').toBeGreaterThanOrEqual(1);
  const originals = orgs.filter((b) => Array.isArray(b.data.knowsAbout));
  expect(originals, 'exactly one original Organization block (with knowsAbout) expected').toHaveLength(1);

  const org = originals[0].data;
  expect(org.name).toBe('DigitalCraft AI');
  expect(org.alternateName).toBe('DigitalCraft');
  expect(org.url).toBe(ORIGIN);
  expect(org.logo).toBe(`${ORIGIN}/og-default.png`);
  expect(org.sameAs).toEqual([
    `${ORIGIN}`,
    'https://cto.digitalcraftai.com',
  ]);
  // knowsAbout is unchanged from the original 6-entry array.
  expect(Array.isArray(org.knowsAbout)).toBe(true);
  expect((org.knowsAbout ?? []).length).toBe(6);

  expect(errors).toEqual([]);
});

// Box 6: no new hostnames - every url in both new blocks stays on the
// existing digitalcraftai.com origin; rendering the home page with the new
// schema makes no first-party /api/ call.
test('every url stays on digitalcraftai.com and no /api/ call fires', async ({ page }) => {
  const errors = await gotoHome(page);
  const appOrigin = new URL(page.url()).origin;
  const apiCalls: string[] = [];
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin === appOrigin && u.pathname.startsWith('/api/')) apiCalls.push(req.url());
  });

  const blocks = await readJsonLdBlocks(page);
  const sites = findWebSite(blocks);
  expect(sites).toHaveLength(1);

  const site = sites[0].data;
  expect((site.url ?? '').startsWith(ORIGIN)).toBe(true);
  const action = Array.isArray(site.potentialAction)
    ? site.potentialAction[0]
    : site.potentialAction;
  const tpl =
    typeof action?.target === 'string' ? action.target : (action?.target?.urlTemplate ?? '');
  expect(tpl.startsWith(ORIGIN)).toBe(true);

  for (const b of findSiteNavBlocks(blocks)) {
    for (const e of b.entries) {
      expect((e.url ?? '').startsWith(ORIGIN)).toBe(true);
    }
  }

  expect(
    apiCalls,
    `rendering the sitelinks schema should make no /api/ call:\n${apiCalls.join('\n')}`,
  ).toEqual([]);
  expect(errors).toEqual([]);
});
