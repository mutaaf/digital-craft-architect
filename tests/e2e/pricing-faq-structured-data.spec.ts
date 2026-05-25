import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0012 - Emit FAQPage structured data for the visible pricing FAQ.
// Each test maps 1:1 to an acceptance-criteria box on the ticket.
//
// PricingFAQ renders a visible accordion of six question/answer pairs on both
// the Construction and Real Estate pages. After this change it must also emit
// ONE inline <script type="application/ld+json"> FAQPage block built from the
// same FAQ_ITEMS source, so the structured data mirrors the visible accordion
// and can never drift. The pages also carry a separate page-level FAQPage block
// covering different questions; that one stays as is and is NOT what these tests
// assert against. The component block is identified as the FAQPage script whose
// question set exactly equals the visible pricing accordion question set.

// Both pages that mount <PricingFAQ /> exactly once today.
const PAGES = ['/construction', '/realestate'] as const;

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

type Faq = { question: string; answer: string };

async function gotoPage(page: Page, route: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
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

// Read the visible pricing accordion: scroll the "Pricing Questions" heading
// into view, then expand each item to capture the rendered question + answer.
async function readVisibleAccordion(page: Page): Promise<Faq[]> {
  const heading = page.getByRole('heading', { name: 'Pricing Questions' });
  await expect(heading).toBeVisible();
  const region = page.locator('div', { has: heading }).last();

  const triggers = region.getByRole('button');
  const count = await triggers.count();
  expect(count, 'visible pricing accordion should render its question triggers').toBeGreaterThan(0);

  const items: Faq[] = [];
  for (let i = 0; i < count; i++) {
    const trigger = triggers.nth(i);
    const question = (await trigger.innerText()).trim();
    // Open this item; Radix accordion is single-collapsible so opening one
    // closes the rest. Read the now-visible answer panel.
    await trigger.click();
    const answer = (
      await region
        .locator('[data-state="open"] [role="region"], [data-state="open"]')
        .last()
        .innerText()
    ).trim();
    items.push({ question, answer });
  }
  return items;
}

// Parse every inline application/ld+json script on the page into JS objects.
async function readJsonLdBlocks(page: Page): Promise<{ raw: string; data: unknown }[]> {
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  return raws.map((raw) => ({ raw, data: JSON.parse(raw) as unknown }));
}

type FaqPage = {
  '@type': string;
  mainEntity?: Array<{
    '@type': string;
    name: string;
    acceptedAnswer?: { '@type': string; text: string };
  }>;
};

const isFaqPage = (d: unknown): d is FaqPage =>
  typeof d === 'object' && d !== null && (d as { '@type'?: unknown })['@type'] === 'FAQPage';

// The FAQPage block emitted by PricingFAQ: its question set equals the visible
// pricing accordion question set. (The separate page-level FAQPage uses other
// questions and must not match.)
function findComponentFaqPage(
  blocks: { raw: string; data: unknown }[],
  visibleQuestions: string[],
): { raw: string; data: FaqPage }[] {
  const want = [...visibleQuestions].sort();
  return blocks
    .filter((b): b is { raw: string; data: FaqPage } => isFaqPage(b.data))
    .filter((b) => {
      const got = (b.data.mainEntity ?? []).map((q) => q.name).sort();
      return got.length === want.length && got.every((q, i) => q === want[i]);
    });
}

for (const route of PAGES) {
  test.describe(`pricing FAQ structured data on ${route}`, () => {
    // Box 1: PricingFAQ renders one application/ld+json FAQPage whose mainEntity
    // has exactly one Question per visible FAQ_ITEMS entry.
    test('emits one FAQPage with one Question per visible item', async ({ page }) => {
      const errors = await gotoPage(page, route);
      const visible = await readVisibleAccordion(page);
      const blocks = await readJsonLdBlocks(page);

      const mine = findComponentFaqPage(blocks, visible.map((v) => v.question));
      expect(mine, 'exactly one component FAQPage block expected').toHaveLength(1);

      const entities = mine[0].data.mainEntity ?? [];
      expect(entities).toHaveLength(visible.length);
      for (const e of entities) {
        expect(e['@type']).toBe('Question');
        expect(e.acceptedAnswer?.['@type']).toBe('Answer');
      }
      expect(errors).toEqual([]);
    });

    // Box 2: each Question.name equals the visible question and each
    // acceptedAnswer.text equals the visible answer for the same item.
    test('each Question/Answer mirrors the visible accordion text', async ({ page }) => {
      const errors = await gotoPage(page, route);
      const visible = await readVisibleAccordion(page);
      const blocks = await readJsonLdBlocks(page);
      const mine = findComponentFaqPage(blocks, visible.map((v) => v.question));
      expect(mine).toHaveLength(1);

      const byName = new Map(
        (mine[0].data.mainEntity ?? []).map((q) => [q.name, q.acceptedAnswer?.text ?? '']),
      );
      for (const item of visible) {
        expect(byName.has(item.question), `schema is missing question: ${item.question}`).toBe(true);
        expect(byName.get(item.question)).toBe(item.answer);
      }
      expect(errors).toEqual([]);
    });

    // Box 3: the emitted JSON-LD parses as valid JSON and contains no em-dash in
    // any question or answer string.
    test('JSON-LD parses and contains no em-dash', async ({ page }) => {
      const errors = await gotoPage(page, route);
      const visible = await readVisibleAccordion(page);
      const blocks = await readJsonLdBlocks(page);
      const mine = findComponentFaqPage(blocks, visible.map((v) => v.question));
      expect(mine).toHaveLength(1);

      // Parsing already happened in readJsonLdBlocks; re-parse the raw text to
      // prove the emitted block is, on its own, valid JSON.
      expect(() => JSON.parse(mine[0].raw)).not.toThrow();
      expect(mine[0].raw).not.toContain('—');
      for (const q of mine[0].data.mainEntity ?? []) {
        expect(q.name).not.toContain('—');
        expect(q.acceptedAnswer?.text ?? '').not.toContain('—');
      }
      expect(errors).toEqual([]);
    });

    // Box 4: exactly one component FAQPage block renders per page (regression
    // against an accidental double emit from PricingFAQ being mounted twice).
    test('exactly one component FAQPage block renders per page', async ({ page }) => {
      const errors = await gotoPage(page, route);
      const visible = await readVisibleAccordion(page);
      const blocks = await readJsonLdBlocks(page);

      const mine = findComponentFaqPage(blocks, visible.map((v) => v.question));
      expect(mine).toHaveLength(1);
      // The visible accordion itself renders once: a single "Pricing Questions"
      // heading proves PricingFAQ is mounted once on this page.
      await expect(page.getByRole('heading', { name: 'Pricing Questions' })).toHaveCount(1);
      expect(errors).toEqual([]);
    });

    // Box 5: the visible accordion markup and dark styling are unchanged; the
    // component renders correctly in light and dark mode.
    test('accordion renders in light and dark mode', async ({ page }) => {
      const errors = await gotoPage(page, route);

      // Light mode: heading + all six triggers visible and clickable.
      const lightItems = await readVisibleAccordion(page);
      expect(lightItems.length).toBeGreaterThan(0);

      // Dark mode: toggle .dark on the root, the accordion still works.
      await page.evaluate(() => document.documentElement.classList.add('dark'));
      await expect(page.getByRole('heading', { name: 'Pricing Questions' })).toBeVisible();
      const darkItems = await readVisibleAccordion(page);
      expect(darkItems.map((d) => d.question)).toEqual(lightItems.map((l) => l.question));
      expect(errors).toEqual([]);
    });

    // Box 6: no first-party /api/ call and no new hostnames triggered by loading
    // the page with the FAQ schema. (Third-party hosts whose path starts with
    // /api/, e.g. analytics ingest, are not our serverless /api/.)
    test('renders the schema with no first-party /api/ call', async ({ page }) => {
      const errors = await gotoPage(page, route);
      const appOrigin = new URL(page.url()).origin;
      const apiCalls: string[] = [];
      page.on('request', (req) => {
        const u = new URL(req.url());
        if (u.origin === appOrigin && u.pathname.startsWith('/api/')) apiCalls.push(req.url());
      });

      const visible = await readVisibleAccordion(page);
      const blocks = await readJsonLdBlocks(page);
      const mine = findComponentFaqPage(blocks, visible.map((v) => v.question));
      expect(mine).toHaveLength(1);
      expect(apiCalls, `rendering the FAQ schema should make no /api/ call:\n${apiCalls.join('\n')}`).toEqual([]);
      expect(errors).toEqual([]);
    });
  });
}
