import { test, expect } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Dedicated coverage for the /case-studies/:slug dynamic route. routes.ts
// only holds static paths, so real slugs are smoke-tested here.
const SLUGS = ['construction', 'real-estate', 'events'] as const;

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

for (const slug of SLUGS) {
  const route = `/case-studies/${slug}`;
  test(`${route} loads cleanly`, async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (e) => {
      const msg = `pageerror: ${e.message}`;
      if (!isIgnorable(msg)) errors.push(msg);
    });

    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response, `no response for ${route}`).not.toBeNull();
    expect(response!.status(), `${route} returned ${response!.status()}`).toBeLessThan(400);

    await expect
      .poll(
        () => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0),
        { timeout: 10_000, message: `${route}: #root never rendered app content` },
      )
      .toBeGreaterThan(500);

    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});

    expect(errors, `unexpected runtime errors on ${route}:\n${errors.join('\n')}`).toEqual([]);
  });
}
