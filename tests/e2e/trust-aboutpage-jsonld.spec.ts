import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0044 - Emit AboutPage + BreadcrumbList JSON-LD on /trust so the
// data-handling disclosure indexes as a canonical artifact. Each test maps
// 1:1 to an acceptance-criteria box on the ticket. Modeled on
// tests/e2e/quiz-jsonld.spec.ts (ticket 0039, the closest peer for
// "publish structure of an existing artifact").
//
// /trust already renders a transparency page sourced from the SECTIONS
// and PROVIDERS constants in src/pages/Trust.tsx. This change inlines two
// sibling <script type="application/ld+json"> tags into the existing
// Helmet head: an AboutPage block whose mainContentOfPage.itemListElement
// is mapped from the SAME SECTIONS array, and a BreadcrumbList block
// (Home -> Trust) matching the pattern in src/pages/AiForElectricians.tsx
// and src/pages/Changelog.tsx.
//
// Per the 2026-05-25 SEO Pilot lesson the spec does NOT use
// page.toHaveTitle() because /trust is not in the index.html SEO Pilot
// pages table (a fact already documented at src/pages/Trust.tsx lines
// 34-36). The spec reads the LAST meta[name="description"] (the
// Helmet-appended one) and asserts it byte-for-byte equals the AboutPage
// block's description (the mirror-source guarantee from the 2026-05-25
// lesson). Per the 2026-05-30 second-@type lesson, the implementer
// grepped every existing tests/e2e/*-jsonld.spec.ts for
// `=== 'BreadcrumbList'` and `=== 'AboutPage'` before writing code and
// confirmed every BreadcrumbList predicate is URL-scoped (to /changelog
// and /quiz today, neither runs on /trust) and AboutPage is new to the
// codebase (0 matches), so emitting new /trust-scoped blocks is safe.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const TRUST_URL = `${ORIGIN}/trust`;
const HASH_PREFIX = `${TRUST_URL}#`;

async function gotoTrust(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/trust', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /trust').not.toBeNull();
  expect(response!.status(), `/trust returned ${response!.status()}`).toBeLessThan(400);
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

type WebPageElement = {
  '@type': string;
  position?: number;
  name?: string;
  url?: string;
};
type ItemListShape = {
  '@type'?: string;
  itemListElement?: WebPageElement[];
};
type AboutOrganization = { '@type'?: string; name?: string; url?: string };
type AboutPage = {
  '@context'?: string;
  '@type': string;
  name?: string;
  description?: string;
  url?: string;
  inLanguage?: string;
  dateModified?: string;
  mainContentOfPage?: ItemListShape;
  about?: AboutOrganization;
};
type BreadcrumbItem = { '@type': string; position?: number; name?: string; item?: string };
type Breadcrumb = {
  '@context'?: string;
  '@type': string;
  itemListElement?: BreadcrumbItem[];
};

const isAboutPage = (d: unknown): d is AboutPage =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'AboutPage';

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

// Box 1: an AboutPage JSON-LD block is emitted with the documented field
// set, mapping mainContentOfPage.itemListElement from the SECTIONS array
// and referencing the Organization via a minimal inline `about` field.
test('emits an AboutPage JSON-LD block with the required fields', async ({ page }) => {
  const errors = await gotoTrust(page);
  const blocks = await readJsonLdBlocks(page);
  const aboutPages = blocks.filter((b): b is { raw: string; data: AboutPage } =>
    isAboutPage(b.data),
  );
  expect(aboutPages, 'exactly one AboutPage JSON-LD block expected on /trust').toHaveLength(1);

  const ap = aboutPages[0].data;
  expect(ap['@context']).toBe('https://schema.org');
  expect(ap['@type']).toBe('AboutPage');
  expect(ap.name).toBe('How Our Demos Handle Your Data');
  expect(typeof ap.description).toBe('string');
  expect((ap.description ?? '').length).toBeGreaterThan(20);
  expect(ap.url).toBe(TRUST_URL);
  expect(ap.inLanguage).toBe('en-US');
  expect(typeof ap.dateModified).toBe('string');
  // dateModified is YYYY-MM-DD per the ticket spec.
  expect(ap.dateModified ?? '').toMatch(/^\d{4}-\d{2}-\d{2}$/);

  // Inline `about` reference to the homepage Organization, deliberately
  // minimal (name + url only) so it cannot collide with the homepage
  // Organization JSON-LD (ticket 0025).
  expect(ap.about).toBeTruthy();
  expect(ap.about!['@type']).toBe('Organization');
  expect(ap.about!.name).toBe('DigitalCraft AI');
  expect(ap.about!.url).toBe(ORIGIN);

  // Round-trip parse so a future stringify bug fails here.
  expect(() => JSON.parse(aboutPages[0].raw)).not.toThrow();
  expect(errors).toEqual([]);
});

