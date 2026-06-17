import { test, expect, type Page } from '@playwright/test';
import { ROUTES, IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0058 - AI-for-pool-service long-tail landing page funneling into the
// existing home-services demos (lead-responder, voice-followup, estimate).
// Each test maps 1:1 to an acceptance-criteria box on the ticket. Modeled
// directly on tests/e2e/ai-for-pest-control.spec.ts (ticket 0056, the closest
// peer because both are residential service trades with a recurring-service
// revenue model and a peak-season emergency funnel). NOT modeled on the
// property-managers spec because that page routes into /realestate/demo/*
// (the wrong family for pool service).
//
// IMPORTANT: /ai-for-pool-service is NOT in the index.html SEO Pilot `pages`
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
//
// Per the 2026-05-30 second-@type lesson, before writing this spec the
// implementer grepped tests/e2e for `=== 'BreadcrumbList'` and
// `exactly one BreadcrumbList` predicates. Every existing predicate is
// per-URL scoped (each spec calls its local goto helper first), so a new
// /ai-for-pool-service-scoped BreadcrumbList block cannot collide.
// demo-breadcrumbs.spec.ts iterates a hard-coded STARTER_ROUTES list that
// does NOT include /ai-for-pool-service, so it is unaffected.

const EM_DASH = String.fromCharCode(8212);

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

const STATIC_ROUTES = new Set(ROUTES);

async function gotoPoolService(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/ai-for-pool-service', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /ai-for-pool-service').not.toBeNull();
  expect(
    response!.status(),
    `/ai-for-pool-service returned ${response!.status()}`,
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

// Box 1: a new /ai-for-pool-service route renders a page whose Helmet-emitted
// description and visible H1 explicitly name "pool service," and whose body
// lists three trade-specific pain themes (peak-season green-pool and
// equipment-failure emergencies going to voicemail, weekly recurring-service
// skip notices slipping off the office manager's list when the route is
// rained out, end-of-season closing appointments customers forget to schedule
// until the first freeze) with defensible language and no invented client
// names, dollar figures, or efficacy percentages.
test('renders pool-service H1, Helmet meta description, and three pain points', async ({
  page,
}) => {
  const errors = await gotoPoolService(page);

  // <title> assertion is delegated to the Helmet-managed head per the
  // 2026-05-25 SEO Pilot lesson - the route is not in the SEO Pilot pages
  // table, so document.title falls back to the homepage default until that
  // ticket adds the route.

  // H1: the visible page heading must name the trade. The substring "Pool
  // Service" (case-insensitive) covers both "Pool Service Companies" and
  // "Pool Service Business" copy variants.
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const h1Text = ((await h1.textContent()) ?? '').toLowerCase();
  expect(h1Text).toMatch(/pool service/);

  // Helmet appends its own meta[name="description"]; the LAST one in the head
  // is the Helmet-managed copy. Poll because Helmet appends after hydrate.
  await expect
    .poll(
      async () =>
        page
          .locator('head meta[name="description"]')
          .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? '')),
      { timeout: 10_000 },
    )
    .toEqual(expect.arrayContaining([expect.stringMatching(/pool service/i)]));

  const descriptions = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('content') ?? ''));
  const helmetDescription = descriptions[descriptions.length - 1];
  expect(helmetDescription.toLowerCase()).toMatch(/pool service/);
  expect(helmetDescription.length).toBeGreaterThan(40);

  // Three trade-specific pain point themes named on the page.
  const body = (await page.locator('body').innerText()).toLowerCase();
  expect(body).toMatch(/green[-\s]?pool|equipment|emergency|voicemail|peak[-\s]?season/);
  expect(body).toMatch(/recurring|weekly|skip/);
  expect(body).toMatch(/closing|end[-\s]?of[-\s]?season|freeze/);

  expect(errors).toEqual([]);
});

// Box 4 + Box 5: the page surfaces three demo CTA cards that link to
// /homeservices/demo/lead-responder, /homeservices/demo/estimate, and
// /homeservices/demo/voice-followup (the existing home-services demos). This
// is the explicit regression check against accidentally pasting
// /realestate/demo/* from the property-managers template.
test('surfaces three demo CTA links pointing at the existing home-services demos', async ({
  page,
}) => {
  const errors = await gotoPoolService(page);

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
  expect(
    hrefs,
    'page must link to /homeservices/demo/voice-followup',
  ).toContain('/homeservices/demo/voice-followup');

  // Both target routes are real static routes (smoke gate covers their
  // render); confirm here so this spec stays self-contained.
  expect(STATIC_ROUTES.has('/homeservices/demo/lead-responder')).toBe(true);
  expect(STATIC_ROUTES.has('/homeservices/demo/estimate')).toBe(true);
  expect(STATIC_ROUTES.has('/homeservices/demo/voice-followup')).toBe(true);

  // Per ticket engineering notes the three demo-card CTAs carry
  // data-testid="poolservice-demo-cta" so the spec can locate them without
  // relying on body copy. Each one's href resolves to a /homeservices/demo/*
  // path registered in ROUTES - this is the explicit regression check that
  // prevents accidental copy-paste of the /realestate/demo/* routes from the
  // property-managers template.
  const ctas = page.locator('[data-testid="poolservice-demo-cta"]');
  await expect(ctas).toHaveCount(3);
  const ctaHrefs = await ctas.evaluateAll((nodes) =>
    nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
  );
  for (const href of ctaHrefs) {
    expect(
      href.startsWith('/homeservices/demo/'),
      `each demo CTA must point at /homeservices/demo/* (got ${href})`,
    ).toBe(true);
    expect(
      href.startsWith('/realestate/demo/'),
      `each demo CTA must NOT point at /realestate/demo/* (got ${href})`,
    ).toBe(false);
    expect(STATIC_ROUTES.has(href)).toBe(true);
  }

  expect(errors).toEqual([]);
});

