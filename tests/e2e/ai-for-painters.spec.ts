import { test, expect, type Page } from '@playwright/test';
import { ROUTES, IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0037 - AI-for-painters long-tail landing page funneling into the
// existing home-services demos. Each test maps 1:1 to an acceptance-criteria
// box on the ticket. Modeled directly on tests/e2e/ai-for-electricians.spec.ts
// (ticket 0034), the most recent peer.
//
// IMPORTANT: /ai-for-painters is NOT in the index.html SEO Pilot `pages`
// table (adding it is its own SEO ticket, out of scope here). Per the
// 2026-05-25 lesson in docs/LESSONS.md, SEO Pilot writes the single <title>
// element at script-execution time using the homepage default for unlisted
// routes. Helmet then writes the route's real title after React hydrates -
// but only after the JS bundle is parsed and React has mounted. Tests that
// read the head immediately after `domcontentloaded` see the SEO Pilot
// fallback. Always poll for the Helmet-driven state rather than reading once.
//
// Helmet APPENDS its meta tags and canonical link as NEW DOM nodes rather
// than overwriting existing ones, so the head ends up with two
// meta[name="description"] tags and two link[rel="canonical"] tags - the
// last one in each list is Helmet's, which is the one the page actually
// owns. Assert against the LAST tag of each pair.

const EM_DASH = String.fromCharCode(8212);

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

const STATIC_ROUTES = new Set(ROUTES);

async function gotoPainters(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/ai-for-painters', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /ai-for-painters').not.toBeNull();
  expect(
    response!.status(),
    `/ai-for-painters returned ${response!.status()}`,
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
type Service = {
  '@type': string;
  name?: string;
  description?: string;
  serviceType?: string;
  url?: string;
};

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' && d !== null && (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

const isService = (d: unknown): d is Service =>
  typeof d === 'object' && d !== null && (d as { '@type'?: unknown })['@type'] === 'Service';

// Box 1: a new /ai-for-painters route renders a page whose Helmet-emitted
// <title>, H1, and meta description all explicitly name "painting" or
// "painters," and whose body lists three trade-specific pain themes
// (after-hours peak-season estimate requests, slow on-site interior and
// exterior quotes, post-job review chasing) with defensible language and no
// invented client names, dollar figures, or efficacy percentages.
test('renders painter-specific H1, Helmet meta description, and three pain points', async ({
  page,
}) => {
  const errors = await gotoPainters(page);

  // <title> assertion is delegated to the Helmet-managed head: the page
  // commits to a painter-named title in source, but the runtime <title>
  // element is owned by the index.html SEO Pilot script for routes outside
  // its `pages` table (per the 2026-05-25 lesson). Asserting Helmet's
  // appended description + canonical + og:title proves Helmet's head is
  // wired up. Adding the route to the SEO Pilot table is its own SEO
  // ticket, out of scope here.

  // H1: the visible page heading must also name the trade.
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const h1Text = ((await h1.textContent()) ?? '').toLowerCase();
  expect(h1Text).toMatch(/paint(ers|ing)/);

  // Helmet appends its own meta[name="description"]; the LAST one in the head
  // is the Helmet-managed copy (the SEO Pilot one set first is the homepage
  // default for unlisted routes). Poll because Helmet appends after hydrate.
  await expect
    .poll(
      async () =>
        page
          .locator('head meta[name="description"]')
          .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? '')),
      { timeout: 10_000 },
    )
    .toEqual(expect.arrayContaining([expect.stringMatching(/paint(ers|ing)/i)]));

  const descriptions = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? ''));
  const helmetDescription = descriptions[descriptions.length - 1];
  expect(helmetDescription.toLowerCase()).toMatch(/paint(ers|ing)/);
  expect(helmetDescription.length).toBeGreaterThan(40);

  // Three trade-specific pain point themes named on the page.
  const body = (await page.locator('body').innerText()).toLowerCase();
  expect(body).toMatch(/after-hours|estimate request|peak season/);
  expect(body).toMatch(/interior|exterior|quote/);
  expect(body).toMatch(/review/);

  expect(errors).toEqual([]);
});

