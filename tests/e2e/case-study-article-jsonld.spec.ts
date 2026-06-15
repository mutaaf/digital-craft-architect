import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';
import { caseStudies } from '../../src/data/caseStudies';

// Ticket 0054 - Emit Article JSON-LD on every /case-studies/:slug page so
// each case study indexes as a structured article artifact. Each test
// maps 1:1 to an acceptance-criteria box. Modeled on
// tests/e2e/trust-aboutpage-jsonld.spec.ts (ticket 0044, the closest
// peer for "second JSON-LD block on a single-page route").
//
// The spec imports `caseStudies` from src/data/caseStudies.ts and
// iterates by slug rather than hardcoding the three known slugs so a
// future fourth case study automatically gets the same assertions (and
// fails loudly if PUBLISHED_DATES is not updated in the same PR per the
// 2026-05-25 mirror-source rule).
//
// Per the 2026-05-30 second-@type lesson, the implementer grepped every
// existing tests/e2e/*-jsonld.spec.ts AND every tests/e2e/case-*.spec.ts
// for `=== 'Article'` predicates before writing this file: zero matches,
// no predecessor spec needs widening. Per the 2026-05-25 SEO Pilot
// lesson the spec does NOT use page.toHaveTitle() because
// /case-studies/:slug is not in the index.html SEO Pilot pages table.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no
// em-dash (the brand-voice Hard NO bans the literal character even in
// tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';

type OrgRef = { '@type'?: string; name?: string; url?: string; logo?: { '@type'?: string; url?: string } };
type Article = {
  '@context'?: string;
  '@type': string;
  headline?: string;
  description?: string;
  author?: OrgRef;
  publisher?: OrgRef;
  mainEntityOfPage?: { '@type'?: string; '@id'?: string };
  about?: { '@type'?: string; name?: string };
  image?: string;
  datePublished?: string;
  dateModified?: string;
};
type BreadcrumbItem = { '@type': string; position?: number; name?: string; item?: string };
type Breadcrumb = {
  '@context'?: string;
  '@type': string;
  itemListElement?: BreadcrumbItem[];
};

const isArticle = (d: unknown): d is Article =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'Article';

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

