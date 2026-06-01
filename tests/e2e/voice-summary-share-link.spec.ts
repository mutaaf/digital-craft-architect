import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0029 - Shareable branded voice-call summary link.
// Each test maps 1:1 to an acceptance-criteria box on the ticket.
//
// The summary view on /construction/demo/voice-negotiator and
// /realestate/demo/voice-negotiator must:
//   - expose data-testid="copy-share-link"   the "Copy share link" button
//   - expose data-testid="copy-confirmation" the transient "Copied" badge
//   - expose data-testid="voice-summary-card" the summary container
//   - expose data-testid="shared-voice-cta"   the cold-open "Book Free
//                                              Consultation" CTA
// Opening either route with `?v=<encoded>` skips input/agent/setup/call and
// renders the summary directly. Malformed `?v=` falls back to the input
// phase. The cold-open path must not render transcript/sellerName/sellerEmail.
//
// The 2026-05-25 SEO Pilot lesson does NOT apply here - we do not assert
// document.title for these routes (neither is in the index.html SEO Pilot
// pages table). All assertions are on UI/DOM state.
//
// The 2026-05-30 "second @type instance" lesson does NOT apply here either -
// this ticket emits no new JSON-LD on either voice-negotiator route.

const ROUTES = [
  '/construction/demo/voice-negotiator',
  '/realestate/demo/voice-negotiator',
] as const;

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

// Demo-style fixture payload (the sentiment, address, and lists match the
// AC-required render fields). No transcript/sellerName/sellerEmail.
const FIXTURE_PAYLOAD = {
  address: '123 Main Street, Dallas, TX 75201',
  agreedPrice: 285000,
  lowestAcceptable: 270000,
  sellerTimeline: '30 to 45 days',
  sentiment: 'positive',
  keyInsights: [
    'Seller is motivated by relocation timeline',
    'Open to a 30-day close with proof of funds',
    'Wants buyer to handle minor roof repair as-is',
  ],
  recommendedNextSteps: [
    'Send proof of funds within 24 hours',
    'Schedule home inspection in the next week',
  ],
  durationSeconds: 312,
};

// Same base64url encoding the production code uses. Defined inline so the
// spec does not need to import the source module.
function encodeFixture(payload: Record<string, unknown>): string {
  const b64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function gotoColdOpen(page: Page, route: string, encoded: string): Promise<string[]> {
  const errors = trackErrors(page);
  const url = `${route}?v=${encoded}`;
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${url}`).not.toBeNull();
  expect(response!.status()).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  return errors;
}

async function gotoPlain(page: Page, route: string): Promise<string[]> {
  const errors = trackErrors(page);
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${route}`).not.toBeNull();
  expect(response!.status()).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  return errors;
}

