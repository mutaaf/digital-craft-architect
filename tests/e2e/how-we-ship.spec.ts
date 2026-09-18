import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS, ROUTES } from './routes';
import {
  SHIP_LOOP_STAGES,
  SHIP_LOOP_GATES,
  SHIP_LOOP_HARD_NOS,
} from '../../src/data/shipLoopStages';

// Ticket 0083 - /how-we-ship transparency page. Each test maps 1:1 to a box
// in the ticket's acceptance-criteria section. Modeled on
// `tests/e2e/security-posture-page.spec.ts` (ticket 0081, the closest
// structural peer for a trust-family public page emitting a URL-scoped
// pair of JSON-LD blocks backed by a `src/data/` typed constant) and
// `tests/e2e/ethics-page.spec.ts` (ticket 0077, the closest peer for a
// stacked "In effect since <date>" chip pattern).
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this spec the
// implementer grepped every `tests/e2e/*.spec.ts` for `=== 'TechArticle'`
// (zero matches site-wide - `/how-we-ship` is the first emitter) and
// `=== 'BreadcrumbList'` (30+ matches, every one invoked AFTER the spec's
// own `gotoX` helper navigates to that spec's own page, so every predicate
// is URL-scoped in practice). A new `/how-we-ship`-scoped sibling of
// either @type cannot collide with any predecessor. Grep result documented
// in the ticket Implementation log.
//
// Per the 2026-09-05 route-code-splitting lesson and the 2026-09-10
// mount-signal lesson, `/how-we-ship` is lazy-wrapped in `<Suspense>` so
// `gotoHowWeShip` waits for the RouteFallback to detach AND for the H1 to
// mount before reading page state.
//
// Per the 2026-09-08 sibling-hub-poll lesson, the JSON-LD read helper
// polls `page.locator('script[type="application/ld+json"]').evaluateAll`
// until at least one block's `@type` equals `'TechArticle'` BEFORE reading
// blocks - a count-only poll would fire before the Helmet head swap
// finishes.
//
// Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the em-dash
// check scopes ONLY to blocks THIS PAGE emits (TechArticle,
// BreadcrumbList) filtered by their `@type`, NOT to every
// `application/ld+json` block on the page. The homepage Organization block
// from `index.html` (ticket 0025) carries a legitimate em-dash and must
// not be flagged.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// character (the 2026-05-07 brand-voice Hard NO bans the literal even in
// tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const PAGE_PATH = '/how-we-ship';
const PAGE_URL = `${ORIGIN}${PAGE_PATH}`;

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
type TechArticle = {
  '@context'?: string;
  '@type': string;
  headline?: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  url?: string;
  about?: { '@type'?: string; name?: string };
  author?: { '@type'?: string; name?: string };
};

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

const isTechArticle = (d: unknown): d is TechArticle =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'TechArticle';

