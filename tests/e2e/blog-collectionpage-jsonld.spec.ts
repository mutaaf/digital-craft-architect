import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';
import { blogPosts } from '../../src/data/blogPosts';

// Ticket 0079 - Emit CollectionPage + ItemList + BreadcrumbList JSON-LD
// on the /blog index. Each test maps 1:1 to an acceptance-criteria box
// on the ticket. Modeled on `tests/e2e/case-studies-hub.spec.ts`
// (ticket 0057) and `tests/e2e/compare-hub.spec.ts` (ticket 0048),
// which are the closest peers for "hub page emitting CollectionPage +
// ItemList + BreadcrumbList".
//
// Per the 2026-05-30 second-@type lesson the implementer grepped every
// `tests/e2e/*.spec.ts` for `=== 'CollectionPage'`, `=== 'ItemList'`,
// AND `=== 'BreadcrumbList'` predicates BEFORE writing code. Every
// predecessor "exactly one" / `toHaveLength(1)` assertion over any of
// those three @types is URL-scoped to a route this PR does NOT touch
// (see the ticket Implementation log for the full inventory), so the
// new blocks on `/blog` cannot collide with `/compare`,
// `/case-studies`, `/subprocessors`, `/ai-for-hospitality`,
// `/changelog`, `/demos`, or any per-detail-page BreadcrumbList.
//
// Per the 2026-09-05 route-fallback + 2026-09-10 mount-signal lessons,
// the `gotoBlogIndex` helper polls innerHTML length, then waits for
// the RouteFallback loading indicator to detach, then waits for the
// first `article` card to be visible - the lazy `Blog` chunk mounts
// after Suspense fallback detaches, and reading JSON-LD before real
// mount races the Helmet head swap.
//
// Per the 2026-09-08 em-dash-scoping lesson, the em-dash assertion is
// scoped to blocks the /blog page OWNS (BreadcrumbList + CollectionPage
// + ItemList), NOT the site-wide Organization block that
// `index.html` injects on every route (ticket 0025's Organization
// block carries a legitimate historical em-dash and is out of scope).

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the brand-voice Hard NO bans the literal character even in tests).
const EM_DASH = String.fromCharCode(8212);

const ORIGIN = 'https://digitalcraftai.com';
const HUB_URL = `${ORIGIN}/blog`;

async function gotoBlogIndex(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/blog', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /blog').not.toBeNull();
  expect(response!.status(), `/blog returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  // 2026-09-05: RouteFallback detach.
  await page
    .locator('[role="status"][aria-label="Loading"]')
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .catch(() => {});
  // 2026-09-10: mount-signal - wait for the first article card to appear.
  await page
    .locator('article')
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 })
    .catch(() => {});
  return errors;
}

async function gotoPath(page: Page, path: string): Promise<string[]> {
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
  await page
    .locator('[role="status"][aria-label="Loading"]')
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .catch(() => {});
  await page
    .locator('h1')
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 })
    .catch(() => {});
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
  // Poll further until the CollectionPage block for /blog is present, so we
  // never race the Helmet swap during initial mount of the lazy chunk.
  await expect
    .poll(
      () =>
        page.$$eval('script[type="application/ld+json"]', (nodes) =>
          nodes
            .map((n) => {
              try {
                return JSON.parse(n.textContent ?? '') as { '@type'?: string; url?: string };
              } catch {
                return null;
              }
            })
            .some(
              (d) =>
                d !== null &&
                d['@type'] === 'CollectionPage' &&
                d.url === 'https://digitalcraftai.com/blog',
            ),
        ),
      { timeout: 10_000 },
    )
    .toBe(true);
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  return raws.map((raw) => ({ raw, data: JSON.parse(raw) as unknown }));
}

type ListItem = {
  '@type': string;
  position?: number;
  name?: string;
  url?: string;
  item?: {
    '@type'?: string;
    '@id'?: string;
    headline?: string;
    url?: string;
    datePublished?: string;
    author?: { '@type'?: string; name?: string; url?: string };
  };
};
type ItemList = {
  '@context'?: string;
  '@type': string;
  '@id'?: string;
  name?: string;
  itemListOrder?: string;
  numberOfItems?: number;
  itemListElement?: ListItem[];
};
type CollectionPage = {
  '@context'?: string;
  '@type': string;
  name?: string;
  description?: string;
  url?: string;
  inLanguage?: string;
  isPartOf?: { '@type'?: string; url?: string };
  mainEntity?: { '@id'?: string };
};
type BreadcrumbItem = { '@type': string; position?: number; name?: string; item?: string };
type Breadcrumb = {
  '@context'?: string;
  '@type': string;
  itemListElement?: BreadcrumbItem[];
};
type BlogPosting = {
  '@type'?: string;
  headline?: string;
  url?: string;
};

const isItemList = (d: unknown): d is ItemList =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'ItemList';

const isCollectionPage = (d: unknown): d is CollectionPage =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'CollectionPage';

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

const isBlogPosting = (d: unknown): d is BlogPosting =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BlogPosting';

// Box 1 (renders): /blog renders with H1 "Blog" and errors are ignorable.
test('renders /blog with an H1 that contains "Blog"', async ({ page }) => {
  const errors = await gotoBlogIndex(page);

  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const h1Text = ((await h1.textContent()) ?? '').toLowerCase();
  expect(h1Text).toContain('blog');

  expect(errors).toEqual([]);
});

// Box 2 (CollectionPage): exactly one CollectionPage block on /blog with
// name "Digital Craft AI Blog", url the /blog URL, inLanguage en-US,
// mainEntity referencing the ItemList via its @id.
test('emits exactly one CollectionPage block with the expected shape', async ({ page }) => {
  const errors = await gotoBlogIndex(page);
  const blocks = await readJsonLdBlocks(page);

  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  expect(collections, 'exactly one CollectionPage block expected on /blog').toHaveLength(1);

  const cp = collections[0].data;
  expect(cp['@context']).toBe('https://schema.org');
  expect(cp['@type']).toBe('CollectionPage');
  expect(cp.name).toBe('Digital Craft AI Blog');
  expect(cp.url).toBe(HUB_URL);
  expect(cp.inLanguage).toBe('en-US');
  expect(cp.isPartOf).toBeTruthy();
  expect(cp.isPartOf!['@type']).toBe('WebSite');
  expect(cp.isPartOf!.url).toBe(ORIGIN);
  expect(cp.mainEntity).toBeTruthy();
  expect(cp.mainEntity!['@id']).toBe(`${HUB_URL}#posts`);
  expect(typeof cp.description).toBe('string');
  expect((cp.description ?? '').length).toBeGreaterThan(20);

  expect(errors).toEqual([]);
});

