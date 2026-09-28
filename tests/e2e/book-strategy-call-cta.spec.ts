import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';
import {
  STRATEGY_CALL_RECIPIENT,
  STRATEGY_CALL_SUBJECT,
  STRATEGY_CALL_BODY_HEADER,
  STRATEGY_CALL_FALLBACK_BODY,
} from '../../src/data/strategyCallCopy';

// Ticket 0101 - Pre-filled "Book a strategy call" mailto CTA on /my.
// Each test maps 1:1 to acceptance-criteria box 5 (cases 1-8). Modeled on
// tests/e2e/roi-calculator.spec.ts (ticket 0046 URL-encoding + telemetry
// pattern) and tests/e2e/my-dashboard.spec.ts (0045 /my mount pattern).
//
// Per the 2026-06-07 mirror-source-across-src-tests lesson, every copy
// constant the assertions look for is imported from src/data/strategyCallCopy.ts
// (not hand-rolled here).
//
// Per the 2026-09-05 route-code-splitting lesson, gotoMyDashboard() waits
// for the RouteFallback role="status" spinner to detach AND for the
// top-level /my <h1> ("Pick up where you left off") to be visible before
// probing the CTA.
//
// Per the 2026-09-28 addInitScript-re-runs lesson, this spec seeds
// persisted-store state via `page.evaluate(...)` AFTER the first
// navigation (never via context.addInitScript, which would re-fire on
// every subsequent navigation and clobber write-through cases).

const DASHBOARD_URL = '/my';

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (2026-05-07 brand-voice Hard NO bans the literal even in test code).
const EM_DASH = String.fromCharCode(8212);

const LAST_ESTIMATE_KEY = 'dca_last_estimate_v1_construction';
const ROI_SCENARIOS_KEY = 'dca_roi_scenarios_v1';
const QUIZ_HISTORY_KEY = 'dca_quiz_history_v1';
const RECENT_VERTICALS_KEY = 'dca_recent_verticals_v1';

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

