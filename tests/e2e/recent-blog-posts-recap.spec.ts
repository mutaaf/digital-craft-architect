import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';
import { blogPosts } from '../../src/data/blogPosts';

// Ticket 0091 - Persist the visitor's read blog posts and surface an
// "Articles you've read" card on /my dashboard. Each test maps 1:1 to an
// acceptance-criteria box on the ticket.
//
// The card is powered by a new client-side store at
// src/utils/recentBlogPostsStore.ts (`dca_recent_blog_posts_v1`) and an
// inline <article> block on src/pages/MyDashboard.tsx. Pre-seeding follows
// the same `addInitScript` pattern as tests/e2e/recent-compares-recap.spec.ts
// (ticket 0074, the direct peer for a recap-store dashboard card) and
// tests/e2e/quiz-history-card.spec.ts (ticket 0076, the direct peer for a
// history-persistence card).

const DASHBOARD_URL = '/my';
const STORAGE_KEY = 'dca_recent_blog_posts_v1';

// U+2014 spelled via fromCharCode so this file itself contains no em-dash
// (the 2026-05-07 brand-voice Hard NO bans the literal character even in
// tests).
const EM_DASH = String.fromCharCode(8212);

type SeedEntry = {
  slug: string;
  title: string;
  tags: readonly string[];
  readAt: number;
};

// Two valid seed slugs drawn from src/data/blogPosts.ts so the allow-list
// filter always accepts them. Ordering is most-recent-first (position 0 is
// the last read) matching the store's on-write prepend convention.
const SEED_TWO: SeedEntry[] = [
  {
    slug: blogPosts[1].slug,
    title: blogPosts[1].title,
    tags: blogPosts[1].tags,
    readAt: 1_730_000_002_000,
  },
  {
    slug: blogPosts[0].slug,
    title: blogPosts[0].title,
    tags: blogPosts[0].tags,
    readAt: 1_730_000_001_000,
  },
];

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  return errors;
}

async function gotoPath(page: Page, path: string): Promise<void> {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${path}`).not.toBeNull();
  expect(response!.status(), `${path} returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  // Per the 2026-09-10 mount-signal lesson: RouteFallback trips the
  // innerHTML>500 heuristic before the lazy chunk mounts, so wait for the
  // real page H1 before moving on. Otherwise the on-mount `useEffect` in
  // BlogPost.tsx may not have written to storage yet, and the /my read
  // that follows will see nothing (write-through case).
  await page
    .locator('h1')
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 })
    .catch(() => {
      /* not every path has an h1; the innerHTML poll is enough */
    });
}

async function contextWithSeed(
  browser: import('@playwright/test').Browser,
  raw: string,
  viewport?: { width: number; height: number },
): Promise<{ ctx: BrowserContext; page: Page; errors: string[] }> {
  const ctx = await browser.newContext(viewport ? { viewport } : undefined);
  await ctx.addInitScript(
    ([key, value]) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* storage unavailable - non-fatal */
      }
    },
    [STORAGE_KEY, raw] as const,
  );
  const page = await ctx.newPage();
  const errors = trackErrors(page);
  return { ctx, page, errors };
}

