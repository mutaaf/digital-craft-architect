import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';
import {
  FOUNDER_NAME,
  FOUNDER_ROLE,
  FOUNDER_BOOK,
  FOUNDER_YEARS,
  FOUNDER_URL,
  FOUNDER_CREDENTIALS,
} from '../../src/data/founder';

// Ticket 0113 - canonical founder facts mirrored from mutaafaziz.com/llms.txt.
// Every founder surface on `/` (Index) and `/?force=cto` (IndexV2) must tell
// the same story as the personal site: full name, Disney Entertainment & ESPN
// Technology, and no Digital Craft client names. Client names elsewhere on
// the page (outcome ticker, case studies, testimonials) are out of scope, so
// every negative assertion is scoped to `[data-testid="founder-section"]`.

// U+2014 via fromCharCode so this file contains no literal em-dash.
const EM_DASH = String.fromCharCode(8212);
const CLIENT_NAMES = ['Overwatch', 'Recyclops', 'TryMinded'];
const DISNEY = 'Disney Entertainment & ESPN';

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

async function gotoLanding(page: Page, path: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    if (!isIgnorable(e.message)) errors.push(e.message);
  });
  await page.goto(path);
  await page
    .locator('[data-testid="founder-section"]')
    .first()
    .waitFor({ state: 'attached', timeout: 15_000 });
  return errors;
}

async function founderText(page: Page): Promise<string> {
  const texts = await page
    .locator('[data-testid="founder-section"]')
    .allTextContents();
  return texts.join('\n');
}

test.describe('founder facts parity (ticket 0113)', () => {
  test('founder.ts mirrors llms.txt facts', () => {
    expect(FOUNDER_NAME).toBe('Mutaaf Aziz');
    expect(FOUNDER_URL).toBe('https://mutaafaziz.com');
    expect(FOUNDER_ROLE).toBe('Founder, DigitalCraft AI');
    expect(FOUNDER_YEARS).toBe('15+ years in software, 10+ leading teams');
    expect(FOUNDER_BOOK).toBe(
      'a seven-figure book of retained, recurring clients',
    );
    expect(FOUNDER_CREDENTIALS.map((c) => [c.org, c.years])).toEqual([
      ['Disney Entertainment & ESPN Technology', '2022 to present'],
      ['Amazon Flex', '2021 to 2022'],
      ['Motorola Solutions', '2018 to 2021'],
    ]);
  });

  for (const path of ['/', '/?force=cto']) {
    test(`${path} founder sections carry the canonical name and Disney credential`, async ({
      page,
    }) => {
      const errors = await gotoLanding(page, path);
      await expect
        .poll(() => founderText(page), { timeout: 10_000 })
        .toContain(FOUNDER_NAME);
      const text = await founderText(page);
      expect(text).toContain(DISNEY);
      for (const name of CLIENT_NAMES) expect(text).not.toContain(name);
      // Em-dash is checked on the copy this ticket owns (content.json, alt,
      // champion paragraph) rather than the whole section: the shipped
      // IndexV2 "§ 0N" eyebrows use one by design and are out of scope.
      expect(errors).toEqual([]);
    });
  }

  test('/ Founder section image alt is the full name', async ({ page }) => {
    await gotoLanding(page, '/');
    await expect(
      page.locator('#about[data-testid="founder-section"] img').first(),
    ).toHaveAttribute('alt', FOUNDER_NAME);
  });

  test('/?force=cto Champion heading and photo use the full name', async ({
    page,
  }) => {
    await gotoLanding(page, '/?force=cto');
    const champion = page.locator('[data-testid="founder-champion"]');
    await expect(champion.locator('h2')).toContainText(FOUNDER_NAME);
    const alt = await champion.locator('img').first().getAttribute('alt');
    expect(alt ?? '').toContain(FOUNDER_NAME);
    expect(alt ?? '').not.toContain(EM_DASH);
    await expect(champion.locator('p').first()).not.toContainText(EM_DASH);
    for (const c of FOUNDER_CREDENTIALS) {
      await expect(champion).toContainText(c.org);
    }
  });

  test('content.json founder bio and timeline match the canonical facts', async ({
    request,
  }) => {
    const res = await request.get('/content.json');
    expect(res.ok()).toBe(true);
    const { founder } = (await res.json()) as {
      founder: { bio: string; timeline: { year: string; event: string }[] };
    };
    expect(founder.bio.startsWith(`${FOUNDER_NAME}, ${FOUNDER_ROLE}.`)).toBe(
      true,
    );
    expect(founder.bio).toContain('Fractional CTO since 2019');
    expect(founder.bio).toContain(FOUNDER_BOOK);
    expect(founder.bio).toContain(FOUNDER_YEARS);

    const all = [founder.bio, ...founder.timeline.map((t) => t.event)].join(
      '\n',
    );
    for (const name of CLIENT_NAMES) expect(all).not.toContain(name);
    expect(all).not.toContain(EM_DASH);
    expect(all).not.toMatch(/after (engineering leadership at )?Motorola/i);

    const byYear = Object.fromEntries(
      founder.timeline.map((t) => [t.year, t.event]),
    );
    expect(byYear['2019']).toContain('Motorola Solutions');
    expect(byYear['2021']).toContain('Amazon Flex');
    expect(byYear['2022']).toContain('Disney Entertainment & ESPN Technology');
  });
});
