import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS, ROUTES } from './routes';

// Ticket 0061 - Public /questions-to-ask-an-ai-vendor buyer-side artifact
// emitting a FAQPage + BreadcrumbList JSON-LD pair. Each test maps 1:1 to an
// acceptance-criteria box on the ticket. Modeled on tests/e2e/playbook.spec.ts
// (the closest peer for "static trust-class page with two JSON-LD blocks and
// anchor sections").
//
// Per the 2026-05-25 SEO Pilot lesson, the spec does NOT use
// page.toHaveTitle() because /questions-to-ask-an-ai-vendor is not in the
// index.html SEO Pilot pages table. The spec reads the LAST
// meta[name="description"] (the Helmet-appended one) directly per the
// 2026-05-25 Helmet-appends lesson.
//
// Per the 2026-05-30 second-@type lesson, the implementer grepped every
// tests/e2e/*-jsonld.spec.ts AND tests/e2e/pricing-faq-structured-data.spec.ts
// for `=== 'FAQPage'` and `=== 'BreadcrumbList'` BEFORE writing this spec.
// FAQPage: ONE match in pricing-faq-structured-data.spec.ts, URL-scoped to
// /construction and /realestate, mainEntity-question-set narrowed via the
// `findComponentFaqPage` filter. BreadcrumbList: 30+ matches, every one
// URL-scoped to a different page. No collision possible with a new
// /questions-to-ask-an-ai-vendor-scoped FAQPage + BreadcrumbList pair.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const PAGE_PATH = '/questions-to-ask-an-ai-vendor';
const PAGE_URL = `${ORIGIN}${PAGE_PATH}`;

async function gotoPage(page: Page, path = PAGE_PATH): Promise<string[]> {
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

type Question = {
  '@type': string;
  name?: string;
  acceptedAnswer?: { '@type': string; text?: string };
};
type FaqPage = {
  '@context'?: string;
  '@type': string;
  mainEntity?: Question[];
};
type BreadcrumbItem = { '@type': string; position?: number; name?: string; item?: string };
type Breadcrumb = {
  '@context'?: string;
  '@type': string;
  itemListElement?: BreadcrumbItem[];
};

const isFaqPage = (d: unknown): d is FaqPage =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'FAQPage';

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

// Box 1: /questions-to-ask-an-ai-vendor returns 200, the H1 contains
// "Questions to Ask" (case-insensitive substring), the page renders 10-12
// question blocks, and each block carries an id="q-N" anchor (N 1-indexed)
// for deep-linking.
test('renders 10-12 question blocks under a "Questions to Ask" H1', async ({ page }) => {
  const errors = await gotoPage(page);

  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const h1Text = ((await h1.textContent()) ?? '').trim();
  expect(/questions to ask/i.test(h1Text)).toBe(true);

  const blocks = page.locator('[data-testid="vendor-question"]');
  await expect(blocks.first()).toBeVisible();
  const blockCount = await blocks.count();
  expect(blockCount).toBeGreaterThanOrEqual(10);
  expect(blockCount).toBeLessThanOrEqual(12);

  for (let i = 1; i <= blockCount; i++) {
    const anchor = page.locator(`#q-${i}`);
    const found = await anchor.count();
    expect(found, `expected exactly one rendered element with id="q-${i}"`).toBe(1);
  }

  expect(errors).toEqual([]);
});

// Box 2: a BreadcrumbList block (Home -> Questions to Ask an AI Vendor) is
// emitted on /questions-to-ask-an-ai-vendor with the second item linking to
// the canonical page URL. Per-URL scoped; the predecessor grep confirmed
// every BreadcrumbList predicate in tests/e2e/ is URL-scoped.
test('emits exactly one BreadcrumbList JSON-LD block naming the page', async ({ page }) => {
  const errors = await gotoPage(page);
  const blocks = await readJsonLdBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(
    breadcrumbs,
    'exactly one BreadcrumbList block expected on /questions-to-ask-an-ai-vendor',
  ).toHaveLength(1);

  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[0].item).toBe(ORIGIN);
  expect(/questions to ask/i.test(items[1].name ?? '')).toBe(true);
  expect(items[1].item).toBe(PAGE_URL);

  expect(() => JSON.parse(breadcrumbs[0].raw)).not.toThrow();
  expect(errors).toEqual([]);
});

// Box 3: a FAQPage block is emitted with @type 'FAQPage' and a mainEntity
// array whose length matches the visible rendered question-block count
// (10-12), where each element is a Question with a non-empty
// acceptedAnswer.text. The mainEntity array is derived from VENDOR_QUESTIONS
// per the mirror-source rule, so future changes update visible rendering
// and schema in one place.
test('emits exactly one FAQPage JSON-LD block mirroring the visible questions', async ({
  page,
}) => {
  const errors = await gotoPage(page);
  const blocks = await readJsonLdBlocks(page);
  const faqs = blocks.filter((b): b is { raw: string; data: FaqPage } => isFaqPage(b.data));
  expect(
    faqs,
    'exactly one FAQPage block expected on /questions-to-ask-an-ai-vendor',
  ).toHaveLength(1);

  const faq = faqs[0].data;
  expect(faq['@context']).toBe('https://schema.org');
  expect(faq['@type']).toBe('FAQPage');

  const entities = faq.mainEntity ?? [];
  expect(entities.length).toBeGreaterThanOrEqual(10);
  expect(entities.length).toBeLessThanOrEqual(12);

  const visibleQuestionCount = await page
    .locator('[data-testid="vendor-question"]')
    .count();
  expect(entities.length).toBe(visibleQuestionCount);

  for (const q of entities) {
    expect(q['@type']).toBe('Question');
    expect(typeof q.name).toBe('string');
    expect((q.name ?? '').length).toBeGreaterThan(0);
    expect(q.acceptedAnswer?.['@type']).toBe('Answer');
    expect(typeof q.acceptedAnswer?.text).toBe('string');
    expect((q.acceptedAnswer?.text ?? '').length).toBeGreaterThan(0);
  }

  expect(() => JSON.parse(faqs[0].raw)).not.toThrow();
  expect(errors).toEqual([]);
});

