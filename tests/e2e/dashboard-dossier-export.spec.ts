import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';
// Ticket 0082 - DOSSIER_ARTIFACT_KEYS is the single ordered-key source
// of truth for the seven artifact slots the composer emits. Imported
// directly from src/utils per the 2026-05-25 mirror-source rule + the
// 2026-06-07 src-imports-tests lesson so a rename cannot drift the
// source and the spec. This module has zero React / DOM imports on
// purpose so Node ESM named-export resolution succeeds at spec
// collection time.
import { DOSSIER_ARTIFACT_KEYS } from '../../src/utils/evaluationDossier';

// Ticket 0082 - "Download JSON" dossier export button on /my.
// Each test maps 1:1 to a sub-scenario in acceptance box 8 (cases 1-11).
// Modeled on tests/e2e/summary-recap.spec.ts (ticket 0066 seed pattern)
// and tests/e2e/roi-card-on-dashboard.spec.ts (ticket 0062 multi-store
// seeding).
//
// Per the 2026-05-07 em-dash Hard NO, this file itself contains no
// em-dash (U+2014). Per the 2026-05-25 SEO Pilot lesson, the spec does
// NOT assert page.toHaveTitle on /my. Per the 2026-09-05 route-code-
// splitting lesson AND the 2026-09-10 mount-signal lesson, the
// gotoDashboard helper waits for RouteFallback detach AND the H1 to be
// visible before reading DOM or intercepting the download event.

const DASHBOARD_URL = '/my';
const LAST_ESTIMATE_KEY = 'dca_last_estimate_v1_construction';
const RECENT_DEMOS_KEY = 'dca_recent_demos_v1';
const RECENT_COMPARES_KEY = 'dca_recent_compares_v1';
const QUIZ_PERSONA_KEY = 'dca_quiz_persona_v1';
const QUIZ_HISTORY_KEY = 'dca_quiz_history_v1';
const VISIT_DAYS_KEY = 'dca_visit_days_v1';
const ROI_RESULT_KEY = 'dca_last_roi_result_v1';

// U+2014 spelled via fromCharCode so this file itself contains no
// em-dash character (2026-05-07 Hard NO grep pattern).
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

