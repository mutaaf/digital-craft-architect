import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';
import { caseStudies } from '../../src/data/caseStudies';

// Ticket 0070 - Public /case-studies/rss.xml RSS 2.0 feed of shipped case
// studies. Modeled on `tests/e2e/changelog-rss-feed.spec.ts` (ticket 0055,
// the direct peer). Each test maps to one of the ten checks in acceptance
// criterion #9.
//
// The feed is generated at build time by
// scripts/generate-case-studies-rss.ts (dynamically imported from
// scripts/generate-changelog.ts, which itself is invoked from
// scripts/generate-sitemap.ts at the start of `npm run build`). The feed
// reads from src/data/caseStudies.ts (the single shared constant used by
// the hub, the detail pages, and the ItemList JSON-LD).
//
// Per the 2026-05-25 SEO Pilot lesson, this spec does NOT call
// page.toHaveTitle() for /case-studies - that route is not in the
// index.html SEO Pilot table. The HTML-side assertion (box 8) reads the
// Helmet-emitted <link rel="alternate"> directly.
//
// Per the 2026-06-15 negated-character-class lesson, the atom:link regex
// uses `[^>]*` NOT `[^/>]*` because `type="application/rss+xml"` contains
// a forward slash that would break the negated-slash pattern.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

const FEED_PATH = '/case-studies/rss.xml';
const ORIGIN = 'https://digitalcraftai.com';
const HUB_URL = `${ORIGIN}/case-studies`;
const FEED_URL = `${ORIGIN}/case-studies/rss.xml`;
const ITEM_LINK_PATTERN = /^https:\/\/digitalcraftai\.com\/case-studies\/[a-z-]+$/;

async function fetchFeed(request: Page['request']): Promise<{
  status: number;
  contentType: string;
  body: string;
}> {
  const res = await request.get(FEED_PATH);
  return {
    status: res.status(),
    contentType: res.headers()['content-type'] ?? '',
    body: await res.text(),
  };
}

// Box 1: GET /case-studies/rss.xml returns 200 and content-type contains 'xml'.
test('GET /case-studies/rss.xml returns 200 and an xml content-type', async ({
  request,
}) => {
  const { status, contentType, body } = await fetchFeed(request);
  expect(status, `expected 200 for ${FEED_PATH}, got ${status}`).toBe(200);
  expect(contentType.toLowerCase()).toContain('xml');
  expect(body.length, 'feed body must be non-empty').toBeGreaterThan(200);
  expect(body.startsWith('<?xml')).toBe(true);
});

// Box 2: body starts with <?xml and contains exactly one <channel> block.
test('feed has exactly one <channel> block', async ({ request }) => {
  const { body } = await fetchFeed(request);
  const channelOpens = body.match(/<channel>/g) ?? [];
  const channelCloses = body.match(/<\/channel>/g) ?? [];
  expect(channelOpens.length, 'expected exactly one <channel> open tag').toBe(1);
  expect(channelCloses.length, 'expected exactly one </channel> close tag').toBe(1);
});

// Box 3: channel block has <title>, <link>, <description>, <language>, and
// an Atom <atom:link rel="self"> self-link. Attribute-list regex uses
// `[^>]*` per the 2026-06-15 negated-character-class lesson.
test('channel block has title, link, description, language, and atom:link self', async ({
  request,
}) => {
  const { body } = await fetchFeed(request);
  const channelMatch = body.match(/<channel>([\s\S]*?)<\/channel>/);
  expect(channelMatch, 'feed must contain a <channel>...</channel> block').not.toBeNull();
  const channel = channelMatch![1];

  // Strip <item> blocks so the channel-level tag checks do not see item
  // children.
  const channelMeta = channel.replace(/<item>[\s\S]*?<\/item>/g, '');

  expect(channelMeta).toMatch(/<title>[^<]+<\/title>/);
  expect(channelMeta).toMatch(/<link>https:\/\/digitalcraftai\.com\/case-studies<\/link>/);
  expect(channelMeta).toMatch(/<description>[^<]+<\/description>/);
  expect(channelMeta).toMatch(/<language>en-us<\/language>/);
  // Atom self-link: tag must contain href to the feed URL AND rel="self".
  // Order of attributes is not constrained by RSS. `[^>]*` NOT `[^/>]*`
  // per the 2026-06-15 lesson - the `type="application/rss+xml"` attribute
  // value contains a forward slash that would break the negated-slash form.
  const atomMatch = channelMeta.match(/<atom:link\b[^>]*\/>/);
  expect(atomMatch, 'channel must contain a self-closing <atom:link/> tag').not.toBeNull();
  expect(atomMatch![0]).toContain(`href="${FEED_URL}"`);
  expect(atomMatch![0]).toContain('rel="self"');
  expect(atomMatch![0]).toContain('type="application/rss+xml"');
});

