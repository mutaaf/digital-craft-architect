import { test, expect } from '@playwright/test';
import { ROUTES, IGNORABLE_ERROR_PATTERNS } from './routes';

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

for (const route of ROUTES) {
  test(`${route} loads cleanly`, async ({ page }) => {
    const errors: string[] = [];

    // Only fail on uncaught JS exceptions. console.error is too noisy —
    // Sentry init, blocked analytics, missing preview-only assets all emit
    // it without breaking the user experience.
    page.on('pageerror', (e) => {
      const msg = `pageerror: ${e.message}`;
      if (!isIgnorable(msg)) errors.push(msg);
    });

    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response, `no response for ${route}`).not.toBeNull();
    expect(response!.status(), `${route} returned ${response!.status()}`).toBeLessThan(400);

    // React mounts into #root — wait until it has meaningful content (more
    // than just the empty toast portal). Proof the SPA hydrated.
    await expect
      .poll(
        () => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0),
        { timeout: 10_000, message: `${route} — #root never rendered app content` },
      )
      .toBeGreaterThan(500);

    // Give async hydration a beat to surface late errors (Helmet, lazy chunks).
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});

    expect(errors, `unexpected runtime errors on ${route}:\n${errors.join('\n')}`).toEqual([]);
  });
}
