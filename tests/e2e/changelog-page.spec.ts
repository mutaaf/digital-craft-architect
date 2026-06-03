import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0032 - Public /changelog page surfacing weekly ship velocity.
// Each test maps 1:1 to an acceptance-criteria box on the ticket.
//
// /changelog is built from the shipped-ticket frontmatter under
// docs/backlog/*.md by scripts/generate-changelog.ts (invoked from inside
// scripts/generate-sitemap.ts so the gated build chain does not need a new
// package.json step - per the 2026-05-28 inline-assertion lesson). The page
// renders the latest 36 shipped tickets, grouped by month-year, with an area
// chip and a "Try the demo" link for area === 'demos' rows that resolve
// against KNOWN_PATHS in src/utils/recentDemosStore.ts.
//
// Per the 2026-05-25 SEO Pilot lesson, /changelog is NOT in the index.html
// SEO Pilot pages table, so we do NOT assert document.title; we assert the
// Helmet-managed meta[name="description"] directly instead.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const SITEMAP_PATH = join(REPO_ROOT, 'public', 'sitemap.xml');

async function gotoChangelog(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/changelog', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /changelog').not.toBeNull();
  expect(response!.status(), `/changelog returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  return errors;
}

// Box A: page renders at least 10 entries (safe floor; the backlog has 29+
// shipped today). Each row carries data-testid="changelog-entry".
test('renders at least 10 shipped backlog entries', async ({ page }) => {
  const errors = await gotoChangelog(page);

  const rows = page.locator('[data-testid="changelog-entry"]');
  await expect(rows.first()).toBeVisible();
  const count = await rows.count();
  expect(count, `expected at least 10 changelog-entry rows, got ${count}`).toBeGreaterThanOrEqual(10);

  // The h1 names the page so a crawler-readable heading is present.
  const h1Text = (await page.locator('h1').first().textContent()) ?? '';
  expect(h1Text.toLowerCase()).toMatch(/(changelog|recent ships|ship log|what we shipped)/);

  expect(errors).toEqual([]);
});

// Box B: the footer link from any page points at /changelog and fires the
// open_changelog analytics event (we assert the href, the GA call is covered
// by the existing footer analytics pattern).
test('footer Changelog link points to /changelog from the homepage', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response!.status()).toBeLessThan(400);

  const changelogLinks = await page
    .locator('footer a', { hasText: /^Changelog$/i })
    .all();
  expect(changelogLinks.length, 'expected at least one footer Changelog link').toBeGreaterThan(0);

  let foundChangelogHref = false;
  for (const link of changelogLinks) {
    const href = await link.getAttribute('href');
    if (href === '/changelog') foundChangelogHref = true;
  }
  expect(foundChangelogHref, 'footer Changelog link must point to /changelog').toBe(true);
  expect(errors).toEqual([]);
});

// Box C: page renders in dark mode (toggle .dark on root, heading still
// renders, row count unchanged).
test('renders cleanly in dark mode', async ({ page }) => {
  const errors = await gotoChangelog(page);

  const lightCount = await page.locator('[data-testid="changelog-entry"]').count();
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  const darkCount = await page.locator('[data-testid="changelog-entry"]').count();
  expect(darkCount).toBe(lightCount);

  // Heading still visible after dark-mode toggle.
  await expect(page.locator('h1').first()).toBeVisible();
  expect(errors).toEqual([]);
});

// Box D: no U+2014 (em-dash) anywhere in the rendered main content. The brand
// voice Hard NO (2026-05-07) bans the character; the visible ticket titles
// are sourced from already-brand-voice-gated backlog files, but this is the
// defense-in-depth assertion.
test('contains zero em-dash characters in rendered main', async ({ page }) => {
  const errors = await gotoChangelog(page);

  const mainText = (await page.locator('main').textContent()) ?? '';
  expect(mainText.length, 'main should have rendered text content').toBeGreaterThan(100);
  expect(mainText, 'no em-dash (U+2014) allowed in rendered main').not.toContain(EM_DASH);

  // Belt-and-braces: scan the full body too in case the page chrome leaks.
  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(bodyText, 'no em-dash (U+2014) allowed in body').not.toContain(EM_DASH);
  expect(errors).toEqual([]);
});

// Box E: Helmet-managed meta description present (NOT toHaveTitle; /changelog
// is not in the SEO Pilot pages table - 2026-05-25 lesson).
test('Helmet emits a non-empty meta description for /changelog', async ({ page }) => {
  const errors = await gotoChangelog(page);

  await expect
    .poll(
      () =>
        page
          .locator('head meta[name="description"]')
          .evaluateAll((nodes) =>
            nodes.map((n) => (n as HTMLMetaElement).content),
          ),
      { timeout: 10_000 },
    )
    .toEqual(
      expect.arrayContaining([
        expect.stringMatching(/(changelog|ship|backlog|recent)/i),
      ]),
    );

  const changelogDesc = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) =>
      nodes
        .map((n) => (n as HTMLMetaElement).content)
        .find((c) => /(changelog|ship|backlog|recent)/i.test(c)),
    );
  expect(changelogDesc, '/changelog Helmet meta description should be present').toBeTruthy();
  expect((changelogDesc ?? '').length).toBeGreaterThan(20);
  expect(changelogDesc ?? '').not.toContain(EM_DASH);
  expect(errors).toEqual([]);
});

// Box F: sitemap.xml registers /changelog with a <lastmod> (the ticket-0022
// pattern; the existing sitemap generator picks the route up automatically).
test('public/sitemap.xml has a /changelog entry with a lastmod', async () => {
  const xml = readFileSync(SITEMAP_PATH, 'utf-8');
  const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
  const changelogBlock = urlBlocks.find((b) => /<loc>[^<]*\/changelog<\/loc>/.test(b));
  expect(changelogBlock, 'sitemap.xml must contain a <url> block for /changelog').toBeTruthy();
  expect(changelogBlock!).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
});