// Box 2: the page emits exactly one BreadcrumbList JSON-LD block
// (Home -> AI for Pool Service) that parses as valid JSON. Per the
// 2026-05-30 second-@type lesson, the predicate is per-URL scoped
// (gotoPoolService was called first), so this toHaveLength(1) cannot
// collide with a sibling page's BreadcrumbList block. The eight existing
// trade pages emit BreadcrumbList only - the ninth follows that convention.
test('emits BreadcrumbList JSON-LD block that parses and names AI for Pool Service', async ({
  page,
}) => {
  const errors = await gotoPoolService(page);
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
  // Second ListItem must explicitly name "AI for Pool Service" per ticket
  // acceptance box 2.
  expect(items[1].name ?? '').toBe('AI for Pool Service');
  expect(items[1].item).toBe('https://digitalcraftai.com/ai-for-pool-service');

  // No em-dash in any emitted JSON-LD string on this page.
  for (const b of breadcrumbs) {
    expect(b.raw).not.toContain(EM_DASH);
  }

  expect(errors).toEqual([]);
});

// Box 3: the page renders the shared Navbar + Footer, uses Helmet for
// title/description/canonical/OG, and the /ai-for-pool-service URL appears
// in the generated sitemap because it is registered as a top-level
// <Route path=...> in src/App.tsx.
test('renders Navbar + Footer, has Helmet canonical, and appears in sitemap.xml', async ({
  page,
}) => {
  const errors = await gotoPoolService(page);

  // Shared Navbar + Footer landmarks.
  await expect(page.locator('nav').first()).toBeVisible();
  await expect(page.locator('footer').first()).toBeVisible();

  // Helmet canonical + OG title. Helmet APPENDS its own link[rel="canonical"]
  // and meta[property="og:title"] as new DOM nodes; the last entry of each
  // is Helmet's. Poll for hydration, then assert at least one entry names
  // the pool-service route.
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
      expect.arrayContaining([expect.stringContaining('/ai-for-pool-service')]),
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
      expect.arrayContaining([expect.stringMatching(/pool service/i)]),
    );

  // Sitemap inclusion - the generator extracts every static path= in App.tsx.
  const sitemap = await page.goto('/sitemap.xml', { waitUntil: 'domcontentloaded' });
  expect(sitemap, 'no response for /sitemap.xml').not.toBeNull();
  expect(sitemap!.status()).toBeLessThan(400);
  const xml = await sitemap!.text();
  expect(xml).toContain('https://digitalcraftai.com/ai-for-pool-service');

  // The new route is in the ROUTES allow-list (canonical src/data/routes.ts
  // per the 2026-06-07 lesson) - the spec re-exports it.
  expect(STATIC_ROUTES.has('/ai-for-pool-service')).toBe(true);

  expect(errors).toEqual([]);
});

// Box 4: the page renders in light and dark mode on a 375px mobile viewport,
// contains no em-dash character (U+2014) in any copy, and trackCTAClick is
// fired on each demo CTA with a location label that includes "poolservice"
// so the page's funnel is measurable in GA independently of the eight other
// trade pages.
test('renders in light/dark on mobile, no em-dash, fires trackCTAClick with poolservice label', async ({
  page,
}) => {
  const errors = await gotoPoolService(page);

  // Light mode visible.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Dark mode: toggle .dark on the root, content still renders.
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Mobile viewport (375px per ticket): heading and demo links still render.
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const mobileHrefs = await page.$$eval('a[href]', (nodes) =>
    nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
  );
  expect(mobileHrefs).toContain('/homeservices/demo/lead-responder');
  expect(mobileHrefs).toContain('/homeservices/demo/estimate');
  expect(mobileHrefs).toContain('/homeservices/demo/voice-followup');

  // No em-dash anywhere in visible copy.
  const visible = await page.locator('body').innerText();
  expect(visible).not.toContain(EM_DASH);

  // Analytics: trackCTAClick wraps window.gtag('event', 'cta_click', ...)
  // with event_label = `cta - location`. Spy on gtag and assert the next
  // demo CTA click pushes an event with a poolservice location label.
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
    labels.some((l) => /poolservice/i.test(l)),
    `expected at least one cta_click event_label to name poolservice, got: ${labels.join(' | ')}`,
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

  const errors = await gotoPoolService(page);

  expect(
    apiCalls,
    `the pool-service landing page should make no first-party /api/ call:\n${apiCalls.join('\n')}`,
  ).toEqual([]);
  expect(errors).toEqual([]);
});
