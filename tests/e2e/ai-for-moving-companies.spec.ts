import { test, expect, type Page } from '@playwright/test';
import { ROUTES } from './routes';

// Ticket 0080 - AI-for-moving-companies long-tail landing page funneling into
// the existing home-services demos (lead-responder, estimate, voice-followup).
// Each test maps 1:1 to an acceptance-criteria box on the ticket. Structurally
// modeled on tests/e2e/ai-for-restoration-services.spec.ts (ticket 0072, the
// freshest peer in the home-services trade-page family) with the added
// coverage the ticket 0080 acceptance criteria demand: a Service block, a
// BreadcrumbList block, and a FAQPage block whose mainEntity length equals
// the visible FAQ card count (byte-identical mirror-source per the 2026-05-25
// lesson).
//
// Per the 2026-05-30 second-@type lesson, before writing this spec the
// implementer grepped every tests/e2e/*-jsonld.spec.ts and every trade-page
// spec for `=== 'Service'`, `=== 'BreadcrumbList'`, and `=== 'FAQPage'`
// predicates plus `toHaveLength(1)` / `exactly one` assertions over those
// types. Every predecessor assertion is URL-scoped (each spec calls its
// local goto helper first navigating to its own trade path), so a new
// /ai-for-moving-companies-scoped Service, BreadcrumbList, or FAQPage block
// cannot collide with any predecessor's exactly-one assertion.
//
// Per the 2026-09-05 RouteFallback lesson and 2026-09-10 mount-signal
// lesson, `gotoMovingCompanies` waits for the RouteFallback spinner to
// detach AND the H1 to be visible before returning; otherwise the lazy
// chunk race can leave the DOM in the fallback state when the test reads it.

const EM_DASH = String.fromCharCode(8212);

const STATIC_ROUTES = new Set(ROUTES);

async function gotoMovingCompanies(page: Page): Promise<void> {
  const response = await page.goto('/ai-for-moving-companies', {
    waitUntil: 'domcontentloaded',
  });
  expect(response, 'no response for /ai-for-moving-companies').not.toBeNull();
  // Box 9-1: GET /ai-for-moving-companies returns 200.
  expect(
    response!.status(),
    `/ai-for-moving-companies returned ${response!.status()}`,
  ).toBeLessThan(400);
  // First wait for the lazy-loaded route body to actually mount. Poll on
  // the fallback role="status" spinner disappearing per the 2026-09-05
  // lesson, then require the H1 to be visible per the 2026-09-10 lesson.
  await page
    .locator('[role="status"][aria-label="Loading"]')
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .catch(() => {});
  await page
    .getByRole('heading', { level: 1 })
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 });
}

async function readJsonLdBlocks(
  page: Page,
): Promise<{ raw: string; data: unknown }[]> {
  const raws = await page.$$eval(
    'script[type="application/ld+json"]',
    (nodes) => nodes.map((n) => n.textContent ?? ''),
  );
  return raws.map((raw) => ({ raw, data: JSON.parse(raw) as unknown }));
}

type FaqItem = {
  '@type'?: string;
  name?: string;
  acceptedAnswer?: { '@type'?: string; text?: string };
};
type FaqPage = { '@type': string; mainEntity?: FaqItem[] };

type BreadcrumbItem = {
  '@type': string;
  position?: number;
  name?: string;
  item?: string;
};
type Breadcrumb = { '@type': string; itemListElement?: BreadcrumbItem[] };

type ServiceBlock = {
  '@type': string;
  name?: string;
  description?: string;
  url?: string;
};

const isFaq = (d: unknown): d is FaqPage =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'FAQPage';

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

const isService = (d: unknown): d is ServiceBlock =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'Service';

// Box 9-2: page renders an H1 containing "Moving Companies"
// (case-insensitive). Also covers the ticket's "hero H1 'AI for Moving
// Companies'" acceptance box.
test('renders H1 naming Moving Companies and a defensible subtitle', async ({
  page,
}) => {
  await gotoMovingCompanies(page);

  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  const h1Text = ((await h1.textContent()) ?? '').toLowerCase();
  expect(h1Text).toMatch(/moving companies/);

  // Helmet appends its own meta[name="description"]; the LAST one in the head
  // is the Helmet-managed copy for this page. Poll because Helmet appends
  // after hydrate.
  await expect
    .poll(
      async () =>
        page
          .locator('head meta[name="description"]')
          .evaluateAll((nodes) =>
            nodes.map((n) => n.getAttribute('content') ?? ''),
          ),
      { timeout: 10_000 },
    )
    .toEqual(expect.arrayContaining([expect.stringMatching(/moving/i)]));

  // Subtitle acceptance: the page body names the pain of walk-in estimates
  // going to voicemail during a load.
  const body = (await page.locator('body').innerText()).toLowerCase();
  expect(body).toMatch(/voicemail|walk-in|walk in|estimate/);
  expect(body).toMatch(/piano|stairs|elevator|inventory/);
  expect(body).toMatch(/review|move-out|move out|porch|moving day/);
});

