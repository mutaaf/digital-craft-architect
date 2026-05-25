import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0010 - Resumable demo session with "Continue your demo" prompt.
// Each test maps 1:1 to an acceptance-criteria box on the ticket.
//
// The demo company profile is persisted by DemoContext under the per-vertical
// localStorage key `dca_demo_company_${vertical}` (promoted from sessionStorage so
// it survives a new session). When a profile exists for the current vertical, the
// hub renders a reusable ResumeDemoPrompt that exposes:
//   - data-testid="resume-demo-prompt"        the card wrapper
//   - data-testid="resume-demo-resume"        the "Resume" action
//   - data-testid="resume-demo-start-fresh"   the "Start fresh" action
//   - data-testid="resume-demo-dismiss"       the dismiss (X) action
// "Start fresh" calls the existing reset (clears the profile, shows the setup
// form). Dismissal is remembered for the session via a dca_*_dismissed key.

const CONSTRUCTION_HUB = '/construction/demo';
const STORAGE_KEY = 'dca_demo_company_construction';
const COMPANY_NAME = 'Acme Builders Co';

// A complete CompanyProfile (shape from src/utils/websiteScraper.ts). Seeding via
// localStorage is exactly what the scrape pipeline already writes, so no new data
// is introduced by the test.
const PROFILE = {
  companyName: COMPANY_NAME,
  ownerName: 'Pat Acme',
  tagline: 'Built to last',
  location: 'Austin, TX',
  phone: '(512) 555-0100',
  email: 'info@acmebuilders.com',
  website: 'acmebuilders.com',
  services: ['Kitchen Remodeling', 'Home Additions'],
  avgJobValue: 42000,
  bookingUrl: '',
  primaryColor: '#0ea5e9',
};

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

