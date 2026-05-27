import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0019 - Visible breadcrumbs and BreadcrumbList JSON-LD on every demo
// page. Each test maps 1:1 to an acceptance-criteria box on the ticket.
//
// A reusable DemoBreadcrumbs component is mounted on the six starter routes
// (four demos plus the construction and realestate demo hubs). It renders a
// visible breadcrumb derived from the route segments AND inlines a
// BreadcrumbList JSON-LD block built from the same crumb array (one source,
// no drift). Per the ticket's "Out of scope" note, non-demo routes are not
// touched by this component; they must NOT pick up a breadcrumb from it.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

const ORIGIN = 'https://digitalcraftai.com';

type BreadcrumbItem = {
  '@type': string;
  position: number;
  name: string;
  item: string;
};

type BreadcrumbList = {
  '@context'?: string;
  '@type': string;
  itemListElement: BreadcrumbItem[];
};

// Starter set the ticket calls out; each row also names the expected three
// crumbs in render order (vertical hub, demo hub, current page).
const STARTER_ROUTES: ReadonlyArray<{
  path: string;
  vertical: string;
  demoSlug: string | null; // null on the demo hub itself
  crumbs: ReadonlyArray<{ name: string; href: string }>;
}> = [
  {
    path: '/construction/demo/lead-responder',
    vertical: 'Construction',
    demoSlug: 'lead-responder',
    crumbs: [
      { name: 'Construction', href: '/construction' },
      { name: 'Demos', href: '/construction/demo' },
      { name: 'Lead Responder', href: '/construction/demo/lead-responder' },
    ],
  },
  {
    path: '/construction/demo/estimate',
    vertical: 'Construction',
    demoSlug: 'estimate',
    crumbs: [
      { name: 'Construction', href: '/construction' },
      { name: 'Demos', href: '/construction/demo' },
      { name: 'Estimate', href: '/construction/demo/estimate' },
    ],
  },
  {
    path: '/construction/demo/voice-negotiator',
    vertical: 'Construction',
    demoSlug: 'voice-negotiator',
    crumbs: [
      { name: 'Construction', href: '/construction' },
      { name: 'Demos', href: '/construction/demo' },
      { name: 'Voice Negotiator', href: '/construction/demo/voice-negotiator' },
    ],
  },
  {
    path: '/realestate/demo/property-negotiator',
    vertical: 'Real Estate',
    demoSlug: 'property-negotiator',
    crumbs: [
      { name: 'Real Estate', href: '/realestate' },
      { name: 'Demos', href: '/realestate/demo' },
      { name: 'Property Negotiator', href: '/realestate/demo/property-negotiator' },
    ],
  },
  {
    path: '/construction/demo',
    vertical: 'Construction',
    demoSlug: null,
    crumbs: [
      { name: 'Construction', href: '/construction' },
      { name: 'Demos', href: '/construction/demo' },
    ],
  },
  {
    path: '/realestate/demo',
    vertical: 'Real Estate',
    demoSlug: null,
    crumbs: [
      { name: 'Real Estate', href: '/realestate' },
      { name: 'Demos', href: '/realestate/demo' },
    ],
  },
];

async function gotoRoute(page: Page, path: string): Promise<string[]> {
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
  return errors;
}

async function findBreadcrumbList(page: Page): Promise<BreadcrumbList | null> {
  const blocks = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  for (const raw of blocks) {
    try {
      const data = JSON.parse(raw) as { '@type'?: string };
      if (data && data['@type'] === 'BreadcrumbList') {
        return data as unknown as BreadcrumbList;
      }
    } catch {
      // some other block, ignore
    }
  }
  return null;
}

// Box 1: visible breadcrumb renders on every starter demo route with the
// three expected crumb labels in order, the demo-name crumb derived from the
// slug via title-case (e.g. "voice-negotiator" -> "Voice Negotiator").
test('renders visible breadcrumb with three crumbs on every starter demo route', async ({
  page,
}) => {
  for (const route of STARTER_ROUTES) {
    if (route.demoSlug === null) continue; // hubs covered separately below
    const errors = await gotoRoute(page, route.path);

    const nav = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(nav, `breadcrumb nav missing on ${route.path}`).toBeVisible();

    const items = nav.locator('[data-breadcrumb-item]');
    await expect(items, `expected 3 crumbs on ${route.path}`).toHaveCount(3);

    for (let i = 0; i < route.crumbs.length; i++) {
      await expect(items.nth(i)).toContainText(route.crumbs[i].name);
    }

    expect(errors).toEqual([]);
  }
});