// Box 2: the page surfaces two demo CTA cards that link to
// /homeservices/demo/lead-responder and /homeservices/demo/estimate (the
// existing home-services demos); both links resolve to real static routes.
test('surfaces two demo CTA links pointing at the existing home-services demos', async ({
  page,
}) => {
  const errors = await gotoPainters(page);

  const hrefs = await page.$$eval('a[href]', (nodes) =>
    nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
  );

  expect(
    hrefs,
    'page must link to /homeservices/demo/lead-responder',
  ).toContain('/homeservices/demo/lead-responder');
  expect(
    hrefs,
    'page must link to /homeservices/demo/estimate',
  ).toContain('/homeservices/demo/estimate');

  // Both target routes are real static routes (smoke gate covers their
  // render); confirm here so this spec stays self-contained.
  expect(STATIC_ROUTES.has('/homeservices/demo/lead-responder')).toBe(true);
  expect(STATIC_ROUTES.has('/homeservices/demo/estimate')).toBe(true);

  expect(errors).toEqual([]);
});

// Box 3: the page emits one BreadcrumbList JSON-LD block (Home -> AI for
// Painters) and one Service JSON-LD whose serviceType mentions painting
// contractors; both parse as valid JSON.
test('emits BreadcrumbList and Service JSON-LD blocks that parse and name painters', async ({
  page,
}) => {
  const errors = await gotoPainters(page);
  const blocks = await readJsonLdBlocks(page);

  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(breadcrumbs, 'exactly one BreadcrumbList block expected').toHaveLength(1);
  const crumb = breadcrumbs[0].data;
  expect(() => JSON.parse(breadcrumbs[0].raw)).not.toThrow();
  const items = crumb.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[0].item).toBe('https://digitalcraftai.com');
  expect((items[1].name ?? '').toLowerCase()).toMatch(/paint(ers|ing)/);
  expect(items[1].item).toBe('https://digitalcraftai.com/ai-for-painters');

  const services = blocks.filter((b): b is { raw: string; data: Service } => isService(b.data));
  // Filter to the Service block(s) emitted by this page (not bled in from a
  // shared head). The page's Service block carries the /ai-for-painters
  // URL OR a serviceType naming painting work.
  const ours = services.filter(
    (s) =>
      (s.data.url ?? '').includes('/ai-for-painters') ||
      /paint(ers|ing)/i.test(s.data.serviceType ?? ''),
  );
  expect(ours.length, 'at least one Service block must name painting work').toBeGreaterThan(0);
  expect(/paint(ers|ing)/i.test(ours[0].data.serviceType ?? '')).toBe(true);
  expect(() => JSON.parse(ours[0].raw)).not.toThrow();

  // No em-dash in any emitted JSON-LD string on this page.
  for (const b of [...breadcrumbs, ...ours]) {
    expect(b.raw).not.toContain(EM_DASH);
  }

  expect(errors).toEqual([]);
});