test.describe('shareable voice-call summary link', () => {
  // Box: encode/decode round-trip. Asserted as an end-to-end URL round-trip
  // through the live "Copy share link" button + a cold-open of the produced
  // URL in a fresh context. This exercises the same encode/decode pair the
  // production code uses, against the production-built bundle (preview),
  // without depending on a dev-server source path being importable.
  test('encode/decode is a parse-safe round-trip through the share button', async ({ browser }) => {
    const ctx = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    const pageA = await ctx.newPage();
    const errorsA = trackErrors(pageA);

    // Seed the summary view via a cold-open so we do not have to drive the
    // full agent pipeline. The seed payload is intentionally rich (full
    // address, both prices, 3 insights, 2 next steps) so the round-trip
    // covers every shareable field.
    const seed = {
      address: '123 Main Street, Dallas, TX 75201',
      agreedPrice: 285000,
      lowestAcceptable: 270000,
      sellerTimeline: '30 to 45 days',
      sentiment: 'positive',
      keyInsights: ['Insight A', 'Insight B', 'Insight C'],
      recommendedNextSteps: ['Step A', 'Step B'],
      durationSeconds: 312,
    };
    const initialEncoded = encodeFixture(seed);
    await pageA.goto(`${ROUTES[0]}?v=${initialEncoded}`, { waitUntil: 'domcontentloaded' });
    await expect(pageA.getByTestId('voice-summary-card')).toBeVisible();

    // The card already rendered the seed address - sanity check.
    await expect(pageA.getByText('123 Main Street, Dallas, TX 75201')).toBeVisible();

    // Click the share button on the cold-opened card; the produced URL must
    // be a URL-safe base64 in the `v` param under the 1800-char cap.
    await pageA.getByTestId('copy-share-link').click();
    const shareUrl = await pageA.evaluate(() => navigator.clipboard.readText());
    const parsed = new URL(shareUrl);
    expect(parsed.pathname).toBe(ROUTES[0]);
    const v = parsed.searchParams.get('v');
    expect(v, 'share URL carries a ?v= param').not.toBeNull();
    expect(/^[A-Za-z0-9_-]+$/.test(v!), 'param is URL-safe base64').toBe(true);
    expect(v!.length).toBeLessThanOrEqual(1800);

    await ctx.close();

    // Round-trip: open the share URL in a fresh context, summary renders
    // identically (same address, same insights, same next steps).
    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    const errorsB = trackErrors(pageB);
    await pageB.goto(shareUrl, { waitUntil: 'domcontentloaded' });

    await expect(pageB.getByTestId('voice-summary-card')).toBeVisible();
    await expect(pageB.getByText('123 Main Street, Dallas, TX 75201')).toBeVisible();
    await expect(pageB.getByText('Insight A')).toBeVisible();
    await expect(pageB.getByText('Step B')).toBeVisible();

    // Privacy: a transcript field that was never in the original payload
    // is also never in the rehydrated DOM (covered explicitly in the
    // malicious-cold-open box but asserted here too as a smoke gate).
    const bodyText = await pageB.evaluate(() => document.body.innerText);
    expect(bodyText).not.toContain('Full Transcript');

    expect(errorsA).toEqual([]);
    expect(errorsB).toEqual([]);
    await ctxB.close();
  });

  // Box: cold-open valid payload renders the summary directly on the
  // construction route, fires the open_shared_voice_summary event exactly
  // once, and does NOT render transcript/sellerName/sellerEmail.
  test('cold-open with valid payload renders summary on construction route', async ({ page }) => {
    // Stub gtag BEFORE navigation so we capture the mount-time event.
    await page.addInitScript(() => {
      (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents = [];
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (
        ...args: unknown[]
      ) => {
        (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents.push(args);
      };
    });

    const encoded = encodeFixture(FIXTURE_PAYLOAD);
    const errors = await gotoColdOpen(page, ROUTES[0], encoded);

    // Summary card renders.
    await expect(page.getByTestId('voice-summary-card')).toBeVisible();

    // Required fields surface in the DOM.
    await expect(page.getByText('123 Main Street, Dallas, TX 75201')).toBeVisible();
    await expect(page.getByText('$285,000')).toBeVisible();
    await expect(page.getByText(/30 to 45 days/)).toBeVisible();
    await expect(
      page.getByText('Seller is motivated by relocation timeline'),
    ).toBeVisible();
    await expect(page.getByText('Send proof of funds within 24 hours')).toBeVisible();

    // No em-dash in any rendered summary text.
    const cardText = await page.getByTestId('voice-summary-card').innerText();
    expect(cardText).not.toContain('—');

    // Cold-open CTA is present and labelled.
    await expect(page.getByTestId('shared-voice-cta')).toBeVisible();

    // Wizard input phase is absent (we skipped past it).
    await expect(page.getByText(/Property URL/i)).toHaveCount(0);

    // The trackCTAClick event fired exactly once on mount.
    const events = (await page.evaluate(
      () => (window as unknown as { __ctaEvents: unknown[][] }).__ctaEvents,
    )) as unknown[][];
    const openEvents = events.filter(
      (e) =>
        Array.isArray(e) &&
        e[0] === 'event' &&
        e[1] === 'cta_click' &&
        typeof (e[2] as { event_label?: string })?.event_label === 'string' &&
        /open_shared_voice_summary/i.test(
          (e[2] as { event_label: string }).event_label,
        ),
    );
    expect(openEvents.length, 'open_shared_voice_summary fired exactly once').toBe(1);

    expect(errors).toEqual([]);
  });

  // Box: same cold-open behavior on the realestate route. Covers the
  // "both verticals decode the param" acceptance line.
  test('cold-open with valid payload renders summary on realestate route', async ({ page }) => {
    const encoded = encodeFixture(FIXTURE_PAYLOAD);
    const errors = await gotoColdOpen(page, ROUTES[1], encoded);

    await expect(page.getByTestId('voice-summary-card')).toBeVisible();
    await expect(page.getByText('123 Main Street, Dallas, TX 75201')).toBeVisible();
    await expect(page.getByTestId('shared-voice-cta')).toBeVisible();

    const cardText = await page.getByTestId('voice-summary-card').innerText();
    expect(cardText).not.toContain('—');

    expect(errors).toEqual([]);
  });

  // Box: missing ?v= falls back to the normal input phase with no error and
  // no open_shared_voice_summary event fired.
  test('no ?v= param falls back to the input phase, no analytics event', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents = [];
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (
        ...args: unknown[]
      ) => {
        (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents.push(args);
      };
    });
    const errors = await gotoPlain(page, ROUTES[0]);

    await expect(page.getByTestId('voice-summary-card')).toHaveCount(0);
    // Property input panel is visible in the input phase.
    await expect(page.getByText(/Property URL|Address|Property Info/i).first()).toBeVisible();

    const events = (await page.evaluate(
      () => (window as unknown as { __ctaEvents: unknown[][] }).__ctaEvents,
    )) as unknown[][];
    const openEvents = events.filter(
      (e) =>
        Array.isArray(e) &&
        e[0] === 'event' &&
        e[1] === 'cta_click' &&
        typeof (e[2] as { event_label?: string })?.event_label === 'string' &&
        /open_shared_voice_summary/i.test(
          (e[2] as { event_label: string }).event_label,
        ),
    );
    expect(openEvents.length, 'no open_shared_voice_summary event when ?v= absent').toBe(0);

    expect(errors).toEqual([]);
  });

  // Box: malformed ?v= falls back to the input phase with no error UI.
  test('malformed ?v= falls back to the input phase, no error UI', async ({ page }) => {
    const errors = await gotoColdOpen(page, ROUTES[0], '!!!not-base64!!!');

    await expect(page.getByTestId('voice-summary-card')).toHaveCount(0);
    await expect(page.getByText(/Property URL|Address|Property Info/i).first()).toBeVisible();

    expect(errors).toEqual([]);
  });

  // Box: malicious cold-open. A payload with transcript/sellerName/
  // sellerEmail injected by a hand-edited URL must NOT surface those fields
  // in the rendered DOM.
  test('cold-open with injected transcript/sellerName/sellerEmail strips them', async ({ page }) => {
    const malicious = {
      ...FIXTURE_PAYLOAD,
      transcript: [{ role: 'user', text: 'LEAKED_TRANSCRIPT_TEXT' }],
      sellerName: 'LEAKED_SELLER_NAME',
      sellerEmail: 'leaked@example.com',
    };
    const encoded = encodeFixture(malicious as unknown as typeof FIXTURE_PAYLOAD);
    const errors = await gotoColdOpen(page, ROUTES[0], encoded);

    await expect(page.getByTestId('voice-summary-card')).toBeVisible();

    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText).not.toContain('LEAKED_TRANSCRIPT_TEXT');
    expect(bodyText).not.toContain('LEAKED_SELLER_NAME');
    expect(bodyText).not.toContain('leaked@example.com');

    // Full Transcript collapsible should NOT be present on the cold-open path.
    await expect(page.getByText('Full Transcript', { exact: true })).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  // Box: Copy share link button writes the URL to the clipboard, shows
  // a transient "Copied" badge, and fires share_voice_summary analytics.
  // We exercise this from the cold-open path so we do not need to drive
  // the full agent pipeline.
  test('Copy share link writes the share URL and fires analytics', async ({ browser }) => {
    const ctx = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    await ctx.addInitScript(() => {
      (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents = [];
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (
        ...args: unknown[]
      ) => {
        (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents.push(args);
      };
    });
    const page = await ctx.newPage();
    const errors = trackErrors(page);

    const encoded = encodeFixture(FIXTURE_PAYLOAD);
    await page.goto(`${ROUTES[0]}?v=${encoded}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('voice-summary-card')).toBeVisible();

    const copyBtn = page.getByTestId('copy-share-link');
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    // Transient "Copied" confirmation appears.
    await expect(page.getByTestId('copy-confirmation')).toBeVisible();

    // Clipboard holds a same-origin URL to the voice-negotiator route with ?v=.
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    const url = new URL(clip);
    expect(url.origin).toBe(new URL(page.url()).origin);
    expect(url.pathname).toBe(ROUTES[0]);
    expect(url.searchParams.get('v')).not.toBeNull();
    expect(url.searchParams.get('v')!.length).toBeGreaterThan(0);

    // No em-dash in the copy of the button or confirmation.
    expect(await copyBtn.innerText()).not.toContain('—');
    expect(await page.getByTestId('copy-confirmation').innerText()).not.toContain('—');

    // share_voice_summary cta event fired.
    const events = (await page.evaluate(
      () => (window as unknown as { __ctaEvents: unknown[][] }).__ctaEvents,
    )) as unknown[][];
    const shareEvents = events.filter(
      (e) =>
        Array.isArray(e) &&
        e[0] === 'event' &&
        e[1] === 'cta_click' &&
        typeof (e[2] as { event_label?: string })?.event_label === 'string' &&
        /share_voice_summary/i.test(
          (e[2] as { event_label: string }).event_label,
        ),
    );
    expect(shareEvents.length, 'at least one share_voice_summary cta_click').toBeGreaterThan(0);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box: dark-mode + 375px viewport. The cold-opened summary card and the
  // copy button both render cleanly with the .dark class applied.
  test('cold-opened summary renders in dark mode on a 375px viewport', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
    const page = await ctx.newPage();
    const errors = trackErrors(page);

    const encoded = encodeFixture(FIXTURE_PAYLOAD);
    await page.goto(`${ROUTES[1]}?v=${encoded}`, { waitUntil: 'domcontentloaded' });

    // Toggle dark mode after hydration.
    await page.evaluate(() => document.documentElement.classList.add('dark'));

    await expect(page.getByTestId('voice-summary-card')).toBeVisible();
    await expect(page.getByTestId('copy-share-link')).toBeVisible();
    await expect(page.getByTestId('shared-voice-cta')).toBeVisible();

    const cardText = await page.getByTestId('voice-summary-card').innerText();
    expect(cardText).not.toContain('—');

    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(hasDarkClass).toBe(true);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box: same origin, same route, no first-party /api/ request on the
  // share flow (mirrors box 6 of ticket 0009 spec). Cold-open then copy.
  test('share flow stays on same origin and route, no /api/ call', async ({ browser }) => {
    const ctx = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    const page = await ctx.newPage();
    const errors = trackErrors(page);

    const apiCalls: string[] = [];
    const encoded = encodeFixture(FIXTURE_PAYLOAD);
    await page.goto(`${ROUTES[0]}?v=${encoded}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('voice-summary-card')).toBeVisible();

    const appOrigin = new URL(page.url()).origin;
    page.on('request', (req) => {
      const u = new URL(req.url());
      if (u.origin === appOrigin && u.pathname.startsWith('/api/')) apiCalls.push(req.url());
    });

    await page.getByTestId('copy-share-link').click();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    const url = new URL(clip);
    expect(url.origin).toBe(appOrigin);
    expect(url.pathname).toBe(ROUTES[0]);
    expect(
      apiCalls,
      `share flow should make no first-party /api/ call:\n${apiCalls.join('\n')}`,
    ).toEqual([]);

    expect(errors).toEqual([]);
    await ctx.close();
  });
});
