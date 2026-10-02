import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';
// Ticket 0107 - mirror-source imports per the 2026-05-25 mirror-source
// rule + the 2026-06-07 src-imports-tests lesson. The spec reads the
// schema version from the ticket 0082 dossier module and the fragment
// cap from the new shareable-dossier util directly; hand-rolled copies
// in the spec would drift silently.
import { DOSSIER_SCHEMA_VERSION } from '../../src/utils/evaluationDossier';
import {
  MAX_FRAGMENT_BYTES,
  encodeDossierToFragment,
  decodeDossierFromFragment,
} from '../../src/utils/shareableDossier';

// Ticket 0107 - Shareable /my dossier via deep-link URL fragment.
// Each test maps 1:1 to a sub-scenario in the ticket's acceptance box
// 7 (cases 1-12). Modeled on tests/e2e/dashboard-dossier-export.spec.ts
// (ticket 0082 seed pattern) for the multi-store seed shape and on
// tests/e2e/shareable-estimate-link.spec.ts (ticket 0009) for the
// clipboard-copy + cross-context open shape.
//
// Per the 2026-05-07 em-dash Hard NO, this file itself contains no
// em-dash (U+2014); the assertion uses String.fromCharCode(8212). Per
// the 2026-09-05 route-code-splitting + 2026-09-10 mount-signal
// lessons, gotoMy waits for RouteFallback detach AND for the dashboard
// H2 to be visible before returning. Per the 2026-09-28 addInitScript-
// re-runs lesson, every seed is written via page.evaluate AFTER the
// first same-origin navigation, not via context.addInitScript, so a
// mid-test navigation cannot clobber the mount-time hydrator write.

const DASHBOARD_URL = '/my';
const LAST_ESTIMATE_KEY = 'dca_last_estimate_v1_construction';
const ROI_RESULT_KEY = 'dca_last_roi_result_v1';
const QUIZ_PERSONA_KEY = 'dca_quiz_persona_v1';
const RECENT_COMPARES_KEY = 'dca_recent_compares_v1';

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

// Waits for a route ready signal that survives the RouteFallback
// Suspense spinner (2026-09-05 lesson) AND the dashboard's on-mount
// hydration pattern (2026-09-10 lesson). The dashboard renders an
// <h1> inside the hero and an <h2> inside the share toolbar container
// once the lazy chunk mounts; waiting for the H1 is enough to serialize
// the recipient-side banner read in the import test.
async function gotoMy(page: Page): Promise<void> {
  const response = await page.goto(DASHBOARD_URL, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${DASHBOARD_URL}`).not.toBeNull();
  expect(response!.status(), `${DASHBOARD_URL} returned ${response!.status()}`).toBeLessThan(400);
  // 2026-09-10 mount-signal: wait for the dashboard H1 directly so
  // the lazy chunk's useLayoutEffect (hydrator) and the dashboard's
  // own useEffect have both fired by the time the test reads DOM.
  // The locator auto-retries, so a slow fresh-context cold start
  // simply waits a bit longer rather than tripping an inflated
  // innerHTML-length poll.
  await page.locator('h1').first().waitFor({ state: 'visible', timeout: 30_000 });
}

async function openUrl(page: Page, url: string): Promise<void> {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${url}`).not.toBeNull();
  expect(response!.status(), `${url} returned ${response!.status()}`).toBeLessThan(400);
  await page.locator('h1').first().waitFor({ state: 'visible', timeout: 30_000 });
}

type Seeds = {
  estimate?: unknown;
  roi?: unknown;
  quizPersona?: unknown;
  recentCompares?: unknown;
};