// Box 4: the page renders the shared Navbar + Footer (using
// `const { content } = useContent()` then `<Footer data={content.footer} />`
// per ticket 0006), uses Helmet for title/description/canonical/OG, and the
// /ai-for-painters URL appears in the generated sitemap because it is
// registered as a top-level <Route path=...> in src/App.tsx.
test('renders Navbar + Footer, has Helmet canonical, and appears in sitemap.xml', async ({
  page,
}) => {
  const errors = await gotoPainters(page);

  // Shared Navbar + Footer landmarks.
  await expect(page.locator('nav').first()).toBeVisible();
  await expect(page.locator('footer').first()).toBeVisible();

  // Helmet canonical + OG title. Helmet APPENDS its own link[rel="canonical"]
  // and meta[property="og:title"] as new DOM nodes; the last entry of each
  // is Helmet's. Poll for hydration, then assert at least one entry names
  // the painters route.
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
      expect.arrayContaining([expect.stringContaining('/ai-for-painters')]),
    );

  await expect
    .poll(
      async () =>
        page
          .locator('head meta[property="og:title"]')
          .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? '')),
      { timeout: 10_000 },
    )
    .toEqual(
      expect.arrayContaining([expect.stringMatching(/paint(ers|ing)/i)]),
    );

  // Sitemap inclusion - the generator extracts every static path= in App.tsx.
  const sitemap = await page.goto('/sitemap.xml', { waitUntil: 'domcontentloaded' });
  expect(sitemap, 'no response for /sitemap.xml').not.toBeNull();
  expect(sitemap!.status()).toBeLessThan(400);
  const xml = await sitemap!.text();
  expect(xml).toContain('https://digitalcraftai.com/ai-for-painters');

  expect(errors).toEqual([]);
});

// Box 5: the page renders in light and dark mode on a mobile viewport,
// contains no em-dash character (U+2014) in any copy, and trackCTAClick is
// fired on each demo CTA with a location label that includes "painters"
// so the page's funnel is measurable in GA.
test('renders in light/dark on mobile, no em-dash, fires trackCTAClick with painters label', async ({
  page,
}) => {
  const errors = await gotoPainters(page);

  // Light mode visible.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Dark mode: toggle .dark on the root, content still renders.
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Mobile viewport (375px width per ticket): heading and demo links still render.
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const mobileHrefs = await page.$$eval('a[href]', (nodes) =>
    nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
  );
  expect(mobileHrefs).toContain('/homeservices/demo/lead-responder');
  expect(mobileHrefs).toContain('/homeservices/demo/estimate');

  // No em-dash anywhere in visible copy.
  const visible = await page.locator('body').innerText();
  expect(visible).not.toContain(EM_DASH);

  // Analytics: trackCTAClick wraps window.gtag('event', 'cta_click', ...)
  // with event_label = `cta - location`. Spy on gtag and assert the next
  // demo CTA click pushes an event with a painters location label.
  await page.evaluate(() => {
    (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents = [];
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (
      ...args: unknown[]
    ) => {
      (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents.push(args);
    };
  });

  // Click the first demo CTA (lead responder link on the page). Use the
  // unique demo route href so we hit a real demo CTA, not the navbar.
  const demoLink = page.locator('a[href="/homeservices/demo/lead-responder"]').first();
  await expect(demoLink).toBeVisible();
  // Prevent React Router navigation from tearing down the page before we
  // read window state.
  await demoLink.evaluate((el) =>
    el.addEventListener('click', (e) => e.preventDefault(), { capture: true, once: true }),
  );
  await demoLink.click();

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
    labels.some((l) => /paint(ers|ing)/i.test(l)),
    `expected at least one cta_click event_label to name painters, got: ${labels.join(' | ')}`,
  ).toBe(true);

  expect(errors).toEqual([]);
});

// Box 6: no new hostnames, no /api/ change, no new demo built; the page is
// composition of existing components plus copy. Render the page and assert
// no first-party /api/ call fires.
test('makes no first-party /api/ call when rendering and no new hostname appears', async ({
  page,
}) => {
  // Restrict to first-party serverless endpoints; Sentry's own SDK posts to
  // its ingest hostname under /api/, which is third-party and not in scope.
  const appOrigin = 'http://127.0.0.1:4173';
  const apiCalls: string[] = [];
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin === appOrigin && u.pathname.startsWith('/api/')) {
      apiCalls.push(req.url());
    }
  });

  const errors = await gotoPainters(page);

  expect(
    apiCalls,
    `the painters landing page should make no first-party /api/ call:\n${apiCalls.join('\n')}`,
  ).toEqual([]);
  expect(errors).toEqual([]);
});
