import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0059 - Emit a public /playbook methodology page with a HowTo +
// BreadcrumbList JSON-LD pair. Each test maps 1:1 to an acceptance-criteria
// box on the ticket. Modeled on tests/e2e/trust-aboutpage-jsonld.spec.ts
// (the closest peer for "trust-class static page with anchor sections and
// a single structured-data pair").
//
// Per the 2026-05-25 SEO Pilot lesson the spec does NOT use
// page.toHaveTitle() because /playbook is not in the index.html SEO Pilot
// pages table. The spec reads the LAST meta[name="description"] (the
// Helmet-appended one) and asserts it byte-for-byte equals the HowTo
// block's description (the mirror-source guarantee from the 2026-05-25
// lesson).
//
// Per the 2026-05-30 second-@type lesson, the implementer grepped every
// tests/e2e/*-jsonld.spec.ts for `=== 'HowTo'` (zero matches; this is the
// first HowTo site-wide) and `=== 'BreadcrumbList'` (many matches, every
// one URL-scoped to a different page) BEFORE writing this spec, so no
// predecessor assertion can intercept a /playbook-scoped block. The grep
// result is documented in the ticket's Implementation log.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const PLAYBOOK_URL = `${ORIGIN}/playbook`;
const STEP_URL_RE = /^https:\/\/digitalcraftai\.com\/playbook#step-\d$/;

async function gotoPlaybook(page: Page, path = '/playbook'): Promise<string[]> {
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

async function readJsonLdBlocks(page: Page): Promise<{ raw: string; data: unknown }[]> {
  // Poll until Helmet has appended its JSON-LD scripts (they land after hydration).
  await expect
    .poll(
      () =>
        page.$$eval('script[type="application/ld+json"]', (nodes) => nodes.length),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  return raws.map((raw) => ({ raw, data: JSON.parse(raw) as unknown }));
}

type HowToStep = {
  '@type': string;
  position?: number;
  name?: string;
  text?: string;
  url?: string;
};
type HowTo = {
  '@context'?: string;
  '@type': string;
  name?: string;
  description?: string;
  totalTime?: string;
  step?: HowToStep[];
};
type BreadcrumbItem = { '@type': string; position?: number; name?: string; item?: string };
type Breadcrumb = {
  '@context'?: string;
  '@type': string;
  itemListElement?: BreadcrumbItem[];
};

const isHowTo = (d: unknown): d is HowTo =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'HowTo';

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

// Box 1: /playbook returns 200, the H1 mentions Playbook or "How We Deploy",
// the page renders four step blocks (one per PLAYBOOK_STEPS entry), and
// every step block carries an id="step-N" anchor (N in 1..4) for deep linking.
test('renders four step blocks under a Playbook-or-How-We-Deploy H1', async ({ page }) => {
  const errors = await gotoPlaybook(page);

  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const h1Text = ((await h1.textContent()) ?? '').trim().replace(/\s+/g, ' ');
  expect(/playbook|how we deploy/i.test(h1Text)).toBe(true);

  // The step blocks render with data-testid="playbook-step" and id="step-N".
  const stepLocators = page.locator('[data-testid="playbook-step"]');
  await expect(stepLocators.first()).toBeVisible();
  const stepCount = await stepLocators.count();
  expect(stepCount).toBe(4);

  for (let i = 1; i <= 4; i++) {
    const anchor = page.locator(`#step-${i}`);
    const found = await anchor.count();
    expect(found, `expected exactly one rendered element with id="step-${i}"`).toBe(1);
  }

  expect(errors).toEqual([]);
});

// Box 2: a BreadcrumbList block (Home -> Playbook) is emitted on /playbook,
// with the second item linking to the canonical /playbook URL. Per-URL
// scoped (the pre-write grep confirmed every predecessor BreadcrumbList
// predicate is URL-scoped to a different page).
test('emits exactly one BreadcrumbList JSON-LD block naming Playbook', async ({ page }) => {
  const errors = await gotoPlaybook(page);
  const blocks = await readJsonLdBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(breadcrumbs, 'exactly one BreadcrumbList block expected on /playbook').toHaveLength(1);

  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[0].item).toBe(ORIGIN);
  // The second crumb's name mirrors the H1 substring contract.
  expect(/playbook|how we deploy/i.test(items[1].name ?? '')).toBe(true);
  expect(items[1].item).toBe(PLAYBOOK_URL);

  expect(() => JSON.parse(breadcrumbs[0].raw)).not.toThrow();
  expect(errors).toEqual([]);
});

// Box 3: a HowTo block is emitted with totalTime='P4W', a name that matches
// the H1 substring contract, and a step[] of length 4 where each step's
// url matches /^https:\/\/digitalcraftai\.com\/playbook#step-\d$/ and each
// step's name + text are non-empty strings (the mirror-source rule from
// the 2026-05-25 lesson means these come from PLAYBOOK_STEPS).
test('emits exactly one HowTo JSON-LD block with four well-formed steps', async ({ page }) => {
  const errors = await gotoPlaybook(page);
  const blocks = await readJsonLdBlocks(page);
  const howtos = blocks.filter((b): b is { raw: string; data: HowTo } => isHowTo(b.data));
  expect(howtos, 'exactly one HowTo block expected on /playbook').toHaveLength(1);

  const howto = howtos[0].data;
  expect(howto['@context']).toBe('https://schema.org');
  expect(howto['@type']).toBe('HowTo');
  expect(typeof howto.name).toBe('string');
  expect(/playbook|how we deploy/i.test(howto.name ?? '')).toBe(true);
  expect(typeof howto.description).toBe('string');
  expect((howto.description ?? '').length).toBeGreaterThan(20);
  expect(howto.totalTime).toBe('P4W');

  const steps = howto.step ?? [];
  expect(steps.length).toBe(4);
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    expect(s['@type']).toBe('HowToStep');
    expect(typeof s.position).toBe('number');
    expect(s.position).toBe(i + 1);
    expect(typeof s.name).toBe('string');
    expect((s.name ?? '').length).toBeGreaterThan(0);
    expect(typeof s.text).toBe('string');
    expect((s.text ?? '').length).toBeGreaterThan(0);
    expect(typeof s.url).toBe('string');
    expect(s.url, `step ${i + 1} url did not match the canonical pattern`).toMatch(STEP_URL_RE);
    // The url's hash must point at a rendered [id="step-N"] anchor.
    const hash = (s.url ?? '').split('#')[1] ?? '';
    expect(hash).toBe(`step-${i + 1}`);
    const found = await page.locator(`#${hash}`).count();
    expect(found, `no rendered element with id="${hash}"`).toBe(1);
  }

  expect(() => JSON.parse(howtos[0].raw)).not.toThrow();
  expect(errors).toEqual([]);
});

