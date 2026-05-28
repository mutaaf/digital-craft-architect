import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0023 - Footer "AI providers we use" trust chip linking to /trust.
// Each test maps 1:1 to an acceptance-criteria box on the ticket.
//
// The chip lives in the bottom legal-links row of src/components/Footer.tsx,
// sibling to the existing "Deployed" timestamp chip. It reads "Powered by
// OpenAI, Vapi, ElevenLabs" (no em-dash), is wrapped in a react-router Link
// to /trust (SPA navigation, no full reload), fires
// trackCTAClick('trust_providers_chip', 'footer') on click, and renders on
// every page that ships <Footer />. The three provider names mirror a single
// PROVIDERS const in Footer.tsx so the chip and the test cannot silently
// diverge (per the 2026-05-25 mirror-source lesson).

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// One source for the provider names. Must match the PROVIDERS const exported
// from src/components/Footer.tsx so a future edit to one fails this assertion
// and forces an edit to the other.
const PROVIDERS = ['OpenAI', 'Vapi', 'ElevenLabs'] as const;

// Two routes that BOTH ship the global <Footer /> (and therefore the chip):
// the homepage and the construction vertical landing page. Anchors the
// "ships on every page that uses <Footer />" claim from the ticket. Some
// pages (e.g. demo-hub subroutes like /construction/demo) intentionally do
// NOT render the global Footer and are out of scope for this chip.
const ROUTES_WITH_FOOTER: ReadonlyArray<string> = ['/', '/construction'];

// Scope all DOM lookups to the page-level footer via getByRole('contentinfo').
// Some testimonial cards on /construction use the semantic <footer> tag for
// byline blocks, so locator('footer') is ambiguous in strict mode; the
// page-level Footer component is the only <footer> that gets contentinfo.

async function gotoRoute(page: Page, path: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${path}`).not.toBeNull();
  expect(response!.status(), `${path} returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  return errors;
}

// Box 1: chip renders with exact text "Powered by OpenAI, Vapi, ElevenLabs"
// inside a react-router Link to /trust, on every route that ships the footer.
test('renders the providers chip on routes that ship the footer', async ({ page }) => {
  for (const path of ROUTES_WITH_FOOTER) {
    const errors = await gotoRoute(page, path);

    const chip = page.getByRole('contentinfo').locator('[data-testid="trust-providers-chip"]');
    await expect(chip, `chip missing on ${path}`).toBeVisible();

    const text = (await chip.textContent())?.trim() ?? '';
    expect(text, `chip text on ${path}`).toContain('Powered by OpenAI, Vapi, ElevenLabs');
    expect(text, `chip text on ${path} must not contain an em-dash`).not.toContain('—');

    // The chip itself (or a parent inside the page footer) is wrapped in an
    // <a> whose href is /trust. Link renders to <a href> in the DOM.
    const anchor = page
      .getByRole('contentinfo')
      .locator('a[href="/trust"]')
      .filter({ has: page.locator('[data-testid="trust-providers-chip"]') });
    await expect(anchor, `chip must be wrapped in <a href="/trust"> on ${path}`).toHaveCount(1);

    expect(errors).toEqual([]);
  }
});

// Box 2: the three provider names rendered in the chip are exactly the
// PROVIDERS set - same membership, no extras, no missing - so a future edit
// to one source fails the test loudly.
test('chip text mirrors the PROVIDERS const exactly', async ({ page }) => {
  await gotoRoute(page, '/');
  const text = (await page.getByRole('contentinfo').locator('[data-testid="trust-providers-chip"]').textContent()) ?? '';

  for (const provider of PROVIDERS) {
    expect(text, `chip must name "${provider}"`).toContain(provider);
  }

  // No provider in the chip beyond the three. Spot-check the four other names
  // currently listed on /trust to confirm the chip is the headline subset.
  for (const other of ['Deepgram', 'Firecrawl', 'Jina', 'Formspree']) {
    expect(text, `chip must NOT name "${other}" (out of scope per ticket)`).not.toContain(other);
  }
});

