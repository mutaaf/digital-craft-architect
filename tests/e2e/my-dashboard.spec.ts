import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0045 - Personalized /my visitor dashboard surfacing saved estimates,
// recent demos, and quiz persona. Each test maps 1:1 to a sub-scenario in
// acceptance box 6 (cases a-g) plus the dark-mode and no-em-dash guards
// every new component owes per the brand-voice + dark-mode Hard NOs.
//
// Modeled on tests/e2e/whats-new-since-visit.spec.ts (ticket 0040, the
// closest peer for "client-side personalization page seeded via
// page.addInitScript"). Pre-seeding uses the same addInitScript pattern.
//
// Per the 2026-05-25 SEO Pilot lesson the spec does NOT use
// page.toHaveTitle() because /my is not in the index.html SEO Pilot pages
// table; we read the LAST meta[name="description"] (the Helmet-appended
// one) instead. Per the 2026-05-30 second-@type lesson, the implementer
// grepped every existing tests/e2e/*-jsonld.spec.ts for
// `=== 'BreadcrumbList'` and `=== 'WebPage'` predicates before writing code:
// BreadcrumbList predicates exist but are all URL-scoped (to /changelog,
// /quiz, /trust today, none of which run on /my), and WebPage returns zero
// matches site-wide (/my is the first page to emit a WebPage block), so
// adding new /my-scoped sibling blocks is safe.

const DASHBOARD_URL = '/my';

const LAST_ESTIMATE_KEY = 'dca_last_estimate_v1_construction';
const RECENT_DEMOS_KEY = 'dca_recent_demos_v1';
const QUIZ_PERSONA_KEY = 'dca_quiz_persona_v1';

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the 2026-05-07 brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const DASHBOARD_CANONICAL = `${ORIGIN}/my`;

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  return errors;
}

async function gotoDashboard(page: Page): Promise<void> {
  const response = await page.goto(DASHBOARD_URL, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${DASHBOARD_URL}`).not.toBeNull();
  expect(response!.status(), `${DASHBOARD_URL} returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
}

type SeedSpec = {
  estimate?: Record<string, unknown>;
  recentDemos?: Array<{ path: string; title: string; vertical: string; viewedAt: number }>;
  quizPersona?: { persona: string; completedAt: number };
};

async function contextWithSeed(
  browser: import('@playwright/test').Browser,
  seed: SeedSpec,
  viewport?: { width: number; height: number },
): Promise<{ ctx: BrowserContext; page: Page; errors: string[] }> {
  const ctx = await browser.newContext(viewport ? { viewport } : undefined);
  await ctx.addInitScript(
    ([estimateKey, demosKey, personaKey, payload]) => {
      try {
        const p = JSON.parse(payload) as {
          estimate?: unknown;
          recentDemos?: unknown;
          quizPersona?: unknown;
        };
        if (p.estimate !== undefined) {
          window.localStorage.setItem(estimateKey, JSON.stringify(p.estimate));
        }
        if (p.recentDemos !== undefined) {
          window.localStorage.setItem(demosKey, JSON.stringify(p.recentDemos));
        }
        if (p.quizPersona !== undefined) {
          window.localStorage.setItem(personaKey, JSON.stringify(p.quizPersona));
        }
      } catch {
        /* storage unavailable - non-fatal */
      }
    },
    [LAST_ESTIMATE_KEY, RECENT_DEMOS_KEY, QUIZ_PERSONA_KEY, JSON.stringify(seed)] as const,
  );
  const page = await ctx.newPage();
  const errors = trackErrors(page);
  return { ctx, page, errors };
}

function fullSeed(): SeedSpec {
  // 14 days ago - old enough that the WhatsNewSinceVisit strip should pick
  // up multiple shipped changelog entries between then and now.
  const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  return {
    estimate: {
      selectedTypeId: 'kitchen',
      sqft: 200,
      selectedFinishId: 'mid_range',
      selectedExtraIds: ['permit', 'design'],
    },
    recentDemos: [
      {
        path: '/construction/demo/voice-negotiator',
        title: 'Voice Negotiator',
        vertical: 'Construction',
        viewedAt: fourteenDaysAgo,
      },
      {
        path: '/construction/demo/estimate',
        title: 'Smart Estimate Generator',
        vertical: 'Construction',
        viewedAt: fourteenDaysAgo - 60_000,
      },
    ],
    quizPersona: {
      persona: 'Ready for AI',
      completedAt: fourteenDaysAgo,
    },
  };
}

// Box (a): all-empty case clears localStorage, navigates to /my, and
// asserts only the empty-state CTA renders.
test('all-empty: only the empty-state CTA renders', async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = trackErrors(page);
  await gotoDashboard(page);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });

  // No card sections render.
  await expect(page.getByTestId('dashboard-estimate-card')).toHaveCount(0);
  await expect(page.getByTestId('dashboard-recent-demos-card')).toHaveCount(0);
  await expect(page.getByTestId('dashboard-quiz-persona-card')).toHaveCount(0);

  // Empty state visible with a single CTA to /demos.
  const empty = page.getByTestId('dashboard-empty-state');
  await expect(empty).toBeVisible();
  const emptyCta = page.getByTestId('dashboard-empty-cta');
  await expect(emptyCta).toBeVisible();
  await expect(emptyCta).toHaveAttribute('href', '/demos');

  expect(errors).toEqual([]);
  await ctx.close();
});

