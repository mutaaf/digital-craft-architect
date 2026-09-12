import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS, ROUTES } from './routes';
import { ETHICS_COMMITMENTS } from '../../src/data/ethicsCommitments';

// Ticket 0077 - /ethics "What we won't do" public commitments page. Each test
// maps 1:1 to a case in the ticket's acceptance-criteria box #7. Modeled on
// `tests/e2e/trust-page.spec.ts` (ticket 0018, the direct peer for a trust-
// family public page) and `tests/e2e/subprocessors.spec.ts` (ticket 0069, the
// direct peer for a structured-content trust page emitting a URL-scoped
// BreadcrumbList JSON-LD block).
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this spec the
// implementer greps every `tests/e2e/*-jsonld.spec.ts` for
// `=== 'BreadcrumbList'` predicates and documents the grep result in the
// ticket Implementation log. Every predecessor BreadcrumbList assertion is
// URL-scoped (the spec navigates to its own page first and asserts blocks on
// THAT page only), so a sibling `/ethics`-scoped BreadcrumbList block cannot
// collide with any pre-existing assertion.
//
// Per the 2026-09-05 route-code-splitting lesson, /ethics is lazy-wrapped in
// <Suspense>, so this spec waits for the H1 to be visible with an auto-
// retrying assertion after the length poll instead of relying on
// `root.innerHTML.length > N` alone for readiness.
// Per the 2026-05-25 SEO Pilot lesson, /ethics is NOT in the index.html SEO
// Pilot pages table; the spec asserts the Helmet-managed meta description
// directly, never toHaveTitle().
// Per the 2026-09-08 sibling-hub-poll lesson, the JSON-LD helper polls until
// at least one block's third ListItem `name` equals "What we won't do" BEFORE
// reading and filtering blocks, so the assertion cannot fire during the
// Helmet head swap window.
// Per the 2026-09-08 em-dash lesson, the "no em-dash in JSON-LD" case filters
// the block list down to blocks THIS PAGE actually emits (BreadcrumbList),
// never iterating over all blocks (which would trip the site-wide index.html
// Organization block's legitimate historical em-dash).

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// character (2026-05-07 brand-voice Hard NO bans the literal even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const PAGE_PATH = '/ethics';
const PAGE_URL = `${ORIGIN}${PAGE_PATH}`;
const TRUST_PATH = '/trust';
const PAGE_H1 = "What we won't do";

type BreadcrumbItem = {
  '@type': string;
  position?: number;
  name?: string;
  item?: string;
};
type Breadcrumb = {
  '@context'?: string;
  '@type': string;
  itemListElement?: BreadcrumbItem[];
};

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

async function gotoEthics(page: Page, path = PAGE_PATH): Promise<string[]> {
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
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });
  return errors;
}

// Poll every JSON-LD block on the DOM until at least one is a BreadcrumbList
// whose third ListItem name equals the /ethics H1. This mirrors the 2026-09-08
// sibling-hub-poll lesson: on an SPA navigation the Helmet head swap is not
// atomic, so a "count > 0 JSON-LD scripts" poll can return before the /ethics-
// owned block lands. Keying the poll on the target hub's own unique field
// (third-item name equals the page H1) blocks until the swap completes.
async function assertEthicsBreadcrumb(page: Page): Promise<Breadcrumb[]> {
  await expect
    .poll(
      async () => {
        const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
          nodes.map((n) => n.textContent ?? ''),
        );
        const parsed = raws
          .map((r) => {
            try {
              return JSON.parse(r) as unknown;
            } catch {
              return null;
            }
          })
          .flatMap((d) => (Array.isArray(d) ? d : [d]))
          .filter((d): d is Breadcrumb => isBreadcrumb(d));
        return parsed.some((b) => {
          const items = b.itemListElement ?? [];
          return items.length >= 3 && (items[2]?.name ?? '') === PAGE_H1;
        });
      },
      { timeout: 10_000 },
    )
    .toBe(true);

  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  return raws
    .map((r) => {
      try {
        return JSON.parse(r) as unknown;
      } catch {
        return null;
      }
    })
    .flatMap((d) => (Array.isArray(d) ? d : [d]))
    .filter((d): d is Breadcrumb => isBreadcrumb(d));
}