// Box 3 (ItemList): exactly one ItemList block with numberOfItems ===
// blogPosts.length, itemListOrder Descending, each ListItem 1-indexed
// with absolute URL, name mirroring blogPosts[i].title byte-for-byte,
// item nested as BlogPosting with datePublished parseable.
test('emits exactly one ItemList block mirroring blogPosts', async ({ page }) => {
  const errors = await gotoBlogIndex(page);
  const blocks = await readJsonLdBlocks(page);

  const lists = blocks.filter((b): b is { raw: string; data: ItemList } => isItemList(b.data));
  expect(lists, 'exactly one ItemList block expected on /blog').toHaveLength(1);

  const list = lists[0].data;
  expect(list['@context']).toBe('https://schema.org');
  expect(list['@type']).toBe('ItemList');
  expect(list['@id']).toBe(`${HUB_URL}#posts`);
  expect(list.itemListOrder).toBe('https://schema.org/ItemListOrderDescending');
  expect(list.numberOfItems).toBe(blogPosts.length);

  const items = list.itemListElement ?? [];
  expect(items.length).toBe(blogPosts.length);

  const slugRe = /^https:\/\/digitalcraftai\.com\/blog\/[a-z0-9-]+$/;
  for (let i = 0; i < blogPosts.length; i++) {
    const it = items[i];
    const entry = blogPosts[i];
    expect(it['@type']).toBe('ListItem');
    expect(it.position).toBe(i + 1);
    expect(it.name).toBe(entry.title);
    expect(it.url).toBe(`${ORIGIN}/blog/${entry.slug}`);
    expect(it.url).toMatch(slugRe);

    expect(it.item).toBeTruthy();
    expect(it.item!['@type']).toBe('BlogPosting');
    expect(it.item!['@id']).toBe(`${ORIGIN}/blog/${entry.slug}`);
    expect(it.item!.url).toBe(`${ORIGIN}/blog/${entry.slug}`);
    expect(it.item!.headline).toBe(entry.title);
    expect(typeof it.item!.datePublished).toBe('string');
    expect(!isNaN(Date.parse(it.item!.datePublished ?? ''))).toBe(true);

    expect(it.item!.author).toBeTruthy();
    expect(it.item!.author!['@type']).toBe('Organization');
    expect(it.item!.author!.name).toBe(entry.author);
    expect(it.item!.author!.url).toBe(ORIGIN);
  }

  expect(errors).toEqual([]);
});

