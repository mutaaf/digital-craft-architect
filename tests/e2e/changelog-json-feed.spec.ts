import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0078 - Public /changelog.json JSON Feed 1.1 sibling to the
// existing /changelog/rss.xml (ticket 0055). Each test maps 1:1 to one
// of the 13 checks in AC #8, plus a subscribe-chip beacon assertion.
//
// The feed is generated at build time by scripts/generate-changelog-json.ts,
// invoked from the end of scripts/generate-changelog-rss.ts's exported main
// so the build chain runs:
//   generate-sitemap -> generate-changelog -> generate-changelog-rss ->
//   generate-changelog-json (this ticket) + generate-case-studies-rss.
// Per the 2026-09-05 route-fallback lesson, the JSON body is fetched via
// page.request.get (no browser render, no MIME-handling quirk).
// Per the 2026-05-25 SEO Pilot lesson, this spec does NOT toHaveTitle()
// for /changelog; the HTML-side checks read Helmet-managed head elements
// directly.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so the spec file itself contains no
// em-dash (the brand-voice Hard NO bans the literal character even in
// tests).
const EM_DASH = String.fromCharCode(8212);

const FEED_PATH = '/changelog.json';
const KNOWN_AREAS = new Set([
  'conversion',
  'seo',
  'content',
  'trust',
  'demos',
  'infra',
  'perf',
]);

interface JsonFeedItem {
  id: string;
  url: string;
  title: string;
  content_text: string;
  date_published: string;
  tags: string[];
}
interface JsonFeed {
  version: string;
  title: string;
  home_page_url: string;
  feed_url: string;
  description: string;
  language: string;
  items: JsonFeedItem[];
}

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

// Box 1: GET /changelog.json returns 200 and Content-Type is
// application/feed+json OR application/json (AC #6 allows either).
test('GET /changelog.json returns 200 with a JSON content-type', async ({
  request,
}) => {
  const { status, contentType } = await fetchFeed(request);
  expect(status, `expected 200 for ${FEED_PATH}, got ${status}`).toBe(200);
  const ct = contentType.toLowerCase();
  expect(
    ct.includes('application/feed+json') || ct.includes('application/json'),
    `expected application/feed+json or application/json content-type, got "${contentType}"`,
  ).toBe(true);
});

// Box 2: the response body parses as valid JSON.
test('feed body parses as valid JSON', async ({ request }) => {
  const { body } = await fetchFeed(request);
  expect(body.length, 'feed body must be non-empty').toBeGreaterThan(50);
  expect(() => JSON.parse(body)).not.toThrow();
});

// Box 3: parsed object has version, title, home_page_url, feed_url, items.
test('feed carries the JSON Feed 1.1 top-level fields', async ({ request }) => {
  const { body } = await fetchFeed(request);
  const feed = JSON.parse(body) as JsonFeed;
  expect(feed.version).toBe('https://jsonfeed.org/version/1.1');
  expect(typeof feed.title, 'title must be a string').toBe('string');
  expect(feed.title.length).toBeGreaterThan(0);
  expect(feed.home_page_url).toBe('https://digitalcraftai.com/changelog');
  expect(feed.feed_url).toBe('https://digitalcraftai.com/changelog.json');
  expect(Array.isArray(feed.items), 'items must be an array').toBe(true);
});

// Box 4: items is a non-empty array.
test('items array is non-empty', async ({ request }) => {
  const { body } = await fetchFeed(request);
  const feed = JSON.parse(body) as JsonFeed;
  expect(feed.items.length).toBeGreaterThanOrEqual(1);
});

// Box 5: every item has id, url, title, content_text, date_published, tags.
test('every item carries the required JSON Feed item fields', async ({
  request,
}) => {
  const { body } = await fetchFeed(request);
  const feed = JSON.parse(body) as JsonFeed;
  for (const item of feed.items) {
    expect(typeof item.id, `item.id must be a string: ${JSON.stringify(item)}`).toBe('string');
    expect(item.id.length, 'item.id must be non-empty').toBeGreaterThan(0);
    expect(typeof item.url).toBe('string');
    expect(item.url.length).toBeGreaterThan(0);
    expect(typeof item.title).toBe('string');
    expect(item.title.length).toBeGreaterThan(0);
    expect(typeof item.content_text).toBe('string');
    expect(item.content_text.length).toBeGreaterThan(0);
    expect(typeof item.date_published).toBe('string');
    expect(item.date_published.length).toBeGreaterThan(0);
    expect(Array.isArray(item.tags), 'item.tags must be an array').toBe(true);
    expect(item.tags.length, 'item.tags must be non-empty').toBeGreaterThan(0);
  }
});