// Box 4: the meta[name="description"] content equals the HowTo block's
// description byte-for-byte (the mirror-source guarantee from the
// 2026-05-25 lesson). Reads the LAST meta[name="description"] element per
// the 2026-05-25 Helmet-appends lesson, NOT page.toHaveTitle() per the
// SEO Pilot lesson (`/playbook` is not in the SEO Pilot pages table).
test('HowTo description mirrors the Helmet meta[name="description"] byte-for-byte', async ({
  page,
}) => {
  const errors = await gotoPlaybook(page);

  await expect
    .poll(
      () =>
        page
          .locator('head meta[name="description"]')
          .evaluateAll((nodes) => nodes.map((n) => (n as HTMLMetaElement).content)),
      { timeout: 10_000 },
    )
    .toEqual(expect.arrayContaining([expect.stringMatching(/.+/)]));

  const descriptions = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) => nodes.map((n) => (n as HTMLMetaElement).content));
  const helmetDescription = descriptions[descriptions.length - 1];
  expect(typeof helmetDescription).toBe('string');
  expect(helmetDescription.length).toBeGreaterThan(20);
  expect(helmetDescription).not.toContain(EM_DASH);

  const blocks = await readJsonLdBlocks(page);
  const howtos = blocks.filter((b): b is { raw: string; data: HowTo } => isHowTo(b.data));
  expect(howtos).toHaveLength(1);
  expect(howtos[0].data.description).toBe(helmetDescription);

  expect(errors).toEqual([]);
});

// Box 5: deep-linking via /playbook#step-3 scrolls the third step into
// view on initial load. The page's useEffect reads window.location.hash
// on mount and calls document.getElementById(hash.slice(1))?.scrollIntoView()
// inside a requestAnimationFrame so it fires after the step blocks render.
test('navigating to /playbook#step-3 scrolls the third step into view', async ({ page }) => {
  const errors = await gotoPlaybook(page, '/playbook#step-3');
  await expect(page.locator('#step-3')).toBeInViewport({ timeout: 5_000 });
  expect(errors).toEqual([]);
});

// Box 6: page renders in light AND dark mode on a 375px mobile viewport,
// the JSON-LD blocks parse as valid JSON, and BOTH JSON-LD blocks this PR
// emits contain zero em-dash characters (U+2014). The visible body copy
// is also em-dash-free (mirror-source-fix guarantee per the 2026-05-25
// lesson).
test('renders in light/dark on mobile and emits no em-dash anywhere', async ({ page }) => {
  const errors = await gotoPlaybook(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Dark mode: toggle .dark on the root, the page still renders.
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const blocks = await readJsonLdBlocks(page);
  const ours = blocks.filter((b) => isHowTo(b.data) || isBreadcrumb(b.data));
  expect(ours.length, 'HowTo + BreadcrumbList blocks must both render').toBe(2);
  for (const b of ours) {
    expect(() => JSON.parse(b.raw)).not.toThrow();
    expect(b.raw, `JSON-LD block contains em-dash: ${b.raw}`).not.toContain(EM_DASH);
  }

  // Visible body copy is also em-dash-free.
  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(bodyText, 'visible /playbook body copy contains an em-dash').not.toContain(EM_DASH);

  expect(errors).toEqual([]);
});

// Box 7: rendering the schema makes no first-party /api/ call (the page is
// fully static, derived from the PLAYBOOK_STEPS constant at render time,
// so it must not introduce any new data flow). Also asserts the bottom
// strategy-call CTA opens in a new tab with rel="noopener noreferrer".
test('renders with no /api/ call and the CTA opens in a new tab safely', async ({ page }) => {
  const apiCalls: string[] = [];
  await gotoPlaybook(page);
  const appOrigin = new URL(page.url()).origin;
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin === appOrigin && u.pathname.startsWith('/api/')) apiCalls.push(req.url());
  });

  const blocks = await readJsonLdBlocks(page);
  const howtos = blocks.filter((b) => isHowTo(b.data));
  expect(howtos).toHaveLength(1);

  expect(
    apiCalls,
    `rendering /playbook JSON-LD should make no first-party /api/ call:\n${apiCalls.join('\n')}`,
  ).toEqual([]);

  // The strategy-call CTA is a calendly link with rel="noopener noreferrer"
  // and target="_blank".
  const cta = page.locator('a[href*="calendly.com/mutaaf"]').first();
  await expect(cta).toBeVisible();
  expect(await cta.getAttribute('target')).toBe('_blank');
  const rel = (await cta.getAttribute('rel')) ?? '';
  expect(rel).toContain('noopener');
  expect(rel).toContain('noreferrer');
});
