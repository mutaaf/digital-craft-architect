import { test, expect, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Ticket 0117 - Crew of Light: the CTO hero plays an aurora-field storyboard. The library is
// vendored (public/vendor/aurora-field@<version>/, pinned by src/vendor/aurora-field.json) and
// loads after first paint. The story comes from /api/scene; the preview server has no API, so
// these tests either let it 404 (the bundled board must play) or answer it with page.route.

const lock = JSON.parse(readFileSync('src/vendor/aurora-field.json', 'utf8')) as { version: string; browser: string };
const SRC = `/vendor/aurora-field@${lock.version}/aurora-field.min.js`;
const STAGE = '[role="img"][aria-label^="Animated illustration"]';
const POOL_BOARD = {
  version: 1,
  beats: [
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

test('with no scene API the bundled story plays, and the trade picker works', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const asked = page.waitForRequest((r) => r.url().includes('/api/scene?host=cto'), { timeout: 15_000 });
  await gotoCTO(page);
  await asked;
  const stage = page.locator(STAGE);
  await expect(stage.locator('canvas')).toHaveCount(1);
  const roofer = stage.getByRole('button', { name: 'Roofer' });
  await expect(roofer).toBeVisible({ timeout: 15_000 });
  await stage.getByRole('button', { name: 'Plumber' }).click();
  await expect(stage.getByRole('button', { name: 'Plumber' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('link', { name: /Show Me the ROI/i }).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('a story from /api/scene takes over without a deploy', async ({ page }) => {
  await page.route('**/api/scene**', (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: { ETag: '"pool-1"' }, body: JSON.stringify(POOL_BOARD) }));
  await gotoCTO(page);
  const stage = page.locator(STAGE);
  await expect(stage.getByRole('button', { name: 'Pool service' })).toBeVisible({ timeout: 15_000 });
  await expect(stage.getByRole('button', { name: 'Roofer' })).toHaveCount(0);
});

test("a visitor from a trade's ad is asked about their trade", async ({ page }) => {
  const asked = page.waitForRequest((r) => r.url().includes('/api/scene?host=cto&vertical=pool-service'), { timeout: 15_000 });
  await gotoCTO(page, '&utm_campaign=pool_service_fall');
  await asked;
  await expect(page.locator(STAGE).getByRole('button', { name: 'Pool service' })).toBeVisible({ timeout: 15_000 });
});

test('reduced motion: no pen, the first trade stands lit with its caption', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await gotoCTO(page);
  await expect(page.locator('.af-caption.af-on')).toContainText('Call answered', { timeout: 15_000 });
  expect(errors).toEqual([]);
  await ctx.close();
});
