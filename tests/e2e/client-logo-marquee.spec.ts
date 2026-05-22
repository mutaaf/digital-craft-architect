import { test, expect } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0004 - Client logo marquee (placeholders).
// A grayscale strip of 8 to 12 honest SVG placeholder logos must render below
// the hero on the Index, Construction, and RealEstate pages. The strip is
// identified by data-testid="client-logo-marquee"; each placeholder logo
// carries data-testid="client-logo". Copy must contain no em-dash, and the
// strip must sit after the hero <section> in document order.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

async function gotoPage(page: import('@playwright/test').Page, route: string) {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${route}`).not.toBeNull();
  expect(response!.status(), `${route} returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  return errors;
}

const PAGES = ['/', '/construction', '/realestate'] as const;

for (const route of PAGES) {
  test(`client logo marquee renders below the hero on ${route}`, async ({ page }) => {
    const errors = await gotoPage(page, route);

    const marquee = page.getByTestId('client-logo-marquee');
    await expect(marquee, `marquee should be present on ${route}`).toBeVisible();

    // Honest placeholder count: 8 to 12 distinct logos. The track is
    // duplicated for a seamless loop, so we assert on the unique label set.
    const labels = await marquee.getByTestId('client-logo').allInnerTexts();
    const unique = new Set(labels.map((l) => l.trim()).filter(Boolean));
    expect(unique.size, `${route} should expose 8 to 12 placeholder logos`).toBeGreaterThanOrEqual(8);
    expect(unique.size, `${route} should expose 8 to 12 placeholder logos`).toBeLessThanOrEqual(12);

    // No em-dash anywhere in the strip copy.
    const text = (await marquee.innerText()).trim();
    expect(text, 'marquee copy must not contain an em-dash').not.toContain('—');

    // The marquee must follow the hero section in document order.
    const heroEndsBeforeMarquee = await page.evaluate(() => {
      const hero = document.querySelector('section:has(h1)');
      const strip = document.querySelector('[data-testid="client-logo-marquee"]');
      if (!hero || !strip) return false;
      const position = hero.compareDocumentPosition(strip);
      return Boolean(position & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(heroEndsBeforeMarquee, `marquee should appear after the hero on ${route}`).toBe(true);

    expect(errors).toEqual([]);
  });
}
