import { test, expect, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Crew of Light: the CTO hero's aurora-field stage (src/components/v2/CrewOfLight.tsx).
// The library is vendored under public/vendor/aurora-field@<version>/ and pinned by
// src/vendor/aurora-field.json; it must load after first paint, never block the headline,
// and the page must still work (and stay still) under prefers-reduced-motion.

const lock = JSON.parse(readFileSync('src/vendor/aurora-field.json', 'utf8')) as { version: string; sha256: string };
const SRC = `/vendor/aurora-field@${lock.version}/aurora-field.js`;
const STAGE = '[role="img"][aria-label^="Animated illustration"]';

async function gotoCTO(page: Page): Promise<void> {
  const response = await page.goto('/?force=cto', { waitUntil: 'domcontentloaded' });
  expect(response!.status()).toBeLessThan(400);
  await page
    .locator('[role="status"][aria-label="Loading"]')
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .catch(() => {});
  await expect(page.locator('h1')).toContainText('Book more jobs.');
}

test('the vendored library is served and matches the lock', async ({ request }) => {
  const res = await request.get(SRC);
  expect(res.status()).toBe(200);
  const body = await res.body();
  expect(createHash('sha256').update(body).digest('hex')).toBe(lock.sha256);
  expect(body.toString('utf8')).toContain(`var VERSION = '${lock.version}'`);
});

test('the library is not in the initial HTML: it loads after first paint', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).not.toContain('aurora-field');
});

test('the CTO hero mounts the stage, loads the crew, and lets you pick a trade', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const loaded = page.waitForRequest((r) => r.url().endsWith(SRC), { timeout: 15_000 });
  await gotoCTO(page);
  await loaded;
  const stage = page.locator(STAGE);
  await expect(stage).toHaveCount(1);
  await expect(stage.locator('canvas')).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => typeof (window as unknown as { AuroraField?: unknown }).AuroraField)).toBe('object');
  const plumber = stage.getByRole('button', { name: 'Plumber' });
  await expect(plumber).toBeVisible();
  await plumber.click();
  await expect(plumber).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('link', { name: /Show Me the ROI/i }).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('reduced motion: no pen, the whole crew stands still', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await gotoCTO(page);
  const line = page.locator(STAGE).getByText('Your whole crew · on autopilot');
  await expect.poll(async () => line.evaluate((el) => getComputedStyle(el).opacity), { timeout: 15_000 }).toBe('1');
  expect(errors).toEqual([]);
  await ctx.close();
});