// Box 4: number of <item> blocks equals caseStudies.length; each <item>
// has all six required children (title, link, description, guid, pubDate,
// category).
test('one <item> per caseStudies entry with all six required children', async ({
  request,
}) => {
  const { body } = await fetchFeed(request);
  const items = body.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  expect(
    items.length,
    `expected ${caseStudies.length} <item> blocks (one per caseStudies entry), found ${items.length}`,
  ).toBe(caseStudies.length);

  for (const item of items) {
    expect(item, `<item> missing <title>: ${item}`).toMatch(/<title>[^<]+<\/title>/);
    expect(item, `<item> missing <link>: ${item}`).toMatch(/<link>[^<]+<\/link>/);
    expect(item, `<item> missing <description>: ${item}`).toMatch(
      /<description>[^<]+<\/description>/,
    );
    expect(item, `<item> missing <guid isPermaLink="true">: ${item}`).toMatch(
      /<guid\s+isPermaLink="true">[^<]+<\/guid>/,
    );
    expect(item, `<item> missing <pubDate>: ${item}`).toMatch(/<pubDate>[^<]+<\/pubDate>/);
    expect(item, `<item> missing <category>: ${item}`).toMatch(/<category>[^<]+<\/category>/);
  }
});

// Box 5: every <link> inside <item> matches the case-study permalink shape,
// and every <pubDate> parses as a valid Date.
test('every item <link> is a /case-studies/<slug> permalink and every <pubDate> parses', async ({
  request,
}) => {
  const { body } = await fetchFeed(request);
  const items = body.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  expect(items.length).toBeGreaterThan(0);
  for (const item of items) {
    const linkMatch = item.match(/<link>([^<]+)<\/link>/);
    expect(linkMatch, `<item> missing <link>: ${item}`).not.toBeNull();
    const linkValue = linkMatch![1];
    expect(
      ITEM_LINK_PATTERN.test(linkValue),
      `<link>${linkValue}</link> does not match ${ITEM_LINK_PATTERN}`,
    ).toBe(true);

    const pubDateMatch = item.match(/<pubDate>([^<]+)<\/pubDate>/);
    expect(pubDateMatch, `<item> missing <pubDate>: ${item}`).not.toBeNull();
    const parsed = new Date(pubDateMatch![1]);
    expect(
      Number.isFinite(parsed.getTime()),
      `<pubDate>${pubDateMatch![1]}</pubDate> did not parse as a valid Date`,
    ).toBe(true);
  }
});

// Box 6: every <link> resolves to a slug present in caseStudies (no orphan
// items, no missing entries).
test('every item <link> resolves to a slug present in caseStudies', async ({
  request,
}) => {
  const { body } = await fetchFeed(request);
  const items = body.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  const expected = new Set(caseStudies.map((c) => `${ORIGIN}/case-studies/${c.slug}`));
  const seen = new Set<string>();
  for (const item of items) {
    const linkMatch = item.match(/<link>([^<]+)<\/link>/);
    expect(linkMatch).not.toBeNull();
    const link = linkMatch![1];
    expect(expected.has(link), `<link>${link}</link> not in caseStudies`).toBe(true);
    seen.add(link);
  }
  // No missing entries either.
  for (const url of expected) {
    expect(seen.has(url), `missing feed <item> for ${url}`).toBe(true);
  }
});

