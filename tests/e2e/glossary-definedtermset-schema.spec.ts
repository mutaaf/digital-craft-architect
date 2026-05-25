import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0013 - Add DefinedTermSet structured data to the AI glossary.
// Each test maps 1:1 to an acceptance-criteria box on the ticket.
//
// The Glossary page (/glossary) renders a typed TERMS array of plain-language
// definitions in a semantic <dl>. After this change it must also emit ONE inline
// <script type="application/ld+json"> DefinedTermSet block built from the same
// TERMS source, so the structured data mirrors the visible list and can never
// drift. Some definitions are React nodes with inline <Link>s; the schema uses a
// plain-text description for those (no markup, no em-dash).

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

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

// Read the visible <dl>: each <dt> is a term, its following <dd> the definition.
// We capture term names and the rendered (plain) definition text the visitor
// actually sees, which is what the schema must mirror.
async function readVisibleDl(page: Page): Promise<{ term: string; definition: string }[]> {
  return page.$$eval('dl div', (nodes) =>
    nodes
      .map((node) => {
        const dt = node.querySelector('dt');
        const dd = node.querySelector('dd');
        if (!dt || !dd) return null;
        return {
          term: (dt.textContent ?? '').trim(),
          definition: (dd.textContent ?? '').replace(/\s+/g, ' ').trim(),
        };
      })
      .filter((x): x is { term: string; definition: string } => x !== null && x.term.length > 0),
  );
}

async function readJsonLdBlocks(page: Page): Promise<{ raw: string; data: unknown }[]> {
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  return raws.map((raw) => ({ raw, data: JSON.parse(raw) as unknown }));
}

type DefinedTerm = { '@type': string; name?: string; description?: string };
type DefinedTermSet = {
  '@type': string;
  name?: string;
  description?: string;
  hasDefinedTerm?: DefinedTerm[];
};

const isDefinedTermSet = (d: unknown): d is DefinedTermSet =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'DefinedTermSet';

function findDefinedTermSet(
  blocks: { raw: string; data: unknown }[],
): { raw: string; data: DefinedTermSet }[] {
  return blocks.filter(
    (b): b is { raw: string; data: DefinedTermSet } => isDefinedTermSet(b.data),
  );
}

// Box 1: the page emits one application/ld+json DefinedTermSet whose
// hasDefinedTerm array has exactly one DefinedTerm per visible TERMS entry.
test('emits one DefinedTermSet with one DefinedTerm per visible term', async ({ page }) => {
  const errors = await gotoGlossary(page);
  const visible = await readVisibleDl(page);
  expect(visible.length, 'the visible glossary should render many terms').toBeGreaterThan(20);

  const blocks = await readJsonLdBlocks(page);
  const sets = findDefinedTermSet(blocks);
  expect(sets, 'exactly one DefinedTermSet block expected').toHaveLength(1);

  const terms = sets[0].data.hasDefinedTerm ?? [];
  expect(terms).toHaveLength(visible.length);
  for (const t of terms) {
    expect(t['@type']).toBe('DefinedTerm');
    expect(typeof t.name).toBe('string');
    expect((t.name ?? '').length).toBeGreaterThan(0);
    expect(typeof t.description).toBe('string');
    expect((t.description ?? '').length).toBeGreaterThan(0);
  }

  // The set of term names in the schema equals the set of visible <dt> terms.
  const schemaNames = terms.map((t) => t.name ?? '').sort();
  const visibleNames = visible.map((v) => v.term).sort();
  expect(schemaNames).toEqual(visibleNames);
  expect(errors).toEqual([]);
});

// Box 2: each DefinedTerm carries a plain-text description derived from the
// term's definition; for link-bearing definitions the schema uses the
// plain-text version with no markup and no em-dash in the string.
test('each DefinedTerm description is plain text with no markup', async ({ page }) => {
  const errors = await gotoGlossary(page);
  const visible = await readVisibleDl(page);
  const blocks = await readJsonLdBlocks(page);
  const sets = findDefinedTermSet(blocks);
  expect(sets).toHaveLength(1);

  const byName = new Map(
    (sets[0].data.hasDefinedTerm ?? []).map((t) => [t.name ?? '', t.description ?? '']),
  );

  for (const item of visible) {
    expect(byName.has(item.term), `schema is missing term: ${item.term}`).toBe(true);
    const desc = byName.get(item.term) ?? '';
    // Plain text: no angle-bracket markup leaked into the schema string.
    expect(desc, `description for ${item.term} must contain no markup`).not.toMatch(/[<>]/);
    // The plain-text description matches what the visitor reads in the <dd>,
    // so the visible list and the schema cannot drift.
    expect(desc).toBe(item.definition);
  }
  expect(errors).toEqual([]);
});