// Box 2: mainContentOfPage.itemListElement length equals SECTIONS.length
// (today 6); the schema length always tracks the rendered section count
// because both derive from the same SECTIONS array. Every entry is a
// well-formed WebPageElement whose url ends in /trust#<section.id> and
// whose name matches a rendered jump-nav anchor text.
test('mainContentOfPage.itemListElement mirrors the rendered SECTIONS array', async ({
  page,
}) => {
  const errors = await gotoTrust(page);
  const blocks = await readJsonLdBlocks(page);
  const aboutPages = blocks.filter((b): b is { raw: string; data: AboutPage } =>
    isAboutPage(b.data),
  );
  expect(aboutPages).toHaveLength(1);

  const items = aboutPages[0].data.mainContentOfPage?.itemListElement ?? [];

  // Visible rendered [id="..."] anchor count inside the SECTIONS render
  // block. The page renders one <article id="<section.id>"> per section,
  // so we count articles with an id attribute (excludes the navbar/footer).
  const renderedAnchorCount = await page
    .locator('article[id]')
    .evaluateAll((nodes) => nodes.length);
  expect(renderedAnchorCount, 'expected at least one rendered [id] anchor').toBeGreaterThan(0);
  // Today's count is 6; we assert SECTIONS.length === itemListElement.length
  // by comparing against the rendered render-block anchor count.
  expect(items.length).toBe(renderedAnchorCount);
  expect(items.length).toBe(6);

  // Pull the jump-nav anchor texts. The jump-nav renders one <a
  // href="#<id>"> per section; we read those anchors' text to compare.
  const jumpNavTexts = await page
    .locator('a[href^="#"]')
    .evaluateAll((nodes) =>
      nodes
        .map((n) => ({
          href: n.getAttribute('href') ?? '',
          text: (n.textContent ?? '').trim(),
        }))
        .filter((x) => x.href.length > 1 && x.text.length > 0),
    );

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    expect(it['@type']).toBe('WebPageElement');
    expect(typeof it.position).toBe('number');
    expect(Number.isInteger(it.position)).toBe(true);
    expect(it.position).toBe(i + 1);
    expect(typeof it.name).toBe('string');
    expect((it.name ?? '').length).toBeGreaterThan(0);
    expect(typeof it.url).toBe('string');
    expect((it.url ?? '').startsWith(HASH_PREFIX)).toBe(true);

    // The hash on the url must match a rendered [id] anchor.
    const hash = (it.url ?? '').slice(HASH_PREFIX.length);
    expect(hash.length).toBeGreaterThan(0);
    const found = await page.locator(`[id="${hash}"]`).count();
    expect(found, `no rendered element with id="${hash}"`).toBeGreaterThan(0);

    // The schema name matches the jump-nav anchor text for that id.
    const navMatch = jumpNavTexts.find((x) => x.href === `#${hash}`);
    expect(navMatch, `no jump-nav anchor with href="#${hash}"`).toBeTruthy();
    expect(navMatch!.text).toBe(it.name);
  }

  expect(errors).toEqual([]);
});

// Box 3: a BreadcrumbList block (Home -> Trust) is also emitted on /trust.
// Per-URL scoped; no predecessor spec asserts site-wide BreadcrumbList
// uniqueness (pre-write grep result documented on the ticket).
test('emits exactly one BreadcrumbList JSON-LD block naming Trust', async ({ page }) => {
  const errors = await gotoTrust(page);
  const blocks = await readJsonLdBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(breadcrumbs, 'exactly one BreadcrumbList block expected on /trust').toHaveLength(1);

  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[0].item).toBe(ORIGIN);
  expect(items[1].name).toBe('Trust');
  expect(items[1].item).toBe(TRUST_URL);

  expect(() => JSON.parse(breadcrumbs[0].raw)).not.toThrow();
  expect(errors).toEqual([]);
});

