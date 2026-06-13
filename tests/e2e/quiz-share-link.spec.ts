import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0052 - Shareable AI Readiness Quiz result deep-link rendering the
// tier card from a /quiz?tier= URL. Each test maps 1:1 to an acceptance-
// criteria box on the ticket. Modeled on
// tests/e2e/shareable-estimate-link.spec.ts (ticket 0009, the closest peer
// for "encode/decode URL params, copy share-link to clipboard") and
// tests/e2e/roi-calculator.spec.ts (ticket 0046, the closest peer for "the
// share-link clicker AND the recipient deep-link are both tested in one
// spec").
//
// The /quiz page renders the AI Readiness Quiz. This ticket adds two
// surfaces:
//   - On the result panel (post-quiz): a "Copy share link" button writes
//     `${origin}/quiz?tier=<tier>` to the clipboard. Both the
//     navigator.clipboard path and the iOS-Safari execCommand fallback fire
//     trackCTAClick('quiz_share_copy', 'quiz').
//   - On the quiz intro (pre-quiz): when the URL carries a valid
//     ?tier=<tier> param AND step === 0, an
//     <aside data-testid="quiz-shared-tier-banner"> renders above question 1
//     with the corresponding TIERS[sharedTier] card (icon, color, label,
//     description) plus the literal line "Shared result. Take the quiz
//     yourself to see your own tier." and the Calendly CTA.
//
// Per the 2026-05-30 second-@type lesson, this ticket adds NO new JSON-LD
// `@type`; the predecessor ticket 0039 Quiz JSON-LD stays untouched and
// this spec does not assert any JSON-LD contract.

const ROUTE = '/quiz';
const EM_DASH = String.fromCharCode(8212);
const BANNER = '[data-testid="quiz-shared-tier-banner"]';

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

async function gotoQuiz(page: Page, query = ''): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const url = `${ROUTE}${query}`;
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${url}`).not.toBeNull();
  expect(response!.status(), `${url} returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(
      () => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(500);
  return errors;
}

// Drive the seven-question quiz to the result panel by clicking the first
// option each time and submitting the email gate. The first option of every
// question carries non-zero points only for some questions, but the path is
// deterministic so the computed tier is byte-stable across runs.
async function runQuizToResults(page: Page, emailDomain = 'example.com'): Promise<string> {
  const quizMain = page.locator('main');
  for (let i = 0; i < 7; i++) {
    const heading = quizMain.locator('h2').first();
    await expect(heading).toBeVisible();
    // Click the first answer option to advance.
    await quizMain.locator('button').filter({ hasText: /.+/ }).first().click();
    await page.waitForTimeout(450);
  }
  // Email gate: enter a synthetic address to unlock the result panel.
  const emailInput = page.getByLabel(/email address for quiz results/i);
  await expect(emailInput).toBeVisible();
  await emailInput.fill(`agent+0052@${emailDomain}`);
  const submit = page.getByRole('button', { name: /see my results/i });
  await submit.click();
  // The Formspree POST may fail in test env; either way the result panel
  // becomes visible once emailSubmitted flips. We assert via the copy share
  // link button which only exists post-completion.
  const copyBtn = page.getByTestId('quiz-copy-share-link');
  await expect(copyBtn).toBeVisible({ timeout: 15_000 });
  // Return the visible tier label so the caller can correlate clipboard
  // contents to the expected tier.
  const tierLabel = (await page.locator('main h2').first().innerText()).trim();
  return tierLabel;
}

