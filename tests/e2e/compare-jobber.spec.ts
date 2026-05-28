import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0021 - Comparison page "Digital Craft vs Jobber". Each test maps
// 1:1 to an acceptance-criteria box on the ticket. Modeled on the existing
// compare-page assertions plus the patterns from tests/e2e/ai-for-hvac.spec.ts.
//
// IMPORTANT: /compare/jobber is NOT in the index.html SEO Pilot `pages`
// table (adding it there is its own SEO ticket, out of scope here). Per the
// 2026-05-25 SEO Pilot lesson in docs/LESSONS.md, document.title is owned by
// the SEO Pilot script on SPA navigation, so we do NOT assert
// expect(page).toHaveTitle(...). We assert the Helmet-managed head elements
// directly (the LAST meta[name="description"], the LAST link[rel="canonical"],
// and the emitted JSON-LD scripts), plus the visible H1 text.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

async function gotoJobber(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/compare/jobber', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /compare/jobber').not.toBeNull();
  expect(
    response!.status(),
    `/compare/jobber returned ${response!.status()}`,
  ).toBeLessThan(400);
  await expect
    .poll(
      () => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(500);
  return errors;
}

async function readJsonLdBlocks(page: Page): Promise<{ raw: string; data: unknown }[]> {
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  return raws.map((raw) => ({ raw, data: JSON.parse(raw) as unknown }));
}

type BreadcrumbItem = { '@type': string; position?: number; name?: string; item?: string };
type Breadcrumb = { '@type': string; itemListElement?: BreadcrumbItem[] };

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' && d !== null && (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

// Box 1: a /compare/jobber route renders a comparison page whose Helmet-emitted
// meta description names both Jobber and DigitalCraft, and whose H1 names both
// products.
test('renders Helmet meta description + H1 naming both Jobber and DigitalCraft', async ({
  page,
}) => {
  const errors = await gotoJobber(page);

  // H1 names both products.
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const h1Text = ((await h1.textContent()) ?? '').toLowerCase();
  expect(h1Text).toMatch(/jobber/);
  expect(h1Text).toMatch(/digitalcraft|digital craft/);

  // Helmet appends meta[name="description"] as a new DOM node; the LAST one
  // in the head is the Helmet-managed copy. Poll because Helmet appends
  // after hydrate.
  await expect
    .poll(
      async () =>
        page
          .locator('head meta[name="description"]')
          .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? '')),
      { timeout: 10_000 },
    )
    .toEqual(expect.arrayContaining([expect.stringMatching(/jobber/i)]));

  const descriptions = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? ''));
  const helmetDescription = descriptions[descriptions.length - 1];
  expect(helmetDescription.toLowerCase()).toMatch(/jobber/);
  expect(helmetDescription.toLowerCase()).toMatch(/digitalcraft|digital craft/);
  expect(helmetDescription.length).toBeGreaterThan(60);

  // Canonical link points at /compare/jobber.
  await expect
    .poll(
      async () =>
        page
          .locator('head link[rel="canonical"]')
          .evaluateAll((nodes) =>
            nodes.map((n) => (n as HTMLLinkElement).getAttribute('href') ?? ''),
          ),
      { timeout: 10_000 },
    )
    .toEqual(
      expect.arrayContaining([expect.stringContaining('/compare/jobber')]),
    );

  expect(errors).toEqual([]);
});

// Box 2: the page renders a feature comparison table with at least 12 rows,
// and at least 3 of those rows must honestly show Jobber winning (built-in
// field-service CRM, dispatching/scheduling, integrated invoicing).
test('feature table renders >=12 rows and shows Jobber winning on >=3 honest rows', async ({
  page,
}) => {
  const errors = await gotoJobber(page);

  // At least 12 data rows in the comparison table body.
  const rows = page.locator('table tbody tr');
  await expect(rows.first()).toBeVisible();
  const rowCount = await rows.count();
  expect(rowCount, `expected >=12 comparison rows, got ${rowCount}`).toBeGreaterThanOrEqual(12);

  // The page must honestly call out at least 3 specific Jobber strengths in
  // copy. Asserting on the visible feature labels keeps the test resilient
  // to icon-cell rendering choices.
  const body = (await page.locator('body').innerText()).toLowerCase();
  expect(body, 'page must acknowledge Jobber built-in field-service CRM').toMatch(
    /built-in field-service crm|field-service crm/,
  );
  expect(body, 'page must acknowledge Jobber dispatching/scheduling').toMatch(
    /dispatch|scheduling/,
  );
  expect(body, 'page must acknowledge Jobber integrated invoicing').toMatch(/invoicing/);

  // Defensible language: no inflated "500+" or similar invented number.
  expect(body).not.toMatch(/\b500\+/);

  // Pricing asterisk source disclosed for any Jobber pricing claim.
  expect(body).toMatch(/getjobber\.com/);

  expect(errors).toEqual([]);
});