// Case 1 - GET /ethics returns 200 and the H1 reads exactly "What we won't do".
test('renders 200 with the expected H1', async ({ page }) => {
  const errors = await gotoEthics(page);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const text = ((await h1.textContent()) ?? '').trim();
  expect(text).toBe(PAGE_H1);
  expect(errors).toEqual([]);
});

// Case 2 - the page renders exactly N commitment cards where N equals
// ETHICS_COMMITMENTS.length. Per the 2026-06-07 src-imports-tests lesson the
// spec imports the canonical array directly from src/data/.
test('renders one ethics-commitment-card per ETHICS_COMMITMENTS entry', async ({ page }) => {
  const errors = await gotoEthics(page);
  const list = page.locator('[data-testid="ethics-commitments-list"]');
  await expect(list).toBeVisible();
  const cards = page.locator('[data-testid="ethics-commitment-card"]');
  await expect(cards.first()).toBeVisible();
  await expect(cards).toHaveCount(ETHICS_COMMITMENTS.length);
  expect(ETHICS_COMMITMENTS.length).toBeGreaterThanOrEqual(8);
  expect(ETHICS_COMMITMENTS.length).toBeLessThanOrEqual(12);
  expect(errors).toEqual([]);
});

// Case 3 - each ethics-commitment-card article contains a visible sinceDate
// chip whose text matches /In effect since \d{4}-\d{2}-\d{2}/.
test('every card shows an "In effect since YYYY-MM-DD" chip', async ({ page }) => {
  const errors = await gotoEthics(page);
  const cards = page.locator('[data-testid="ethics-commitment-card"]');
  await expect(cards).toHaveCount(ETHICS_COMMITMENTS.length);
  const texts = await cards.allTextContents();
  expect(texts.length).toBe(ETHICS_COMMITMENTS.length);
  const chipRe = /In effect since \d{4}-\d{2}-\d{2}/;
  for (const t of texts) {
    expect(chipRe.test(t), `card text missing sinceDate chip: ${t}`).toBe(true);
  }
  expect(errors).toEqual([]);
});

// Case 4 - the visible body text contains no em-dash character. The site-wide
// index.html Organization block is a JSON-LD script tag, not visible body
// text, so the body scan is safe per the 2026-09-08 em-dash lesson.
test('no em-dash character anywhere in visible body text', async ({ page }) => {
  const errors = await gotoEthics(page);
  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(bodyText.length, 'body should have text content').toBeGreaterThan(100);
  expect(bodyText, 'no em-dash allowed in visible copy').not.toContain(EM_DASH);
  expect(errors).toEqual([]);
});

// Case 5 - exactly ONE BreadcrumbList JSON-LD block scoped to /ethics whose
// third ListItem name equals the page H1. Uses the poll-until-third-item
// helper per the 2026-09-08 sibling-hub-poll lesson.
test('emits exactly one BreadcrumbList JSON-LD scoped to /ethics', async ({ page }) => {
  const errors = await gotoEthics(page);
  const breadcrumbs = await assertEthicsBreadcrumb(page);
  const owned = breadcrumbs.filter((b) => {
    const items = b.itemListElement ?? [];
    return items.length >= 3 && (items[2]?.name ?? '') === PAGE_H1;
  });
  expect(owned, 'exactly one /ethics-scoped BreadcrumbList expected').toHaveLength(1);

  const items = owned[0].itemListElement ?? [];
  expect(items.length).toBe(3);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[0].item).toBe(`${ORIGIN}/`);
  expect(items[1].name).toBe('Trust');
  expect(items[1].item).toBe(`${ORIGIN}${TRUST_PATH}`);
  expect(items[2].name).toBe(PAGE_H1);
  expect(items[2].item).toBe(PAGE_URL);

  // Owned block string carries no em-dash character (2026-05-07 Hard NO).
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  const ownedRaw = raws.find((r) => r.includes(PAGE_URL) && r.includes('BreadcrumbList'));
  expect(ownedRaw, '/ethics-owned BreadcrumbList raw JSON-LD should be present').toBeTruthy();
  expect(ownedRaw ?? '', 'no em-dash allowed in /ethics-owned JSON-LD').not.toContain(EM_DASH);

  expect(errors).toEqual([]);
});

