import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { IGNORABLE_ERROR_PATTERNS, ROUTES } from './routes';

// Ticket 0040 - "What's new since you visited" delta strip on the /demos hub.
// Each test maps 1:1 to a scenario in acceptance box 6.
//
// The strip is powered by the existing client-side dca_recent_demos_v1
// localStorage key (ticket 0026) and the build-time-regenerated
// src/data/changelogEntries.ts (ticket 0032). Pre-seeding follows the same
// addInitScript pattern as the 0026 recent-demos-recap spec.
//
// Per the 2026-05-25 mirror-source lesson, ROUTES from tests/e2e/routes.ts is
// the single allow-list both this spec and src/components/WhatsNewSinceVisit.tsx
// consult, so a renamed route cannot drift the two.

const DEMOS_HUB = '/demos';
const STORAGE_KEY = 'dca_recent_demos_v1';

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the 2026-05-07 brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

type SeedEntry = {
  path: string;
  title: string;
  vertical: string;
  viewedAt: number;
};

function seedWith(viewedAt: number): SeedEntry[] {
  return [
    {
      path: '/construction/demo/voice-negotiator',
      title: 'Voice Negotiator',
      vertical: 'Construction',
      viewedAt,
    },
  ];
}

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  return errors;
}

async function gotoHub(page: Page) {
  const response = await page.goto(DEMOS_HUB, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${DEMOS_HUB}`).not.toBeNull();
  expect(response!.status()).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
}

async function contextWithSeed(
  browser: import('@playwright/test').Browser,
  raw: string,
  viewport?: { width: number; height: number },
): Promise<{ ctx: BrowserContext; page: Page; errors: string[] }> {
  const ctx = await browser.newContext(viewport ? { viewport } : undefined);
  await ctx.addInitScript(
    ([key, value]) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* storage unavailable - non-fatal */
      }
    },
    [STORAGE_KEY, raw] as const,
  );
  const page = await ctx.newPage();
  const errors = trackErrors(page);
  return { ctx, page, errors };
}

// Pull the build-time changelog entries directly from the generated source.
// We parse the file rather than import so we stay aligned with whatever the
// component renders without coupling our spec to a TS module loader.
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const CHANGELOG_SRC = join(REPO_ROOT, 'src', 'data', 'changelogEntries.ts');

interface ParsedEntry {
  id: string;
  title: string;
  created: string;
}

function parseChangelog(): ParsedEntry[] {
  const src = readFileSync(CHANGELOG_SRC, 'utf-8');
  // Lines look like:
  //   { id: "0038", title: "...", area: "seo", created: "2026-06-07" },
  const re = /\{\s*id:\s*"([^"]+)",\s*title:\s*"((?:[^"\\]|\\.)*)",\s*area:\s*"[^"]+",\s*created:\s*"([^"]+)"\s*\}/g;
  const out: ParsedEntry[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    out.push({
      id: m[1],
      title: m[2].replace(/\\"/g, '"'),
      created: m[3],
    });
  }
  return out;
}

test.describe("what's new since you visited strip", () => {
  // Scenario 1: first-time visitor (no history) sees nothing.
  test('first-time visitor sees no strip', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors = trackErrors(page);
    await gotoHub(page);

    // Make sure storage really is empty for this scenario.
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('whats-new-strip')).toHaveCount(0);
    await expect(page.getByTestId('whats-new-chip')).toHaveCount(0);
    // Existing /demos catalog still renders.
    await expect(page.locator('h2', { hasText: 'Construction' }).first()).toBeVisible();

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Scenario 2: same-day returner whose viewedAt is Date.now() sees no strip.
  test('same-day returner with no delta sees no strip', async ({ browser }) => {
    const { ctx, page, errors } = await contextWithSeed(
      browser,
      JSON.stringify(seedWith(Date.now())),
    );
    await gotoHub(page);

    await expect(page.getByTestId('whats-new-strip')).toHaveCount(0);
    await expect(page.getByTestId('whats-new-chip')).toHaveCount(0);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Scenario 3: two-week returner sees the strip with a "new since your last visit"
  // header and at least one chip.
  test('two-week returner sees the strip with a "new since your last visit" header', async ({
    browser,
  }) => {
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const { ctx, page, errors } = await contextWithSeed(
      browser,
      JSON.stringify(seedWith(fourteenDaysAgo)),
    );
    await gotoHub(page);

    const strip = page.getByTestId('whats-new-strip');
    await expect(strip).toBeVisible();
    await expect(strip).toContainText(/new since your last visit/i);

    const chips = strip.getByTestId('whats-new-chip');
    expect(await chips.count()).toBeGreaterThan(0);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Scenario 4: cap-at-5. Seed viewedAt to a date older than every changelog
  // entry; the strip renders exactly 5 chips (not 6, not more).
  test('cap-at-5: at most five chips render even when delta is larger', async ({ browser }) => {
    // 2025-01-01 is older than every shipped backlog entry by construction.
    const ancient = Date.UTC(2025, 0, 1);
    const { ctx, page, errors } = await contextWithSeed(
      browser,
      JSON.stringify(seedWith(ancient)),
    );
    await gotoHub(page);

    const strip = page.getByTestId('whats-new-strip');
    await expect(strip).toBeVisible();

    const chips = strip.getByTestId('whats-new-chip');
    expect(await chips.count()).toBe(5);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Scenario 5: dead-route fallback. No changelog entry today carries a `path`
  // field on the type (it's not in ChangelogEntry), so every chip must fall
  // back to /changelog#<entryId>. The runtime guard says: if a path is given
  // and is NOT in ROUTES, fall back to the hash link. We assert every
  // rendered chip's href ends in /changelog#<id> (the safe shape) and that
  // no chip href points at a route absent from ROUTES.
  test('dead-route fallback: chip hrefs use /changelog#<id> when not in ROUTES', async ({
    browser,
  }) => {
    const ancient = Date.UTC(2025, 0, 1);
    const { ctx, page, errors } = await contextWithSeed(
      browser,
      JSON.stringify(seedWith(ancient)),
    );
    await gotoHub(page);

    const strip = page.getByTestId('whats-new-strip');
    await expect(strip).toBeVisible();

    const chips = strip.getByTestId('whats-new-chip');
    const count = await chips.count();
    expect(count).toBeGreaterThan(0);

    const knownRoutes = new Set<string>(ROUTES);
    for (let i = 0; i < count; i++) {
      const href = await chips.nth(i).getAttribute('href');
      expect(href, 'chip must have an href').not.toBeNull();
      // Allowed: /changelog#<id> OR a path in ROUTES.
      const isHashFallback = /^\/changelog#\d{4}$/.test(href!);
      const isKnownRoute = knownRoutes.has(href!);
      expect(
        isHashFallback || isKnownRoute,
        `chip href "${href}" must be either /changelog#<id> or a route in ROUTES`,
      ).toBe(true);
    }

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Scenario 6: dark mode at 375px renders the strip cleanly.
  test('strip renders in dark mode on a 375px viewport', async ({ browser }) => {
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const { ctx, page, errors } = await contextWithSeed(
      browser,
      JSON.stringify(seedWith(fourteenDaysAgo)),
      { width: 375, height: 800 },
    );
    await gotoHub(page);

    await page.evaluate(() => document.documentElement.classList.add('dark'));

    const strip = page.getByTestId('whats-new-strip');
    await expect(strip).toBeVisible();
    await expect(strip).toContainText(/new since your last visit/i);

    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(hasDarkClass).toBe(true);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Scenario 7: no em-dash anywhere in the rendered strip.
  test('rendered strip contains zero em-dash characters', async ({ browser }) => {
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const { ctx, page, errors } = await contextWithSeed(
      browser,
      JSON.stringify(seedWith(fourteenDaysAgo)),
    );
    await gotoHub(page);

    const strip = page.getByTestId('whats-new-strip');
    await expect(strip).toBeVisible();

    const stripText = (await strip.textContent()) ?? '';
    expect(stripText.length, 'strip should have text content').toBeGreaterThan(10);
    expect(stripText, 'no em-dash (U+2014) allowed in strip').not.toContain(EM_DASH);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Scenario 8: mirror-source. Every rendered chip title must appear verbatim
  // in the build-time-regenerated src/data/changelogEntries.ts source. This
  // catches a component that maintains its own filtered copy instead of
  // filtering live (the 2026-05-25 mirror-source rule).
  test('mirror-source: every chip title matches a changelogEntries title verbatim', async ({
    browser,
  }) => {
    const ancient = Date.UTC(2025, 0, 1);
    const { ctx, page, errors } = await contextWithSeed(
      browser,
      JSON.stringify(seedWith(ancient)),
    );
    await gotoHub(page);

    const strip = page.getByTestId('whats-new-strip');
    await expect(strip).toBeVisible();

    const chips = strip.getByTestId('whats-new-chip');
    const count = await chips.count();
    expect(count).toBeGreaterThan(0);

    const parsedTitles = new Set(parseChangelog().map((e) => e.title));
    expect(parsedTitles.size, 'parsed changelog should have entries').toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const chipText = (await chips.nth(i).textContent()) ?? '';
      // The chip wraps the entry title; assert at least one parsed title is a
      // substring of the chip's rendered text (the chip may also carry an
      // icon's accessible label, so we don't insist on exact equality).
      const anyMatch = [...parsedTitles].some((t) => chipText.includes(t));
      expect(
        anyMatch,
        `chip text "${chipText}" did not match any title in changelogEntries.ts`,
      ).toBe(true);
    }

    expect(errors).toEqual([]);
    await ctx.close();
  });
});