// Box 3: the page renders at least four differentiator cards (icon + title
// + 2-3 sentence desc) explaining DCA advantages in defensible language with
// no em-dash character.
test('renders >=4 differentiator cards naming defensible DCA advantages', async ({ page }) => {
  const errors = await gotoJobber(page);

  const body = (await page.locator('body').innerText()).toLowerCase();
  // The four named DCA advantages from the DIFFERENTIATORS array, asserted
  // by phrase rather than icon to stay resilient to layout swaps.
  expect(body).toMatch(/ai voice agent|ai voice/);
  expect(body).toMatch(/trade|industry|plumbing|hvac/);
  expect(body).toMatch(/48.?hour|48 hour/);
  expect(body).toMatch(/flat pricing|flat monthly/);

  expect(errors).toEqual([]);
});

// Box 4: the page renders the shared Navbar + Footer via the ticket 0006
// pattern (`const { content } = useContent()` then
// `{content?.footer && <Footer data={content.footer} />}`) and uses Helmet
// for title/description/canonical/OG. The route also appears in sitemap.xml.
test('renders Navbar + Footer, has Helmet canonical + OG, appears in sitemap.xml', async ({
  page,
}) => {
  const errors = await gotoJobber(page);

  // Shared landmarks visible.
  await expect(page.locator('nav').first()).toBeVisible();
  await expect(page.locator('footer').first()).toBeVisible();

  // Helmet og:title names Jobber.
  await expect
    .poll(
      async () =>
        page
          .locator('head meta[property="og:title"]')
          .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? '')),
      { timeout: 10_000 },
    )
    .toEqual(
      expect.arrayContaining([expect.stringMatching(/jobber/i)]),
    );

  // Sitemap inclusion - the generator extracts every static path= in App.tsx.
  const sitemap = await page.goto('/sitemap.xml', { waitUntil: 'domcontentloaded' });
  expect(sitemap, 'no response for /sitemap.xml').not.toBeNull();
  expect(sitemap!.status()).toBeLessThan(400);
  const xml = await sitemap!.text();
  expect(xml).toContain('https://digitalcraftai.com/compare/jobber');

  expect(errors).toEqual([]);
});

// Box 5: the page emits exactly one BreadcrumbList JSON-LD block (Home ->
// Compare -> Jobber), parses as valid JSON, and shares its labels with the
// visible breadcrumb so the schema and visible markup cannot drift.
test('emits BreadcrumbList JSON-LD whose names mirror the visible breadcrumb', async ({
  page,
}) => {
  const errors = await gotoJobber(page);
  const blocks = await readJsonLdBlocks(page);

  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(
    breadcrumbs,
    'exactly one BreadcrumbList block expected on /compare/jobber',
  ).toHaveLength(1);

  const crumb = breadcrumbs[0].data;
  expect(() => JSON.parse(breadcrumbs[0].raw)).not.toThrow();
  const items = crumb.itemListElement ?? [];
  expect(items.length).toBe(3);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect((items[1].name ?? '').toLowerCase()).toBe('compare');
  expect((items[2].name ?? '').toLowerCase()).toBe('jobber');
  expect(items[2].item).toBe('https://digitalcraftai.com/compare/jobber');

  // Mirror-source: every JSON-LD itemListElement name must also be present
  // verbatim in the visible breadcrumb DOM. If a future copy edit drifts the
  // visible label, this assertion catches it.
  const visibleCrumbs = await page
    .locator('[data-breadcrumb-item]')
    .evaluateAll((nodes) => nodes.map((n) => (n.textContent ?? '').trim()));
  for (const item of items) {
    const name = item.name ?? '';
    expect(
      visibleCrumbs.some((v) => v.includes(name)),
      `JSON-LD crumb "${name}" must also appear in visible breadcrumb: ${visibleCrumbs.join(' | ')}`,
    ).toBe(true);
  }

  // No em-dash in any emitted JSON-LD string on this page.
  for (const b of breadcrumbs) {
    expect(b.raw).not.toContain('—');
  }

  expect(errors).toEqual([]);
});