// Box 7: feed body contains zero U+2014 em-dash code points.
test('feed body contains zero em-dash (U+2014) code points', async ({ request }) => {
  const { body } = await fetchFeed(request);
  expect(body, 'feed body must not contain the em-dash character').not.toContain(EM_DASH);
});

// Box 8: /case-studies HTML page has <link rel="alternate" type="application/rss+xml">
// pointing at the feed URL, for auto-discovery by browsers and feedreaders.
// Asserted via the Helmet-emitted head element per the 2026-05-25
// Helmet-appends lesson.
test('/case-studies HTML page advertises the RSS feed via <link rel="alternate">', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/case-studies', { waitUntil: 'domcontentloaded' });
  expect(response).not.toBeNull();
  expect(response!.status()).toBeLessThan(400);

  // Poll until Helmet appends the link tag.
  await expect
    .poll(
      () =>
        page
          .locator('head link[rel="alternate"][type="application/rss+xml"]')
          .count(),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);

  const hrefs = await page
    .locator('head link[rel="alternate"][type="application/rss+xml"]')
    .evaluateAll((nodes) => nodes.map((n) => (n as HTMLLinkElement).getAttribute('href') ?? ''));
  const pointsAtFeed = hrefs.some((h) => h.endsWith('/case-studies/rss.xml'));
  expect(
    pointsAtFeed,
    `expected a <link rel="alternate" type="application/rss+xml"> with href ending in /case-studies/rss.xml; got ${JSON.stringify(hrefs)}`,
  ).toBe(true);

  expect(errors).toEqual([]);
});

// Box 9: the hub renders a visible "Subscribe (RSS)" anchor routing to
// /case-studies/rss.xml (data-testid="case-studies-rss-link").
test('/case-studies renders a visible Subscribe (RSS) anchor to the feed', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/case-studies', { waitUntil: 'domcontentloaded' });
  expect(response).not.toBeNull();
  expect(response!.status()).toBeLessThan(400);

  const anchor = page.locator('[data-testid="case-studies-rss-link"]');
  await expect(anchor).toBeVisible();
  const href = await anchor.getAttribute('href');
  expect(href).toBe('/case-studies/rss.xml');
  const text = ((await anchor.textContent()) ?? '').toLowerCase();
  expect(text).toContain('rss');

  expect(errors).toEqual([]);
});

// Box 10: sibling-hub regression - re-run key ticket 0057 assertions on
// /case-studies to prove the additive Helmet <link rel="alternate"> did
// not break the hub. H1 substring, card count, CollectionPage + ItemList
// numberOfItems all match caseStudies.length.
test('sibling-hub regression: /case-studies still passes key ticket 0057 assertions', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/case-studies', { waitUntil: 'domcontentloaded' });
  expect(response).not.toBeNull();
  expect(response!.status()).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);

  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const h1Text = ((await h1.textContent()) ?? '').toLowerCase();
  expect(h1Text).toContain('case studies');

  const cards = page.locator('[data-testid="case-study-hub-card"]');
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBe(caseStudies.length);

  await expect
    .poll(
      () => page.$$eval('script[type="application/ld+json"]', (nodes) => nodes.length),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  const parsed = raws.map((r) => JSON.parse(r) as { '@type'?: string; numberOfItems?: number });

  const collections = parsed.filter((d) => d['@type'] === 'CollectionPage');
  expect(collections, 'exactly one CollectionPage block expected').toHaveLength(1);

  const lists = parsed.filter((d) => d['@type'] === 'ItemList');
  expect(lists, 'exactly one ItemList block expected').toHaveLength(1);
  expect(lists[0].numberOfItems).toBe(caseStudies.length);

  expect(errors).toEqual([]);
});