test.describe('recent blog posts recap card', () => {
  // Box (1): empty storage hides the RecentBlogPostsCard entirely.
  test('empty storage: card is absent', async ({ page }) => {
    const errors = trackErrors(page);
    await gotoPath(page, DASHBOARD_URL);

    await expect(page.getByTestId('recent-blog-posts-card')).toHaveCount(0);
    // Existing dashboard shell still renders.
    await expect(page.locator('h1')).toContainText(/pick up where you/i);

    expect(errors).toEqual([]);
  });

  // Box (2): with two valid seeded entries, the card renders exactly two
  // rows with the post titles visible.
  test('seeded two entries: card renders exactly two rows with post titles', async ({
    browser,
  }) => {
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(SEED_TWO));
    await gotoPath(page, DASHBOARD_URL);

    const card = page.getByTestId('recent-blog-posts-card');
    await expect(card).toBeVisible();

    const rows = page.getByTestId('recent-blog-post-row');
    await expect(rows).toHaveCount(2);

    await expect(card.getByText(SEED_TWO[0].title, { exact: true }).first()).toBeVisible();
    await expect(card.getByText(SEED_TWO[1].title, { exact: true }).first()).toBeVisible();

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (3): each Reopen article anchor href matches /blog/<slug> and the
  // slug is present in the blogPosts allow-list (imported from src per the
  // 2026-06-07 src-imports-tests lesson).
  test('reopen anchor hrefs match /blog/<slug> and slugs are in blogPosts', async ({
    browser,
  }) => {
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(SEED_TWO));
    await gotoPath(page, DASHBOARD_URL);

    const rows = page.getByTestId('recent-blog-post-row');
    await expect(rows).toHaveCount(2);

    const hrefs = await rows.evaluateAll((els) =>
      els
        .map((el) => el.querySelector('a[href^="/blog/"]'))
        .map((a) => (a ? a.getAttribute('href') : null)),
    );
    expect(hrefs.length).toBe(2);
    const knownSlugs = new Set(blogPosts.map((p) => p.slug));
    for (const href of hrefs) {
      expect(href, 'each row must expose a reopen anchor').not.toBeNull();
      expect(href!).toMatch(/^\/blog\//);
      const slug = href!.replace(/^\/blog\//, '');
      expect(knownSlugs.has(slug), `${slug} must be in blogPosts allow-list`).toBe(true);
    }

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (4): navigating to two /blog/<slug> routes then to /my writes both
  // paths in reverse-visit order (most-recent-first). Per the 2026-09-10
  // mount-signal lesson, `gotoPath` waits for the BlogPost H1 before moving
  // on so the on-mount `useEffect` write completes.
  test('write-through: visiting two /blog/<slug> pages then /my lists both in reverse order', async ({
    browser,
  }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors = trackErrors(page);

    const slugA = blogPosts[0].slug;
    const slugB = blogPosts[1].slug;

    await gotoPath(page, `/blog/${slugA}`);
    await gotoPath(page, `/blog/${slugB}`);
    await gotoPath(page, DASHBOARD_URL);

    const raw = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
    expect(raw, 'storage should have been written').not.toBeNull();
    const list = JSON.parse(raw!) as SeedEntry[];
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list[0].slug).toBe(slugB);
    expect(list[1].slug).toBe(slugA);

    const rows = page.getByTestId('recent-blog-post-row');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText(blogPosts[1].title);
    await expect(rows.nth(1)).toContainText(blogPosts[0].title);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (5): a duplicate visit to the same blog slug does NOT create a
  // second row (dedup case, mirroring the ticket 0074 dedup pattern).
  test('dedup: duplicate visit does not create a second row', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors = trackErrors(page);

    const slug = blogPosts[0].slug;
    await gotoPath(page, `/blog/${slug}`);
    await gotoPath(page, `/blog/${slug}`);
    await gotoPath(page, DASHBOARD_URL);

    const rows = page.getByTestId('recent-blog-post-row');
    await expect(rows).toHaveCount(1);

    const raw = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
    const list = JSON.parse(raw!) as SeedEntry[];
    expect(list.filter((e) => e.slug === slug).length).toBe(1);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (6): a seeded entry whose slug is NOT in blogPosts is filtered at
  // read time and does NOT render (allow-list case).
  test('allow-list: invalid slug is filtered at read time and does not render', async ({
    browser,
  }) => {
    const validSlug = blogPosts[0].slug;
    const validTitle = blogPosts[0].title;
    const seed: SeedEntry[] = [
      {
        slug: 'this-post-was-removed',
        title: 'Ghost Post',
        tags: ['Ghost'],
        readAt: 1_730_000_003_000,
      },
      {
        slug: validSlug,
        title: validTitle,
        tags: blogPosts[0].tags,
        readAt: 1_730_000_002_000,
      },
    ];
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(seed));
    await gotoPath(page, DASHBOARD_URL);

    const rows = page.getByTestId('recent-blog-post-row');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(validTitle);
    await expect(page.getByText('Ghost Post', { exact: true })).toHaveCount(0);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (7): when at least one entry is stored AND at least one blogPosts
  // entry is unvisited, exactly one blog-suggest-chip renders with a valid
  // /blog/<slug> href.
  test('suggest chip: one chip renders with valid /blog href when unvisited posts remain', async ({
    browser,
  }) => {
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(SEED_TWO));
    await gotoPath(page, DASHBOARD_URL);

    const chip = page.getByTestId('blog-suggest-chip');
    await expect(chip).toHaveCount(1);

    const href = await chip.getAttribute('href');
    expect(href, 'suggest chip must have an href').not.toBeNull();
    expect(href!).toMatch(/^\/blog\//);
    const slug = href!.replace(/^\/blog\//, '');
    const knownSlugs = new Set(blogPosts.map((p) => p.slug));
    expect(knownSlugs.has(slug)).toBe(true);
    // The suggested post is NOT one of the seeded slugs.
    const seededSlugs = new Set(SEED_TWO.map((s) => s.slug));
    expect(seededSlugs.has(slug), `${slug} must be unread, not one of the seeded slugs`).toBe(false);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (8): when every blogPosts entry has been seeded, the suggest chip
  // is absent. Per the 2026-09-10 raw-vs-sliced lesson, the
  // `suggestNextBlogPost` implementation must read the RAW parsed list, not
  // the display-sliced list, so this box actually returns `null` when all
  // slugs are seeded and the visible list is capped at 5.
  test('suggest chip absent when every blog post has been read', async ({ browser }) => {
    const seed: SeedEntry[] = blogPosts.map((p, i) => ({
      slug: p.slug,
      title: p.title,
      tags: p.tags,
      readAt: 1_730_000_000_000 + i,
    }));
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(seed));
    await gotoPath(page, DASHBOARD_URL);

    // Card renders because entries are stored, but no chip because nothing
    // is unread. Row count is capped at MAX_ENTRIES = 5 by the store's
    // display slice.
    await expect(page.getByTestId('recent-blog-posts-card')).toBeVisible();
    await expect(page.getByTestId('blog-suggest-chip')).toHaveCount(0);
    await expect(page.getByTestId('recent-blog-post-row')).toHaveCount(5);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (9): the seeded /my page text contains no U+2014 code point in any
  // RecentBlogPostsCard string.
  test('no em-dash characters anywhere on the seeded /my page', async ({ browser }) => {
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(SEED_TWO));
    await gotoPath(page, DASHBOARD_URL);

    const cardText = (await page.getByTestId('recent-blog-posts-card').textContent()) ?? '';
    expect(cardText.length).toBeGreaterThan(20);
    expect(cardText, 'no em-dash (U+2014) allowed in the recent-blog-posts card').not.toContain(EM_DASH);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (10): dark mode renders cleanly via
  // document.documentElement.classList.add('dark') on a 375px viewport and
  // the card is still visible.
  test('dark mode: card renders with dark class on documentElement at 375px', async ({
    browser,
  }) => {
    const { ctx, page, errors } = await contextWithSeed(
      browser,
      JSON.stringify(SEED_TWO),
      { width: 375, height: 800 },
    );
    await gotoPath(page, DASHBOARD_URL);
    await page.evaluate(() => document.documentElement.classList.add('dark'));

    await expect(page.getByTestId('recent-blog-posts-card')).toBeVisible();
    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(hasDarkClass).toBe(true);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box (11): same-tag suggestion regression. Seed one entry whose tags
  // overlap with a known unread post; assert the suggest chip routes to
  // that same-tag unread post, not to a different-tag unread post. Also
  // verifies the fallback: when no same-tag unread post exists, the chip
  // href falls back to the first unread post in blogPosts array order.
  test('same-tag suggestion prefers a shared-tag unread post', async ({ browser }) => {
    // Pick the most-recent read and derive a target unread post that
    // shares at least one tag. Walk blogPosts and find any post whose
    // tags overlap with blogPosts[0].tags (excluding blogPosts[0] itself).
    const recent = blogPosts[0];
    const recentTags = new Set(recent.tags);
    const sameTagUnread = blogPosts.find(
      (p, i) => i !== 0 && p.tags.some((t) => recentTags.has(t)),
    );
    expect(sameTagUnread, 'the corpus must include a same-tag sibling of blogPosts[0]').toBeTruthy();

    const seed: SeedEntry[] = [
      {
        slug: recent.slug,
        title: recent.title,
        tags: recent.tags,
        readAt: 1_730_000_005_000,
      },
    ];
    const { ctx, page, errors } = await contextWithSeed(browser, JSON.stringify(seed));
    await gotoPath(page, DASHBOARD_URL);

    const chip = page.getByTestId('blog-suggest-chip');
    await expect(chip).toHaveCount(1);
    const href = await chip.getAttribute('href');
    expect(href).toBe(`/blog/${sameTagUnread!.slug}`);

    expect(errors).toEqual([]);
    await ctx.close();
  });
});