async function gotoHub(page: Page) {
  const response = await page.goto(CONSTRUCTION_HUB, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${CONSTRUCTION_HUB}`).not.toBeNull();
  expect(response!.status()).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
}

// A "fresh session" = a brand-new browser context (no sessionStorage carried over)
// that nonetheless has the persisted profile in localStorage, exactly as a real
// returning visitor would on a later visit. addInitScript runs before app code.
async function freshSessionWithProfile(
  browser: import('@playwright/test').Browser,
): Promise<{ ctx: BrowserContext; page: Page; errors: string[] }> {
  const ctx = await browser.newContext();
  await ctx.addInitScript(
    ([key, value]) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* storage unavailable - non-fatal */
      }
    },
    [STORAGE_KEY, JSON.stringify(PROFILE)] as const,
  );
  const page = await ctx.newPage();
  const errors = trackErrors(page);
  return { ctx, page, errors };
}

test.describe('resumable demo session', () => {
  // Box 1: a demo company profile set in one session is still available after the
  // tab is closed and reopened (persistence survives a new session, same vertical).
  test('persisted profile survives a new session (localStorage, per-vertical)', async ({ browser }) => {
    const { ctx, page, errors } = await freshSessionWithProfile(browser);
    await gotoHub(page);

    // The profile is read back from localStorage on a cold start: the resume
    // prompt renders with the persisted company name.
    const prompt = page.getByTestId('resume-demo-prompt');
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText(COMPANY_NAME);

    // It is still in localStorage (not sessionStorage), the proof of survival.
    const stored = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
    expect(stored).toContain(COMPANY_NAME);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box 2: when a persisted profile exists, the hub shows a "Continue your
  // [Company] demo" prompt with a Resume action and a Start-fresh action.
  test('shows Continue prompt with Resume and Start-fresh actions', async ({ browser }) => {
    const { ctx, page, errors } = await freshSessionWithProfile(browser);
    await gotoHub(page);

    const prompt = page.getByTestId('resume-demo-prompt');
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText(`Continue your ${COMPANY_NAME} demo`);
    await expect(page.getByTestId('resume-demo-resume')).toBeVisible();
    await expect(page.getByTestId('resume-demo-start-fresh')).toBeVisible();

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box 3: "Resume" keeps the persisted profile active; "Start fresh" clears it
  // (calls reset) and shows the normal setup form.
  test('Resume keeps the profile; Start fresh clears it and shows the setup form', async ({ browser }) => {
    // Resume: profile stays, prompt collapses, no setup input shown.
    {
      const { ctx, page, errors } = await freshSessionWithProfile(browser);
      await gotoHub(page);
      await page.getByTestId('resume-demo-resume').click();
      await expect(page.getByTestId('resume-demo-prompt')).toHaveCount(0);
      // The customized state persists (company badge still names the company).
      await expect(page.getByText(`Built for ${COMPANY_NAME}`)).toBeVisible();
      const stored = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
      expect(stored).toContain(COMPANY_NAME);
      expect(errors).toEqual([]);
      await ctx.close();
    }

    // Start fresh: reset clears storage, prompt gone, the setup form is back.
    {
      const { ctx, page, errors } = await freshSessionWithProfile(browser);
      await gotoHub(page);
      await page.getByTestId('resume-demo-start-fresh').click();
      await expect(page.getByTestId('resume-demo-prompt')).toHaveCount(0);
      // The default setup form (Customize for Your Business) is shown again.
      await expect(page.getByText('Customize for Your Business')).toBeVisible();
      const stored = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY);
      expect(stored).toBeNull();
      expect(errors).toEqual([]);
      await ctx.close();
    }
  });

  // Box 4: when no persisted profile exists, no prompt renders and the hub behaves
  // exactly as it does today (regression check).
  test('no prompt renders when storage is empty', async ({ page }) => {
    const errors = trackErrors(page);
    await gotoHub(page);

    await expect(page.getByTestId('resume-demo-prompt')).toHaveCount(0);
    // Hub still works: the setup form is present as it is today.
    await expect(page.getByText('Customize for Your Business')).toBeVisible();

    expect(errors).toEqual([]);
  });

  // Box 5: dismissing the prompt is remembered for the session; the copy contains
  // no em-dash and renders in light and dark mode.
  test('dismissal sticks for the session, no em-dash, renders in light and dark mode', async ({ browser }) => {
    const { ctx, page, errors } = await freshSessionWithProfile(browser);
    await gotoHub(page);

    const prompt = page.getByTestId('resume-demo-prompt');
    await expect(prompt).toBeVisible();

    // No em-dash anywhere in the prompt copy.
    expect(await prompt.innerText()).not.toContain('—');

    // Dark mode: toggle the .dark class, the prompt still renders.
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await expect(prompt).toBeVisible();
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await expect(prompt).toBeVisible();

    // Dismiss, prompt disappears.
    await page.getByTestId('resume-demo-dismiss').click();
    await expect(prompt).toHaveCount(0);

    // Reload within the SAME context (same session) - it stays dismissed.
    await gotoHub(page);
    await expect(page.getByTestId('resume-demo-prompt')).toHaveCount(0);

    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Box 6: no new hostnames, no first-party /api/ call from showing or resuming
  // the prompt; persistence is browser storage only.
  test('showing and resuming the prompt makes no first-party /api/ call', async ({ browser }) => {
    const { ctx, page, errors } = await freshSessionWithProfile(browser);
    await page.goto(CONSTRUCTION_HUB, { waitUntil: 'domcontentloaded' });
    const appOrigin = new URL(page.url()).origin;

    const apiCalls: string[] = [];
    page.on('request', (req) => {
      const u = new URL(req.url());
      if (u.origin === appOrigin && u.pathname.startsWith('/api/')) apiCalls.push(req.url());
    });

    await expect(page.getByTestId('resume-demo-prompt')).toBeVisible();
    await page.getByTestId('resume-demo-resume').click();
    await expect(page.getByTestId('resume-demo-prompt')).toHaveCount(0);

    expect(apiCalls, `resume flow should make no first-party /api/ call:\n${apiCalls.join('\n')}`).toEqual([]);
    expect(errors).toEqual([]);
    await ctx.close();
  });

  // Real estate hub renders the same reusable prompt (per-vertical key scoping),
  // proving the component is shared, not duplicated, and stays vertical-scoped.
  test('real estate hub shows the prompt from its own per-vertical key', async ({ browser }) => {
    const ctx = await browser.newContext();
    await ctx.addInitScript(
      ([key, value]) => {
        try {
          window.localStorage.setItem(key, value);
        } catch {
          /* storage unavailable - non-fatal */
        }
      },
      ['dca_demo_company_realestate', JSON.stringify(PROFILE)] as const,
    );
    const page = await ctx.newPage();
    const errors = trackErrors(page);

    // Construction hub must NOT show it (the profile lives under the RE key).
    await gotoHub(page);
    await expect(page.getByTestId('resume-demo-prompt')).toHaveCount(0);

    // Real estate hub shows it.
    const response = await page.goto('/realestate/demo', { waitUntil: 'domcontentloaded' });
    expect(response!.status()).toBeLessThan(400);
    await expect
      .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
        timeout: 10_000,
      })
      .toBeGreaterThan(500);
    await expect(page.getByTestId('resume-demo-prompt')).toContainText(COMPANY_NAME);

    expect(errors).toEqual([]);
    await ctx.close();
  });
});