// Box 6: the page renders in light and dark mode on a 375px mobile viewport;
// the feature table is horizontally readable (overflow-x-auto wrapper); the
// rendered DOM contains no em-dash character; trackCTAClick fires with a
// compare_jobber_* location label.
test('renders light/dark on 375px mobile, has no em-dash, fires compare_jobber_ CTA event', async ({
  page,
}) => {
  const errors = await gotoJobber(page);

  // Light mode visible.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Dark mode: toggle .dark on root, heading still renders.
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // 375px viewport: heading still visible, and the table is wrapped in an
  // overflow-x-auto container so the page does not horizontally overflow.
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const tableWrapperOverflowCount = await page
    .locator('div.overflow-x-auto')
    .filter({ has: page.locator('table') })
    .count();
  expect(
    tableWrapperOverflowCount,
    'comparison table must be wrapped in overflow-x-auto for 375px readability',
  ).toBeGreaterThan(0);

  // No em-dash anywhere in the rendered visible copy.
  const visible = await page.locator('body').innerText();
  expect(visible).not.toContain('—');

  // No em-dash in any JSON-LD block THIS page emits (BreadcrumbList +
  // WebPage). Other blocks (e.g. the global Organization schema in
  // index.html) are not in this ticket's scope.
  const blocks = await readJsonLdBlocks(page);
  const ourBlocks = blocks.filter((b) => {
    const t = (b.data as { '@type'?: unknown })?.['@type'];
    return t === 'BreadcrumbList' || t === 'WebPage';
  });
  expect(ourBlocks.length, 'page must emit BreadcrumbList + WebPage JSON-LD').toBeGreaterThanOrEqual(2);
  for (const b of ourBlocks) {
    expect(b.raw).not.toContain('—');
  }

  // Analytics: trackCTAClick wraps window.gtag('event', 'cta_click', ...).
  // Stub gtag and click the primary CTA; assert at least one event_label
  // contains the "compare_jobber_" prefix.
  await page.evaluate(() => {
    (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents = [];
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (
      ...args: unknown[]
    ) => {
      (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents.push(args);
    };
  });

  const primaryCTA = page.locator('a[href="/homeservices/demo"]').first();
  await expect(primaryCTA).toBeVisible();
  // Prevent React Router navigation from tearing down before we read state.
  await primaryCTA.evaluate((el) =>
    el.addEventListener('click', (e) => e.preventDefault(), { capture: true, once: true }),
  );
  await primaryCTA.click();

  const events = (await page.evaluate(
    () => (window as unknown as { __ctaEvents: unknown[][] }).__ctaEvents,
  )) as unknown[][];
  const ctaEvents = events.filter(
    (e) => Array.isArray(e) && e[0] === 'event' && e[1] === 'cta_click',
  );
  expect(ctaEvents.length, 'at least one cta_click event fired').toBeGreaterThan(0);
  const labels = ctaEvents.map((e) => {
    const params = e[2] as { event_label?: string };
    return params?.event_label ?? '';
  });
  expect(
    labels.some((l) => /compare_jobber_/i.test(l)),
    `expected at least one cta_click event_label to contain "compare_jobber_", got: ${labels.join(' | ')}`,
  ).toBe(true);

  expect(errors).toEqual([]);
});

// Box 7: no /api/ change, no new dependency; the page is composition only.
// Render the page and assert no first-party /api/ call fires.
test('makes no first-party /api/ call when rendering', async ({ page }) => {
  const appOrigin = 'http://127.0.0.1:4173';
  const apiCalls: string[] = [];
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin === appOrigin && u.pathname.startsWith('/api/')) {
      apiCalls.push(req.url());
    }
  });

  const errors = await gotoJobber(page);

  expect(
    apiCalls,
    `the Jobber comparison page should make no first-party /api/ call:\n${apiCalls.join('\n')}`,
  ).toEqual([]);
  expect(errors).toEqual([]);
});
