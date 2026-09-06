import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';
// Imported from a keys-only src module (not from MyDashboard.tsx itself)
// because MyDashboard's transitive react-helmet-async import fails Node
// ESM named-export resolution at Playwright's spec collection time.
// Deviation from the ticket's `import from '@/pages/MyDashboard'` text
// documented in the Implementation log.
import { SUMMARY_LINE_KEYS } from '../../src/pages/mydashboardSummaryKeys';

// Ticket 0066 - Printable "Your Digital Craft summary" recap on /my.
// Each test maps 1:1 to a sub-scenario in acceptance box 6 (cases 1-9).
// Modeled on tests/e2e/my-dashboard.spec.ts (ticket 0045, the closest peer
// for "client-side personalization page seeded via page.addInitScript")
// and tests/e2e/roi-card-on-dashboard.spec.ts (ticket 0062, for the
// multi-store seeding pattern and the raw-seed helper shape).
//
// Per the 2026-05-07 em-dash Hard NO, this file itself contains no em-dash
// (U+2014). Per the 2026-05-25 SEO Pilot lesson, the spec does NOT assert
// page.toHaveTitle on /my. Per the 2026-06-07 src-imports-tests lesson,
// SUMMARY_LINE_KEYS is imported from src/pages/MyDashboard so this spec
// and the page module share one ordered-key source. Per the 2026-09-05
// route-code-splitting lesson, print-mode visibility assertions use the
// auto-retrying expect(locator).toBeHidden() / .toBeVisible() form.

const DASHBOARD_URL = '/my';
const LAST_ESTIMATE_KEY = 'dca_last_estimate_v1_construction';
const RECENT_DEMOS_KEY = 'dca_recent_demos_v1';
const QUIZ_PERSONA_KEY = 'dca_quiz_persona_v1';
const VISIT_DAYS_KEY = 'dca_visit_days_v1';
const ROI_RESULT_KEY = 'dca_last_roi_result_v1';

// U+2014 spelled via fromCharCode so this file itself contains no em-dash.
const EM_DASH = String.fromCharCode(8212);

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

// UTC YYYY-MM-DD for N days ago. Mirrors visitStreakStore's date-format
// choice so the seed and the mount-time read both agree on today's string.
function utcDaysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

type Seeds = {
  estimate?: unknown;
  recentDemos?: unknown;
  quizPersona?: unknown;
  visitDays?: unknown;
  roiResult?: unknown;
};

async function contextWithSeeds(
  browser: import('@playwright/test').Browser,
  seeds: Seeds,
  extraInit?: string,
  viewport?: { width: number; height: number },
): Promise<{ ctx: BrowserContext; page: Page; errors: string[] }> {
  const ctx = await browser.newContext(viewport ? { viewport } : undefined);
  const payload = JSON.stringify({
    keys: {
      estimate: LAST_ESTIMATE_KEY,
      recentDemos: RECENT_DEMOS_KEY,
      quizPersona: QUIZ_PERSONA_KEY,
      visitDays: VISIT_DAYS_KEY,
      roiResult: ROI_RESULT_KEY,
    },
    values: {
      estimate: seeds.estimate,
      recentDemos: seeds.recentDemos,
      quizPersona: seeds.quizPersona,
      visitDays: seeds.visitDays,
      roiResult: seeds.roiResult,
    },
  });
  await ctx.addInitScript((raw: string) => {
    try {
      const parsed = JSON.parse(raw) as {
        keys: Record<string, string>;
        values: Record<string, unknown>;
      };
      for (const name of Object.keys(parsed.keys)) {
        const v = parsed.values[name];
        if (v === undefined) continue;
        window.localStorage.setItem(parsed.keys[name], JSON.stringify(v));
      }
    } catch {
      /* storage unavailable - non-fatal */
    }
  }, payload);
  if (extraInit) {
    await ctx.addInitScript(extraInit);
  }
  const page = await ctx.newPage();
  const errors = trackErrors(page);
  return { ctx, page, errors };
}

function estimateSeed() {
  return {
    selectedTypeId: 'kitchen',
    sqft: 200,
    selectedFinishId: 'mid_range',
    selectedExtraIds: ['permit'],
  };
}

function recentDemosSeed() {
  const now = Date.now();
  return [
    {
      path: '/construction/demo/lead-responder',
      title: 'Lead Responder',
      vertical: 'Construction',
      viewedAt: now - 60_000,
    },
    {
      path: '/construction/demo/estimate',
      title: 'Smart Estimate Generator',
      vertical: 'Construction',
      viewedAt: now - 120_000,
    },
  ];
}

function personaSeed() {
  return { persona: 'Ready for AI', completedAt: Date.now() - 60_000 };
}

