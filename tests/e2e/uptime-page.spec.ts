import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0036 - Public /uptime page surfacing demo and serverless health for
// regulated-vertical buyers. Each test maps 1:1 to an acceptance-criteria box.
//
// The page is a CLIENT component that fires HEAD/OPTIONS/GET probes against
// EXISTING /api/* routes via useUptimeProbe; per the cross-fleet pattern, a
// client-component fetch IS page.route()-interceptable, so each test stubs
// '**/api/**' deterministically before navigation rather than hitting the
// real serverless surfaces.
//
// Per the 2026-05-25 SEO Pilot lesson, /uptime is NOT added to the index.html
// SEO Pilot pages table in this ticket, so we do NOT assert document.title;
// we assert the Helmet-managed meta[name="description"] directly (and read
// the LAST matching meta tag per the 2026-05-25 Helmet-appends lesson).
//
// Per the 2026-05-30 second-@type lesson, this ticket emits no JSON-LD; no
// schema-overlap assertion is needed.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

// Forbidden uptime-percent pattern - any "99.9%" / "99.99%" / "100.0%" string
// would falsely imply an aggregate SLA. The page reports current state only.
const UPTIME_PERCENT_RE = /\d+\.\d+%/;

async function stubAllGreen(page: Page): Promise<void> {
  await page.route('**/api/**', (route) => route.fulfill({ status: 204 }));
}