// Waits for a route ready signal that survives the RouteFallback Suspense
// spinner introduced by ticket 0068's code-splitting change (2026-09-05
// lesson) AND the on-mount write-through pattern the dashboard uses
// (2026-09-10 lesson). Both waits are wrapped in .catch(() => {}) so a
// missing signal degrades gracefully to the length-based readiness
// heuristic; timeouts are short (5s) so a helper that races the 30s
// per-test cap never spends more than a fraction on readiness alone.
async function gotoDashboard(page: Page): Promise<void> {
  const response = await page.goto(DASHBOARD_URL, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${DASHBOARD_URL}`).not.toBeNull();
  expect(response!.status(), `${DASHBOARD_URL} returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  await page
    .locator('[role="status"][aria-label="Loading"]')
    .waitFor({ state: 'hidden', timeout: 5_000 })
    .catch(() => {});
  await page
    .locator('h1')
    .first()
    .waitFor({ state: 'visible', timeout: 5_000 })
    .catch(() => {});
}

function utcDaysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

type Seeds = {
  estimate?: unknown;
  recentDemos?: unknown;
  recentCompares?: unknown;
  quizPersona?: unknown;
  quizHistory?: unknown;
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
      recentCompares: RECENT_COMPARES_KEY,
      quizPersona: QUIZ_PERSONA_KEY,
      quizHistory: QUIZ_HISTORY_KEY,
      visitDays: VISIT_DAYS_KEY,
      roiResult: ROI_RESULT_KEY,
    },
    values: {
      estimate: seeds.estimate,
      recentDemos: seeds.recentDemos,
      recentCompares: seeds.recentCompares,
      quizPersona: seeds.quizPersona,
      quizHistory: seeds.quizHistory,
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
  return [9, 7, 5, 3, 1].map(utcDaysAgo).sort();
}

function quizHistorySeed() {
  const now = Date.now();
  return [
    { persona: 'Getting Started', completedAt: now - 1_000_000 },
    { persona: 'Ready for AI', completedAt: now - 60_000 },
  ];
}

// Eight distinct compare paths (above the 5-entry display slice) so the
// 2026-09-10 raw-vs-sliced lesson case (11) can assert the dossier
// exports every viewed entry, not just the display-sliced view. Paths
// come from src/data/compareEntries.ts; the store's allow-list rejects
// unknown paths at read time, so this seed uses real entries only.
function recentComparesSeed() {
  const now = Date.now();
  const paths: Array<[string, string]> = [
    ['/compare/hubspot', 'HubSpot'],
    ['/compare/jobber', 'Jobber'],
    ['/compare/gohighlevel', 'GoHighLevel'],
    ['/compare/servicetitan', 'ServiceTitan'],
    ['/compare/podium', 'Podium'],
    ['/compare/housecallpro', 'Housecall Pro'],
    ['/compare/buildertrend', 'Buildertrend'],
    ['/compare/thumbtack', 'Thumbtack'],
  ];
  return paths.map(([path, tool], i) => ({
    path,
    tool,
    viewedAt: now - (i + 1) * 60_000,
  }));
}

// Case 1: `GET /my` returns 200 and the button renders with the
// expected data-testid inside the recap section.
test('GET /my returns 200 and the download button renders inside the recap', async ({
  browser,
}) => {
  const { ctx, page, errors } = await contextWithSeeds(browser, {
    roiResult: roiResultSeed(),
  });
  await gotoDashboard(page);

  const recap = page.getByTestId('dashboard-summary-recap');
  await expect(recap).toBeVisible();
  const button = recap.getByTestId('dashboard-dossier-download');
  await expect(button).toBeVisible();
  await expect(button).toHaveText(/Download JSON/);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case 2: clicking the button emits a Playwright Download event whose
// suggestedFilename matches the ticket's naming pattern.
test('click emits a download whose filename matches digital-craft-evaluation-YYYY-MM-DD.json', async ({
  browser,
}) => {
  const { ctx, page, errors } = await contextWithSeeds(browser, {
    roiResult: roiResultSeed(),
  });
  await gotoDashboard(page);

  const button = page.getByTestId('dashboard-dossier-download');
  await expect(button).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    button.click(),
  ]);
  expect(download.suggestedFilename()).toMatch(
    /^digital-craft-evaluation-\d{4}-\d{2}-\d{2}\.json$/,
  );

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case 3: the downloaded file parses as JSON and its parsed shape
// satisfies the schemaVersion + generatedAt + seven-key contract.
test('downloaded file parses as JSON matching the dossier shape', async ({ browser }) => {
  const { ctx, page, errors } = await contextWithSeeds(browser, {
    roiResult: roiResultSeed(),
  });
  await gotoDashboard(page);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('dashboard-dossier-download').click(),
  ]);
  const path = await download.path();
  expect(path, 'download.path() returned null').not.toBeNull();
  const fs = await import('node:fs/promises');
  const raw = await fs.readFile(path as string, 'utf-8');
  const parsed = JSON.parse(raw) as {
    schemaVersion: unknown;
    generatedAt: unknown;
    artifacts: Record<string, unknown>;
  };
  expect(parsed.schemaVersion).toBe('1.0');
  expect(typeof parsed.generatedAt).toBe('string');
  expect(parsed.generatedAt as string).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  expect(typeof parsed.artifacts).toBe('object');
  expect(parsed.artifacts).not.toBeNull();
  // The seven artifact keys are the exact source of truth in the
  // dossier module; the spec imports the constant so a rename cannot
  // drift the source and the assertion.
  expect(Object.keys(parsed.artifacts).sort()).toEqual([...DOSSIER_ARTIFACT_KEYS].sort());

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case 4: an empty visitor (no seeds) still emits a well-formed
// dossier: every array-typed slot is an Array (even empty), every
// nullable slot is either null or an object (never undefined).
test('empty visitor emits a well-formed dossier with empty arrays and null singletons', async ({
  browser,
}) => {
  // Seed at least ONE artifact so the recap section renders (the empty-
  // state block replaces the recap when anyData is false). The
  // downloaded dossier still reflects the empty stores for the six
  // un-seeded slots.
  const { ctx, page, errors } = await contextWithSeeds(browser, {
    quizPersona: personaSeed(),
  });
  await gotoDashboard(page);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('dashboard-dossier-download').click(),
  ]);
  const path = await download.path();
  const fs = await import('node:fs/promises');
  const raw = await fs.readFile(path as string, 'utf-8');
  const parsed = JSON.parse(raw) as { artifacts: Record<string, unknown> };
  const a = parsed.artifacts as {
    estimate: unknown;
    roi: unknown;
    quizPersona: unknown;
    quizHistory: unknown;
    recentDemos: unknown;
    recentCompares: unknown;
    visitStreak: unknown;
  };
  expect(a.estimate === null || typeof a.estimate === 'object').toBe(true);
  expect(a.roi === null || typeof a.roi === 'object').toBe(true);
  expect(a.quizPersona === null || typeof a.quizPersona === 'object').toBe(true);
  expect(Array.isArray(a.quizHistory)).toBe(true);
  expect(Array.isArray(a.recentDemos)).toBe(true);
  expect(Array.isArray(a.recentCompares)).toBe(true);
  // visitStreak's getter never returns null (returns {daysInLast14: 0, latestDay: null}),
  // so this slot is always an object in practice - but the schema admits null too.
  expect(a.visitStreak === null || typeof a.visitStreak === 'object').toBe(true);
  // Un-seeded array slots are empty arrays.
  expect((a.recentDemos as unknown[]).length).toBe(0);
  expect((a.recentCompares as unknown[]).length).toBe(0);
  expect((a.quizHistory as unknown[]).length).toBe(0);
  expect(a.estimate).toBeNull();
  expect(a.roi).toBeNull();

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case 5: with all seven stores seeded, the parsed JSON echoes the
// seeded values verbatim. The estimate's selectedTypeId, the ROI's
// hourly rate, the persona name, and the recent demo path each appear
// in the corresponding artifact slot. Extended timeout because the
// heaviest seed (all seven stores + eight compare rows + two quiz
// history rows) drives more render work than the single-store cases.
test('seeded stores round-trip verbatim into the exported dossier', async ({ browser }) => {
  test.setTimeout(60_000);
  const { ctx, page, errors } = await contextWithSeeds(browser, {
    estimate: estimateSeed(),
    recentDemos: recentDemosSeed(),
    recentCompares: recentComparesSeed(),
    quizPersona: personaSeed(),
    quizHistory: quizHistorySeed(),
    visitDays: visitDaysSeed(),
    roiResult: roiResultSeed(),
  });
  await gotoDashboard(page);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('dashboard-dossier-download').click(),
  ]);
  const path = await download.path();
  const fs = await import('node:fs/promises');
  const raw = await fs.readFile(path as string, 'utf-8');
  const parsed = JSON.parse(raw) as {
    artifacts: {
      estimate: { selectedTypeId: string; sqft: number } | null;
      roi: { inputs: { hourly: number } } | null;
      quizPersona: { persona: string } | null;
      quizHistory: Array<{ persona: string }>;
      recentDemos: Array<{ path: string }>;
      recentCompares: Array<{ path: string }>;
      visitStreak: { daysInLast14: number } | null;
    };
  };
  expect(parsed.artifacts.estimate?.selectedTypeId).toBe('kitchen');
  expect(parsed.artifacts.estimate?.sqft).toBe(200);
  expect(parsed.artifacts.roi?.inputs.hourly).toBe(75);
  expect(parsed.artifacts.quizPersona?.persona).toBe('Ready for AI');
  expect(parsed.artifacts.quizHistory.length).toBe(2);
  expect(parsed.artifacts.quizHistory[1].persona).toBe('Ready for AI');
  expect(parsed.artifacts.recentDemos.map((d) => d.path)).toContain(
    '/construction/demo/lead-responder',
  );
  // 2026-09-10 raw-vs-sliced case: 8 seeded entries all appear in the
  // export even though the display slice is 5.
  expect(parsed.artifacts.recentCompares.length).toBe(8);
  expect((parsed.artifacts.visitStreak?.daysInLast14 ?? 0)).toBeGreaterThanOrEqual(5);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case 6: the trackCTAClick beacon fires with the expected event name +
// location arguments exactly once on click. Uses the ticket 0077
// beacon-stub pattern (window.gtag stub set in extraInit before
// navigation).
test('dashboard_dossier_download beacon fires exactly once on click', async ({ browser }) => {
  const { ctx, page, errors } = await contextWithSeeds(
    browser,
    { roiResult: roiResultSeed() },
    `(() => {
      window.__dossierBeacons = [];
      window.gtag = (...args) => {
        window.__dossierBeacons.push(args);
      };
    })();`,
  );
  await gotoDashboard(page);

  await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('dashboard-dossier-download').click(),
  ]);
  const beacons = await page.evaluate(
    () => (window as unknown as { __dossierBeacons?: unknown[][] }).__dossierBeacons ?? [],
  );
  const dossierBeacons = beacons.filter(
    (a) => Array.isArray(a) && JSON.stringify(a).includes('dashboard_dossier_download'),
  );
  expect(dossierBeacons.length).toBe(1);
  expect(JSON.stringify(dossierBeacons[0])).toContain('my_dashboard_recap');

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case 7: beacon fires BEFORE the Blob is created (mirroring the
// ticket 0023 footer chip beacon-before-navigate pattern). The stub
// records the beacon call order and the Blob constructor call order in
// one shared array, then the spec asserts beacon < Blob.
test('beacon fires BEFORE the Blob is created', async ({ browser }) => {
  const { ctx, page, errors } = await contextWithSeeds(
    browser,
    { roiResult: roiResultSeed() },
    `(() => {
      window.__dossierLog = [];
      window.gtag = (...args) => {
        window.__dossierLog.push({ kind: 'gtag', args });
      };
      const OriginalBlob = window.Blob;
      window.Blob = function(parts, options) {
        window.__dossierLog.push({ kind: 'blob' });
        return new OriginalBlob(parts, options);
      };
    })();`,
  );
  await gotoDashboard(page);

  await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('dashboard-dossier-download').click(),
  ]);
  const log = await page.evaluate(
    () => (window as unknown as { __dossierLog?: Array<{ kind: string; args?: unknown[] }> }).__dossierLog ?? [],
  );
  const beaconIdx = log.findIndex(
    (e) =>
      e.kind === 'gtag' &&
      Array.isArray(e.args) &&
      JSON.stringify(e.args).includes('dashboard_dossier_download'),
  );
  const blobIdx = log.findIndex((e) => e.kind === 'blob');
  expect(beaconIdx, 'dossier beacon should have fired').toBeGreaterThanOrEqual(0);
  expect(blobIdx, 'Blob should have been constructed').toBeGreaterThanOrEqual(0);
  expect(beaconIdx, 'beacon must fire BEFORE Blob construction').toBeLessThan(blobIdx);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case 8: 2026-05-07 em-dash Hard NO. Every wrapper field the composer
// authors (schemaVersion, generatedAt) is hyphen-only. Visitor-entered
// content is out of scope per the ticket AC.
test('wrapper fields contain zero U+2014 code points', async ({ browser }) => {
  const { ctx, page, errors } = await contextWithSeeds(browser, {
    roiResult: roiResultSeed(),
  });
  await gotoDashboard(page);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('dashboard-dossier-download').click(),
  ]);
  const path = await download.path();
  const fs = await import('node:fs/promises');
  const raw = await fs.readFile(path as string, 'utf-8');
  const parsed = JSON.parse(raw) as { schemaVersion: string; generatedAt: string };
  expect(parsed.schemaVersion).not.toContain(EM_DASH);
  expect(parsed.generatedAt).not.toContain(EM_DASH);
  // The button label is also hyphen-only.
  const buttonText = (await page.getByTestId('dashboard-dossier-download').textContent()) ?? '';
  expect(buttonText).not.toContain(EM_DASH);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case 9: dark-mode render. Applies documentElement.classList.add('dark')
// on a 375px viewport (mobile) and asserts the button is visible in the
// dark theme.
test('dark mode: button renders with dark class on documentElement (375px)', async ({
  browser,
}) => {
  const { ctx, page, errors } = await contextWithSeeds(
    browser,
    { roiResult: roiResultSeed() },
    undefined,
    { width: 375, height: 800 },
  );
  await gotoDashboard(page);
  await page.evaluate(() => document.documentElement.classList.add('dark'));

  await expect(page.getByTestId('dashboard-dossier-download')).toBeVisible();
  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(hasDarkClass).toBe(true);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case 10: 2026-09-10 raw-vs-sliced lesson. Seed 8 entries into
// dca_recent_compares_v1 (above the 5-entry display slice) and assert
// the exported dossier carries every one of them (length === 8). The
// on-screen recent-compares card still shows only 5; the dossier
// exports the raw list.
test('raw-vs-sliced: 8 seeded compares export as 8 entries even though display slice is 5', async ({
  browser,
}) => {
  const { ctx, page, errors } = await contextWithSeeds(browser, {
    recentCompares: recentComparesSeed(),
  });
  await gotoDashboard(page);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('dashboard-dossier-download').click(),
  ]);
  const path = await download.path();
  const fs = await import('node:fs/promises');
  const raw = await fs.readFile(path as string, 'utf-8');
  const parsed = JSON.parse(raw) as {
    artifacts: { recentCompares: Array<{ path: string }> };
  };
  expect(parsed.artifacts.recentCompares.length).toBe(8);
  // Every seeded path appears in the export (order not asserted; the
  // store's read helper preserves insertion order but the raw-vs-sliced
  // invariant this test protects is purely the count).
  const seededPaths = new Set(recentComparesSeed().map((e) => e.path));
  for (const entry of parsed.artifacts.recentCompares) {
    expect(seededPaths.has(entry.path)).toBe(true);
  }

  expect(errors).toEqual([]);
  await ctx.close();
});

// Case 11: the recap section still renders cleanly in both light and
// dark mode with the new sibling button present (regression guard on
// the ticket 0066 spec).
test('sibling recap section renders alongside the new button in light and dark mode', async ({
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

  const recap = page.getByTestId('dashboard-summary-recap');
  await expect(recap).toBeVisible();
  await expect(recap.getByTestId('dashboard-summary-print')).toBeVisible();
  await expect(recap.getByTestId('dashboard-dossier-download')).toBeVisible();

  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(recap).toBeVisible();
  await expect(recap.getByTestId('dashboard-dossier-download')).toBeVisible();

  expect(errors).toEqual([]);
  await ctx.close();
});