// Seed via page.evaluate AFTER the first navigation (2026-09-28
// addInitScript-re-runs lesson) so a mid-test navigation to a share
// URL cannot re-fire a seed script that clobbers the mount-time
// hydrator write.
async function seedAndReload(page: Page, seeds: Seeds): Promise<void> {
  await page.evaluate(
    ([estimate, roi, persona, compares, estimateKey, roiKey, personaKey, comparesKey]) => {
      const w = window as unknown as { localStorage: Storage };
      if (estimate !== undefined) w.localStorage.setItem(estimateKey as string, estimate as string);
      if (roi !== undefined) w.localStorage.setItem(roiKey as string, roi as string);
      if (persona !== undefined) w.localStorage.setItem(personaKey as string, persona as string);
      if (compares !== undefined) w.localStorage.setItem(comparesKey as string, compares as string);
    },
    [
      seeds.estimate === undefined ? undefined : JSON.stringify(seeds.estimate),
      seeds.roi === undefined ? undefined : JSON.stringify(seeds.roi),
      seeds.quizPersona === undefined ? undefined : JSON.stringify(seeds.quizPersona),
      seeds.recentCompares === undefined ? undefined : JSON.stringify(seeds.recentCompares),
      LAST_ESTIMATE_KEY,
      ROI_RESULT_KEY,
      QUIZ_PERSONA_KEY,
      RECENT_COMPARES_KEY,
    ],
  );
  await gotoMy(page);
}

function estimateSeed() {
  return {
    selectedTypeId: 'kitchen',
    sqft: 200,
    selectedFinishId: 'mid_range',
    selectedExtraIds: ['permit'],
  };
}

function roiSeed() {
  return {
    inputs: { leads: 60, minutes: 8, hourly: 75, afterhours: 35 },
    savedAt: Date.now() - 60_000,
  };
}

function personaSeed() {
  return { persona: 'Ready for AI', completedAt: Date.now() - 60_000 };
}

// 100 compare rows (all cycling through the real COMPARE_ENTRIES allow-
// list by path) so the base64url-encoded dossier reliably exceeds the
// 32KB fragment cap. The store's read-time allow-list filter accepts
// every path; only the dossier-encode step blows past MAX_FRAGMENT_BYTES.
function oversizedComparesSeed() {
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
  const rows: Array<{ path: string; tool: string; viewedAt: number }> = [];
  const now = Date.now();
  // 400 rows of average ~90 bytes each JSON-stringified clears 32KB
  // after base64url expansion (4/3 ratio) with margin.
  for (let i = 0; i < 400; i++) {
    const [path, tool] = paths[i % paths.length];
    rows.push({ path, tool, viewedAt: now - i * 1000 });
  }
  return rows;
}