// Case 6 - the page emits NO other JSON-LD block beyond BreadcrumbList (no
// AboutPage, no ItemList, no CollectionPage, no ClaimReview, no HowTo, no
// SpecialAnnouncement). Filters to /ethics-URL-scoped blocks so the site-wide
// index.html Organization / WebSite / SiteNavigationElement blocks do not
// count (they belong to the shell, not to /ethics).
test('emits no JSON-LD block on /ethics besides BreadcrumbList', async ({ page }) => {
  const errors = await gotoEthics(page);
  await assertEthicsBreadcrumb(page); // ensure Helmet head swap finished

  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  const parsed = raws
    .map((r) => {
      try {
        return JSON.parse(r) as unknown;
      } catch {
        return null;
      }
    })
    .flatMap((d) => (Array.isArray(d) ? d : [d]))
    .filter((d): d is Record<string, unknown> => typeof d === 'object' && d !== null);

  // Consider a block /ethics-owned if it references PAGE_URL or is a
  // BreadcrumbList whose third item is the page H1.
  const owned = parsed.filter((d) => {
    if (d['@type'] === 'BreadcrumbList') {
      const items = (d.itemListElement as BreadcrumbItem[] | undefined) ?? [];
      return items.length >= 3 && (items[2]?.name ?? '') === PAGE_H1;
    }
    const serialized = JSON.stringify(d);
    return serialized.includes(PAGE_URL);
  });

  // Exactly one owned block, and its @type is BreadcrumbList (no other type).
  expect(owned, 'exactly one /ethics-owned JSON-LD block expected').toHaveLength(1);
  const forbiddenTypes = new Set([
    'AboutPage',
    'CollectionPage',
    'ItemList',
    'ClaimReview',
    'HowTo',
    'SpecialAnnouncement',
  ]);
  for (const block of parsed) {
    const t = block['@type'];
    if (typeof t !== 'string') continue;
    if (!forbiddenTypes.has(t)) continue;
    const serialized = JSON.stringify(block);
    expect(
      serialized.includes(PAGE_URL),
      `/ethics must not emit a ${t} block; found one referencing ${PAGE_URL}`,
    ).toBe(false);
  }
  expect(errors).toEqual([]);
});