async function gotoCaseStudy(page: Page, slug: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const route = `/case-studies/${slug}`;
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${route}`).not.toBeNull();
  expect(response!.status(), `${route} returned ${response!.status()}`).toBeLessThan(400);
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
      () => page.$$eval('script[type="application/ld+json"]', (nodes) => nodes.length),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  return raws.map((raw) => ({ raw, data: JSON.parse(raw) as unknown }));
}

for (const study of caseStudies) {
  const slug = study.slug;
  const canonical = `${ORIGIN}/case-studies/${slug}`;

  // Box 1: each case-study slug page emits exactly one Article JSON-LD
  // block carrying the seven required fields with the documented
  // shapes. Reuses study.summary as description per the mirror-source
  // rule.
  test(`/case-studies/${slug} emits one Article JSON-LD block with required fields`, async ({
    page,
  }) => {
    const errors = await gotoCaseStudy(page, slug);
    const blocks = await readJsonLdBlocks(page);
    const articles = blocks.filter((b): b is { raw: string; data: Article } =>
      isArticle(b.data),
    );
    expect(
      articles,
      `exactly one Article JSON-LD block expected on /case-studies/${slug}`,
    ).toHaveLength(1);

    const art = articles[0].data;
    expect(art['@context']).toBe('https://schema.org');
    expect(art['@type']).toBe('Article');

    // headline = study.title (mirror-source, byte-identical).
    expect(art.headline).toBe(study.title);

    // description = study.summary (mirror-source, byte-identical).
    expect(art.description).toBe(study.summary);

    // author is an Organization reference to Digital Craft AI.
    expect(art.author).toBeTruthy();
    expect(art.author!['@type']).toBe('Organization');
    expect(art.author!.name).toBe('Digital Craft AI');
    expect(art.author!.url).toBe(ORIGIN);

    // publisher is an Organization with an ImageObject logo.
    expect(art.publisher).toBeTruthy();
    expect(art.publisher!['@type']).toBe('Organization');
    expect(art.publisher!.name).toBe('Digital Craft AI');
    expect(art.publisher!.url).toBe(ORIGIN);
    expect(art.publisher!.logo).toBeTruthy();
    expect(art.publisher!.logo!['@type']).toBe('ImageObject');
    expect(art.publisher!.logo!.url).toBe(`${ORIGIN}/favicon.svg`);

    // mainEntityOfPage @id is the canonical URL.
    expect(art.mainEntityOfPage).toBeTruthy();
    expect(art.mainEntityOfPage!['@type']).toBe('WebPage');
    expect(art.mainEntityOfPage!['@id']).toBe(canonical);

    // about is a Thing whose name is the case study's vertical label.
    expect(art.about).toBeTruthy();
    expect(art.about!['@type']).toBe('Thing');
    expect(art.about!.name).toBe(study.vertical);

    // image is a vertical-mapped og-*.png URL on the canonical origin.
    expect(typeof art.image).toBe('string');
    expect(art.image!.startsWith(`${ORIGIN}/og-`)).toBe(true);
    expect(art.image!).toMatch(/\/og-.+\.png$/);

    // datePublished and dateModified are YYYY-MM-DD strings.
    expect(typeof art.datePublished).toBe('string');
    expect(art.datePublished ?? '').toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(typeof art.dateModified).toBe('string');
    expect(art.dateModified ?? '').toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // Round-trip parse so a future stringify bug fails here.
    expect(() => JSON.parse(articles[0].raw)).not.toThrow();
    expect(errors).toEqual([]);
  });

  // Box 4 (regression): the pre-existing BreadcrumbList block stays
  // present and its itemListElement array still has three items.
  test(`/case-studies/${slug} still emits the original BreadcrumbList block`, async ({
    page,
  }) => {
    const errors = await gotoCaseStudy(page, slug);
    const blocks = await readJsonLdBlocks(page);
    const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
      isBreadcrumb(b.data),
    );
    expect(
      breadcrumbs,
      `exactly one BreadcrumbList block expected on /case-studies/${slug}`,
    ).toHaveLength(1);
    const items = breadcrumbs[0].data.itemListElement ?? [];
    expect(items.length).toBe(3);
    expect((items[0].name ?? '').toLowerCase()).toBe('home');
    expect(items[2].item).toBe(canonical);
    expect(errors).toEqual([]);
  });

  // Box 5: image URL ends with the vertical-mapped filename. The map
  // is asserted explicitly per slug so a future vertical rename in
  // caseStudies.ts surfaces here rather than at runtime.
  test(`/case-studies/${slug} image URL matches the vertical-mapped og file`, async ({
    page,
  }) => {
    await gotoCaseStudy(page, slug);
    const blocks = await readJsonLdBlocks(page);
    const articles = blocks.filter((b): b is { raw: string; data: Article } =>
      isArticle(b.data),
    );
    expect(articles).toHaveLength(1);
    const expectedFile =
      study.vertical === 'Construction'
        ? '/og-construction.png'
        : study.vertical === 'Real Estate'
          ? '/og-realestate.png'
          : study.vertical === 'Events'
            ? '/og-events.png'
            : '/og-default.png';
    expect(articles[0].data.image).toBe(`${ORIGIN}${expectedFile}`);
  });

  // Box 5: no em-dash in either JSON-LD block, no em-dash in the
  // visible page text (mirror-source-fix guarantee per the 2026-05-25
  // lesson).
  test(`/case-studies/${slug} emits no em-dash in JSON-LD or visible body`, async ({
    page,
  }) => {
    await gotoCaseStudy(page, slug);
    const blocks = await readJsonLdBlocks(page);
    const ours = blocks.filter((b) => isArticle(b.data) || isBreadcrumb(b.data));
    expect(ours.length, 'Article + BreadcrumbList blocks must both render').toBe(2);
    for (const b of ours) {
      expect(() => JSON.parse(b.raw)).not.toThrow();
      expect(b.raw, `JSON-LD block contains em-dash: ${b.raw}`).not.toContain(EM_DASH);
    }
    const bodyText = (await page.locator('body').textContent()) ?? '';
    expect(
      bodyText,
      `visible /case-studies/${slug} body copy contains an em-dash`,
    ).not.toContain(EM_DASH);
  });

  // Box 5 (dark mode): page still renders cleanly when the dark class
  // is toggled on the root, and the Article block is still present.
  test(`/case-studies/${slug} renders the Article block in dark mode`, async ({
    page,
  }) => {
    await gotoCaseStudy(page, slug);
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const blocks = await readJsonLdBlocks(page);
    const articles = blocks.filter((b): b is { raw: string; data: Article } =>
      isArticle(b.data),
    );
    expect(articles).toHaveLength(1);
  });
}