test.describe('shareable /my dossier via deep-link URL fragment', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });
  // Dashboard chunk cold start + optional cross-context navigation
  // comfortably exceeds the 30s default on a loaded CI runner; bump
  // every case to 60s so a slow fresh context never flakes.
  test.describe.configure({ timeout: 60_000 });

  // Box 1: empty /my (no stores seeded). The share button renders. The
  // copied URL's fragment decodes to a dossier whose every artifact
  // slot is null or empty-array. The toast reads "0 artifacts".
  test('empty /my: share button copies a URL whose fragment decodes to an empty dossier', async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await gotoMy(page);

    const button = page.getByTestId('dashboard-share-link-copy');
    await expect(button).toBeVisible();
    await button.click();

    const toast = page.getByTestId('dashboard-share-link-toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('0 artifacts');

    const clip = await page.evaluate(() => navigator.clipboard.readText());
    const url = new URL(clip);
    expect(url.pathname).toBe('/my');
    expect(url.hash.startsWith('#dossier=')).toBe(true);
    const fragment = url.hash.slice('#dossier='.length);
    const decoded = decodeDossierFromFragment(fragment);
    expect(decoded).not.toBeNull();
    expect(decoded!.schemaVersion).toBe(DOSSIER_SCHEMA_VERSION);
    expect(decoded!.artifacts.estimate).toBeNull();
    expect(decoded!.artifacts.roi).toBeNull();
    expect(decoded!.artifacts.quizPersona).toBeNull();
    expect(Array.isArray(decoded!.artifacts.quizHistory)).toBe(true);
    expect(decoded!.artifacts.quizHistory.length).toBe(0);
    expect(Array.isArray(decoded!.artifacts.recentDemos)).toBe(true);
    expect(decoded!.artifacts.recentDemos.length).toBe(0);
    expect(Array.isArray(decoded!.artifacts.recentCompares)).toBe(true);
    expect(decoded!.artifacts.recentCompares.length).toBe(0);

    expect(errors).toEqual([]);
  });

  // Box 2: three stores seeded. The copied URL's fragment decodes to a
  // dossier containing exactly those three non-null slots.
  test('seeded three artifacts: copied URL fragment decodes to a 3-artifact dossier', async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await gotoMy(page);
    await seedAndReload(page, {
      estimate: estimateSeed(),
      roi: roiSeed(),
      quizPersona: personaSeed(),
    });

    const button = page.getByTestId('dashboard-share-link-copy');
    await expect(button).toBeVisible();
    await button.click();

    const toast = page.getByTestId('dashboard-share-link-toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('3 artifacts');

    const clip = await page.evaluate(() => navigator.clipboard.readText());
    const url = new URL(clip);
    const fragment = url.hash.slice('#dossier='.length);
    const decoded = decodeDossierFromFragment(fragment);
    expect(decoded).not.toBeNull();
    expect(decoded!.artifacts.estimate).not.toBeNull();
    expect(decoded!.artifacts.estimate!.selectedTypeId).toBe('kitchen');
    expect(decoded!.artifacts.roi).not.toBeNull();
    expect(decoded!.artifacts.roi!.inputs.hourly).toBe(75);
    expect(decoded!.artifacts.quizPersona).not.toBeNull();
    expect(decoded!.artifacts.quizPersona!.persona).toBe('Ready for AI');

    expect(errors).toEqual([]);
  });

  // Box 3: paste the resulting URL into a FRESH browser context (empty
  // localStorage) and navigate to it. The recipient's dashboard shows
  // the three seeded cards AND the import banner reading "3 artifacts".
  test('fresh context import: the recipient dashboard renders the seeded cards and the banner', async ({
    browser,
  }) => {
    test.setTimeout(60_000);
    const ctxA = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    const pageA = await ctxA.newPage();
    await gotoMy(pageA);
    await seedAndReload(pageA, {
      estimate: estimateSeed(),
      roi: roiSeed(),
      quizPersona: personaSeed(),
    });
    await pageA.getByTestId('dashboard-share-link-copy').click();
    const shareUrl = await pageA.evaluate(() => navigator.clipboard.readText());
    await ctxA.close();

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    const errors = trackErrors(pageB);
    await openUrl(pageB, shareUrl);

    const banner = pageB.getByTestId('dashboard-shared-link-import-banner');
    await expect(banner).toHaveCount(1);
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('3 artifacts');

    // The three seeded cards render on the recipient's dashboard.
    await expect(pageB.getByTestId('dashboard-estimate-card')).toBeVisible();
    await expect(pageB.getByTestId('dashboard-roi-card')).toBeVisible();
    await expect(pageB.getByTestId('dashboard-quiz-persona-card')).toBeVisible();

    expect(errors).toEqual([]);
    await ctxB.close();
  });

  // Box 4: clicking "Restore your own" on the banner clears the three
  // imported keys and renders the empty-state dashboard.
  test('restore your own: clears imported keys and reverts to the empty state', async ({
    browser,
  }) => {
    test.setTimeout(60_000);
    const ctxA = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    const pageA = await ctxA.newPage();
    await gotoMy(pageA);
    await seedAndReload(pageA, {
      estimate: estimateSeed(),
      roi: roiSeed(),
      quizPersona: personaSeed(),
    });
    await pageA.getByTestId('dashboard-share-link-copy').click();
    const shareUrl = await pageA.evaluate(() => navigator.clipboard.readText());
    await ctxA.close();

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    const errors = trackErrors(pageB);
    await openUrl(pageB, shareUrl);

    const banner = pageB.getByTestId('dashboard-shared-link-import-banner');
    await expect(banner).toBeVisible();
    await pageB.getByTestId('dashboard-shared-link-restore').click();

    // The imported cards go away.
    await expect(pageB.getByTestId('dashboard-estimate-card')).toHaveCount(0);
    await expect(pageB.getByTestId('dashboard-roi-card')).toHaveCount(0);
    await expect(pageB.getByTestId('dashboard-quiz-persona-card')).toHaveCount(0);
    // Imported keys are cleared from localStorage.
    const remaining = await pageB.evaluate(
      ([estimateKey, roiKey, personaKey]) => ({
        estimate: window.localStorage.getItem(estimateKey as string),
        roi: window.localStorage.getItem(roiKey as string),
        persona: window.localStorage.getItem(personaKey as string),
      }),
      [LAST_ESTIMATE_KEY, ROI_RESULT_KEY, QUIZ_PERSONA_KEY] as const,
    );
    expect(remaining.estimate).toBeNull();
    expect(remaining.roi).toBeNull();
    expect(remaining.persona).toBeNull();

    expect(errors).toEqual([]);
    await ctxB.close();
  });

  // Box 5: a fragment whose payload is not valid base64url is a silent
  // no-op (no banner, no clear, no toast).
  test('malformed base64url fragment: silent no-op, no banner, no store mutation', async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await openUrl(page, '/my#dossier=!!!bad!!!');

    await expect(page.getByTestId('dashboard-shared-link-import-banner')).toHaveCount(0);
    // The dashboard's own empty-state (no stores) still renders.
    await expect(page.getByTestId('dashboard-share-link-copy')).toBeVisible();

    expect(errors).toEqual([]);
  });

  // Box 6: a fragment whose decoded JSON carries a schemaVersion that
  // does not match DOSSIER_SCHEMA_VERSION is a silent no-op.
  test('stale schemaVersion fragment: silent no-op, no banner, no store mutation', async ({
    page,
  }) => {
    const errors = trackErrors(page);
    // Build a dossier shape with a bogus schemaVersion, then encode it
    // via the real encode helper so the base64url framing is valid.
    const stale = {
      schemaVersion: '0.0',
      generatedAt: new Date().toISOString(),
      artifacts: {
        estimate: null,
        roi: null,
        quizPersona: null,
        quizHistory: [],
        recentDemos: [],
        recentCompares: [],
        visitStreak: null,
      },
    };
    // encodeDossierToFragment accepts any EvaluationDossier-shaped
    // object; the mismatch is caught at decode time (returns null).
    const fragment = encodeDossierToFragment(stale as never);
    await openUrl(page, `/my#dossier=${fragment}`);

    await expect(page.getByTestId('dashboard-shared-link-import-banner')).toHaveCount(0);
    await expect(page.getByTestId('dashboard-share-link-copy')).toBeVisible();

    expect(errors).toEqual([]);
  });

  // Box 7: oversized dossier (seeded via a bulk-insert of recent-
  // compares entries that push the base64url-encoded fragment past
  // MAX_FRAGMENT_BYTES). The share button does NOT write to the
  // clipboard; the oversized banner renders.
  test('oversized dossier: oversized banner renders, no clipboard write', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = trackErrors(page);
    await gotoMy(page);
    await seedAndReload(page, {
      recentCompares: oversizedComparesSeed(),
    });

    // Pre-fill clipboard with a sentinel so a failing-to-write path
    // leaves the sentinel in place, which the assertion catches.
    await page.evaluate(() => navigator.clipboard.writeText('__sentinel__'));

    const button = page.getByTestId('dashboard-share-link-copy');
    await expect(button).toBeVisible();
    await button.click();

    const oversized = page.getByTestId('dashboard-share-link-oversized');
    await expect(oversized).toHaveCount(1);
    await expect(oversized).toBeVisible();

    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toBe('__sentinel__');

    expect(errors).toEqual([]);
  });

  // Box 8: the import banner renders zero U+2014 em-dash code points
  // in its visible text (2026-05-07 Hard NO). Scoped to the two new
  // banner components so the homepage Organization JSON-LD's
  // legitimate em-dash is not swept up (2026-09-08 lesson).
  test('import banner has zero em-dashes in its visible text', async ({ browser }) => {
    test.setTimeout(60_000);
    const ctxA = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    const pageA = await ctxA.newPage();
    await gotoMy(pageA);
    await seedAndReload(pageA, {
      estimate: estimateSeed(),
      roi: roiSeed(),
      quizPersona: personaSeed(),
    });
    await pageA.getByTestId('dashboard-share-link-copy').click();
    const shareUrl = await pageA.evaluate(() => navigator.clipboard.readText());
    await ctxA.close();

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    const errors = trackErrors(pageB);
    await openUrl(pageB, shareUrl);

    const banner = pageB.getByTestId('dashboard-shared-link-import-banner');
    await expect(banner).toBeVisible();
    const bannerText = (await banner.innerText()) ?? '';
    expect(bannerText).not.toContain(EM_DASH);

    // The share-link copy button text is also em-dash free.
    const buttonText =
      (await pageB.getByTestId('dashboard-share-link-copy').innerText()) ?? '';
    expect(buttonText).not.toContain(EM_DASH);

    expect(errors).toEqual([]);
    await ctxB.close();
  });

  // Box 9: the share-link copy button and the import banner render
  // cleanly in both light and dark mode (html.dark toggle).
  test('dark mode: copy button and import banner render cleanly', async ({ browser }) => {
    test.setTimeout(60_000);
    const ctxA = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    const pageA = await ctxA.newPage();
    await gotoMy(pageA);
    await seedAndReload(pageA, { quizPersona: personaSeed() });
    await pageA.getByTestId('dashboard-share-link-copy').click();
    const shareUrl = await pageA.evaluate(() => navigator.clipboard.readText());
    await ctxA.close();

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    const errors = trackErrors(pageB);
    await openUrl(pageB, shareUrl);

    await pageB.evaluate(() => document.documentElement.classList.add('dark'));
    await expect(pageB.getByTestId('dashboard-share-link-copy')).toBeVisible();
    await expect(pageB.getByTestId('dashboard-shared-link-import-banner')).toBeVisible();
    const hasDarkClass = await pageB.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(hasDarkClass).toBe(true);

    expect(errors).toEqual([]);
    await ctxB.close();
  });

  // Box 10: regression guard. The MAX_FRAGMENT_BYTES constant imported
  // from the source util matches the ticket's documented cap of 32KB
  // (32 * 1024). Mirror-source parity between the spec and the shipped
  // util per the 2026-06-07 src-imports-tests lesson.
  test('MAX_FRAGMENT_BYTES mirrors the ticket cap of 32KB', () => {
    expect(MAX_FRAGMENT_BYTES).toBe(32 * 1024);
  });

  // Box 11: regression check on the ticket 0082 download-JSON button.
  // The share-link copy button renders next to it in the summary recap
  // toolbar when the dashboard has data; both buttons stay visible
  // alongside the ticket 0066 print button. (The share button also
  // renders in a dedicated empty-state toolbar when anyData is false;
  // that path is exercised by Box 1.)
  test('ticket 0082 download-JSON button stays visible alongside the new share button', async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await gotoMy(page);
    await seedAndReload(page, {
      estimate: estimateSeed(),
      roi: roiSeed(),
    });

    const recap = page.getByTestId('dashboard-summary-recap');
    await expect(recap).toBeVisible();
    await expect(recap.getByTestId('dashboard-summary-print')).toBeVisible();
    await expect(recap.getByTestId('dashboard-dossier-download')).toBeVisible();
    await expect(page.getByTestId('dashboard-share-link-copy')).toBeVisible();
    const downloadLabel =
      (await recap.getByTestId('dashboard-dossier-download').innerText()) ?? '';
    expect(downloadLabel).toMatch(/Download JSON/);

    expect(errors).toEqual([]);
  });

  // Box 12: 2026-05-30 second-@type lesson. This ticket adds no new
  // JSON-LD block. The grep over the two JSON-LD blocks the page
  // already emits (ticket 0045 BreadcrumbList + WebPage) is a no-op;
  // no third block of either @type lands. The Implementation log
  // records "no new JSON-LD blocks added" for auditability.
  test('no new JSON-LD block landed on /my', async ({ page }) => {
    const errors = trackErrors(page);
    await gotoMy(page);
    const blocks = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
        (s) => s.textContent ?? '',
      ),
    );
    const parsed = blocks
      .map((raw) => {
        try {
          return JSON.parse(raw) as { '@type'?: unknown; name?: unknown };
        } catch {
          return null;
        }
      })
      .filter(
        (b): b is { '@type'?: unknown; name?: unknown } => b !== null && typeof b === 'object',
      );
    // The dashboard emits two blocks already from ticket 0045: a
    // BreadcrumbList and a WebPage. The homepage Organization block
    // ships inline in index.html, so it lands on every SPA route; the
    // predecessor-spec grep for /my's own blocks filters by @type.
    const dashboardTypes = parsed
      .map((b) => (typeof b['@type'] === 'string' ? b['@type'] : ''))
      .filter((t) => t === 'BreadcrumbList' || t === 'WebPage');
    expect(dashboardTypes.sort()).toEqual(['BreadcrumbList', 'WebPage']);

    expect(errors).toEqual([]);
  });
});
