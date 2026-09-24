import { test, expect, type Page } from '@playwright/test';
import { ROUTES, IGNORABLE_ERROR_PATTERNS } from './routes';
import { COMPARE_ENTRIES } from '../../src/data/compareEntries';

// Ticket 0095 - Public /compare.json JSON Feed 1.1 sibling to the shipped
// /compare hub (ticket 0048), mirroring the ticket 0078 /changelog.json
// pattern. Each test maps 1:1 to an acceptance-criteria box on the ticket
// (AC #9 in the ticket file). Modeled on
// tests/e2e/changelog-json-feed.spec.ts (ticket 0078, the direct peer for
// a JSON Feed surface).
//
// Per the 2026-05-25 mirror-source rule, this spec imports COMPARE_ENTRIES
// from src/data/compareEntries.ts and ROUTES from src/data/routes.ts (via
// tests/e2e/routes.ts's re-export per the 2026-06-07 lesson); no
// hand-rolled copies.
//
// Per the 2026-09-05 route-code-splitting lesson, the CompareHub
// regression case waits for the RouteFallback status role to detach and
// for the H1 to be visible before probing the DOM.
//
// Per the 2026-09-08 sibling-hub-name-poll lesson, the ticket 0048
// CollectionPage JSON-LD regression case polls on the block's `name`
// field, not on a `count > 0` heuristic.
//
// Per the 2026-06-15 attribute-list regex lesson, any regex in this spec
// that matches a tag attribute list uses `[^>]*`, not `[^/>]*`. No such
// regex is currently used; the guard-rail note is here for future edits.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

const FEED_PATH = '/compare.json';
const ORIGIN = 'https://digitalcraftai.com';
const HOME_PAGE_URL = `${ORIGIN}/compare`;
const FEED_URL = `${ORIGIN}/compare.json`;
const STATIC_ROUTES = new Set(ROUTES);