async function gotoMyDashboard(page: Page): Promise<void> {
  const response = await page.goto(DASHBOARD_URL, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${DASHBOARD_URL}`).not.toBeNull();
  expect(response!.status(), `${DASHBOARD_URL} returned ${response!.status()}`).toBeLessThan(400);
  // 2026-09-05: wait for the RouteFallback (role="status" aria-label="Loading")
  // to detach BEFORE probing the DOM. The catch keeps the helper safe if
  // the fallback never appeared (fast lazy-chunk hit).
  await page
    .locator('[role="status"][aria-label="Loading"]')
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .catch(() => {
      /* no fallback observed - lazy chunk was already cached */
    });
  // Wait for the top-level /my H1 so the on-mount effects have populated
  // hydrated state before the assertions run.
  await page
    .getByRole('heading', { level: 1, name: /pick up where you/i })
    .waitFor({ state: 'visible', timeout: 10_000 });
}

async function reseedAndReload(
  page: Page,
  seeds: Record<string, string | null>,
): Promise<void> {
  // 2026-09-28: seed via page.evaluate AFTER the first navigation so the
  // seed persists across subsequent same-origin navigations without the
  // addInitScript re-run trap.
  await page.evaluate((pairs) => {
    try {
      for (const [k, v] of pairs) {
        if (v === null) window.localStorage.removeItem(k);
        else window.localStorage.setItem(k, v);
      }
    } catch {
      /* storage unavailable - non-fatal */
    }
  }, Object.entries(seeds));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page
    .locator('[role="status"][aria-label="Loading"]')
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .catch(() => {
      /* no fallback observed */
    });
  await page
    .getByRole('heading', { level: 1, name: /pick up where you/i })
    .waitFor({ state: 'visible', timeout: 10_000 });
}

function decodeMailtoBody(href: string): string {
  const q = href.split('?', 2)[1] ?? '';
  const params = new URLSearchParams(q);
  return params.get('body') ?? '';
}

test.describe('book strategy call CTA on /my', () => {
  // Box (1): /my renders exactly one CTA element with the expected testid.
  test('renders exactly one CTA on /my', async ({ page }) => {
    const errors = trackErrors(page);
    await gotoMyDashboard(page);
    await expect(page.getByTestId('book-strategy-call-cta')).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  // Box (2): the anchor's href starts with `mailto:<STRATEGY_CALL_RECIPIENT>`
  // and the recipient byte-matches the imported constant from
  // src/data/strategyCallCopy.ts (mirror-source per 2026-06-07).
  test('anchor href starts with the imported mailto recipient', async ({ page }) => {
    const errors = trackErrors(page);
    await gotoMyDashboard(page);
    const anchor = page.getByTestId('book-strategy-call-cta').locator('a');
    await expect(anchor).toBeVisible();
    const href = (await anchor.getAttribute('href')) ?? '';
    expect(href.startsWith(`mailto:${STRATEGY_CALL_RECIPIENT}`)).toBe(true);
    // Subject param is present and byte-matches STRATEGY_CALL_SUBJECT.
    const q = href.split('?', 2)[1] ?? '';
    const params = new URLSearchParams(q);
    expect(params.get('subject')).toBe(STRATEGY_CALL_SUBJECT);
    expect(errors).toEqual([]);
  });

  // Box (3): empty stores. Body is the single-line fallback and does NOT
  // contain any section header for estimate / ROI / quiz / verticals.
  test('empty stores: body is the fallback line, no section headers', async ({ page }) => {
    const errors = trackErrors(page);
    await gotoMyDashboard(page);
    await reseedAndReload(page, {
      [LAST_ESTIMATE_KEY]: null,
      [ROI_SCENARIOS_KEY]: null,
      [QUIZ_HISTORY_KEY]: null,
      [RECENT_VERTICALS_KEY]: null,
    });
    const anchor = page.getByTestId('book-strategy-call-cta').locator('a');
    const href = (await anchor.getAttribute('href')) ?? '';
    const body = decodeMailtoBody(href);
    expect(body).toContain(STRATEGY_CALL_FALLBACK_BODY);
    expect(body).not.toContain('Last estimate:');
    expect(body).not.toContain('Top saved ROI scenario:');
    expect(body).not.toContain('Most recent quiz tier:');
    expect(body).not.toContain('Verticals viewed:');
    expect(errors).toEqual([]);
  });

  // Box (4): seeded stores. Body contains one line per seeded section
  // quoting the seeded value (write-through case, values come through the
  // shipped getter, not raw localStorage).
  test('seeded stores: body quotes each seeded section', async ({ page }) => {
    const errors = trackErrors(page);
    await gotoMyDashboard(page);
    const now = Date.now();
    await reseedAndReload(page, {
      [LAST_ESTIMATE_KEY]: JSON.stringify({
        selectedTypeId: 'kitchen',
        sqft: 200,
        selectedFinishId: 'mid_range',
        selectedExtraIds: ['permit'],
      }),
      [ROI_SCENARIOS_KEY]: JSON.stringify([
        {
          id: 'baseline',
          name: 'Baseline',
          inputs: { leads: 50, minutes: 8, hourly: 85, afterhours: 35 },
          savedAt: now - 60_000,
        },
        {
          id: 'stretch',
          name: 'Stretch',
          inputs: { leads: 120, minutes: 12, hourly: 110, afterhours: 55 },
          savedAt: now - 30_000,
        },
      ]),
      [QUIZ_HISTORY_KEY]: JSON.stringify([
        { persona: 'Getting Started', completedAt: now - 5 * 24 * 60 * 60 * 1000 },
        { persona: 'Ready for AI', completedAt: now - 60 * 60 * 1000 },
      ]),
      [RECENT_VERTICALS_KEY]: JSON.stringify([
        { path: '/ai-for-plumbers', label: 'Plumbers', lastVisitedAt: now - 1000 },
        { path: '/ai-for-hvac', label: 'HVAC', lastVisitedAt: now - 2000 },
      ]),
    });
    const anchor = page.getByTestId('book-strategy-call-cta').locator('a');
    const href = (await anchor.getAttribute('href')) ?? '';
    const body = decodeMailtoBody(href);
    // Estimate section: quotes the project label the shipped getter would
    // hand back (Kitchen Remodel is the calculated project label).
    expect(body).toContain('Last estimate:');
    expect(body).toContain('Kitchen Remodel');
    // Top-savings ROI scenario is the stretch scenario (higher inputs
    // yield higher annualSavings).
    expect(body).toContain('Top saved ROI scenario:');
    expect(body).toContain('Stretch');
    // Most-recent quiz tier is the last history entry.
    expect(body).toContain('Most recent quiz tier:');
    expect(body).toContain('Ready for AI');
    // Verticals section quotes both labels the getter returns.
    expect(body).toContain('Verticals viewed:');
    expect(body).toContain('Plumbers');
    expect(body).toContain('HVAC');
    // Fallback body is NOT present because at least one section rendered.
    expect(body).not.toContain(STRATEGY_CALL_FALLBACK_BODY);
    expect(errors).toEqual([]);
  });

  // Box (5): even when every store is saturated to its cap, the encoded
  // body param stays under 900 characters (composer truncates section-by-
  // section from the bottom).
  test('encoded body length stays <= 900 chars at full saturation', async ({ page }) => {
    const errors = trackErrors(page);
    await gotoMyDashboard(page);
    const now = Date.now();
    const fiveScenarios = [1, 2, 3, 4, 5].map((i) => ({
      id: `scenario-${i}`,
      name: `Long scenario name number ${i} that eats characters`,
      inputs: { leads: 100 + i, minutes: 10 + i, hourly: 95 + i, afterhours: 40 + i },
      savedAt: now - i * 1000,
    }));
    const fiveVerticals = [
      { path: '/ai-for-plumbers', label: 'Plumbers', lastVisitedAt: now - 100 },
      { path: '/ai-for-hvac', label: 'HVAC', lastVisitedAt: now - 200 },
      { path: '/ai-for-roofers', label: 'Roofers', lastVisitedAt: now - 300 },
      { path: '/ai-for-electricians', label: 'Electricians', lastVisitedAt: now - 400 },
      { path: '/ai-for-landscapers', label: 'Landscapers', lastVisitedAt: now - 500 },
    ];
    const quizHistory = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({
      persona: 'Advanced - Ready to Scale' as const,
      completedAt: now - i * 24 * 60 * 60 * 1000,
    }));
    await reseedAndReload(page, {
      [LAST_ESTIMATE_KEY]: JSON.stringify({
        selectedTypeId: 'full_home',
        sqft: 5000,
        selectedFinishId: 'premium',
        selectedExtraIds: ['permit', 'design', 'demo'],
      }),
      [ROI_SCENARIOS_KEY]: JSON.stringify(fiveScenarios),
      [QUIZ_HISTORY_KEY]: JSON.stringify(quizHistory),
      [RECENT_VERTICALS_KEY]: JSON.stringify(fiveVerticals),
    });
    const anchor = page.getByTestId('book-strategy-call-cta').locator('a');
    const href = (await anchor.getAttribute('href')) ?? '';
    const q = href.split('?', 2)[1] ?? '';
    const params = new URLSearchParams(q);
    const encodedBody = new URLSearchParams({ body: params.get('body') ?? '' })
      .toString()
      .replace(/^body=/, '');
    expect(encodedBody.length, `encoded body length ${encodedBody.length} exceeds 900`)
      .toBeLessThanOrEqual(900);
    // Header line is preserved even when trailing sections drop.
    expect(params.get('body') ?? '').toContain(STRATEGY_CALL_BODY_HEADER);
    expect(errors).toEqual([]);
  });

  // Box (6): the click fires trackCTAClick('my_book_strategy_call',
  // 'my_dashboard') measurable via a window.gtag spy per the ticket 0046
  // telemetry-assertion pattern.
  test('click fires trackCTAClick with my_book_strategy_call / my_dashboard label', async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await gotoMyDashboard(page);
    await page.evaluate(() => {
      (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents = [];
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (
        ...args: unknown[]
      ) => {
        (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents.push(args);
      };
    });
    const anchor = page.getByTestId('book-strategy-call-cta').locator('a');
    // Prevent the mailto: navigation from tearing down the page before we
    // read window state.
    await anchor.evaluate((el) =>
      el.addEventListener('click', (e) => e.preventDefault(), {
        capture: true,
        once: true,
      }),
    );
    await anchor.click();
    const events = (await page.evaluate(
      () => (window as unknown as { __ctaEvents: unknown[][] }).__ctaEvents,
    )) as unknown[][];
    const ctaEvents = events.filter(
      (e) => Array.isArray(e) && e[0] === 'event' && e[1] === 'cta_click',
    );
    expect(ctaEvents.length, 'at least one cta_click event fired').toBeGreaterThan(0);
    const labels = ctaEvents.map((e) => {
      const params = e[2] as { event_label?: string };
      return params?.event_label ?? '';
    });
    expect(
      labels.some((l) => /my_book_strategy_call.*my_dashboard/.test(l)),
      `expected an event_label like "my_book_strategy_call - my_dashboard", got: ${labels.join(' | ')}`,
    ).toBe(true);
    expect(errors).toEqual([]);
  });

  // Box (7): rendered CTA text and the URL-decoded body contain zero
  // U+2014 code points (owned-strings scope per 2026-09-08).
  test('CTA copy and mailto body contain zero em-dash characters', async ({ page }) => {
    const errors = trackErrors(page);
    await gotoMyDashboard(page);
    const cta = page.getByTestId('book-strategy-call-cta');
    const ctaText = (await cta.textContent()) ?? '';
    expect(ctaText.length).toBeGreaterThan(10);
    expect(ctaText, 'CTA copy must contain no em-dash').not.toContain(EM_DASH);
    const anchor = cta.locator('a');
    const href = (await anchor.getAttribute('href')) ?? '';
    const body = decodeMailtoBody(href);
    expect(body, 'mailto body must contain no em-dash').not.toContain(EM_DASH);
    expect(errors).toEqual([]);
  });

  // Box (8): dark mode renders cleanly via
  // document.documentElement.classList.add('dark'); CTA remains visible.
  test('dark mode: CTA visible with .dark on documentElement at 375px', async ({
    browser,
  }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
    const page = await ctx.newPage();
    const errors = trackErrors(page);
    await gotoMyDashboard(page);
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await expect(page.getByTestId('book-strategy-call-cta')).toBeVisible();
    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(hasDarkClass).toBe(true);
    expect(errors).toEqual([]);
    await ctx.close();
  });
});