// Case 7 - the /trust cross-link chip is present on /trust and its href
// resolves to /ethics.
test('the /trust page has a cross-link chip pointing to /ethics', async ({ page }) => {
  const errors = await gotoEthics(page, TRUST_PATH);
  const chip = page.locator('[data-testid="trust-ethics-link"]');
  await expect(chip).toBeVisible();
  const href = await chip.getAttribute('href');
  expect(href).toBe(PAGE_PATH);
  const text = ((await chip.textContent()) ?? '').trim();
  expect(text.length, 'chip should have visible label text').toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

// Case 8 - clicking the /trust cross-link chip fires the ethics_from_trust
// beacon. gtag is shimmed via addInitScript BEFORE navigation so the shim is
// present at every document load.
test('/trust cross-link click fires ethics_from_trust beacon', async ({ page }) => {
  await page.addInitScript(() => {
    const win = window as unknown as {
      __ethicsEvents: string[];
      gtag: (command: string, action: string, params?: Record<string, unknown>) => void;
    };
    win.__ethicsEvents = [];
    win.gtag = (_command, _action, params) => {
      const label =
        params && typeof params.event_label === 'string' ? params.event_label : '';
      if (label.includes('ethics')) {
        win.__ethicsEvents.push(`beacon:${label}`);
      }
    };
  });
  const errors = await gotoEthics(page, TRUST_PATH);
  const chip = page.locator('[data-testid="trust-ethics-link"]');
  await expect(chip).toBeVisible();
  // Intercept the /ethics navigation so the click stays on /trust (we're
  // only asserting the beacon fires on click; SPA nav is orthogonal).
  await chip.evaluate((node) => {
    node.addEventListener('click', (e) => e.preventDefault(), { once: true });
  });
  await chip.click();
  const events = await page.evaluate(
    () => (window as unknown as { __ethicsEvents: string[] }).__ethicsEvents,
  );
  expect(
    events.some((e) => e.includes('ethics_from_trust')),
    `expected ethics_from_trust beacon; got: ${events.join(', ')}`,
  ).toBe(true);
  expect(errors).toEqual([]);
});

// Case 9 - the page renders identically in dark mode.
test('renders identically in dark mode', async ({ page }) => {
  const errors = await gotoEthics(page);
  const lightCards = await page
    .locator('[data-testid="ethics-commitment-card"]')
    .count();
  const lightHeadings = await page.$$eval('h1, h2', (nodes) =>
    nodes.map((n) => (n.textContent ?? '').trim()).filter((t) => t.length > 0),
  );

  await page.evaluate(() => document.documentElement.classList.add('dark'));

  const darkCards = await page
    .locator('[data-testid="ethics-commitment-card"]')
    .count();
  const darkHeadings = await page.$$eval('h1, h2', (nodes) =>
    nodes.map((n) => (n.textContent ?? '').trim()).filter((t) => t.length > 0),
  );

  expect(darkCards).toBe(lightCards);
  expect(darkHeadings).toEqual(lightHeadings);
  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(hasDarkClass).toBe(true);
  expect(errors).toEqual([]);
});

// Case 10 - the ethics_view beacon fires exactly ONCE per page mount. Even on
// a SPA-transition return (leave /ethics via SPA nav, come back via SPA nav),
// the useRef mount guard prevents a double-fire within the same component
// instance; a fresh navigation counts each mount as its own beacon, so the
// stricter contract is "exactly one per new mount". We seed the gtag shim
// before navigation and count only ethics_view labels.
test('ethics_view beacon fires exactly once per mount', async ({ page }) => {
  await page.addInitScript(() => {
    const win = window as unknown as {
      __viewEvents: string[];
      gtag: (command: string, action: string, params?: Record<string, unknown>) => void;
    };
    win.__viewEvents = [];
    win.gtag = (_command, _action, params) => {
      const label =
        params && typeof params.event_label === 'string' ? params.event_label : '';
      if (label === 'ethics_view') win.__viewEvents.push(label);
    };
  });
  const errors = await gotoEthics(page);
  // Wait for the useEffect to fire (mount-time side effects; the useRef guard
  // debounces a StrictMode double-mount).
  await expect
    .poll(
      () => page.evaluate(() => (window as unknown as { __viewEvents: string[] }).__viewEvents.length),
      { timeout: 5_000 },
    )
    .toBeGreaterThan(0);
  const events = await page.evaluate(
    () => (window as unknown as { __viewEvents: string[] }).__viewEvents,
  );
  expect(events.length, `expected exactly one ethics_view; got: ${events.join(', ')}`).toBe(1);
  expect(errors).toEqual([]);
});

// Bonus - /ethics is registered in the ROUTES allow-list per the 2026-06-07
// src-imports-tests lesson.
test('/ethics path is in the ROUTES allow-list', async () => {
  expect(new Set<string>(ROUTES).has(PAGE_PATH)).toBe(true);
});