// Box 2: every starter route emits exactly one BreadcrumbList JSON-LD block
// whose itemListElement mirrors the visible crumbs (same names, absolute
// digitalcraftai.com URLs), parses as valid JSON, and contains no em-dash.
test('emits BreadcrumbList JSON-LD mirroring the visible crumbs', async ({ page }) => {
  for (const route of STARTER_ROUTES) {
    const errors = await gotoRoute(page, route.path);

    const list = await findBreadcrumbList(page);
    expect(list, `BreadcrumbList JSON-LD missing on ${route.path}`).not.toBeNull();
    expect(list!.itemListElement.length).toBe(route.crumbs.length);

    for (let i = 0; i < route.crumbs.length; i++) {
      const item = list!.itemListElement[i];
      expect(item['@type']).toBe('ListItem');
      expect(item.position).toBe(i + 1);
      expect(item.name).toBe(route.crumbs[i].name);
      expect(item.item).toBe(`${ORIGIN}${route.crumbs[i].href}`);
      expect(item.name).not.toContain('—');
      expect(item.item).not.toContain('—');
    }

    expect(errors).toEqual([]);
  }
});

// Box 3: tapping a crumb is an SPA navigation (react-router <Link>) - no full
// page reload - and resolves to the expected hub.
test('crumb clicks are SPA navigations to the expected hubs', async ({ page }) => {
  await gotoRoute(page, '/construction/demo/voice-negotiator');

  // Capture every full-document navigation (a real reload would fire 'load'
  // again and the marker would be lost).
  await page.evaluate(() => {
    (window as unknown as { __spaMarker: boolean }).__spaMarker = true;
  });

  // Click the second crumb (Demos -> /construction/demo).
  await page.locator('nav[aria-label="Breadcrumb"] a', { hasText: 'Demos' }).first().click();
  await expect(page).toHaveURL(/\/construction\/demo$/);

  // SPA marker must survive (no full reload between routes).
  const stillSpa = await page.evaluate(
    () => (window as unknown as { __spaMarker?: boolean }).__spaMarker === true,
  );
  expect(stillSpa, 'expected SPA navigation but page fully reloaded').toBe(true);

  // First crumb -> vertical hub.
  await page.locator('nav[aria-label="Breadcrumb"] a', { hasText: 'Construction' }).first().click();
  await expect(page).toHaveURL(/\/construction$/);
  const stillSpa2 = await page.evaluate(
    () => (window as unknown as { __spaMarker?: boolean }).__spaMarker === true,
  );
  expect(stillSpa2).toBe(true);
});

// Box 5 (regression): the breadcrumb does NOT appear on non-demo routes.
test('does not render on non-demo routes', async ({ page }) => {
  for (const path of ['/', '/construction', '/glossary', '/demos']) {
    await gotoRoute(page, path);
    const count = await page.locator('nav[aria-label="Breadcrumb"]').count();
    expect(count, `breadcrumb leaked onto ${path}`).toBe(0);
  }
});

// Box 5: the breadcrumb renders cleanly in dark mode on a starter route and
// keeps the same crumb text.
test('renders in dark mode on the voice-negotiator demo', async ({ page }) => {
  await gotoRoute(page, '/construction/demo/voice-negotiator');

  const lightItems = await page
    .locator('nav[aria-label="Breadcrumb"] [data-breadcrumb-item]')
    .allTextContents();
  expect(lightItems.length).toBe(3);

  await page.evaluate(() => document.documentElement.classList.add('dark'));
  const darkItems = await page
    .locator('nav[aria-label="Breadcrumb"] [data-breadcrumb-item]')
    .allTextContents();
  expect(darkItems).toEqual(lightItems);
});