function roiResultSeed() {
  return {
    inputs: { leads: 60, minutes: 8, hourly: 75, afterhours: 35 },
    savedAt: Date.now() - 60_000,
  };
}

function visitDaysSeed() {
  // Five distinct days within the last 14, none of which is today,
  // so the mount's recordVisitToday() adds today for six total.
  return [9, 7, 5, 3, 1].map(utcDaysAgo).sort();
}

// Case 1: empty-state case clears localStorage, navigates to /my, and
// asserts the recap section is NOT visible (the existing empty-state
// block still renders per ticket 0045 spec unchanged).
test('empty state: recap section is NOT visible when no artifacts are stored', async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = trackErrors(page);
  await gotoDashboard(page);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);

  await expect(page.getByTestId('dashboard-summary-recap')).toHaveCount(0);
  await expect(page.getByTestId('dashboard-empty-state')).toBeVisible();

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case 2: single-store case seeds ONLY dca_last_roi_result_v1 with a
// known bundle, navigates to /my, asserts the recap section IS visible,
// asserts the ordered list contains exactly ONE <li> matching the ROI
// template pattern, and asserts the four other list positions are absent.
test('single-store: ONLY roi seeded yields exactly one <li> matching the ROI template', async ({
  browser,
}) => {
  const { ctx, page, errors } = await contextWithSeeds(browser, {
    roiResult: roiResultSeed(),
  });
  await gotoDashboard(page);

  const recap = page.getByTestId('dashboard-summary-recap');
  await expect(recap).toBeVisible();

  const items = recap.locator('ol > li');
  await expect(items).toHaveCount(1);
  await expect(items.first()).toHaveText(
    /ROI computed on \d{4}-\d{2}-\d{2}: \$[\d,]+ per year/,
  );

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case 3: all-stores case seeds all five stores with known values,
// navigates to /my, and asserts the ordered list contains exactly FIVE
// <li> elements in the fixed order (estimate, roi, persona, demos,
// streak) each matching its template pattern.
test('all-stores: five <li> in fixed key order matching each template', async ({
  browser,
}) => {
  const { ctx, page, errors } = await contextWithSeeds(browser, {
    estimate: estimateSeed(),
    recentDemos: recentDemosSeed(),
    quizPersona: personaSeed(),
    visitDays: visitDaysSeed(),
    roiResult: roiResultSeed(),
  });
  await gotoDashboard(page);

  // The shared SUMMARY_LINE_KEYS is the single source of truth for order.
  expect(SUMMARY_LINE_KEYS).toEqual(['estimate', 'roi', 'persona', 'demos', 'streak']);

  const recap = page.getByTestId('dashboard-summary-recap');
  await expect(recap).toBeVisible();

  const items = recap.locator('ol > li');
  await expect(items).toHaveCount(5);

  const texts = await items.allTextContents();
  const [estimateText, roiText, personaText, demosText, streakText] = texts;
  expect(estimateText).toMatch(/Estimate saved: \$[\d,]+/);
  expect(roiText).toMatch(/ROI computed on \d{4}-\d{2}-\d{2}: \$[\d,]+ per year/);
  expect(personaText).toMatch(/AI Readiness Quiz: Ready for AI/);
  expect(demosText).toMatch(/Recent demos explored: \d+/);
  expect(streakText).toMatch(/Visits: \d+ days? in the last 14/);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case 4: generated-timestamp case asserts the footer line matches
// /Generated on \d{4}-\d{2}-\d{2} at \d{2}:\d{2} local/.
test('generated timestamp: footer line matches YYYY-MM-DD at HH:MM local', async ({
  browser,
}) => {
  const { ctx, page, errors } = await contextWithSeeds(browser, {
    roiResult: roiResultSeed(),
  });
  await gotoDashboard(page);

  const recap = page.getByTestId('dashboard-summary-recap');
  await expect(recap).toBeVisible();
  await expect(recap).toContainText(/Generated on \d{4}-\d{2}-\d{2} at \d{2}:\d{2} local/);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case 5: print-view case calls page.emulateMedia({ media: 'print' })
// on the all-stores seed and asserts (a) the recap section is visible,
// (b) dashboard-estimate-card is hidden, (c) dashboard-roi-card is
// hidden, (d) the site nav element is hidden, (e) the site footer
// element is hidden. Uses auto-retrying toBeHidden() / toBeVisible()
// per the 2026-09-05 route-code-splitting lesson.
test('print view: cards and chrome are hidden, recap section is visible', async ({
  browser,
}) => {
  const { ctx, page, errors } = await contextWithSeeds(browser, {
    estimate: estimateSeed(),
    recentDemos: recentDemosSeed(),
    quizPersona: personaSeed(),
    visitDays: visitDaysSeed(),
    roiResult: roiResultSeed(),
  });
  await gotoDashboard(page);

  // Make sure on-screen render succeeded first, then switch to print.
  await expect(page.getByTestId('dashboard-summary-recap')).toBeVisible();
  await page.emulateMedia({ media: 'print' });

  await expect(page.getByTestId('dashboard-summary-recap')).toBeVisible();
  await expect(page.getByTestId('dashboard-estimate-card')).toBeHidden();
  await expect(page.getByTestId('dashboard-roi-card')).toBeHidden();
  await expect(page.locator('nav').first()).toBeHidden();
  await expect(page.locator('footer').first()).toBeHidden();

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case 6: print-button case overrides window.print BEFORE navigation
// (addInitScript runs before every document load) and asserts the
// override is called when the button is clicked.
test('print button: clicking calls window.print()', async ({ browser }) => {
  const { ctx, page, errors } = await contextWithSeeds(
    browser,
    { roiResult: roiResultSeed() },
    `(() => {
      window.__printCalled = false;
      window.print = () => { window.__printCalled = true; };
    })();`,
  );
  await gotoDashboard(page);

  const button = page.getByTestId('dashboard-summary-print');
  await expect(button).toBeVisible();
  await button.click();

  const called = await page.evaluate(
    () => (window as unknown as { __printCalled?: boolean }).__printCalled === true,
  );
  expect(called).toBe(true);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case 7: analytics-fire-order case seeds a window.gtag stub and a
// window.print override BEFORE navigation, records both calls in a
// window-level array in call order, and asserts the summary_recap_print
// event fires BEFORE the print call (the print dialog blocks the event
// loop and would swallow a later beacon).
test('analytics fire order: summary_recap_print event fires BEFORE window.print', async ({
  browser,
}) => {
  const { ctx, page, errors } = await contextWithSeeds(
    browser,
    { roiResult: roiResultSeed() },
    `(() => {
      window.__log = [];
      window.gtag = (...args) => {
        window.__log.push({ kind: 'gtag', args });
      };
      window.print = () => { window.__log.push({ kind: 'print' }); };
    })();`,
  );
  await gotoDashboard(page);

  const button = page.getByTestId('dashboard-summary-print');
  await expect(button).toBeVisible();
  await button.click();

  const log = await page.evaluate(
    () => (window as unknown as { __log?: Array<{ kind: string; args?: unknown[] }> }).__log ?? [],
  );
  // Find the print-related gtag entry and the print entry.
  const printBeaconIdx = log.findIndex(
    (e) =>
      e.kind === 'gtag' &&
      Array.isArray(e.args) &&
      JSON.stringify(e.args).includes('summary_recap_print'),
  );
  const printIdx = log.findIndex((e) => e.kind === 'print');
  expect(printBeaconIdx, 'summary_recap_print beacon should have fired').toBeGreaterThanOrEqual(0);
  expect(printIdx, 'window.print should have been called').toBeGreaterThanOrEqual(0);
  expect(printBeaconIdx, 'beacon must fire BEFORE window.print').toBeLessThan(printIdx);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case 8: dark-mode case applies document.documentElement.classList.add('dark')
// on a 375px viewport and asserts the recap section renders.
test('dark mode: recap renders with dark class on documentElement (375px)', async ({
  browser,
}) => {
  const { ctx, page, errors } = await contextWithSeeds(
    browser,
    {
      estimate: estimateSeed(),
      recentDemos: recentDemosSeed(),
      quizPersona: personaSeed(),
      visitDays: visitDaysSeed(),
      roiResult: roiResultSeed(),
    },
    undefined,
    { width: 375, height: 800 },
  );
  await gotoDashboard(page);
  await page.evaluate(() => document.documentElement.classList.add('dark'));

  await expect(page.getByTestId('dashboard-summary-recap')).toBeVisible();
  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(hasDarkClass).toBe(true);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case 9: no-em-dash case reads page.textContent('body') on the
// all-stores seed and asserts no String.fromCharCode(8212) character
// is present anywhere in the rendered text.
test('no em-dash: body text contains zero U+2014 characters (all stores)', async ({
  browser,
}) => {
  const { ctx, page, errors } = await contextWithSeeds(browser, {
    estimate: estimateSeed(),
    recentDemos: recentDemosSeed(),
    quizPersona: personaSeed(),
    visitDays: visitDaysSeed(),
    roiResult: roiResultSeed(),
  });
  await gotoDashboard(page);
  await expect(page.getByTestId('dashboard-summary-recap')).toBeVisible();

  const bodyText = (await page.textContent('body')) ?? '';
  expect(bodyText.length).toBeGreaterThan(100);
  expect(bodyText).not.toContain(EM_DASH);

  expect(errors).toEqual([]);
  await ctx.close();
});