// Box 6: every item.date_published parses as a valid ISO-8601 timestamp.
test('every item.date_published parses as a valid ISO-8601 timestamp', async ({
  request,
}) => {
  const { body } = await fetchFeed(request);
  const feed = JSON.parse(body) as JsonFeed;
  for (const item of feed.items) {
    expect(
      !isNaN(Date.parse(item.date_published)),
      `item.date_published "${item.date_published}" did not parse`,
    ).toBe(true);
  }
});

// Box 7: items ordered newest-first (matches the ticket 0055 RSS ordering).
test('items are ordered newest-first by date_published', async ({ request }) => {
  const { body } = await fetchFeed(request);
  const feed = JSON.parse(body) as JsonFeed;
  const first = Date.parse(feed.items[0].date_published);
  const last = Date.parse(feed.items[feed.items.length - 1].date_published);
  expect(first).toBeGreaterThanOrEqual(last);
});

// Box 8: items[0].url starts with https://digitalcraftai.com/changelog#.
test('items[0].url is a /changelog#NNNN permalink', async ({ request }) => {
  const { body } = await fetchFeed(request);
  const feed = JSON.parse(body) as JsonFeed;
  expect(feed.items[0].url).toMatch(/^https:\/\/digitalcraftai\.com\/changelog#/);
});

// Box 9: items[0].tags[0] is one of the known area values.
test('items[0].tags[0] is a known changelog area', async ({ request }) => {
  const { body } = await fetchFeed(request);
  const feed = JSON.parse(body) as JsonFeed;
  expect(KNOWN_AREAS.has(feed.items[0].tags[0])).toBe(true);
});

// Box 10: raw body contains zero U+2014 em-dash code points.
test('feed body contains zero em-dash (U+2014) code points', async ({
  request,
}) => {
  const { body } = await fetchFeed(request);
  expect(body).not.toContain(EM_DASH);
});

// Box 11: GET /changelog renders <link rel="alternate" type="application/feed+json"
// href="/changelog.json"> in <head>.
test('/changelog HTML page advertises the JSON Feed via <link rel="alternate">', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/changelog', { waitUntil: 'domcontentloaded' });
  expect(response).not.toBeNull();
  expect(response!.status()).toBeLessThan(400);

  await expect
    .poll(
      () =>
        page
          .locator('head link[rel="alternate"][type="application/feed+json"]')
          .count(),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);

  const hrefs = await page
    .locator('head link[rel="alternate"][type="application/feed+json"]')
    .evaluateAll((nodes) =>
      nodes.map((n) => (n as HTMLLinkElement).getAttribute('href') ?? ''),
    );
  const pointsAtFeed = hrefs.some((h) => h.endsWith('/changelog.json'));
  expect(
    pointsAtFeed,
    `expected a <link rel="alternate" type="application/feed+json"> with href ending in /changelog.json; got ${JSON.stringify(hrefs)}`,
  ).toBe(true);

  expect(errors).toEqual([]);
});

// Box 12: /changelog renders a visible [data-testid="changelog-json-subscribe-chip"]
// whose href resolves to /changelog.json.
test('/changelog renders a visible JSON Feed subscribe chip pointing at the feed', async ({
  page,
}) => {
  await page.goto('/changelog', { waitUntil: 'domcontentloaded' });
  const chip = page.locator('[data-testid="changelog-json-subscribe-chip"]');
  await expect(chip).toBeVisible({ timeout: 10_000 });
  const href = await chip.getAttribute('href');
  expect(href).toBe('/changelog.json');
});

// Box 13: a click on the JSON subscribe chip fires the changelog_json_subscribe
// beacon via the trackCTAClick shim (spied by hijacking window.gtag before
// the click).
test('clicking the JSON subscribe chip fires the changelog_json_subscribe beacon', async ({
  page,
}) => {
  await page.goto('/changelog', { waitUntil: 'domcontentloaded' });
  const chip = page.locator('[data-testid="changelog-json-subscribe-chip"]');
  await expect(chip).toBeVisible({ timeout: 10_000 });

  await page.evaluate(() => {
    (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents = [];
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (
      ...args: unknown[]
    ) => {
      (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents.push(args);
    };
  });

  // Prevent the browser from actually navigating away to /changelog.json
  // (which would tear down the page before we read window state).
  await chip.evaluate((el) =>
    el.addEventListener('click', (e) => e.preventDefault(), {
      capture: true,
      once: true,
    }),
  );
  await chip.click();

  const events = (await page.evaluate(
    () => (window as unknown as { __ctaEvents: unknown[][] }).__ctaEvents,
  )) as unknown[][];
  const ctaEvents = events.filter(
    (e) => Array.isArray(e) && e[0] === 'event' && e[1] === 'cta_click',
  );
  const labels = ctaEvents.map((e) => {
    const params = e[2] as { event_label?: string };
    return params?.event_label ?? '';
  });
  expect(
    labels.some((l) => l.includes('changelog_json_subscribe')),
    `expected a cta_click event carrying "changelog_json_subscribe"; got ${JSON.stringify(labels)}`,
  ).toBe(true);
});