async function gotoHowWeShip(page: Page, path = PAGE_PATH): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${path}`).not.toBeNull();
  expect(response!.status(), `${path} returned ${response!.status()}`).toBeLessThan(400);
  // Wait for RouteFallback (role=status, aria-label=Loading) to detach per
  // the 2026-09-05 route-code-splitting lesson.
  await page
    .locator('[role="status"][aria-label="Loading"]')
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .catch(() => {});
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  // H1 mount signal per the 2026-09-10 lesson. Real "page ready" for a
  // lazy-loaded route with mount-time side effects.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });
  return errors;
}

async function readOwnedJsonLdBlocks(
  page: Page,
): Promise<{ raw: string; data: unknown }[]> {
  // Poll for a TechArticle block by @type per the 2026-09-08 sibling-hub-poll
  // lesson - a count-only poll would fire before Helmet finishes the head
  // swap and could return the pre-mount block set on a fast SPA navigation.
  await expect
    .poll(
      () =>
        page.$$eval('script[type="application/ld+json"]', (nodes) =>
          nodes.some((n) => {
            try {
              const parsed = JSON.parse(n.textContent ?? 'null') as unknown;
              return (
                typeof parsed === 'object' &&
                parsed !== null &&
                (parsed as { '@type'?: unknown })['@type'] === 'TechArticle'
              );
            } catch {
              return false;
            }
          }),
        ),
      { timeout: 10_000 },
    )
    .toBe(true);
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  return raws.map((raw) => ({ raw, data: JSON.parse(raw) as unknown }));
}

// Box 1 (AC #4 + AC #5): /how-we-ship path is in the ROUTES allow-list per
// the 2026-06-07 mirror-source-across-src-tests lesson.
test('/how-we-ship path is in the ROUTES allow-list', async () => {
  expect(new Set<string>(ROUTES).has(PAGE_PATH)).toBe(true);
});

// Box 2 (AC #1 + AC #2 mirror-source guards): SHIP_LOOP_STAGES has the four
// stages named by AGENTS.md, SHIP_LOOP_GATES has both gating checks, and
// SHIP_LOOP_HARD_NOS has at least six statements each with a valid ISO
// sinceDate.
test('SHIP_LOOP_STAGES / SHIP_LOOP_GATES / SHIP_LOOP_HARD_NOS mirror AGENTS.md', async () => {
  expect(SHIP_LOOP_STAGES.length).toBe(4);
  const stageIds = new Set(SHIP_LOOP_STAGES.map((s) => s.id));
  for (const id of ['groom', 'ship', 'review', 'auto-merge']) {
    expect(stageIds.has(id as (typeof SHIP_LOOP_STAGES)[number]['id'])).toBe(true);
  }
  for (const s of SHIP_LOOP_STAGES) {
    expect(s.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(typeof s.description).toBe('string');
    expect(s.description.length).toBeGreaterThan(20);
    expect(typeof s.cadence).toBe('string');
    expect(s.cadence.length).toBeGreaterThan(0);
    expect(s.description).not.toContain(EM_DASH);
    expect(s.name).not.toContain(EM_DASH);
    expect(s.cadence).not.toContain(EM_DASH);
  }
  expect(SHIP_LOOP_GATES.length).toBeGreaterThanOrEqual(2);
  expect(new Set<string>(SHIP_LOOP_GATES).has('build')).toBe(true);
  expect(new Set<string>(SHIP_LOOP_GATES).has('smoke-required')).toBe(true);
  expect(SHIP_LOOP_HARD_NOS.length).toBeGreaterThanOrEqual(6);
  for (const n of SHIP_LOOP_HARD_NOS) {
    expect(n.sinceDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(typeof n.statement).toBe('string');
    expect(n.statement.length).toBeGreaterThan(10);
    expect(n.statement).not.toContain(EM_DASH);
  }
});

// Box 3 (AC #3): GET /how-we-ship returns 200 and renders an H1 whose text
// contains "How we ship" (case-insensitive).
test('renders 200 with a "How we ship" H1', async ({ page }) => {
  const errors = await gotoHowWeShip(page);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const text = ((await h1.textContent()) ?? '').trim();
  expect(/how we ship/i.test(text)).toBe(true);
  expect(errors).toEqual([]);
});

// Box 4 (AC #3 + AC #10): renders exactly SHIP_LOOP_STAGES.length stage
// cards. Count derived from the mirror-source constant per the 2026-05-25
// rule, not hard-coded.
test('renders one stage card per SHIP_LOOP_STAGES entry', async ({ page }) => {
  const errors = await gotoHowWeShip(page);
  const cards = page.locator('[data-testid="ship-loop-stage-card"]');
  await expect(cards.first()).toBeVisible();
  await expect(cards).toHaveCount(SHIP_LOOP_STAGES.length);
  expect(errors).toEqual([]);
});

// Box 5 (AC #3 + AC #10): renders exactly SHIP_LOOP_GATES.length gate chips
// whose text content matches the array entries verbatim.
test('renders one gate chip per SHIP_LOOP_GATES entry with verbatim text', async ({ page }) => {
  const errors = await gotoHowWeShip(page);
  const chips = page.locator('[data-testid="ship-loop-gate-chip"]');
  await expect(chips.first()).toBeVisible();
  await expect(chips).toHaveCount(SHIP_LOOP_GATES.length);
  const texts = (await chips.allTextContents()).map((t) => t.trim());
  const expected = new Set<string>(SHIP_LOOP_GATES);
  for (const t of texts) {
    expect(expected.has(t), `gate chip text "${t}" not in SHIP_LOOP_GATES`).toBe(true);
  }
  expect(errors).toEqual([]);
});

// Box 6 (AC #3 + AC #10): renders exactly SHIP_LOOP_HARD_NOS.length Hard-NO
// items each with a visible "In effect since YYYY-MM-DD" chip.
test('renders one Hard-NO item per SHIP_LOOP_HARD_NOS entry with a sinceDate chip', async ({ page }) => {
  const errors = await gotoHowWeShip(page);
  const items = page.locator('[data-testid="ship-loop-hardno-item"]');
  await expect(items.first()).toBeVisible();
  await expect(items).toHaveCount(SHIP_LOOP_HARD_NOS.length);
  const chips = page.locator('[data-testid="ship-loop-hardno-since"]');
  await expect(chips).toHaveCount(SHIP_LOOP_HARD_NOS.length);
  const chipTexts = await chips.allTextContents();
  const sinceRe = /In effect since \d{4}-\d{2}-\d{2}/;
  for (const t of chipTexts) {
    expect(sinceRe.test(t), `expected sinceDate chip pattern in "${t}"`).toBe(true);
  }
  expect(errors).toEqual([]);
});

// Box 7 (AC #6): exactly one TechArticle JSON-LD block on the page whose
// about.name equals "Autonomous agent ship loop" and whose url is the
// /how-we-ship URL.
test('emits exactly one TechArticle JSON-LD about the ship loop', async ({ page }) => {
  const errors = await gotoHowWeShip(page);
  const blocks = await readOwnedJsonLdBlocks(page);
  const techArticles = blocks.filter((b): b is { raw: string; data: TechArticle } =>
    isTechArticle(b.data),
  );
  expect(
    techArticles,
    'exactly one TechArticle block expected on /how-we-ship',
  ).toHaveLength(1);
  const ta = techArticles[0].data;
  expect(ta.about?.name).toBe('Autonomous agent ship loop');
  expect(ta.url).toBe(PAGE_URL);
  expect(typeof ta.description).toBe('string');
  expect((ta.description ?? '').length).toBeGreaterThan(20);
  expect(typeof ta.datePublished).toBe('string');
  expect((ta.datePublished ?? '')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(typeof ta.dateModified).toBe('string');
  expect((ta.dateModified ?? '')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(errors).toEqual([]);
});

// Box 8 (AC #6): exactly one BreadcrumbList block with two itemListElement
// entries whose names are "Home" and "How we ship".
test('emits a two-item BreadcrumbList (Home -> How we ship)', async ({ page }) => {
  const errors = await gotoHowWeShip(page);
  const blocks = await readOwnedJsonLdBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(
    breadcrumbs,
    'exactly one BreadcrumbList block expected on /how-we-ship',
  ).toHaveLength(1);
  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[1].name).toBe('How we ship');
  expect(items[1].item).toBe(PAGE_URL);
  expect(errors).toEqual([]);
});

// Box 9 (AC #3 "See it for yourself"): the "See it for yourself" section
// renders three chips whose hrefs are /changelog, /changelog/rss.xml, and
// /changelog.json respectively.
test('See it for yourself section renders three evidence chips', async ({ page }) => {
  const errors = await gotoHowWeShip(page);
  const chips = page.locator('[data-testid="ship-loop-evidence-chip"]');
  await expect(chips).toHaveCount(3);
  const hrefs = await chips.evaluateAll((nodes) =>
    nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
  );
  const expected = new Set(['/changelog', '/changelog/rss.xml', '/changelog.json']);
  for (const h of hrefs) {
    expect(expected.has(h), `href "${h}" not in evidence chip set`).toBe(true);
  }
  expect(new Set(hrefs).size).toBe(3);
  expect(errors).toEqual([]);
});

// Box 10 (AC #8): the "How we ship" footer chip renders on / and clicking
// it fires trackCTAClick('footer_how_we_ship_chip', <current-route>) before
// navigating. Following the ticket 0023 / 0081 footer-chip pattern, gtag is
// stubbed AFTER page load (page.evaluate rather than addInitScript) so the
// Google Analytics loader script cannot overwrite the stub, and click's
// default navigation is suppressed once so the captured events survive past
// the click and can be read back.
test('footer How we ship chip fires the beacon on click', async ({ page }) => {
  const errors = await gotoHowWeShip(page, '/');
  await page.evaluate(() => {
    (window as unknown as { __ctaEvents: unknown[][] }).__ctaEvents = [];
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (
      ...args: unknown[]
    ) => {
      (window as unknown as { __ctaEvents: unknown[][] }).__ctaEvents.push(args);
    };
  });
  const chip = page.locator('[data-testid="footer-how-we-ship-chip"]');
  await expect(chip).toBeVisible();
  const chipLink = page
    .locator('a[href="/how-we-ship"]')
    .filter({ has: page.locator('[data-testid="footer-how-we-ship-chip"]') });
  await expect(chipLink).toHaveCount(1);
  await chipLink.evaluate((el) =>
    el.addEventListener('click', (e) => e.preventDefault(), { capture: true, once: true }),
  );
  await chipLink.click();
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
    labels.some((l) => /footer_how_we_ship_chip/.test(l) && /\//.test(l)),
    `expected cta_click event_label "footer_how_we_ship_chip - <route>", got: ${labels.join(' | ')}`,
  ).toBe(true);
  expect(errors).toEqual([]);
});

// Box 10b (AC #8): clicking the chip actually navigates to /how-we-ship
// (SPA transition, no full reload).
test('footer How we ship chip navigates to /how-we-ship', async ({ page }) => {
  const errors = await gotoHowWeShip(page, '/');
  const chipLink = page
    .locator('a[href="/how-we-ship"]')
    .filter({ has: page.locator('[data-testid="footer-how-we-ship-chip"]') });
  await expect(chipLink).toBeVisible();
  await chipLink.click();
  await expect(page).toHaveURL(/\/how-we-ship$/);
  expect(errors).toEqual([]);
});

// Box 11 (AC #9): dark-mode case. Toggle the `dark` class on
// documentElement and confirm the stage cards still render.
test('renders in dark mode', async ({ page }) => {
  const errors = await gotoHowWeShip(page);
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.locator('[data-testid="ship-loop-stage-card"]').first()).toBeVisible();
  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(hasDarkClass).toBe(true);
  expect(errors).toEqual([]);
});

// Box 12 (AC #10 + AC #12 em-dash Hard NO): no em-dash anywhere in visible
// copy or in the blocks THIS PAGE emits (TechArticle + BreadcrumbList) per
// the 2026-09-08 em-dash-JSON-LD-block-filter lesson. Do NOT iterate all
// application/ld+json blocks on the page - the homepage Organization block
// from index.html (ticket 0025) carries a legitimate historical em-dash.
test('no em-dash on the how-we-ship page or the blocks it emits', async ({ page }) => {
  const errors = await gotoHowWeShip(page);
  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(bodyText.length, 'body should have text content').toBeGreaterThan(100);
  expect(bodyText, 'no em-dash allowed in visible copy').not.toContain(EM_DASH);
  const blocks = await readOwnedJsonLdBlocks(page);
  const owned = blocks.filter((b) => isBreadcrumb(b.data) || isTechArticle(b.data));
  expect(
    owned.length,
    'BreadcrumbList + TechArticle blocks emitted by /how-we-ship must both render',
  ).toBe(2);
  for (const b of owned) {
    expect(b.raw, 'no em-dash allowed in a /how-we-ship-owned JSON-LD block').not.toContain(
      EM_DASH,
    );
  }
  expect(errors).toEqual([]);
});

// Box 13 (AC #6 mirror-source): the TechArticle description equals the
// Helmet-managed meta[name="description"] content byte-for-byte per the
// 2026-05-25 mirror-source rule.
test('meta description mirrors the TechArticle description', async ({ page }) => {
  const errors = await gotoHowWeShip(page);
  const descriptions = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) => nodes.map((n) => (n as HTMLMetaElement).content));
  const helmetDescription = descriptions[descriptions.length - 1];
  expect(typeof helmetDescription).toBe('string');
  expect(helmetDescription.length).toBeGreaterThan(20);
  expect(helmetDescription).not.toContain(EM_DASH);

  const blocks = await readOwnedJsonLdBlocks(page);
  const techArticles = blocks.filter((b): b is { raw: string; data: TechArticle } =>
    isTechArticle(b.data),
  );
  expect(techArticles).toHaveLength(1);
  expect(techArticles[0].data.description).toBe(helmetDescription);
  expect(errors).toEqual([]);
});