// Box 3: clicking the chip is an SPA navigation to /trust - the SPA marker
// survives, no full page reload happens.
test('clicking the chip is an SPA navigation to /trust', async ({ page }) => {
  await gotoRoute(page, '/');

  // Drop a marker on window; a full reload would lose it.
  await page.evaluate(() => {
    (window as unknown as { __spaMarker: boolean }).__spaMarker = true;
  });

  const chipLink = page
    .getByRole('contentinfo')
    .locator('a[href="/trust"]')
    .filter({ has: page.locator('[data-testid="trust-providers-chip"]') });
  await expect(chipLink).toHaveCount(1);
  await chipLink.click();

  await expect(page).toHaveURL(/\/trust$/);
  const stillSpa = await page.evaluate(
    () => (window as unknown as { __spaMarker?: boolean }).__spaMarker === true,
  );
  expect(stillSpa, 'expected SPA navigation but page fully reloaded').toBe(true);
});

// Box 4: clicking the chip fires trackCTAClick('trust_providers_chip', 'footer'),
// which under the hood pushes a gtag('event', 'cta_click', ...) with
// event_label "trust_providers_chip - footer". Stub gtag, prevent navigation
// so window state survives, click, and read back.
test('clicking the chip fires trackCTAClick with the documented label', async ({ page }) => {
  await gotoRoute(page, '/');

  await page.evaluate(() => {
    (window as unknown as { __ctaEvents: unknown[][] }).__ctaEvents = [];
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (
      ...args: unknown[]
    ) => {
      (window as unknown as { __ctaEvents: unknown[][] }).__ctaEvents.push(args);
    };
  });

  const chipLink = page
    .getByRole('contentinfo')
    .locator('a[href="/trust"]')
    .filter({ has: page.locator('[data-testid="trust-providers-chip"]') });
  await expect(chipLink).toBeVisible();

  // Suppress the actual SPA navigation so the captured events survive past click.
  await chipLink.evaluate((el) =>
    el.addEventListener('click', (e) => e.preventDefault(), { capture: true, once: true }),
  );
  await chipLink.click();

  const events = (await page.evaluate(
    () => (window as unknown as { __ctaEvents: unknown[][] }).__ctaEvents,
  )) as unknown[][];
  const ctaEvents = events.filter(
    (e) => Array.isArray(e) && e[0] === 'event' && e[1] === 'cta_click',
  );
  expect(ctaEvents.length, 'at least one cta_click event fired').toBeGreaterThan(0);
  const labels = ctaEvents.map((e) => {
    const params = e[2] as { event_label?: string };
    return params?.event_label ?? '';
  });
  expect(
    labels.some((l) => /trust_providers_chip/.test(l) && /footer/.test(l)),
    `expected cta_click event_label "trust_providers_chip - footer", got: ${labels.join(' | ')}`,
  ).toBe(true);
});

// Box 5: footer (and therefore the chip) renders in light and dark mode on a
// 375px mobile viewport, and no em-dash appears anywhere in the rendered
// footer text.
test('chip renders in light and dark mode on 375px mobile without em-dash', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await gotoRoute(page, '/');

  const chip = page.getByRole('contentinfo').locator('[data-testid="trust-providers-chip"]');
  await expect(chip).toBeVisible();
  const lightText = (await chip.textContent())?.trim() ?? '';
  expect(lightText).toContain('Powered by OpenAI, Vapi, ElevenLabs');

  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(chip).toBeVisible();
  const darkText = (await chip.textContent())?.trim() ?? '';
  expect(darkText).toBe(lightText);

  // No em-dash anywhere in the rendered page-footer text.
  const footerText = (await page.getByRole('contentinfo').textContent()) ?? '';
  expect(footerText, 'footer must contain no em-dash character').not.toContain('—');
});

// Box 6 (regression): the existing Trust & Privacy footer link still resolves
// to /trust - the new chip ADDS a discovery surface, it does not replace the
// existing one.
test('existing Trust & Privacy footer link still resolves to /trust', async ({ page }) => {
  await gotoRoute(page, '/');
  const existing = page
    .getByRole('contentinfo')
    .locator('a[href="/trust"]', { hasText: /Trust & Privacy/i });
  await expect(existing).toHaveCount(1);
});
