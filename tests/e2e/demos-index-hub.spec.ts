import { test, expect, type Page } from '@playwright/test';
import { ROUTES, IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0011 - Crawlable /demos index hub with ItemList structured data.
// Each test maps 1:1 to an acceptance-criteria box on the ticket.
//
// /demos is a new top-level page that lists every live demo grouped by vertical,
// each with a title, a one-line description, and a working link to the demo
// route. It carries Helmet head (title, description, canonical), the shared
// Navbar + Footer, and emits ONE inline <script type="application/ld+json">
// ItemList block whose items mirror the rendered demo links.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// The set of static routes the app actually serves. Every demo link the page
// renders must resolve to one of these. Bare per-vertical hubs (e.g.
// /construction/demo) are routes too; the demo catalog points at the deeper
// /.../demo/<tool> routes.
const STATIC_ROUTES = new Set(ROUTES);

async function gotoDemos(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/demos', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /demos').not.toBeNull();
  expect(response!.status(), `/demos returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  return errors;
}

// All demo links rendered on the page: anchors/links whose href points at a
// /.../demo/<tool> route on the current origin.
async function readDemoLinks(page: Page): Promise<string[]> {
  return page.$$eval('a[href]', (nodes) =>
    nodes
      .map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? '')
      .filter((h) => /^\/[a-z-]+\/demo\/[a-z-]+$/.test(h)),
  );
}

async function readJsonLdBlocks(page: Page): Promise<{ raw: string; data: unknown }[]> {
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  return raws.map((raw) => ({ raw, data: JSON.parse(raw) as unknown }));
}

type ItemListElement = { '@type': string; position?: number; name?: string; url?: string };
type ItemList = { '@type': string; itemListElement?: ItemListElement[] };

const isItemList = (d: unknown): d is ItemList =>
  typeof d === 'object' && d !== null && (d as { '@type'?: unknown })['@type'] === 'ItemList';

function findItemList(blocks: { raw: string; data: unknown }[]): { raw: string; data: ItemList }[] {
  return blocks.filter((b): b is { raw: string; data: ItemList } => isItemList(b.data));
}

// Box 1: a new /demos route renders a page listing the live demos grouped or
// labeled by vertical, each with a title, a one-line description, and a working
// link to the demo route.
test('renders demo cards with title, description, and a demo link', async ({ page }) => {
  const errors = await gotoDemos(page);

  const links = await readDemoLinks(page);
  expect(links.length, 'page should render at least several demo links').toBeGreaterThan(10);

  // A recognizable page heading proves the page itself rendered (not a redirect
  // or NotFound).
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // At least one vertical label/grouping is shown (the page is grouped by
  // vertical, so a known industry name appears as a section label).
  const body = (await page.locator('body').innerText()).toLowerCase();
  expect(body).toContain('construction');
  expect(body).toContain('real estate');
  expect(errors).toEqual([]);
});

// Box 2: every link on the page resolves to an existing route (no dead links).
test('every demo link resolves to a real static route', async ({ page }) => {
  const errors = await gotoDemos(page);
  const links = await readDemoLinks(page);
  expect(links.length).toBeGreaterThan(10);

  const dead = links.filter((href) => !STATIC_ROUTES.has(href));
  expect(dead, `these demo links have no matching route:\n${dead.join('\n')}`).toEqual([]);
  expect(errors).toEqual([]);
});

// Box 3: the page emits one application/ld+json ItemList block whose items match
// the rendered demo links, following the existing JSON-LD pattern.
test('emits one ItemList whose items match the rendered demo links', async ({ page }) => {
  const errors = await gotoDemos(page);
  const links = await readDemoLinks(page);
  const blocks = await readJsonLdBlocks(page);

  const lists = findItemList(blocks);
  expect(lists, 'exactly one ItemList block expected').toHaveLength(1);

  const items = lists[0].data.itemListElement ?? [];
  expect(items.length, 'ItemList must be non-empty').toBeGreaterThan(0);
  for (const it of items) {
    expect(it['@type']).toBe('ListItem');
    expect(typeof it.name).toBe('string');
    expect((it.name ?? '').length).toBeGreaterThan(0);
    expect(typeof it.url).toBe('string');
  }

  // The set of URL paths in the ItemList equals the set of rendered demo links.
  const itemPaths = items
    .map((it) => {
      try {
        return new URL(it.url ?? '', 'https://digitalcraftai.com').pathname;
      } catch {
        return it.url ?? '';
      }
    })
    .sort();
  const linkPaths = [...new Set(links)].sort();
  expect(itemPaths).toEqual(linkPaths);
  expect(errors).toEqual([]);
});

// Box 4: the page has a canonical tag, title, and meta description via Helmet,
// and renders the shared Navbar and Footer.
test('has Helmet head (title, description, canonical) plus Navbar and Footer', async ({ page }) => {
  const errors = await gotoDemos(page);

  await expect(page).toHaveTitle(/demo/i);

  const description = await page
    .locator('head meta[name="description"]')
    .first()
    .getAttribute('content');
  expect(description, 'meta description should be present and non-empty').toBeTruthy();
  expect((description ?? '').length).toBeGreaterThan(20);

  const canonical = await page
    .locator('head link[rel="canonical"]')
    .first()
    .getAttribute('href');
  expect(canonical).toContain('/demos');

  // Shared Navbar: the brand link to home. Shared Footer: a footer landmark.
  await expect(page.locator('nav').first()).toBeVisible();
  await expect(page.locator('footer').first()).toBeVisible();
  expect(errors).toEqual([]);
});

// Box 5: the page renders in light and dark mode, is responsive on mobile, and
// contains no em-dash in its copy.
test('renders in light and dark mode, responsive, with no em-dash in copy', async ({ page }) => {
  const errors = await gotoDemos(page);

  // Light mode.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const lightLinks = await readDemoLinks(page);
  expect(lightLinks.length).toBeGreaterThan(10);

  // Dark mode: toggle .dark on the root, the page still renders its content.
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const darkLinks = await readDemoLinks(page);
  expect(darkLinks.sort()).toEqual(lightLinks.sort());

  // Mobile viewport: the heading and demo links still render.
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect((await readDemoLinks(page)).length).toBeGreaterThan(10);

  // No em-dash anywhere in the visible copy.
  const visibleText = await page.locator('body').innerText();
  expect(visibleText).not.toContain('—');
  expect(errors).toEqual([]);
});

// Box 6: the /demos route appears in the generated sitemap. The sitemap is
// generated at build into public/sitemap.xml from the path= attributes in
// App.tsx; serving it under the dev/preview server proves inclusion.
test('the /demos route is present in the generated sitemap', async ({ page }) => {
  const response = await page.goto('/sitemap.xml', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /sitemap.xml').not.toBeNull();
  expect(response!.status()).toBeLessThan(400);
  const xml = await response!.text();
  expect(xml).toContain('https://digitalcraftai.com/demos');
});