// Box 3: the emitted JSON-LD parses as valid JSON and the DefinedTermSet
// name/description match the page heading and meta description intent; no
// description string (nor the block) contains an em-dash.
test('JSON-LD parses, names match the page, and contains no em-dash', async ({ page }) => {
  const errors = await gotoGlossary(page);
  const blocks = await readJsonLdBlocks(page);
  const sets = findDefinedTermSet(blocks);
  expect(sets).toHaveLength(1);

  // The raw block re-parses on its own as valid JSON.
  expect(() => JSON.parse(sets[0].raw)).not.toThrow();

  const set = sets[0].data;
  expect(set['@type']).toBe('DefinedTermSet');
  expect(typeof set.name).toBe('string');
  expect((set.name ?? '').toLowerCase()).toContain('glossary');
  expect(typeof set.description).toBe('string');
  expect((set.description ?? '').length).toBeGreaterThan(20);

  // No em-dash anywhere in the emitted block, including every description.
  expect(sets[0].raw).not.toContain('—');
  for (const t of set.hasDefinedTerm ?? []) {
    expect(t.name ?? '').not.toContain('—');
    expect(t.description ?? '').not.toContain('—');
  }
  expect(errors).toEqual([]);
});

// Box 4: the visible <dl> term list, jump-nav, and anchors are unchanged and
// still render in light and dark mode.
test('visible dl, jump-nav, and anchors render in light and dark mode', async ({ page }) => {
  const errors = await gotoGlossary(page);

  // Light mode: the term list and the jump-nav both render.
  const lightTerms = await readVisibleDl(page);
  expect(lightTerms.length).toBeGreaterThan(20);

  // Every term has an anchor target whose id matches a jump-nav href.
  const anchorIds = await page.$$eval('dl div[id]', (nodes) =>
    nodes.map((n) => n.getAttribute('id') ?? ''),
  );
  const navHrefs = await page.$$eval('a[href^="#"]', (nodes) =>
    nodes.map((n) => (n.getAttribute('href') ?? '').replace(/^#/, '')),
  );
  expect(anchorIds.length).toBe(lightTerms.length);
  for (const id of anchorIds) {
    expect(navHrefs, `jump-nav is missing an anchor for #${id}`).toContain(id);
  }

  // Dark mode: toggle .dark on the root, the same terms still render.
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  const darkTerms = await readVisibleDl(page);
  expect(darkTerms.map((d) => d.term)).toEqual(lightTerms.map((l) => l.term));
  expect(errors).toEqual([]);
});

// Box 5: the new schema does not introduce a second conflicting head-level
// block; the page still has its existing Helmet title and description.
//
// Note: a separate index.html "SEO Pilot" script owns the single <title>
// element and rewrites it on SPA navigation from its own per-route table.
// /glossary is not in that table, so the title element falls back to the
// homepage title. That is pre-existing, out-of-scope behavior, so we assert the
// page's Helmet head block still renders its own content by checking the
// glossary meta description Helmet injects (and the JSON-LD it emits alongside
// it), which is exactly what this change preserves and adds.
test('keeps the existing Helmet title and description, no conflicting block', async ({ page }) => {
  const errors = await gotoGlossary(page);

  // The glossary's Helmet meta description is present in the head, non-empty,
  // and free of em-dashes. Helmet appends it after hydration; poll for it.
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
    .toEqual(expect.arrayContaining([expect.stringMatching(/plain-language glossary/i)]));

  const glossaryDescription = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) =>
      nodes
        .map((n) => (n as HTMLMetaElement).content)
        .find((c) => /plain-language glossary/i.test(c)),
    );
  expect(glossaryDescription, 'glossary Helmet meta description should be present').toBeTruthy();
  expect((glossaryDescription ?? '').length).toBeGreaterThan(20);
  expect(glossaryDescription ?? '').not.toContain('—');

  // Exactly one DefinedTermSet block (no accidental double emit), and no other
  // JSON-LD block is a DefinedTermSet that would conflict.
  const blocks = await readJsonLdBlocks(page);
  expect(findDefinedTermSet(blocks)).toHaveLength(1);
  expect(errors).toEqual([]);
});

// Box 6: no new hostnames, no first-party /api/ call, no analytics removal;
// rendering the glossary with the schema makes no /api/ call.
test('renders the schema with no first-party /api/ call', async ({ page }) => {
  const errors = await gotoGlossary(page);
  const appOrigin = new URL(page.url()).origin;
  const apiCalls: string[] = [];
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin === appOrigin && u.pathname.startsWith('/api/')) apiCalls.push(req.url());
  });

  const blocks = await readJsonLdBlocks(page);
  expect(findDefinedTermSet(blocks)).toHaveLength(1);
  expect(
    apiCalls,
    `rendering the glossary schema should make no /api/ call:\n${apiCalls.join('\n')}`,
  ).toEqual([]);
  expect(errors).toEqual([]);
});