// Box 9-3: page renders exactly three demo-card CTAs with hrefs
// /homeservices/demo/lead-responder, /homeservices/demo/estimate, and
// /homeservices/demo/voice-followup. Explicit regression check against
// pasting /realestate/demo/* by accident.
test('surfaces three demo CTA links pointing at the existing home-services demos', async ({
  page,
}) => {
  await gotoMovingCompanies(page);

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

  // All three target routes are real static routes.
  expect(STATIC_ROUTES.has('/homeservices/demo/lead-responder')).toBe(true);
  expect(STATIC_ROUTES.has('/homeservices/demo/estimate')).toBe(true);
  expect(STATIC_ROUTES.has('/homeservices/demo/voice-followup')).toBe(true);

  // Each demo-card CTA carries data-testid="moving-companies-demo-cta" so the
  // spec can find the exact three cards without depending on body copy.
  const ctas = page.locator('[data-testid="moving-companies-demo-cta"]');
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
});

// Box 9-4: exactly one Service JSON-LD block whose `name` field contains
// "Moving Companies". Per the 2026-05-30 second-@type lesson, this predicate
// is URL-scoped (gotoMovingCompanies was called first) so it cannot collide
// with any predecessor trade-page's exactly-one-Service assertion.
test('emits exactly one Service JSON-LD block naming Moving Companies', async ({
  page,
}) => {
  await gotoMovingCompanies(page);
  const blocks = await readJsonLdBlocks(page);

  const services = blocks.filter(
    (b): b is { raw: string; data: ServiceBlock } => isService(b.data),
  );
  expect(services, 'exactly one Service block expected').toHaveLength(1);
  const svc = services[0].data;
  expect(() => JSON.parse(services[0].raw)).not.toThrow();
  expect(svc.name ?? '').toMatch(/moving companies/i);
  expect(svc.url).toBe('https://digitalcraftai.com/ai-for-moving-companies');
  expect((svc.description ?? '').length).toBeGreaterThan(40);

  // No em-dash in the Service block.
  expect(services[0].raw).not.toContain(EM_DASH);
});

// Box 9-5: exactly one BreadcrumbList JSON-LD block with two itemListElement
// entries whose names are "Home" and "AI for Moving Companies". URL-scoped
// per the 2026-05-30 lesson.
test('emits exactly one BreadcrumbList block whose second item is AI for Moving Companies', async ({
  page,
}) => {
  await gotoMovingCompanies(page);
  const blocks = await readJsonLdBlocks(page);

  const breadcrumbs = blocks.filter(
    (b): b is { raw: string; data: Breadcrumb } => isBreadcrumb(b.data),
  );
  expect(breadcrumbs, 'exactly one BreadcrumbList block expected').toHaveLength(1);
  const crumb = breadcrumbs[0].data;
  expect(() => JSON.parse(breadcrumbs[0].raw)).not.toThrow();
  const items = crumb.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[0].item).toBe('https://digitalcraftai.com');
  expect(items[1].name ?? '').toBe('AI for Moving Companies');
  expect(items[1].item).toBe(
    'https://digitalcraftai.com/ai-for-moving-companies',
  );

  // No em-dash in the BreadcrumbList block.
  expect(breadcrumbs[0].raw).not.toContain(EM_DASH);
});

// Box 9-6: exactly one FAQPage JSON-LD block whose `mainEntity` array length
// equals the count of visible FAQ cards on the page. Byte-identical
// mirror-source assertion per the 2026-05-25 lesson: every visible question
// and answer text must appear verbatim inside the corresponding
// mainEntity[i].name and mainEntity[i].acceptedAnswer.text field.
test('emits exactly one FAQPage block mirroring the visible FAQ cards', async ({
  page,
}) => {
  await gotoMovingCompanies(page);
  const blocks = await readJsonLdBlocks(page);

  const faqs = blocks.filter((b): b is { raw: string; data: FaqPage } =>
    isFaq(b.data),
  );
  expect(faqs, 'exactly one FAQPage block expected').toHaveLength(1);
  const faq = faqs[0].data;
  const mainEntity = faq.mainEntity ?? [];
  expect(mainEntity.length).toBeGreaterThan(0);

  // Count visible FAQ card headings on the page. Each card carries
  // data-testid="moving-companies-faq-card".
  const visibleCards = page.locator(
    '[data-testid="moving-companies-faq-card"]',
  );
  const visibleCount = await visibleCards.count();
  expect(
    mainEntity.length,
    'FAQPage mainEntity length must equal the visible FAQ card count',
  ).toBe(visibleCount);

  // Byte-identical mirror-source assertion: every visible question and
  // answer appears verbatim in the FAQPage block. The visible question is
  // rendered as the card's <h3>, and the answer is the following <p>. Read
  // the cards in DOM order and compare to mainEntity in the same order.
  for (let i = 0; i < visibleCount; i++) {
    const card = visibleCards.nth(i);
    const q = (await card.locator('h3').first().textContent()) ?? '';
    const a = (await card.locator('p').first().textContent()) ?? '';
    const entity = mainEntity[i];
    expect(entity?.name ?? '').toBe(q.trim());
    expect(entity?.acceptedAnswer?.text ?? '').toBe(a.trim());
  }

  // No em-dash inside the FAQPage block.
  expect(faqs[0].raw).not.toContain(EM_DASH);
});

