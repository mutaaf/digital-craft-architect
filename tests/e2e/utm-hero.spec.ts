import { test, expect } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0001 - UTM-personalized hero copy.
// The homepage hero subheadline must swap to vertical-specific copy when
// utm_campaign contains a known keyword, and stay on the default copy when no
// matching UTM is present. The hero subheadline is the first <p> inside the
// hero <section> on the landing page.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// The hero subheadline is the first <p> inside the <section> that holds the
// page <h1>. Anchoring to the h1's section keeps this robust if banners above
// the hero ever start using <section>.
const heroSubheadline = (page: import('@playwright/test').Page) =>
  page.locator('section:has(h1)').first().locator('p').first();

async function gotoLanding(page: import('@playwright/test').Page, query: string) {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto(`/${query}`, { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for landing page').not.toBeNull();
  expect(response!.status()).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  return errors;
}

// Capture the default (no-UTM) subheadline so the vertical assertions compare
// against the real shipped copy rather than a hardcoded string.
let defaultCopy = '';

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  await gotoLanding(page, '');
  defaultCopy = (await heroSubheadline(page).textContent())?.trim() ?? '';
  expect(defaultCopy.length, 'default subheadline should not be empty').toBeGreaterThan(0);
  await page.close();
});

test('no UTM renders the default hero subheadline', async ({ page }) => {
  const errors = await gotoLanding(page, '');
  await expect(heroSubheadline(page)).toHaveText(defaultCopy);
  expect(errors).toEqual([]);
});

test('non-matching utm_campaign renders the default hero subheadline', async ({ page }) => {
  const errors = await gotoLanding(page, '?utm_campaign=brand_generic_2026');
  await expect(heroSubheadline(page)).toHaveText(defaultCopy);
  expect(errors).toEqual([]);
});

const VERTICALS = [
  { campaign: 'construction', keyword: /construction|contractor|build/i },
  { campaign: 'realestate', keyword: /real estate|propert|deal|investor/i },
  { campaign: 'restaurant', keyword: /restaurant|booking|reservation|guest/i },
  { campaign: 'events', keyword: /event|booking|venue|client/i },
] as const;

for (const { campaign, keyword } of VERTICALS) {
  test(`utm_campaign="${campaign}" swaps the hero subheadline to vertical copy`, async ({
    page,
  }) => {
    const errors = await gotoLanding(page, `?utm_campaign=${campaign}_spring_ad`);
    const sub = heroSubheadline(page);
    const text = (await sub.textContent())?.trim() ?? '';
    expect(text, `${campaign} copy should differ from default`).not.toBe(defaultCopy);
    expect(text, `${campaign} copy should be vertical-specific`).toMatch(keyword);
    expect(text, 'copy must not contain an em-dash').not.toContain('—');
    expect(errors).toEqual([]);
  });
}