// Box 4: the LAST meta[name="description"] content (the Helmet-appended one
// per the 2026-05-25 Helmet-appends lesson) is non-empty, em-dash-free, and
// mirrors a defensible page summary. Per the 2026-05-25 SEO Pilot lesson the
// spec asserts the meta description directly, NOT page.toHaveTitle().
test('Helmet meta[name="description"] renders non-empty and em-dash-free', async ({ page }) => {
  const errors = await gotoPage(page);

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

  expect(errors).toEqual([]);
});

// Box 5: deep-linking via /questions-to-ask-an-ai-vendor#q-2 scrolls the
// second question block into view on initial load. The page's useEffect
// reads window.location.hash on mount and calls
// document.getElementById(hash.slice(1))?.scrollIntoView() inside a
// requestAnimationFrame so it fires after the blocks render.
test('navigating to #q-2 scrolls the second question into view', async ({ page }) => {
  const errors = await gotoPage(page, `${PAGE_PATH}#q-2`);
  await expect(page.locator('#q-2')).toBeInViewport({ timeout: 5_000 });
  expect(errors).toEqual([]);
});

// Box 6: page renders in light AND dark mode on a 375px mobile viewport,
// the JSON-LD blocks parse as valid JSON, and BOTH the FAQPage and
// BreadcrumbList blocks contain zero em-dash characters (U+2014). The
// visible body copy is also em-dash-free (mirror-source-fix guarantee per
// the 2026-05-25 lesson).
test('renders in light/dark on mobile and emits no em-dash anywhere', async ({ page }) => {
  const errors = await gotoPage(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const blocks = await readJsonLdBlocks(page);
  const ours = blocks.filter((b) => isFaqPage(b.data) || isBreadcrumb(b.data));
  expect(ours.length, 'FAQPage + BreadcrumbList blocks must both render').toBe(2);
  for (const b of ours) {
    expect(() => JSON.parse(b.raw)).not.toThrow();
    expect(b.raw, `JSON-LD block contains em-dash: ${b.raw}`).not.toContain(EM_DASH);
  }

  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(bodyText, 'visible body copy contains an em-dash').not.toContain(EM_DASH);

  expect(errors).toEqual([]);
});

// Box 7: every rendered ourAnswerHref value resolves to a path in ROUTES
// imported from ./routes (which re-exports the canonical src/data/routes.ts
// allow-list per the 2026-06-07 src-imports-tests lesson). The bottom
// strategy-call CTA opens calendly in a new tab with rel="noopener noreferrer".
test('every ourAnswerHref resolves to ROUTES and the CTA opens safely', async ({ page }) => {
  const errors = await gotoPage(page);

  const answerLinks = page.locator('[data-testid="vendor-question-answer-link"]');
  const linkCount = await answerLinks.count();
  // The page has at least one ourAnswer link (the data-handling row links
  // to /trust per the ticket's suggested mapping).
  expect(linkCount).toBeGreaterThan(0);

  const hrefs = await answerLinks.evaluateAll((nodes) =>
    nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
  );
  const routeSet = new Set<string>(ROUTES);
  for (const href of hrefs) {
    expect(href.length).toBeGreaterThan(0);
    // ourAnswerHref values are internal app paths; the rendered DOM emits
    // them via react-router <Link to={...}>, so the href attribute is the
    // raw path.
    expect(routeSet.has(href), `ourAnswerHref ${href} is not in ROUTES`).toBe(true);
  }

  const cta = page.locator('a[href*="calendly.com/mutaaf"]').first();
  await expect(cta).toBeVisible();
  expect(await cta.getAttribute('target')).toBe('_blank');
  const rel = (await cta.getAttribute('rel')) ?? '';
  expect(rel).toContain('noopener');
  expect(rel).toContain('noreferrer');

  expect(errors).toEqual([]);
});

// Box 8: rendering the page makes no first-party /api/ call (the page is
// fully static derived from VENDOR_QUESTIONS at render time, so it must
// not introduce any new data flow).
test('renders with no first-party /api/ call', async ({ page }) => {
  const apiCalls: string[] = [];
  await gotoPage(page);
  const appOrigin = new URL(page.url()).origin;
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin === appOrigin && u.pathname.startsWith('/api/')) apiCalls.push(req.url());
  });

  const blocks = await readJsonLdBlocks(page);
  const faqs = blocks.filter((b) => isFaqPage(b.data));
  expect(faqs).toHaveLength(1);

  expect(
    apiCalls,
    `rendering /questions-to-ask-an-ai-vendor should make no first-party /api/ call:\n${apiCalls.join('\n')}`,
  ).toEqual([]);
});