// Box 4 (BreadcrumbList): exactly one BreadcrumbList block on /blog with
// two levels (Home, Blog).
test('emits exactly one BreadcrumbList block with two levels (Home -> Blog)', async ({
  page,
}) => {
  const errors = await gotoBlogIndex(page);
  const blocks = await readJsonLdBlocks(page);

  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(
    breadcrumbs,
    'exactly one BreadcrumbList block expected on /blog',
  ).toHaveLength(1);

  const bc = breadcrumbs[0].data;
  expect(bc['@context']).toBe('https://schema.org');
  const items = bc.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect(items[0]['@type']).toBe('ListItem');
  expect(items[0].position).toBe(1);
  expect(items[0].name).toBe('Home');
  expect(items[0].item).toBe(ORIGIN);
  expect(items[1]['@type']).toBe('ListItem');
  expect(items[1].position).toBe(2);
  expect(items[1].name).toBe('Blog');
  expect(items[1].item).toBe(HUB_URL);

  expect(errors).toEqual([]);
});

// Box 5 (em-dash): every /blog-owned JSON-LD block string is em-dash-free.
// Scoped to blocks THIS PAGE owns per the 2026-09-08 lesson (the site-wide
// Organization block from index.html carries a legitimate historical
// em-dash and is out of scope).
test('/blog-emitted JSON-LD blocks contain no U+2014 em-dash', async ({ page }) => {
  const errors = await gotoBlogIndex(page);
  const blocks = await readJsonLdBlocks(page);

  const ours = blocks.filter(
    (b) => isBreadcrumb(b.data) || isCollectionPage(b.data) || isItemList(b.data),
  );
  expect(
    ours.length,
    '/blog must emit BreadcrumbList + CollectionPage + ItemList',
  ).toBe(3);
  for (const b of ours) {
    expect(b.raw, `/blog JSON-LD block contains em-dash: ${b.raw}`).not.toContain(
      EM_DASH,
    );
  }

  expect(errors).toEqual([]);
});

// Box 6 (mirror-source): the LAST `meta[name="description"]` content (the
// Helmet-appended one per the 2026-05-25 Helmet-appends lesson) equals
// CollectionPage.description byte-for-byte.
test('CollectionPage.description mirrors Helmet meta[name="description"] byte-for-byte', async ({
  page,
}) => {
  const errors = await gotoBlogIndex(page);

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
  const collections = blocks.filter((b): b is { raw: string; data: CollectionPage } =>
    isCollectionPage(b.data),
  );
  expect(collections).toHaveLength(1);
  expect(collections[0].data.description).toBe(helmetDescription);

  expect(errors).toEqual([]);
});

// Box 7 (leaf regression): /blog/<slug of newest post> still emits
// exactly one BlogPosting block whose headline equals blogPosts[0].title.
test('leaf blog post still emits its BlogPosting JSON-LD unchanged', async ({ page }) => {
  const newest = blogPosts[0];
  const errors = await gotoPath(page, `/blog/${newest.slug}`);

  await expect
    .poll(
      () => page.$$eval('script[type="application/ld+json"]', (nodes) => nodes.length),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);

  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  const parsed = raws
    .map((r) => {
      try {
        return JSON.parse(r) as unknown;
      } catch {
        return null;
      }
    })
    .filter((d): d is unknown => d !== null);

  const postings = parsed.filter(isBlogPosting);
  expect(postings, 'exactly one BlogPosting block on /blog/<slug>').toHaveLength(1);
  expect(postings[0].headline).toBe(newest.title);
  expect(postings[0].url ?? `${ORIGIN}/blog/${newest.slug}`).toContain(newest.slug);

  expect(errors).toEqual([]);
});

// Box 8 (homepage regression): / renders no CollectionPage block whose
// url is https://digitalcraftai.com/blog (guards against a Helmet leak
// via index.html).
test('/ does not emit a CollectionPage block pointing at /blog', async ({ page }) => {
  const errors = await gotoPath(page, '/');

  await expect
    .poll(
      () => page.$$eval('script[type="application/ld+json"]', (nodes) => nodes.length),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);

  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  const parsed = raws
    .map((r) => {
      try {
        return JSON.parse(r) as unknown;
      } catch {
        return null;
      }
    })
    .filter((d): d is unknown => d !== null);

  const blogCollections = parsed.filter(
    (d): d is CollectionPage => isCollectionPage(d) && d.url === HUB_URL,
  );
  expect(
    blogCollections,
    '/ must NOT emit a CollectionPage block with url === /blog',
  ).toHaveLength(0);

  expect(errors).toEqual([]);
});
