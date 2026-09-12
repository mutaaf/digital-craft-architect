import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0076 - Persist every AI Readiness Quiz completion and surface a
// "Your readiness trend" sparkline card on /my dashboard. Each test maps
// 1:1 to the ticket's e2e acceptance box (cases 1-10). Modeled on
// tests/e2e/roi-card-on-dashboard.spec.ts (ticket 0062, the closest peer
// for "/my card that reads a client-side store seeded via page.addInitScript")
// and tests/e2e/summary-recap.spec.ts (ticket 0066, the closest peer for
// the window.gtag beacon shim used in cases 5 and 8).

const DASHBOARD_URL = '/my';
const HISTORY_KEY = 'dca_quiz_history_v1';

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the 2026-05-07 brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

// Real tier labels from src/pages/AIReadinessQuiz.tsx TIERS - matches the
// KNOWN_PERSONAS allow-list in src/utils/quizHistoryStore.ts (the ticket
// prose named placeholder labels; the mirror-source rule locks the store
// to the real tier labels the quiz emits into dca_quiz_persona_v1).
const P_GETTING_STARTED = 'Getting Started';
const P_READY = 'Ready for AI';
const P_ADVANCED = 'Advanced - Ready to Scale';

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

function trackErrors(page: Page): { errors: string[]; consoleErrors: string[] } {
  const errors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!isIgnorable(text)) consoleErrors.push(text);
    }
  });
  return { errors, consoleErrors };
}

// gotoPath mirrors the ticket 0074 pattern (2026-09-10 mount-signal lesson):
// after the innerHTML poll, also wait for the h1 mount so the useEffect that
// reads localStorage has fired before we assert against the derived DOM.
async function gotoPath(page: Page, path: string): Promise<void> {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${path}`).not.toBeNull();
  expect(response!.status(), `${path} returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  await page
    .locator('h1')
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 })
    .catch(() => {});
}

interface SeededEntry {
  persona: string;
  completedAt: number;
}

async function contextWithHistorySeed(
  browser: import('@playwright/test').Browser,
  entries: SeededEntry[] | string,
  viewport?: { width: number; height: number },
): Promise<{ ctx: BrowserContext; page: Page; errors: string[]; consoleErrors: string[] }> {
  const raw = typeof entries === 'string' ? entries : JSON.stringify(entries);
  const ctx = await browser.newContext(viewport ? { viewport } : undefined);
  await ctx.addInitScript(
    ([key, value]) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* storage unavailable - non-fatal */
      }
    },
    [HISTORY_KEY, raw] as const,
  );
  const page = await ctx.newPage();
  const tracked = trackErrors(page);
  return { ctx, page, ...tracked };
}

async function contextWithHistorySeedAndGtag(
  browser: import('@playwright/test').Browser,
  entries: SeededEntry[],
): Promise<{ ctx: BrowserContext; page: Page; errors: string[] }> {
  const raw = JSON.stringify(entries);
  const ctx = await browser.newContext();
  await ctx.addInitScript(
    ([key, value]) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* storage unavailable - non-fatal */
      }
      // Same window.gtag stub the ticket 0066 summary-recap spec uses.
      // Every gtag(...) invocation is recorded so the spec can filter for
      // the specific cta_click event_label the new card emits.
      const w = window as unknown as {
        __log: Array<{ kind: string; args: unknown[] }>;
        gtag: (...args: unknown[]) => void;
      };
      w.__log = [];
      w.gtag = (...args: unknown[]) => {
        w.__log.push({ kind: 'gtag', args });
      };
    },
    [HISTORY_KEY, raw] as const,
  );
  const page = await ctx.newPage();
  const { errors } = trackErrors(page);
  return { ctx, page, errors };
}

// Case (1): empty state - no seeded key, dashboard renders WITHOUT the
// sparkline AND WITHOUT the list. Existing readiness card also absent
// because dca_quiz_persona_v1 is not seeded.
test('empty: no seeded history means the sparkline and list do not render', async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const { errors } = trackErrors(page);
  await gotoPath(page, DASHBOARD_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page
    .locator('h1')
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 })
    .catch(() => {});

  await expect(page.getByTestId('quiz-history-sparkline')).toHaveCount(0);
  await expect(page.getByTestId('quiz-history-list')).toHaveCount(0);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case (2): single-entry - the list renders exactly ONE row, no SVG, and