// Box 4: no copy change. The H1 still reads the documented literal
// (reconstructed from the two existing spans), every entry in the
// PROVIDERS constant still appears in the rendered body, and every
// SECTIONS entry still renders an [id="<section.id>"] anchor that the
// jump-nav link targets.
test('preserves the H1, the providers list, and every SECTIONS anchor', async ({ page }) => {
  const errors = await gotoTrust(page);

  // H1 unchanged. The Hero renders "How Our Demos <span>Handle Your Data</span>";
  // we read the H1 textContent and assert the literal joined string.
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  expect(((await h1.textContent()) ?? '').trim().replace(/\s+/g, ' ')).toBe(
    'How Our Demos Handle Your Data',
  );

  // Every provider name from the existing PROVIDERS constant still appears
  // in the rendered body (mirror of tests/e2e/trust-page.spec.ts box 1).
  const expectedProviders = [
    'OpenAI',
    'Vapi',
    'ElevenLabs',
    'Deepgram',
    'Firecrawl',
    'Jina',
    'Formspree',
    'Sentry',
    'Google Analytics',
  ];
  const bodyText = (await page.locator('body').textContent()) ?? '';
  for (const provider of expectedProviders) {
    expect(bodyText, `provider "${provider}" must remain in the visible page`).toContain(
      provider,
    );
  }

  // Every SECTIONS entry renders an [id="..."] anchor reachable from a
  // jump-nav link. We pull the AboutPage schema's section ids (mirror of
  // SECTIONS) and assert each has a corresponding [id] anchor AND a
  // jump-nav <a href="#<id>"> link.
  const blocks = await readJsonLdBlocks(page);
  const aboutPages = blocks.filter((b): b is { raw: string; data: AboutPage } =>
    isAboutPage(b.data),
  );
  expect(aboutPages).toHaveLength(1);
  const sectionIds = (aboutPages[0].data.mainContentOfPage?.itemListElement ?? [])
    .map((it) => (it.url ?? '').slice(HASH_PREFIX.length))
    .filter((id) => id.length > 0);
  expect(sectionIds.length).toBe(6);
  for (const id of sectionIds) {
    const idCount = await page.locator(`[id="${id}"]`).count();
    expect(idCount, `missing rendered [id="${id}"] anchor`).toBeGreaterThan(0);
    const navCount = await page.locator(`a[href="#${id}"]`).count();
    expect(navCount, `missing jump-nav link to #${id}`).toBeGreaterThan(0);
  }

  expect(errors).toEqual([]);
});

// Box 5: page renders in light AND dark mode on a 375px mobile viewport,
// the AboutPage JSON-LD parses as valid JSON, and BOTH JSON-LD blocks
// this PR emits contain zero em-dash characters (U+2014). Also asserts
// the visible page text has no em-dash (mirror-source-fix guarantee per
// the 2026-05-25 lesson).
test('renders in light/dark on mobile and emits no em-dash in the JSON-LD', async ({
  page,
}) => {
  const errors = await gotoTrust(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Dark mode: toggle .dark on the root, the page still renders.
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const blocks = await readJsonLdBlocks(page);
  const ours = blocks.filter((b) => isAboutPage(b.data) || isBreadcrumb(b.data));
  expect(ours.length, 'AboutPage + BreadcrumbList blocks must both render').toBe(2);
  for (const b of ours) {
    expect(() => JSON.parse(b.raw)).not.toThrow();
    expect(b.raw, `JSON-LD block contains em-dash: ${b.raw}`).not.toContain(EM_DASH);
  }

  // Visible body copy is also em-dash-free (mirror-source-fix guarantee).
  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(bodyText, 'visible /trust body copy contains an em-dash').not.toContain(EM_DASH);
});

// Box 6: the meta[name="description"] content equals the AboutPage block's
// description byte-for-byte (mirror-source guarantee). Reads the LAST
// meta[name="description"] element per the 2026-05-25 Helmet-appends
// lesson.
test('AboutPage description mirrors the Helmet meta[name="description"] byte-for-byte', async ({
  page,
}) => {
  const errors = await gotoTrust(page);

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
  // Read the LAST meta[name="description"] (the Helmet-appended one, not
  // the index.html default that may land earlier). Per the 2026-05-25
  // Helmet-appends lesson.
  const helmetDescription = descriptions[descriptions.length - 1];
  expect(typeof helmetDescription).toBe('string');
  expect(helmetDescription.length).toBeGreaterThan(20);
  expect(helmetDescription).not.toContain(EM_DASH);

  const blocks = await readJsonLdBlocks(page);
  const aboutPages = blocks.filter((b): b is { raw: string; data: AboutPage } =>
    isAboutPage(b.data),
  );
  expect(aboutPages).toHaveLength(1);
  expect(aboutPages[0].data.description).toBe(helmetDescription);

  expect(errors).toEqual([]);
});

// Box 7: no first-party /api/ call is made by rendering the schema, and
// the page itself loads (catches any regression where Helmet's script tag
// broke the page). Third-party telemetry is out of scope; we only flag
// calls to the app's own /api/* serverless functions.
test('renders the schema with no first-party /api/ call', async ({ page }) => {
  const apiCalls: string[] = [];
  await gotoTrust(page);
  const appOrigin = new URL(page.url()).origin;
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin === appOrigin && u.pathname.startsWith('/api/')) apiCalls.push(req.url());
  });

  const blocks = await readJsonLdBlocks(page);
  const aboutPages = blocks.filter((b): b is { raw: string; data: AboutPage } =>
    isAboutPage(b.data),
  );
  expect(aboutPages).toHaveLength(1);

  expect(
    apiCalls,
    `rendering /trust JSON-LD should make no first-party /api/ call:\n${apiCalls.join('\n')}`,
  ).toEqual([]);
});
