import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0060 - Return-visit streak badge on /my dashboard.
//
// Each test maps 1:1 to one of the six sub-assertions in the acceptance
// box. Modeled on tests/e2e/my-dashboard.spec.ts (ticket 0045, the closest
// peer for "client-side personalization page seeded via
// page.addInitScript"). Pre-seeding uses the same addInitScript pattern.
//
// The store under test (src/utils/visitStreakStore.ts) chose UTC dates
// over local-time dates to avoid local-midnight edge cases; the spec
// computes today and N days ago in UTC as well so the seed and the
// post-mount read agree on what "today" means. The seeded YYYY-MM-DD
// strings are computed RELATIVE to today's date inside the spec setup
// so the test does not break when the system clock advances.
//
// Per the 2026-05-25 SEO Pilot lesson the spec does NOT assert
// page.toHaveTitle on /my; the regression spec already covers head
// elements. This spec only asserts the badge content the new ticket
// adds.

const DASHBOARD_URL = '/my';
const VISIT_DAYS_KEY = 'dca_visit_days_v1';

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the 2026-05-07 brand-voice Hard NO bans the literal character even in tests).
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

// UTC YYYY-MM-DD for N days ago. Mirror of the store's date-format choice
// so the seed and the mount-time read both agree on today's string.
function utcDaysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

async function contextWithRawSeed(
  browser: import('@playwright/test').Browser,
  rawValue: string | null,
  viewport?: { width: number; height: number },
): Promise<{ ctx: BrowserContext; page: Page; errors: string[] }> {
  const ctx = await browser.newContext(viewport ? { viewport } : undefined);
  await ctx.addInitScript(
    ([key, value]) => {
      try {
        if (value === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, value);
        }
      } catch {
        /* storage unavailable - non-fatal */
      }
    },
    [VISIT_DAYS_KEY, rawValue] as const,
  );
  const page = await ctx.newPage();
  const errors = trackErrors(page);
  return { ctx, page, errors };
}

// Box (1): seeded-empty case clears localStorage, navigates to /my, and
// asserts the badge shows "Visiting 1 day in the last 14" because the
// recordVisitToday mount fired today's date.
test('seeded-empty: badge shows "Visiting 1 day in the last 14" after mount', async ({
  browser,
}) => {
  const { ctx, page, errors } = await contextWithRawSeed(browser, null);
  await gotoDashboard(page);

  const badge = page.getByTestId('dashboard-streak-badge');
  await expect(badge).toBeVisible();
  await expect(badge).toContainText('Visiting 1 day in the last 14');
  await expect(badge).toContainText(/glad you are here/i);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Box (2): seeded-five-day case uses page.addInitScript to seed
// dca_visit_days_v1 with five distinct YYYY-MM-DD strings within the
// last 14 days BEFORE mount, then asserts the badge shows at least 5
// (5 if today is one of the seeded five, 6 if today is the sixth day).
test('seeded-five-day: badge shows at least 5 days', async ({ browser }) => {
  // Five distinct days: 1, 3, 5, 7, 9 days ago (none of which is today).
  // After mount records today, the count is 6.
  const seed = [9, 7, 5, 3, 1].map(utcDaysAgo).sort();
  const { ctx, page, errors } = await contextWithRawSeed(browser, JSON.stringify(seed));
  await gotoDashboard(page);

  const badge = page.getByTestId('dashboard-streak-badge');
  await expect(badge).toBeVisible();
  // Conservative assertion ("at least 5") per the engineering-note edge
  // case where today may or may not already be in the seeded set.
  await expect(badge).toContainText(/Visiting (5|6|7|8|9|10|11|12|13|14) days in the last 14/);
  await expect(badge).toContainText(/welcome back/i);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Box (3): seeded-with-old-entry case seeds three valid days plus two
// days older than 14 days; asserts the badge count is 3 or 4 (4 if
// today is not already in the seeded set) because the old entries
// were pruned.
test('seeded-with-pruned-old: old entries pruned, count is 3 or 4', async ({ browser }) => {
  // Three valid days within the trailing 14: 2, 6, 10 days ago.
  // Two old days: 20 and 30 days ago. Sorted ascending.
  const seed = [
    utcDaysAgo(30),
    utcDaysAgo(20),
    utcDaysAgo(10),
    utcDaysAgo(6),
    utcDaysAgo(2),
  ];
  const { ctx, page, errors } = await contextWithRawSeed(browser, JSON.stringify(seed));
  await gotoDashboard(page);

  const badge = page.getByTestId('dashboard-streak-badge');
  await expect(badge).toBeVisible();
  // 3 valid seeded + today's mount adds today (a 4th distinct day).
  await expect(badge).toContainText(/Visiting (3|4) days in the last 14/);
  await expect(badge).toContainText(/welcome back/i);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Box (4): corrupted-entry case seeds dca_visit_days_v1 to a non-JSON
// string; asserts the badge renders with the post-mount default of 1 day
// because the corrupted read silently reset.
test('corrupted-entry: silently resets, badge shows 1 day after mount', async ({ browser }) => {
  const { ctx, page, errors } = await contextWithRawSeed(browser, '!!! not json {');
  await gotoDashboard(page);

  const badge = page.getByTestId('dashboard-streak-badge');
  await expect(badge).toBeVisible();
  await expect(badge).toContainText('Visiting 1 day in the last 14');

  expect(errors).toEqual([]);
  await ctx.close();
});

// Box (5): dark-mode case applies document.documentElement.classList.add('dark')
// on a 375px viewport and asserts the badge renders.
test('renders in dark mode on a 375px viewport', async ({ browser }) => {
  const seed = [3, 1].map(utcDaysAgo).sort();
  const { ctx, page, errors } = await contextWithRawSeed(
    browser,
    JSON.stringify(seed),
    { width: 375, height: 800 },
  );
  await gotoDashboard(page);
  await page.evaluate(() => document.documentElement.classList.add('dark'));

  const badge = page.getByTestId('dashboard-streak-badge');
  await expect(badge).toBeVisible();

  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(hasDarkClass).toBe(true);

  expect(errors).toEqual([]);
  await ctx.close();
});

// Box (6): no-em-dash case reads page.textContent('body') and asserts no
// U+2014 character is present anywhere in the rendered text.
test('rendered body contains zero em-dash characters', async ({ browser }) => {
  const seed = [5, 3, 1].map(utcDaysAgo).sort();
  const { ctx, page, errors } = await contextWithRawSeed(browser, JSON.stringify(seed));
  await gotoDashboard(page);

  await expect(page.getByTestId('dashboard-streak-badge')).toBeVisible();

  const bodyText = (await page.textContent('body')) ?? '';
  expect(bodyText.length, 'body should have text content').toBeGreaterThan(100);
  expect(bodyText, 'no em-dash (U+2014) allowed on /my').not.toContain(EM_DASH);

  expect(errors).toEqual([]);
  await ctx.close();
});
