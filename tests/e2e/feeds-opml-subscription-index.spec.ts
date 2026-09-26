import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';
import { PUBLISHED_FEEDS } from '../../src/data/publishedFeeds';

// Ticket 0098 - Public /feeds.opml OPML 2.0 subscription index aggregating
// every RSS and JSON Feed the site publishes. Each test maps 1:1 to a
// numbered check in acceptance criterion #9. Modeled on
// tests/e2e/compare-json-feed.spec.ts (ticket 0095, the direct peer for a
// machine-readable feed surface) and tests/e2e/changelog-rss-feed.spec.ts
// (ticket 0055, for XML parsing regex patterns).
//
// Per the 2026-05-25 mirror-source rule and the 2026-06-07
// mirror-source-across-src-tests lesson, this spec imports
// `PUBLISHED_FEEDS` from `src/data/publishedFeeds.ts` directly; no
// hand-rolled copy of the feed metadata lives in the test.
//
// Per the 2026-06-15 attribute-list regex lesson, every regex that walks
// an XML attribute list uses `[^>]*`, not `[^/>]*` (the forward slash is
// a legitimate character inside URL attribute values like `xmlUrl` and
// `htmlUrl`).
//
// Per the 2026-09-05 route-code-splitting lesson, the homepage-footer
// regression case waits for the RouteFallback status role to detach and
// for the H1 to be visible before probing the DOM.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

const FEED_PATH = '/feeds.opml';
const ORIGIN = 'https://digitalcraftai.com';
const OPML_TITLE = 'Digital Craft AI Feeds';

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

// Check (1): GET /feeds.opml returns 200 with content-type containing
// `application/xml` or `text/xml` or `text/x-opml` (any of the three is
// accepted by every mainstream reader).
test('GET /feeds.opml returns 200 with an XML-family content-type', async ({
  request,
}) => {
  const { status, contentType } = await fetchFeed(request);
  expect(status, `expected 200 for ${FEED_PATH}, got ${status}`).toBe(200);
  const ct = contentType.toLowerCase();
  expect(
    ct.includes('application/xml') ||
      ct.includes('text/xml') ||
      ct.includes('text/x-opml'),
    `expected application/xml or text/xml or text/x-opml content-type, got "${contentType}"`,
  ).toBe(true);
});

// Check (2): the response body parses as XML (starts with the XML
// declaration and is non-empty).
test('feed body parses as XML (starts with declaration, non-empty)', async ({
  request,
}) => {
  const { body } = await fetchFeed(request);
  expect(body.length, 'feed body must be non-empty').toBeGreaterThan(200);
  expect(body.startsWith('<?xml')).toBe(true);
});

// Check (3): the root element is `<opml version="2.0">`.
test('root element is <opml version="2.0">', async ({ request }) => {
  const { body } = await fetchFeed(request);
  const rootMatch = body.match(/<opml\b[^>]*>/);
  expect(rootMatch, 'body must contain an <opml ...> root open tag').not.toBeNull();
  expect(rootMatch![0]).toContain('version="2.0"');
});

// Check (4): the <head> block contains a <title> element with text
// "Digital Craft AI Feeds".
test('<head> contains a <title> with the expected text', async ({ request }) => {
  const { body } = await fetchFeed(request);
  const headMatch = body.match(/<head>([\s\S]*?)<\/head>/);
  expect(headMatch, 'feed must contain a <head>...</head> block').not.toBeNull();
  const head = headMatch![1];
  const titleMatch = head.match(/<title>([^<]+)<\/title>/);
  expect(titleMatch, '<head> must contain a <title>').not.toBeNull();
  expect(titleMatch![1]).toBe(OPML_TITLE);
});

// Check (5): the <body> contains exactly PUBLISHED_FEEDS.length
// <outline> elements (mirror-source assertion importing PUBLISHED_FEEDS
// from src/data/publishedFeeds.ts per the 2026-06-07 lesson).
test('<body> contains exactly PUBLISHED_FEEDS.length <outline> elements', async ({
  request,
}) => {
  const { body } = await fetchFeed(request);
  const bodyMatch = body.match(/<body>([\s\S]*?)<\/body>/);
  expect(bodyMatch, 'feed must contain a <body>...</body> block').not.toBeNull();
  const bodyContent = bodyMatch![1];
  // Per the 2026-06-15 attribute-list regex lesson, `[^>]*` (not
  // `[^/>]*`) matches attribute lists that include URL slashes.
  const outlines = bodyContent.match(/<outline\b[^>]*\/?>/g) ?? [];
  expect(outlines.length).toBe(PUBLISHED_FEEDS.length);
});