// Box (b): full-state case seeds all four stores and asserts all four
// cards render with the expected text. (The WhatsNew strip is the
// fourth surface; its own spec covers its internals - we only assert it
// shows up.)
test('full-state: all four cards render', async ({ browser }) => {
  const { ctx, page, errors } = await contextWithSeed(browser, fullSeed());
  await gotoDashboard(page);

  // Estimate card
  const estimate = page.getByTestId('dashboard-estimate-card');
  await expect(estimate).toBeVisible();
  await expect(estimate).toContainText(/your last estimate/i);

  // Recent demos card
  const demos = page.getByTestId('dashboard-recent-demos-card');
  await expect(demos).toBeVisible();
  await expect(demos).toContainText(/recently viewed/i);

  // Quiz persona card
  const persona = page.getByTestId('dashboard-quiz-persona-card');
  await expect(persona).toBeVisible();
  await expect(persona).toContainText(/your ai readiness/i);
  await expect(persona).toContainText(/Ready for AI/);

  // WhatsNew strip is the existing ticket 0040 component reused verbatim.
  await expect(page.getByTestId('whats-new-strip')).toBeVisible();

  // Empty state is suppressed when at least one card has data.
  await expect(page.getByTestId('dashboard-empty-state')).toHaveCount(0);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Box (c): partial-state case seeds only the estimate store and asserts
// only the estimate card renders. Empty state is suppressed when at
// least one card has data.
test('partial-state: only the estimate card renders, empty CTA suppressed', async ({
  browser,
}) => {
  const { ctx, page, errors } = await contextWithSeed(browser, {
    estimate: {
      selectedTypeId: 'bathroom',
      sqft: 100,
      selectedFinishId: 'standard',
      selectedExtraIds: [],
    },
  });
  await gotoDashboard(page);

  await expect(page.getByTestId('dashboard-estimate-card')).toBeVisible();
  await expect(page.getByTestId('dashboard-recent-demos-card')).toHaveCount(0);
  await expect(page.getByTestId('dashboard-quiz-persona-card')).toHaveCount(0);

  // Empty CTA does NOT show when at least one card has data.
  await expect(page.getByTestId('dashboard-empty-state')).toHaveCount(0);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Box (d): Reopen URL case asserts the estimate card's Reopen button
// href contains the encoded type/sqft/finish/extras query params, using
// the existing ticket 0009 estimateShareParams encoder.
test('reopen url carries encoded type, sqft, finish, extras query params', async ({
  browser,
}) => {
  const { ctx, page, errors } = await contextWithSeed(browser, {
    estimate: {
      selectedTypeId: 'kitchen',
      sqft: 200,
      selectedFinishId: 'mid_range',
      selectedExtraIds: ['permit', 'design'],
    },
  });
  await gotoDashboard(page);

  const reopen = page.getByTestId('dashboard-estimate-reopen');
  await expect(reopen).toBeVisible();
  const href = await reopen.getAttribute('href');
  expect(href, 'reopen href required').not.toBeNull();
  // pt=kitchen, sqft=200, fin=mid_range, extras=permit,design (URL-encoded)
  expect(href!).toContain('pt=kitchen');
  expect(href!).toContain('sqft=200');
  expect(href!).toContain('fin=mid_range');
  // URLSearchParams encodes "," as "%2C", so the literal string must include both.
  expect(href!).toMatch(/extras=permit(%2C|,)design/);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Box (e): JSON-LD case reads all script[type="application/ld+json"]
// blocks and asserts exactly one BreadcrumbList names "Your Dashboard"
// in the second ListItem and exactly one WebPage block carries the
// expected name. WebPage.description must match the Helmet-managed meta
// description byte-for-byte (the 2026-05-25 mirror-source rule).
test('emits BreadcrumbList + WebPage JSON-LD with mirror-source description', async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = trackErrors(page);
  await gotoDashboard(page);

  // Poll until Helmet has appended its JSON-LD scripts.
  await expect
    .poll(
      () => page.$$eval('script[type="application/ld+json"]', (nodes) => nodes.length),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);

  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  const blocks = raws.map((raw) => JSON.parse(raw) as unknown);

  type Breadcrumb = {
    '@type': string;
    itemListElement?: Array<{ '@type'?: string; position?: number; name?: string; item?: string }>;
  };
  type WebPage = {
    '@context'?: string;
    '@type': string;
    name?: string;
    description?: string;
    url?: string;
    isPartOf?: { '@type'?: string; url?: string } | string;
  };

  const breadcrumbs = blocks.filter(
    (d): d is Breadcrumb =>
      typeof d === 'object' &&
      d !== null &&
      (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList',
  );
  expect(breadcrumbs, 'exactly one BreadcrumbList expected on /my').toHaveLength(1);
  const breadcrumb = breadcrumbs[0];
  const items = breadcrumb.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect(items[0].name).toBe('Home');
  expect(items[1].name).toBe('Your Dashboard');
  expect(items[1].item).toBe(DASHBOARD_CANONICAL);

  const webPages = blocks.filter(
    (d): d is WebPage =>
      typeof d === 'object' &&
      d !== null &&
      (d as { '@type'?: unknown })['@type'] === 'WebPage',
  );
  expect(webPages, 'exactly one WebPage expected on /my').toHaveLength(1);
  const webPage = webPages[0];
  expect(webPage['@context']).toBe('https://schema.org');
  expect(webPage.name).toBe('Your Dashboard');
  expect(typeof webPage.description).toBe('string');
  expect((webPage.description ?? '').length).toBeGreaterThan(20);
  expect(webPage.url).toBe(DASHBOARD_CANONICAL);

  // isPartOf points at the homepage WebSite block (its url is the origin).
  expect(webPage.isPartOf).toBeTruthy();
  if (typeof webPage.isPartOf === 'object' && webPage.isPartOf !== null) {
    expect(webPage.isPartOf['@type']).toBe('WebSite');
    expect(webPage.isPartOf.url).toBe(ORIGIN);
  }

  // Helmet-appended meta description (LAST in DOM order per the 2026-05-25
  // Helmet-appends lesson) must equal the WebPage.description byte-for-byte.
  const descriptions = await page
    .locator('meta[name="description"]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? ''));
  expect(descriptions.length).toBeGreaterThan(0);
  const helmetDescription = descriptions[descriptions.length - 1];
  expect(helmetDescription).toBe(webPage.description);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Box (f): dark-mode case applies document.documentElement.classList.add('dark')
// on a 375px viewport and asserts the page renders.
test('renders in dark mode on a 375px viewport', async ({ browser }) => {
  const { ctx, page, errors } = await contextWithSeed(browser, fullSeed(), {
    width: 375,
    height: 800,
  });
  await gotoDashboard(page);
  await page.evaluate(() => document.documentElement.classList.add('dark'));

  await expect(page.getByTestId('dashboard-estimate-card')).toBeVisible();
  await expect(page.getByTestId('dashboard-recent-demos-card')).toBeVisible();
  await expect(page.getByTestId('dashboard-quiz-persona-card')).toBeVisible();

  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(hasDarkClass).toBe(true);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Box (g): no-em-dash case reads page.textContent('body') and asserts no
// U+2014 character is present anywhere in the rendered text. Runs in both
// the full-state and the all-empty case so we cover both render branches.
test('rendered body contains zero em-dash characters (full state)', async ({ browser }) => {
  const { ctx, page, errors } = await contextWithSeed(browser, fullSeed());
  await gotoDashboard(page);

  const bodyText = (await page.textContent('body')) ?? '';
  expect(bodyText.length, 'body should have text content').toBeGreaterThan(100);
  expect(bodyText, 'no em-dash (U+2014) allowed on /my').not.toContain(EM_DASH);

  expect(errors).toEqual([]);
  await ctx.close();
});

test('rendered body contains zero em-dash characters (empty state)', async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = trackErrors(page);
  await gotoDashboard(page);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });

  const bodyText = (await page.textContent('body')) ?? '';
  expect(bodyText.length).toBeGreaterThan(50);
  expect(bodyText, 'no em-dash (U+2014) allowed on /my empty state').not.toContain(EM_DASH);

  expect(errors).toEqual([]);
  await ctx.close();
});