// Box 9-7: no em-dash (U+2014) anywhere in the visible body copy, and none
// in any JSON-LD block this page owns. Filter to the page's own @types per
// the 2026-09-08 lesson so we do not trip the shipped homepage Organization
// block's legitimate em-dash.
test('contains no em-dash in visible copy or in the JSON-LD blocks this page owns', async ({
  page,
}) => {
  await gotoMovingCompanies(page);

  const visible = await page.locator('body').innerText();
  expect(visible).not.toContain(EM_DASH);

  const blocks = await readJsonLdBlocks(page);
  const owned = blocks.filter(
    (b) => isService(b.data) || isBreadcrumb(b.data) || isFaq(b.data),
  );
  for (const b of owned) {
    expect(b.raw).not.toContain(EM_DASH);
  }
});

// Box 9-8: the page renders cleanly in both light and dark mode. Toggle the
// html.dark class the way the ticket 0072 spec does and re-check that the
// H1 and the three demo-card CTAs are still visible.
test('renders in light and dark mode with the same demo-card CTAs visible', async ({
  page,
}) => {
  await gotoMovingCompanies(page);

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const lightCtas = page.locator('[data-testid="moving-companies-demo-cta"]');
  await expect(lightCtas).toHaveCount(3);

  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const darkCtas = page.locator('[data-testid="moving-companies-demo-cta"]');
  await expect(darkCtas).toHaveCount(3);

  // Mobile viewport (375px per ticket): heading and demo links still render.
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(
    page.locator('[data-testid="moving-companies-demo-cta"]'),
  ).toHaveCount(3);
});

// Box 9-9: the "Book a 15-minute strategy call" CTA at the bottom fires
// trackCTAClick('moving_companies_book_call', 'moving_companies_footer')
// on click. trackCTAClick wraps window.gtag('event','cta_click', { ...,
// event_label: `${ctaName} - ${location}` }).
test('bottom strategy-call CTA fires the moving_companies_book_call analytics event', async ({
  page,
}) => {
  await gotoMovingCompanies(page);

  await page.evaluate(() => {
    (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents = [];
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (
      ...args: unknown[]
    ) => {
      (window as unknown as { __ctaEvents: unknown[] }).__ctaEvents.push(args);
    };
  });

  const bottomCta = page
    .locator('[data-testid="moving-companies-footer-cta"]')
    .first();
  await expect(bottomCta).toBeVisible();
  // Prevent external navigation from tearing down the page before we read
  // window state.
  await bottomCta.evaluate((el) =>
    el.addEventListener('click', (e) => e.preventDefault(), {
      capture: true,
      once: true,
    }),
  );
  await bottomCta.click();

  const events = (await page.evaluate(
    () => (window as unknown as { __ctaEvents: unknown[][] }).__ctaEvents,
  )) as unknown[][];
  const ctaEvents = events.filter(
    (e) => Array.isArray(e) && e[0] === 'event' && e[1] === 'cta_click',
  );
  expect(
    ctaEvents.length,
    'at least one cta_click event fired',
  ).toBeGreaterThan(0);
  const labels = ctaEvents.map((e) => {
    const params = e[2] as { event_label?: string };
    return params?.event_label ?? '';
  });
  expect(
    labels.some((l) =>
      /moving_companies_book_call.*moving_companies_footer/.test(l),
    ),
    `expected an event_label like "moving_companies_book_call - moving_companies_footer", got: ${labels.join(' | ')}`,
  ).toBe(true);
});

// Standard Box 10: no first-party /api/ call fires when rendering the page,
// and the /ai-for-moving-companies URL appears in the generated sitemap
// (auto-emitted from src/data/routes.ts via scripts/generate-sitemap.ts).
test('makes no first-party /api/ call and appears in sitemap.xml', async ({
  page,
}) => {
  const appOrigin = 'http://127.0.0.1:4173';
  const apiCalls: string[] = [];
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin === appOrigin && u.pathname.startsWith('/api/')) {
      apiCalls.push(req.url());
    }
  });

  await gotoMovingCompanies(page);

  expect(
    apiCalls,
    `the moving-companies landing page should make no first-party /api/ call:\n${apiCalls.join('\n')}`,
  ).toEqual([]);

  // Sitemap inclusion.
  const sitemap = await page.goto('/sitemap.xml', {
    waitUntil: 'domcontentloaded',
  });
  expect(sitemap, 'no response for /sitemap.xml').not.toBeNull();
  expect(sitemap!.status()).toBeLessThan(400);
  const xml = await sitemap!.text();
  expect(xml).toContain('https://digitalcraftai.com/ai-for-moving-companies');

  // The route is in the ROUTES allow-list.
  expect(STATIC_ROUTES.has('/ai-for-moving-companies')).toBe(true);
});
