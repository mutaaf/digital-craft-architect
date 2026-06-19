import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0063 - Emit BreadcrumbList JSON-LD on /glossary so the AI glossary
// indexes as a navigable artifact. Each test maps 1:1 to an acceptance-criteria
// box on the ticket. Modeled on tests/e2e/trust-aboutpage-jsonld.spec.ts
// (the closest peer: a single static content page emitting a BreadcrumbList
// block alongside another @type, in this case the existing DefinedTermSet
// from ticket 0013).
//
// Per the 2026-05-25 SEO Pilot lesson the spec does NOT use
// page.toHaveTitle(); /glossary IS in the index.html SEO Pilot pages table,
// but the artifact this ticket emits is JSON-LD, not the title, so we read
// the JSON-LD block directly via evaluateAll.
//
// Per the 2026-05-30 second-@type lesson, the implementer grepped every
// tests/e2e/*-jsonld.spec.ts AND tests/e2e/glossary-definedtermset-schema.spec.ts
// for `=== 'BreadcrumbList'` and `=== 'DefinedTermSet'` predicates before
// writing code. Every existing BreadcrumbList predicate is URL-scoped to a
// non-/glossary route (/case-studies/..., /changelog, /trust, /, /quiz); the
// DefinedTermSet predicate filters by @type alone and asserts .toHaveLength(1)
// over the filtered set, so a sibling BreadcrumbList block on /glossary does
// not collide with the ticket 0013 spec.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const GLOSSARY_URL = `${ORIGIN}/glossary`;
const GLOSSARY_NAME = 'AI & Automation Glossary';

async function gotoGlossary(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/glossary', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /glossary').not.toBeNull();
  expect(response!.status(), `/glossary returned ${response!.status()}`).toBeLessThan(400);
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

type BreadcrumbItem = {
  '@type': string;
  position?: number;
  name?: string;
  item?: string;
};
type Breadcrumb = {
  '@context'?: string;
  '@type': string;
  itemListElement?: BreadcrumbItem[];
};
type DefinedTerm = { '@type': string; name?: string; description?: string };
type DefinedTermSet = {
  '@context'?: string;
  '@type': string;
  name?: string;
  description?: string;
  hasDefinedTerm?: DefinedTerm[];
};

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

const isDefinedTermSet = (d: unknown): d is DefinedTermSet =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'DefinedTermSet';

// Box 1: GET /glossary returns 200 and at least one application/ld+json
// block on the page parses to a JSON object with @type === 'BreadcrumbList'.
// The BreadcrumbList itemListElement has exactly two entries, in the
// canonical (Home -> AI & Automation Glossary) shape.
test('emits exactly one BreadcrumbList JSON-LD block naming the glossary', async ({ page }) => {
  const errors = await gotoGlossary(page);
  const blocks = await readJsonLdBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(
    breadcrumbs,
    'exactly one BreadcrumbList block expected on /glossary',
  ).toHaveLength(1);

  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);

  // Position 1: Home -> homepage origin.
  expect(items[0]['@type']).toBe('ListItem');
  expect(items[0].position).toBe(1);
  expect(items[0].name).toBe('Home');
  expect(items[0].item).toBe(ORIGIN);

  // Position 2: glossary name (mirrors the GLOSSARY_NAME constant in
  // src/pages/Glossary.tsx per the 2026-05-25 mirror-source rule) -> /glossary.
  expect(items[1]['@type']).toBe('ListItem');
  expect(items[1].position).toBe(2);
  expect(items[1].name).toBe(GLOSSARY_NAME);
  expect(items[1].item).toBe(GLOSSARY_URL);

  // Round-trip parse so a future stringify bug fails here.
  expect(() => JSON.parse(breadcrumbs[0].raw)).not.toThrow();
  expect(errors).toEqual([]);
});

// Box 2: non-regression check against ticket 0013. The existing
// DefinedTermSet block STILL renders alongside the new BreadcrumbList; the
// page now has both blocks but the DefinedTermSet count remains exactly 1.
test('preserves the existing DefinedTermSet block (ticket 0013 non-regression)', async ({
  page,
}) => {
  const errors = await gotoGlossary(page);
  const blocks = await readJsonLdBlocks(page);

  const definedTermSets = blocks.filter(
    (b): b is { raw: string; data: DefinedTermSet } => isDefinedTermSet(b.data),
  );
  expect(
    definedTermSets,
    'exactly one DefinedTermSet block expected on /glossary',
  ).toHaveLength(1);

  // The DefinedTermSet name still matches the existing source-of-truth.
  expect(definedTermSets[0].data.name).toBe(GLOSSARY_NAME);
  // The DefinedTerm array still has the same shape; ticket 0013 already
  // gates the per-term content, so here we only assert it is non-empty.
  expect((definedTermSets[0].data.hasDefinedTerm ?? []).length).toBeGreaterThan(0);

  expect(errors).toEqual([]);
});

// Box 3: no em-dash (U+2014) anywhere in the new BreadcrumbList JSON-LD
// block or in the visible page text. The page text check is the mirror-
// source-fix guarantee per the 2026-05-25 lesson; the glossary uses the same
// constant for the visible heading and the schema name field.
test('emits no em-dash in the BreadcrumbList block or in visible page text', async ({
  page,
}) => {
  const errors = await gotoGlossary(page);
  const blocks = await readJsonLdBlocks(page);

  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(breadcrumbs).toHaveLength(1);
  expect(breadcrumbs[0].raw, 'BreadcrumbList raw JSON contains em-dash').not.toContain(
    EM_DASH,
  );

  // Visible page text has no em-dash either.
  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(bodyText, 'visible /glossary body copy contains an em-dash').not.toContain(
    EM_DASH,
  );

  expect(errors).toEqual([]);
});

// Box 4: page renders cleanly in dark mode via the .dark class on the root.
// The Helmet emission is head-only so the DOM is byte-identical, but the
// ticket explicitly requires the dark-mode assertion.
test('renders cleanly in dark mode on a mobile viewport', async ({ page }) => {
  const errors = await gotoGlossary(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Dark mode: toggle .dark on the root, the page still renders and the
  // BreadcrumbList block is still present and valid.
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const blocks = await readJsonLdBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(breadcrumbs).toHaveLength(1);
  expect(() => JSON.parse(breadcrumbs[0].raw)).not.toThrow();

  expect(errors).toEqual([]);
});

// Box 5: rendering /glossary with the new schema makes no first-party /api/
// call (the no-/api/-touch Hard NO is a code-level guarantee but we also
// assert it at runtime, mirror of the trust-aboutpage spec box 7).
test('renders the BreadcrumbList block with no first-party /api/ call', async ({ page }) => {
  const apiCalls: string[] = [];
  await gotoGlossary(page);
  const appOrigin = new URL(page.url()).origin;
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin === appOrigin && u.pathname.startsWith('/api/')) apiCalls.push(req.url());
  });

  const blocks = await readJsonLdBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(breadcrumbs).toHaveLength(1);

  expect(
    apiCalls,
    `rendering /glossary BreadcrumbList should make no first-party /api/ call:\n${apiCalls.join('\n')}`,
  ).toEqual([]);
});