// the "Take the quiz again to see your trend" fallback copy is visible.
test('single-entry: one seeded completion renders one row and the trend fallback copy', async ({
  browser,
}) => {
  const { ctx, page, errors } = await contextWithHistorySeed(browser, [
    { persona: P_GETTING_STARTED, completedAt: Date.UTC(2026, 7, 15) },
  ]);
  await gotoPath(page, DASHBOARD_URL);

  await expect(page.getByTestId('quiz-history-list')).toBeVisible();
  await expect(page.getByTestId('quiz-history-row')).toHaveCount(1);
  await expect(page.getByTestId('quiz-history-sparkline')).toHaveCount(0);
  await expect(page.getByTestId('quiz-history-fallback')).toBeVisible();
  await expect(page.getByTestId('quiz-history-fallback')).toContainText(
    /take the quiz again to see your trend/i,
  );

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case (3): three seeded entries (Getting Started -> Ready for AI ->
// Advanced) render three rows in chronological order AND the sparkline
// with three <circle> data points.
test('three-entries: renders three rows and the sparkline with three circles', async ({
  browser,
}) => {
  const entries = [
    { persona: P_GETTING_STARTED, completedAt: Date.UTC(2026, 6, 1) },
    { persona: P_READY, completedAt: Date.UTC(2026, 6, 15) },
    { persona: P_ADVANCED, completedAt: Date.UTC(2026, 7, 1) },
  ];
  const { ctx, page, errors } = await contextWithHistorySeed(browser, entries);
  await gotoPath(page, DASHBOARD_URL);

  await expect(page.getByTestId('quiz-history-row')).toHaveCount(3);
  const svg = page.getByTestId('quiz-history-sparkline');
  await expect(svg).toBeVisible();
  await expect(svg.locator('circle')).toHaveCount(3);

  const rows = await page.getByTestId('quiz-history-row').allTextContents();
  expect(rows[0]).toContain('2026-07-01');
  expect(rows[0]).toContain(P_GETTING_STARTED);
  expect(rows[2]).toContain('2026-08-01');
  expect(rows[2]).toContain(P_ADVANCED);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case (4): sparkline polyline `points` attribute contains three coordinate
// pairs with x-values 0, 110, and 220 per the ticket viewBox math (220/(N-1)).
test('sparkline: polyline point x-values are 0, 110, 220 for three entries', async ({
  browser,
}) => {
  const entries = [
    { persona: P_GETTING_STARTED, completedAt: Date.UTC(2026, 6, 1) },
    { persona: P_READY, completedAt: Date.UTC(2026, 6, 15) },
    { persona: P_ADVANCED, completedAt: Date.UTC(2026, 7, 1) },
  ];
  const { ctx, page, errors } = await contextWithHistorySeed(browser, entries);
  await gotoPath(page, DASHBOARD_URL);

  const points = await page
    .getByTestId('quiz-history-sparkline')
    .locator('polyline')
    .first()
    .getAttribute('points');
  expect(points, 'polyline points attribute expected').not.toBeNull();
  const pairs = points!.trim().split(/\s+/).map((p) => p.split(',').map((n) => Number(n)));
  expect(pairs).toHaveLength(3);
  expect(pairs[0][0]).toBe(0);
  expect(pairs[1][0]).toBe(110);
  expect(pairs[2][0]).toBe(220);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case (5): Re-take the quiz button hrefs to /quiz and clicking it fires
// the `my_quiz_history_retake` beacon through window.gtag (same shim the
// ticket 0066 summary-recap spec uses to spy on trackCTAClick calls).
test('retake: Re-take the quiz link fires my_quiz_history_retake and routes to /quiz', async ({
  browser,
}) => {
  const entries = [
    { persona: P_GETTING_STARTED, completedAt: Date.UTC(2026, 6, 1) },
    { persona: P_READY, completedAt: Date.UTC(2026, 7, 1) },
  ];
  const { ctx, page, errors } = await contextWithHistorySeedAndGtag(browser, entries);
  await gotoPath(page, DASHBOARD_URL);

  const retake = page.getByTestId('quiz-history-retake');
  await expect(retake).toBeVisible();
  const href = await retake.getAttribute('href');
  expect(href).toBe('/quiz');

  await retake.click();
  await page.waitForURL(/\/quiz$/);

  const log = await page.evaluate(
    () => (window as unknown as { __log: Array<{ kind: string; args: unknown[] }> }).__log,
  );
  const retakeHit = log.find(
    (e) =>
      e.kind === 'gtag' &&
      Array.isArray(e.args) &&
      JSON.stringify(e.args).includes('my_quiz_history_retake') &&
      JSON.stringify(e.args).includes('my_dashboard'),
  );
  expect(retakeHit, 'my_quiz_history_retake beacon should fire on click').toBeDefined();

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case (6): unknown persona seed - a persona not in KNOWN_PERSONAS is
// filtered at read time and does NOT render a row.
test('unknown-persona: seeded entry with an unknown label does not render a row', async ({
  browser,
}) => {
  const entries = [
    { persona: 'Wizard', completedAt: Date.UTC(2026, 6, 1) },
    { persona: P_READY, completedAt: Date.UTC(2026, 7, 1) },
  ];
  const { ctx, page, errors } = await contextWithHistorySeed(browser, entries);
  await gotoPath(page, DASHBOARD_URL);

  await expect(page.getByTestId('quiz-history-row')).toHaveCount(1);
  const bodyText = (await page.textContent('body')) ?? '';
  expect(bodyText).not.toContain('Wizard');

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case (7): dedup guard - two entries within 60 seconds are collapsed at
// read time. The store's write-side no-ops a duplicate within 60s; the
// read-side additionally collapses consecutive duplicates so a stale
// localStorage value that already carries a double-click residue still
// surfaces one row.
test('dedup: seeded duplicate within 60s does not add a second row', async ({ browser }) => {
  const t0 = Date.UTC(2026, 7, 1, 12, 0, 0);
  const entries = [
    { persona: P_GETTING_STARTED, completedAt: t0 },
    { persona: P_GETTING_STARTED, completedAt: t0 + 30_000 },
  ];
  const { ctx, page, errors } = await contextWithHistorySeed(browser, entries);
  await gotoPath(page, DASHBOARD_URL);

  await expect(page.getByTestId('quiz-history-row')).toHaveCount(1);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case (8): the quiz_history_view beacon fires exactly once per page mount
// (React 18 strict-mode double-mount protection via useRef in the card).
test('view-beacon: quiz_history_view fires exactly once per mount', async ({ browser }) => {
  const entries = [
    { persona: P_GETTING_STARTED, completedAt: Date.UTC(2026, 6, 1) },
    { persona: P_READY, completedAt: Date.UTC(2026, 7, 1) },
  ];
  const { ctx, page, errors } = await contextWithHistorySeedAndGtag(browser, entries);
  await gotoPath(page, DASHBOARD_URL);
  await expect(page.getByTestId('quiz-history-sparkline')).toBeVisible();
  // Give React 18 strict-mode a beat to double-fire an unguarded effect.
  await page.waitForTimeout(500);

  const log = await page.evaluate(
    () => (window as unknown as { __log: Array<{ kind: string; args: unknown[] }> }).__log,
  );
  const views = log.filter(
    (e) =>
      e.kind === 'gtag' &&
      Array.isArray(e.args) &&
      JSON.stringify(e.args).includes('quiz_history_view'),
  );
  expect(views).toHaveLength(1);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case (9): dark-mode renders cleanly and the sparkline is visible.
test('dark-mode: card renders with dark class on documentElement', async ({ browser }) => {
  const entries = [
    { persona: P_GETTING_STARTED, completedAt: Date.UTC(2026, 6, 1) },
    { persona: P_READY, completedAt: Date.UTC(2026, 7, 1) },
  ];
  const { ctx, page, errors } = await contextWithHistorySeed(browser, entries, {
    width: 375,
    height: 812,
  });
  await gotoPath(page, DASHBOARD_URL);
  await page.evaluate(() => document.documentElement.classList.add('dark'));

  await expect(page.getByTestId('quiz-history-sparkline')).toBeVisible();
  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(hasDarkClass).toBe(true);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case (10): no em-dash characters anywhere on the seeded /my page.
test('no em-dash characters anywhere on the seeded /my page', async ({ browser }) => {
  const entries = [
    { persona: P_GETTING_STARTED, completedAt: Date.UTC(2026, 6, 1) },
    { persona: P_READY, completedAt: Date.UTC(2026, 7, 1) },
  ];
  const { ctx, page, errors } = await contextWithHistorySeed(browser, entries);
  await gotoPath(page, DASHBOARD_URL);

  const bodyText = (await page.textContent('body')) ?? '';
  expect(bodyText.length, 'body should have text content').toBeGreaterThan(100);
  expect(bodyText, 'no em-dash (U+2014) allowed on seeded /my').not.toContain(EM_DASH);

  expect(errors).toEqual([]);
  await ctx.close();
});