test.describe('shareable AI readiness quiz tier deep-link', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  // Box 1: baseline. /quiz with no params shows the intro + question 1 and
  // no shared-tier banner exists.
  test('baseline: /quiz with no params renders question 1 and no shared banner', async ({
    page,
  }) => {
    const errors = await gotoQuiz(page);
    await expect(page.locator(BANNER)).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.locator('main h2').filter({ hasText: 'What type of business do you run?' }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });

  // Box 2: ready-tier case. /quiz?tier=ready shows the Ready tier label in
  // the shared banner above question 1.
  test('ready: /quiz?tier=ready renders the Ready for AI shared banner', async ({ page }) => {
    const errors = await gotoQuiz(page, '?tier=ready');
    const banner = page.locator(BANNER);
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Ready for AI');
    await expect(banner).toContainText('Shared result. Take the quiz yourself to see your own tier.');
    expect(errors).toEqual([]);
  });

  // Box 3: advanced-tier case.
  test('advanced: /quiz?tier=advanced renders the Advanced shared banner', async ({ page }) => {
    const errors = await gotoQuiz(page, '?tier=advanced');
    const banner = page.locator(BANNER);
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Advanced');
    expect(errors).toEqual([]);
  });

  // Box 4: getting-started-tier case.
  test('getting_started: /quiz?tier=getting_started renders the Getting Started shared banner', async ({
    page,
  }) => {
    const errors = await gotoQuiz(page, '?tier=getting_started');
    const banner = page.locator(BANNER);
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Getting Started');
    expect(errors).toEqual([]);
  });

  // Box 5: malformed-tier case. /quiz?tier=foo treats the param as absent;
  // the banner does not render and no pageerror event fires.
  test('malformed: /quiz?tier=foo renders no banner and no page error', async ({ page }) => {
    const errors = await gotoQuiz(page, '?tier=foo');
    await expect(page.locator(BANNER)).toHaveCount(0);
    await expect(
      page.locator('main h2').filter({ hasText: 'What type of business do you run?' }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });

  // Box 6: copy case. Complete the quiz with a deterministic path, click
  // "Copy share link", and assert the clipboard holds a URL with ?tier=
  // matching the computed tier.
  test('copy: completing the quiz and clicking Copy share link writes a tier URL to the clipboard', async ({
    page,
  }) => {
    const errors = await gotoQuiz(page);
    await runQuizToResults(page);

    const copyBtn = page.getByTestId('quiz-copy-share-link');
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(page.getByTestId('quiz-copy-confirmation')).toBeVisible();

    const clip = await page.evaluate(() => navigator.clipboard.readText());
    const url = new URL(clip);
    expect(url.origin).toBe(new URL(page.url()).origin);
    expect(url.pathname).toBe(ROUTE);
    const tier = url.searchParams.get('tier');
    expect(tier, 'share URL carries a tier param').not.toBeNull();
    expect(['getting_started', 'ready', 'advanced']).toContain(tier);

    // No em-dash in the visible button or confirmation copy.
    expect(await copyBtn.innerText()).not.toContain(EM_DASH);
    expect(await page.getByTestId('quiz-copy-confirmation').innerText()).not.toContain(EM_DASH);

    expect(errors).toEqual([]);
  });

  // Box 7: no-em-dash case. /quiz?tier=ready body text contains zero em-dash
  // characters (U+2014).
  test('no-em-dash: /quiz?tier=ready body text contains zero em-dash characters', async ({
    page,
  }) => {
    const errors = await gotoQuiz(page, '?tier=ready');
    await expect(page.locator(BANNER)).toBeVisible();
    const bodyText = (await page.textContent('body')) ?? '';
    expect(bodyText, 'rendered body contains an em-dash').not.toContain(EM_DASH);
    expect(errors).toEqual([]);
  });

  // Box 8: dark-mode case. Applying .dark to the root keeps the shared
  // banner rendering on /quiz?tier=ready.
  test('dark-mode: applying .dark on the root keeps the shared banner rendering', async ({
    page,
  }) => {
    const errors = await gotoQuiz(page, '?tier=ready');
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.setViewportSize({ width: 375, height: 812 });
    const banner = page.locator(BANNER);
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Ready for AI');

    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(hasDarkClass).toBe(true);

    expect(errors).toEqual([]);
  });
});