// Check (6): every <outline>'s xmlUrl is byte-identical to the
// corresponding PUBLISHED_FEEDS[i].xmlUrl (mirror-source, preserved
// order).
test('every <outline> xmlUrl matches PUBLISHED_FEEDS in order', async ({
  request,
}) => {
  const { body } = await fetchFeed(request);
  const bodyMatch = body.match(/<body>([\s\S]*?)<\/body>/);
  const bodyContent = bodyMatch![1];
  const outlines = bodyContent.match(/<outline\b[^>]*\/?>/g) ?? [];
  expect(outlines.length).toBe(PUBLISHED_FEEDS.length);
  for (let i = 0; i < PUBLISHED_FEEDS.length; i++) {
    const outline = outlines[i];
    const xmlUrlMatch = outline.match(/\bxmlUrl="([^"]+)"/);
    expect(xmlUrlMatch, `outline ${i} missing xmlUrl attribute: ${outline}`).not.toBeNull();
    expect(xmlUrlMatch![1]).toBe(PUBLISHED_FEEDS[i].xmlUrl);
  }
});

// Check (7): every <outline>'s type attribute matches
// PUBLISHED_FEEDS[i].type and is either "rss" or "json".
test('every <outline> type matches PUBLISHED_FEEDS[i].type', async ({
  request,
}) => {
  const { body } = await fetchFeed(request);
  const bodyMatch = body.match(/<body>([\s\S]*?)<\/body>/);
  const bodyContent = bodyMatch![1];
  const outlines = bodyContent.match(/<outline\b[^>]*\/?>/g) ?? [];
  expect(outlines.length).toBe(PUBLISHED_FEEDS.length);
  for (let i = 0; i < PUBLISHED_FEEDS.length; i++) {
    const outline = outlines[i];
    const typeMatch = outline.match(/\btype="([^"]+)"/);
    expect(typeMatch, `outline ${i} missing type attribute: ${outline}`).not.toBeNull();
    const typeValue = typeMatch![1];
    expect(typeValue === 'rss' || typeValue === 'json').toBe(true);
    expect(typeValue).toBe(PUBLISHED_FEEDS[i].type);
  }
});

// Check (8): the response body contains zero U+2014 em-dash code points.
test('feed body contains zero em-dash (U+2014) code points', async ({
  request,
}) => {
  const { body } = await fetchFeed(request);
  expect(body, 'feed body must not contain the em-dash character').not.toContain(EM_DASH);
});

// Check (9): the response body size is under the 20KB failure cap
// (with a 10KB warning). OPML files are tiny; a runaway feed count
// or a stray CDATA payload trips the warning.
test('feed body stays under the 20KB failure cap', async ({ request }) => {
  const { body } = await fetchFeed(request);
  const bytes = Buffer.byteLength(body, 'utf-8');
  if (bytes > 10 * 1024) {
    console.warn(
      `warn: /feeds.opml body is ${bytes} bytes; approaching the 20KB failure cap.`,
    );
  }
  expect(bytes, `feed body is ${bytes} bytes; exceeds 20KB soft cap`).toBeLessThan(
    20 * 1024,
  );
});

// Check (10): homepage footer renders one visible
// [data-testid="feeds-opml-link"] anchor with href="/feeds.opml".
test('homepage footer renders the Subscribe (OPML) chip', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /').not.toBeNull();
  expect(response!.status(), `/ returned ${response!.status()}`).toBeLessThan(400);

  // Per the 2026-09-05 route-code-splitting lesson, wait for the
  // RouteFallback status role to detach AND for the H1 to be visible
  // before probing the DOM.
  await page
    .locator('[role="status"][aria-label="Loading"]')
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .catch(() => {
      /* fallback may never appear */
    });
  await page
    .getByRole('heading', { level: 1 })
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 })
    .catch(() => {
      /* older UA quirk fallback */
    });

  const chip = page.locator('[data-testid="feeds-opml-link"]').first();
  await chip.scrollIntoViewIfNeeded();
  await expect(chip).toBeVisible({ timeout: 10_000 });
  const href = await chip.getAttribute('href');
  expect(href).toBe('/feeds.opml');

  expect(errors).toEqual([]);
});

// Check (11): every xmlUrl advertised in PUBLISHED_FEEDS returns 200
// on the same build (regression check that no OPML entry points at a
// missing feed). Only same-origin URLs are fetched via the preview
// server; the path is derived from the URL's pathname.
test('every advertised feed URL in PUBLISHED_FEEDS returns 200', async ({
  request,
}) => {
  for (const feed of PUBLISHED_FEEDS) {
    expect(feed.xmlUrl.startsWith(`${ORIGIN}/`), feed.xmlUrl).toBe(true);
    const pathname = feed.xmlUrl.slice(ORIGIN.length);
    const res = await request.get(pathname);
    expect(
      res.status(),
      `expected 200 for ${pathname}, got ${res.status()}`,
    ).toBe(200);
  }
});