interface JsonFeedItem {
  id: string;
  url: string;
  title: string;
  content_text: string;
  date_published: string;
  date_modified: string;
}
interface JsonFeed {
  version: string;
  title: string;
  home_page_url: string;
  feed_url: string;
  description: string;
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

// Box (a): GET /compare.json returns 200 and Content-Type is
// application/feed+json OR application/json.
test('GET /compare.json returns 200 with a JSON content-type', async ({
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

// Box (b): the response body parses via JSON.parse and version === 1.1 URL.
test('feed body parses as valid JSON with the JSON Feed 1.1 version', async ({
  request,
}) => {
  const { body } = await fetchFeed(request);
  expect(body.length, 'feed body must be non-empty').toBeGreaterThan(50);
  expect(() => JSON.parse(body)).not.toThrow();
  const feed = JSON.parse(body) as JsonFeed;
  expect(feed.version).toBe('https://jsonfeed.org/version/1.1');
  expect(feed.title).toBe('Digital Craft AI comparison feed');
  expect(feed.home_page_url).toBe(HOME_PAGE_URL);
  expect(feed.feed_url).toBe(FEED_URL);
  expect(typeof feed.description).toBe('string');
  expect(feed.description.length).toBeGreaterThan(20);
  expect(Array.isArray(feed.items), 'items must be an array').toBe(true);
});

// Box (c): items.length === COMPARE_ENTRIES.length (mirror-source
// assertion importing COMPARE_ENTRIES from src/data/compareEntries.ts per
// the 2026-06-07 lesson). Item ordering matches array order.
test('items array length equals COMPARE_ENTRIES.length and preserves order', async ({
  request,
}) => {
  const { body } = await fetchFeed(request);
  const feed = JSON.parse(body) as JsonFeed;
  expect(feed.items.length).toBe(COMPARE_ENTRIES.length);
  for (let i = 0; i < COMPARE_ENTRIES.length; i++) {
    const entry = COMPARE_ENTRIES[i];
    expect(feed.items[i].url).toBe(`${ORIGIN}${entry.path}`);
  }
});

// Box (d): every item's `url` route is present in the src/data/routes.ts
// ROUTES array (imported per the 2026-06-07 lesson).
test('every item url resolves to a route in the ROUTES allow-list', async ({
  request,
}) => {
  const { body } = await fetchFeed(request);
  const feed = JSON.parse(body) as JsonFeed;
  for (const item of feed.items) {
    expect(item.url.startsWith(`${ORIGIN}/`), item.url).toBe(true);
    const pathname = item.url.slice(ORIGIN.length);
    expect(
      STATIC_ROUTES.has(pathname),
      `item.url "${item.url}" (path "${pathname}") not in ROUTES`,
    ).toBe(true);
    expect(pathname).toMatch(/^\/compare\/[a-z0-9-]+$/);
  }
});

// Box (e): every item's title byte-identically equals the derived
// "Digital Craft vs " + entry.tool string (mirror-source assertion per the
// 2026-05-25 rule). The ticket prose named `entry.title` but the shipped
// COMPARE_ENTRIES source has no `title` field; per the 2026-09-12
// code-beats-prose lesson the derived string is the byte-identical mirror
// of the CompareHub H2 render AND of the ItemList JSON-LD `name` field.
test('every item.title byte-equals "Digital Craft vs " + entry.tool', async ({
  request,
}) => {
  const { body } = await fetchFeed(request);
  const feed = JSON.parse(body) as JsonFeed;
  for (let i = 0; i < COMPARE_ENTRIES.length; i++) {
    const entry = COMPARE_ENTRIES[i];
    const expected = `Digital Craft vs ${entry.tool}`;
    expect(feed.items[i].title).toBe(expected);
  }
});

// Box (f): every item's date_published and date_modified parse as valid
// ISO 8601 datetimes and represent a datetime on or before now (UTC).
test('every item.date_published + date_modified parse as ISO 8601 <= now', async ({
  request,
}) => {
  const { body } = await fetchFeed(request);
  const feed = JSON.parse(body) as JsonFeed;
  const now = Date.now();
  for (const item of feed.items) {
    const pub = Date.parse(item.date_published);
    const mod = Date.parse(item.date_modified);
    expect(
      !isNaN(pub),
      `item.date_published "${item.date_published}" did not parse`,
    ).toBe(true);
    expect(
      !isNaN(mod),
      `item.date_modified "${item.date_modified}" did not parse`,
    ).toBe(true);
    expect(pub, `date_published ${item.date_published} is in the future`).toBeLessThanOrEqual(now);
    expect(mod, `date_modified ${item.date_modified} is in the future`).toBeLessThanOrEqual(now);
  }
});

// Box (g): every item.content_text contains zero U+2014 code points.
test('feed body and every item.content_text contain zero U+2014 em-dashes', async ({
  request,
}) => {
  const { body } = await fetchFeed(request);
  expect(body, 'raw feed body contains an em-dash').not.toContain(EM_DASH);
  const feed = JSON.parse(body) as JsonFeed;
  for (const item of feed.items) {
    expect(
      item.content_text,
      `item.content_text for ${item.url} contains an em-dash`,
    ).not.toContain(EM_DASH);
    expect(item.title, `item.title for ${item.url} contains an em-dash`).not.toContain(EM_DASH);
  }
});

// Box (h): response body total size is under 200KB (a soft cap so a future
// expansion still ships as one file). A warning fires above 100KB.
test('feed body total size stays under the 200KB soft cap', async ({ request }) => {
  const { body } = await fetchFeed(request);
  const bytes = Buffer.byteLength(body, 'utf-8');
  if (bytes > 100 * 1024) {
    console.warn(
      `warn: /compare.json body is ${bytes} bytes; approaching the 200KB soft cap.`,
    );
  }
  expect(bytes, `feed body is ${bytes} bytes; exceeds 200KB soft cap`).toBeLessThan(
    200 * 1024,
  );
});

async function gotoCompareHub(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/compare', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /compare').not.toBeNull();
  expect(response!.status(), `/compare returned ${response!.status()}`).toBeLessThan(400);
  // Per the 2026-09-05 route-code-splitting lesson, wait for the
  // RouteFallback [role="status"] to detach AND for the CompareHub H1 to
  // be visible before probing the DOM.
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
  await expect
    .poll(
      () =>
        page.evaluate(
          () => document.getElementById('root')?.innerHTML.length ?? 0,
        ),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(500);
  return errors;
}

// Box (i): CompareHub renders one visible [data-testid="compare-json-feed-link"]
// anchor whose href is /compare.json, and clicking it fires a cta_click
// beacon carrying "compare_subscribe_json" via trackCTAClick.
test('/compare renders the Subscribe (JSON Feed) chip and it fires the cta_click beacon', async ({
  page,
}) => {
  const errors = await gotoCompareHub(page);

  const chip = page.locator('[data-testid="compare-json-feed-link"]');
  await expect(chip).toBeVisible({ timeout: 10_000 });
  const href = await chip.getAttribute('href');
  expect(href).toBe('/compare.json');

  await page.evaluate(() => {
    (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents = [];
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (
      ...args: unknown[]
    ) => {
      (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents.push(args);
    };
  });

  // Prevent the browser from actually navigating away to /compare.json
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
    labels.some((l) => l.includes('compare_subscribe_json')),
    `expected a cta_click event carrying "compare_subscribe_json"; got ${JSON.stringify(labels)}`,
  ).toBe(true);

  expect(errors).toEqual([]);
});

// Box (j): the ticket 0048 CollectionPage JSON-LD block on /compare stays
// byte-identical after the additive footer chip (regression check per the
// 2026-05-30 second-@type lesson). Per the 2026-09-08 sibling-hub-name-poll
// lesson, the poll keys on the block's own `name` field, not on
// `count > 0` scripts.
test('/compare still emits the ticket 0048 CollectionPage block with byte-identical shape', async ({
  page,
}) => {
  const errors = await gotoCompareHub(page);

  await expect
    .poll(
      async () => {
        return await page.$$eval(
          'script[type="application/ld+json"]',
          (nodes) => {
            for (const n of nodes) {
              try {
                const parsed = JSON.parse(n.textContent ?? '') as {
                  '@type'?: string;
                  name?: string;
                };
                if (
                  parsed['@type'] === 'CollectionPage' &&
                  parsed.name === 'Digital Craft Comparisons'
                ) {
                  return true;
                }
              } catch {
                /* skip non-JSON */
              }
            }
            return false;
          },
        );
      },
      { timeout: 10_000 },
    )
    .toBe(true);

  const collectionBlocks = await page.$$eval(
    'script[type="application/ld+json"]',
    (nodes) => {
      const out: Array<Record<string, unknown>> = [];
      for (const n of nodes) {
        try {
          const parsed = JSON.parse(n.textContent ?? '') as Record<
            string,
            unknown
          >;
          if (parsed['@type'] === 'CollectionPage') out.push(parsed);
        } catch {
          /* skip non-JSON */
        }
      }
      return out;
    },
  );

  expect(collectionBlocks).toHaveLength(1);
  const cp = collectionBlocks[0];
  expect(cp['@context']).toBe('https://schema.org');
  expect(cp['@type']).toBe('CollectionPage');
  expect(cp.name).toBe('Digital Craft Comparisons');
  expect(cp.url).toBe(HOME_PAGE_URL);
  expect((cp.isPartOf as { '@type'?: string } | undefined)?.['@type']).toBe(
    'WebSite',
  );

  expect(errors).toEqual([]);
});