async function gotoUptime(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/uptime', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /uptime').not.toBeNull();
  expect(response!.status(), `/uptime returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  return errors;
}

// Box A: page renders at /uptime with at least 3 surface chips, an H1 that
// names the page, and resolves with status < 400.
test('renders at least 3 surface chips with a Status or Uptime heading', async ({ page }) => {
  await stubAllGreen(page);
  const errors = await gotoUptime(page);

  const chips = page.locator('[data-testid="uptime-surface"]');
  await expect(chips.first()).toBeVisible();
  const count = await chips.count();
  expect(count, `expected at least 3 uptime-surface chips, got ${count}`).toBeGreaterThanOrEqual(3);

  const h1Text = (await page.locator('h1').first().textContent()) ?? '';
  expect(h1Text).toMatch(/uptime|status/i);

  expect(errors).toEqual([]);
});

// Box B: with every /api/* probe stubbed to 2xx, every chip resolves to the
// green status (data-status="green"). Probe behavior is deterministic via
// page.route().
test('every chip resolves green when every probe returns 2xx', async ({ page }) => {
  await stubAllGreen(page);
  const errors = await gotoUptime(page);

  const chips = page.locator('[data-testid="uptime-surface"]');
  const total = await chips.count();
  expect(total).toBeGreaterThanOrEqual(3);

  // Wait until every chip has resolved out of the initial 'unknown' state.
  await expect
    .poll(
      async () => {
        const statuses = await chips.evaluateAll((nodes) =>
          nodes.map((n) => (n as HTMLElement).getAttribute('data-status') ?? 'unknown'),
        );
        return statuses.every((s) => s === 'green');
      },
      { timeout: 10_000 },
    )
    .toBe(true);

  expect(errors).toEqual([]);
});

// Box C: a 5xx response from one surface degrades that chip to yellow while
// the rest stay green. The page renders honest per-surface state, not an
// aggregate badge. Pick one known probePath (the vapi-status surface) to 503
// and let every other /api/* call return 204 - this is deterministic without
// relying on first-request order in a Promise.allSettled fan-out.
test('a 5xx probe degrades that surface to yellow without dragging others down', async ({ page }) => {
  const DEGRADED_PATH = '/api/vapi-status';
  await page.route('**/api/**', (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname === DEGRADED_PATH) return route.fulfill({ status: 503 });
    return route.fulfill({ status: 204 });
  });
  const errors = await gotoUptime(page);

  const chips = page.locator('[data-testid="uptime-surface"]');
  await expect(chips.first()).toBeVisible();

  await expect
    .poll(
      async () => {
        const statuses = await chips.evaluateAll((nodes) =>
          nodes.map((n) => ({
            status: (n as HTMLElement).getAttribute('data-status') ?? 'unknown',
            surfaceId: (n as HTMLElement).getAttribute('data-surface-id') ?? '',
          })),
        );
        return statuses;
      },
      { timeout: 10_000 },
    )
    .toEqual(
      expect.arrayContaining([
        expect.objectContaining({ surfaceId: 'voice-infra', status: 'yellow' }),
      ]),
    );

  // And every OTHER surface stays green (not red, not yellow).
  const finalStatuses = await chips.evaluateAll((nodes) =>
    nodes.map((n) => ({
      status: (n as HTMLElement).getAttribute('data-status') ?? 'unknown',
      surfaceId: (n as HTMLElement).getAttribute('data-surface-id') ?? '',
    })),
  );
  for (const s of finalStatuses) {
    if (s.surfaceId !== 'voice-infra') {
      expect(s.status, `surface ${s.surfaceId} should be green`).toBe('green');
    }
  }

  expect(errors).toEqual([]);
});

// Box D: the empty-incidents copy is present on a fresh INCIDENTS = [] build.
// "No incidents reported in the last 90 days" matches the engineering note.
test('renders the empty-incidents message when INCIDENTS is empty', async ({ page }) => {
  await stubAllGreen(page);
  const errors = await gotoUptime(page);

  const mainText = (await page.locator('main').textContent()) ?? '';
  expect(mainText).toMatch(/no incidents reported in the last 90 days/i);

  expect(errors).toEqual([]);
});

// Box E: footer link from any page points at /uptime and uses the
// existing trackCTAClick analytics pattern (we assert href; the GA fire is
// covered by the analytics wrapper itself).
test('footer Uptime link points to /uptime from the homepage', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response!.status()).toBeLessThan(400);

  const uptimeLinks = await page
    .locator('footer a', { hasText: /^Uptime$/i })
    .all();
  expect(uptimeLinks.length, 'expected at least one footer Uptime link').toBeGreaterThan(0);

  let foundUptimeHref = false;
  for (const link of uptimeLinks) {
    const href = await link.getAttribute('href');
    if (href === '/uptime') foundUptimeHref = true;
  }
  expect(foundUptimeHref, 'footer Uptime link must point to /uptime').toBe(true);
  expect(errors).toEqual([]);
});

// Box F: the page renders cleanly in dark mode (toggle .dark on root, chips
// still render with the same count).
test('renders cleanly in dark mode', async ({ page }) => {
  await stubAllGreen(page);
  const errors = await gotoUptime(page);

  const lightCount = await page.locator('[data-testid="uptime-surface"]').count();
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  const darkCount = await page.locator('[data-testid="uptime-surface"]').count();
  expect(darkCount).toBe(lightCount);

  await expect(page.locator('h1').first()).toBeVisible();
  expect(errors).toEqual([]);
});

// Box G: brand-voice Hard NO (2026-05-07) - no em-dash in any rendered text.
test('contains zero em-dash characters in rendered main', async ({ page }) => {
  await stubAllGreen(page);
  const errors = await gotoUptime(page);

  const mainText = (await page.locator('main').textContent()) ?? '';
  expect(mainText.length).toBeGreaterThan(100);
  expect(mainText, 'no em-dash (U+2014) allowed in rendered main').not.toContain(EM_DASH);
  expect(errors).toEqual([]);
});

// Box H: the "no aggregate uptime percentage" rule is gate-enforced - no
// "99.9%" / "99.99%" anywhere on the rendered page (the page reports current
// observed state only, never an aggregate claim).
test('contains no aggregate uptime percentage in rendered main', async ({ page }) => {
  await stubAllGreen(page);
  const errors = await gotoUptime(page);

  const mainText = (await page.locator('main').textContent()) ?? '';
  expect(
    UPTIME_PERCENT_RE.test(mainText),
    `rendered main must contain no \\d+\\.\\d+% pattern; got: ${mainText.match(UPTIME_PERCENT_RE)?.[0] ?? ''}`,
  ).toBe(false);
  expect(errors).toEqual([]);
});

// Box I: Helmet-managed meta description present (NOT toHaveTitle; /uptime is
// not in the SEO Pilot pages table - 2026-05-25 lesson). Read the LAST
// matching meta tag (2026-05-25 Helmet-appends lesson).
test('Helmet emits a non-empty meta description for /uptime', async ({ page }) => {
  await stubAllGreen(page);
  const errors = await gotoUptime(page);

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
        expect.stringMatching(/(uptime|status|reliab|incident)/i),
      ]),
    );

  const uptimeDesc = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) =>
      nodes
        .map((n) => (n as HTMLMetaElement).content)
        .findLast((c) => /(uptime|status|reliab|incident)/i.test(c)),
    );
  expect(uptimeDesc, '/uptime Helmet meta description should be present').toBeTruthy();
  expect((uptimeDesc ?? '').length).toBeGreaterThan(20);
  expect(uptimeDesc ?? '').not.toContain(EM_DASH);
  expect(errors).toEqual([]);
});

// Box J: every surface chip's trustAnchor resolves to a real section id in
// the rendered /trust body (mirror-source rule per 2026-05-25 lesson). We
// read the UPTIME_SURFACES trustAnchor values off the rendered DOM via
// data attributes, then verify each id is present on /trust.
test('every surface trustAnchor resolves to a real section id on /trust', async ({ browser }) => {
  const ctx = await browser.newContext();
  const uptimePage = await ctx.newPage();
  await uptimePage.route('**/api/**', (route) => route.fulfill({ status: 204 }));
  await uptimePage.goto('/uptime', { waitUntil: 'domcontentloaded' });
  await expect
    .poll(() => uptimePage.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);

  const trustAnchors = await uptimePage.$$eval(
    '[data-testid="uptime-surface"]',
    (nodes) =>
      nodes
        .map((n) => (n as HTMLElement).getAttribute('data-trust-anchor'))
        .filter((a): a is string => typeof a === 'string' && a.length > 0),
  );
  expect(trustAnchors.length, 'expected at least one data-trust-anchor on uptime chips').toBeGreaterThan(0);
  await uptimePage.close();

  const trustPage = await ctx.newPage();
  await trustPage.goto('/trust', { waitUntil: 'domcontentloaded' });
  await expect
    .poll(() => trustPage.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);

  for (const anchor of trustAnchors) {
    const id = anchor.replace(/^#/, '');
    const found = await trustPage.locator(`#${id}`).count();
    expect(found, `trust anchor "#${id}" missing from /trust DOM`).toBeGreaterThan(0);
  }

  await trustPage.close();
  await ctx.close();
});

// Box K: an offline/blocked-network environment falls back to "unknown" status
// on every chip. The page renders gracefully and never misleads.
test('falls back to unknown status when probes abort', async ({ page }) => {
  await page.route('**/api/**', (route) => route.abort('failed'));
  const errors = await gotoUptime(page);

  const chips = page.locator('[data-testid="uptime-surface"]');
  await expect(chips.first()).toBeVisible();

  await expect
    .poll(
      async () => {
        const statuses = await chips.evaluateAll((nodes) =>
          nodes.map((n) => (n as HTMLElement).getAttribute('data-status') ?? 'unknown'),
        );
        return statuses.every((s) => s === 'red' || s === 'unknown');
      },
      { timeout: 10_000 },
    )
    .toBe(true);

  expect(errors).toEqual([]);
});
