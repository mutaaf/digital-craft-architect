import { test, expect, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Ticket 0123 - the app launcher shared with mutaafaziz.com (github.com/mutaaf/launcher), vendored at
// public/vendor/launcher@<version>/launcher.js and pinned by src/vendor/launcher.json. Both navbars
// carry one Apps button; the palette renders in an open shadow root, which Playwright's locators pierce.

const lock = JSON.parse(readFileSync('src/vendor/launcher.json', 'utf8')) as { version: string; sha256: string };

async function go(page: Page, host: 'root' | 'cto'): Promise<void> {
  await page.route('**/api/scene**', (route) => route.fulfill({ status: 404 }));
  const res = await page.goto(`/?force=${host}`, { waitUntil: 'domcontentloaded' });
  expect(res!.status()).toBeLessThan(400);
  await page.locator('[role="status"][aria-label="Loading"]').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
}

test('the vendored launcher is served and matches the lock', async ({ request }) => {
  const res = await request.get(`/vendor/launcher@${lock.version}/launcher.js`);
  expect(res.status()).toBe(200);
  expect(createHash('sha256').update(await res.body()).digest('hex')).toBe(lock.sha256);
});

for (const [host, here, other] of [['root', 'Digital Craft AI', 'Fractional CTO'], ['cto', 'Fractional CTO', 'Digital Craft AI']] as const) {
  test(`${host}: one Apps button opens the shared palette, without the site you're on`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await go(page, host);
    const apps = page.getByRole('button', { name: 'Apps' });
    await expect(apps).toHaveCount(1);
    await apps.click();
    const palette = page.getByRole('dialog', { name: 'Launch an app' });
    await expect(palette).toBeVisible({ timeout: 10_000 });
    await expect(palette.getByRole('option', { name: new RegExp(other) })).toBeVisible();
    await expect(palette.getByRole('option', { name: new RegExp(`^${here}`) })).toHaveCount(0);
    await expect(palette.getByRole('option', { name: /Book a discovery call/ })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(palette).toBeHidden();
    await expect(apps).toBeFocused();
    expect(errors).toEqual([]);
  });
}

test('Ctrl+K opens and closes it; search finds an app', async ({ page }) => {
  await go(page, 'cto');
  const palette = page.getByRole('dialog', { name: 'Launch an app' });
  await expect.poll(async () => page.evaluate(() => !!document.querySelector('[data-launcher]')), { timeout: 10_000 }).toBe(true);
  await page.keyboard.press('Control+k');
  await expect(palette).toBeVisible();
  await page.keyboard.type('flight');
  await expect(palette.getByRole('option')).toHaveCount(1);
  await expect(palette.getByRole('option')).toContainText('OpenAero DFW');
  await page.keyboard.press('Control+k');
  await expect(palette).toBeHidden();
});

test('phones: the Apps button sits beside the menu and opens a bottom sheet', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await go(page, 'root');
  const apps = page.getByRole('button', { name: 'Apps' });
  await expect(apps).toBeVisible();
  await apps.click();
  const box = await page.getByRole('dialog', { name: 'Launch an app' }).boundingBox();
  expect(Math.round(box!.y + box!.height)).toBeGreaterThanOrEqual(840);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await ctx.close();
});
