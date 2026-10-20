import { test, expect, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Tickets 0117-0119 - Crew of Light: both heroes play an aurora-field storyboard in four acts. The library is
// vendored (public/vendor/aurora-field@<version>/, pinned by src/vendor/aurora-field.json) and
// loads after first paint. The story comes from /api/scene; the preview server has no API, so
// these tests either let it 404 (the bundled board must play) or answer it with page.route.

const lock = JSON.parse(readFileSync('src/vendor/aurora-field.json', 'utf8')) as { version: string; browser: string };
const SRC = `/vendor/aurora-field@${lock.version}/aurora-field.min.js`;
const STAGE = 'figure[aria-labelledby="story-title-cto"]';
const ROOT_STAGE = 'figure[aria-labelledby="story-title-root"]';
const POOL_BOARD = {
  version: 1,
  beats: [
    { trade: 'pool', moment: { text: 'Sun 8:02 AM · new lead', at: 'prop' }, missed: { text: 'No reply · the lead went cold' }, caption: { who: 'Pool service', did: 'Lead went cold · nobody wrote back' } },
    { trade: 'pool', moment: { text: 'Sun 8:02 AM · new lead', at: 'prop' }, caption: { who: 'Pool service', did: 'Lead qualified · follow-up booked' } },
    { crew: ['pool', 'plumber'], caption: { did: 'Your whole crew · on autopilot' } },
  ],
};

async function gotoCTO(page: Page, query = ''): Promise<void> {
  const response = await page.goto('/?force=cto' + query, { waitUntil: 'domcontentloaded' });
  expect(response!.status()).toBeLessThan(400);
  await page.locator('[role="status"][aria-label="Loading"]').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
  await expect(page.locator('h1')).toContainText('Book more jobs.');
}

test('the vendored library is served and matches the lock', async ({ request }) => {
  const res = await request.get(SRC);
  expect(res.status()).toBe(200);
  expect(createHash('sha256').update(await res.body()).digest('hex')).toBe(lock.browser);
});

test('the library is not in the initial HTML: it loads after first paint', async ({ request }) => {
  expect(await (await request.get('/')).text()).not.toContain('aurora-field');
});

test('with no scene API the bundled story plays: the miss first, narrated, with chapters', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const asked = page.waitForRequest((r) => r.url().includes('/api/scene?host=cto'), { timeout: 15_000 });
  await gotoCTO(page);
  await asked;
  const stage = page.locator(STAGE);
  await expect(stage.locator('canvas')).toHaveCount(1);
  await expect(stage.getByRole('combobox')).toHaveValue('roofer', { timeout: 15_000 });
  await expect(stage.locator('.story-line')).toContainText(/Meet a roofer|9:47 PM|Nobody picks up/, { timeout: 15_000 });
  await expect(stage.getByRole('button', { name: 'The miss' })).toHaveAttribute('aria-current', 'step');
  // jump to the catch; the transcript tells the whole story to screen readers
  await stage.getByRole('button', { name: 'The catch' }).click();
  await expect(stage.getByRole('button', { name: 'The catch' })).toHaveAttribute('aria-current', 'step');
  await expect(stage.locator('figcaption li')).toHaveCount(8);
  await expect(stage.locator('figcaption li').nth(4)).toContainText('This time, an agent picks up.');
  await expect(page.getByRole('link', { name: /Show Me the ROI/i }).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('the story can be paused, and the visitor can recast it with their trade', async ({ page }) => {
  await page.route('**/api/scene**', (route) => route.fulfill({ status: 404 }));
  await gotoCTO(page);
  const stage = page.locator(STAGE);
  const pause = stage.getByRole('button', { name: 'Pause the story' });
  await expect(pause).toBeVisible({ timeout: 15_000 });
  await pause.click();
  await expect(stage.getByRole('button', { name: 'Play the story' })).toHaveAttribute('aria-pressed', 'true');
  await stage.getByRole('combobox').selectOption('plumber');
  await expect(stage.getByRole('button', { name: 'Pause the story' })).toBeVisible();
  await expect(stage.locator('figcaption li').first()).toContainText('Meet a plumber.');
  await page.reload();
  await expect(page.locator(STAGE).getByRole('combobox')).toHaveValue('plumber', { timeout: 15_000 });
});

test('a story from /api/scene takes over without a deploy', async ({ page }) => {
  await page.route('**/api/scene**', (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: { ETag: '"pool-1"' }, body: JSON.stringify(POOL_BOARD) }));
  await gotoCTO(page);
  const stage = page.locator(STAGE);
  await expect(stage.getByRole('combobox')).toHaveValue('pool', { timeout: 15_000 });
  await expect(stage.locator('figcaption li')).toHaveCount(3);
});

test("a visitor from a trade's ad is asked about their trade", async ({ page }) => {
  const asked = page.waitForRequest((r) => r.url().includes('/api/scene?host=cto&vertical=pool-service'), { timeout: 15_000 });
  await gotoCTO(page, '&utm_campaign=pool_service_fall');
  await asked;
  await expect(page.locator(STAGE).getByRole('combobox')).toHaveValue('pool', { timeout: 15_000 });
  await expect(page.locator(STAGE).locator('figcaption li').first()).toContainText('Meet a pool tech.');
});

test('the company site tells the story in its own voice, in an after-hours window', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const asked = page.waitForRequest((r) => r.url().includes('/api/scene?host=root'), { timeout: 15_000 });
  await page.goto('/?force=root', { waitUntil: 'domcontentloaded' });
  await asked;
  const stage = page.locator(ROOT_STAGE);
  await expect(stage.getByRole('combobox')).toHaveValue('contractor', { timeout: 15_000 });
  await expect(stage.locator('figcaption li').nth(1)).toContainText('So we build');
  await expect(stage.getByRole('button', { name: 'Your crew' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Watch it work on your company/i })).toHaveAttribute('href', '/construction/demo');
  expect(errors).toEqual([]);
});

test('reduced motion: no pen, never the loss: the builder sits lit at his desk with his caption', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await gotoCTO(page);
  await expect(page.locator('.af-caption.af-on')).toContainText('Custom AI systems', { timeout: 15_000 });
  await expect(page.locator(STAGE).locator('.story-line')).toContainText('So I build the system');
  expect(errors).toEqual([]);
  await ctx.close();
});

test('phones: the story can be paused from beside the narrator', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.route('**/api/scene**', (route) => route.fulfill({ status: 404 }));
  await gotoCTO(page);
  const pause = page.getByRole('button', { name: 'Pause the story' }).first();
  await expect(pause).toBeVisible({ timeout: 15_000 });
  await pause.click();
  await expect(page.getByRole('button', { name: 'Play the story' }).first()).toHaveAttribute('aria-pressed', 'true');
  await ctx.close();
});
