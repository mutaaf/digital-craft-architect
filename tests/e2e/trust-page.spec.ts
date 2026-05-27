import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0018 - How-the-demos-work transparency page at /trust.
// Each test maps 1:1 to an acceptance-criteria box on the ticket.
//
// The /trust page is a static, plain-language transparency document that names
// the third-party providers actually in use (per CLAUDE.md's Tech Stack and
// Environment Variables tables), explains where scraped data, voice audio, and
// email submissions go, lists what is NOT stored on Digital Craft servers, and
// gives a deletion-request contact. The footer's previously-dead Privacy Policy
// link now points to /trust.
//
// Per the 2026-05-25 SEO Pilot lesson (docs/LESSONS.md), /trust is not in the
// index.html SEO Pilot pages table, so we do NOT assert document.title; we
// assert the Helmet-managed meta[name="description"] directly instead.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

async function gotoTrust(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/trust', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /trust').not.toBeNull();
  expect(response!.status(), `/trust returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  return errors;
}

// Box 1: every third-party provider currently in use (per the CLAUDE.md tables)
// is explicitly named on the page; no provider is omitted and no provider is
// named that the repo does not actually use.
test('names every third-party provider currently in the stack', async ({ page }) => {
  const errors = await gotoTrust(page);

  // Sourced directly from CLAUDE.md "Tech Stack" + "Environment Variables".
  const expectedProviders = [
    'OpenAI',
    'Vapi',
    'ElevenLabs',
    'Deepgram',
    'Firecrawl',
    'Jina',
    'Formspree',
    'Sentry',
    'Google Analytics',
  ];

  const bodyText = (await page.locator('main, body').first().textContent()) ?? '';
  for (const provider of expectedProviders) {
    expect(
      bodyText,
      `provider "${provider}" must be named in the visible page text`,
    ).toContain(provider);
  }
  expect(errors).toEqual([]);
});

// Box 2: the page has at least six labeled sections covering scraped website
// data, voice call audio + transcripts, email form submissions, browser
// storage, what is NOT stored on Digital Craft servers, and a deletion-request
// contact.
test('renders at least six labeled transparency sections', async ({ page }) => {
  const errors = await gotoTrust(page);

  // Each h2 corresponds to one of the six required topics. We match on intent
  // keywords so wording can be polished without breaking the test, while still
  // forcing each topic to appear as its own section heading.
  const headings = await page.$$eval('h2', (nodes) =>
    nodes.map((n) => (n.textContent ?? '').toLowerCase().trim()),
  );
  expect(headings.length, 'expected at least six h2 section headings').toBeGreaterThanOrEqual(6);

  const requiredTopicPatterns: RegExp[] = [
    /scrap/i,                        // scraped website data
    /voice/i,                        // voice call audio + transcripts
    /email/i,                        // email form submissions
    /(storage|browser)/i,            // browser storage (session/local)
    /(not store|never store)/i,      // what is NOT stored on Digital Craft servers
    /(delet|contact)/i,              // deletion-request contact
  ];
  for (const pattern of requiredTopicPatterns) {
    expect(
      headings.some((h) => pattern.test(h)),
      `expected one h2 heading matching ${pattern}; got: ${headings.join(' | ')}`,
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

// Box 3: the footer's Privacy Policy link points to /trust (not href="#").
test('footer Privacy Policy link points to /trust in the rendered DOM', async ({ page }) => {
  const errors = await gotoTrust(page);

  // The footer renders on /trust itself, so we can assert against the rendered
  // DOM directly. Both Link (renders <a href>) and <a href> styles are caught.
  const privacyLinks = await page.locator('footer a', { hasText: /Trust & Privacy|Privacy/i }).all();
  expect(privacyLinks.length, 'expected at least one footer Privacy link').toBeGreaterThan(0);

  let foundTrustHref = false;
  for (const link of privacyLinks) {
    const href = await link.getAttribute('href');
    if (href === '/trust') foundTrustHref = true;
    expect(href, 'footer Privacy link must not still be href="#"').not.toBe('#');
  }
  expect(foundTrustHref, 'at least one footer Privacy link must resolve to /trust').toBe(true);
  expect(errors).toEqual([]);
});

// Box 4: the page uses Helmet for title/description/canonical and registers as
// a top-level route. We assert the Helmet-managed meta[name="description"]
// content (not document.title — /trust is not in the SEO Pilot table).
test('Helmet emits a non-empty meta description for /trust', async ({ page }) => {
  const errors = await gotoTrust(page);

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
    .toEqual(
      expect.arrayContaining([
        expect.stringMatching(/(trust|transpar|privacy|provider)/i),
      ]),
    );

  const trustDescription = await page
    .locator('head meta[name="description"]')
    .evaluateAll((nodes) =>
      nodes
        .map((n) => (n as HTMLMetaElement).content)
        .find((c) => /(trust|transpar|privacy|provider)/i.test(c)),
    );
  expect(trustDescription, '/trust Helmet meta description should be present').toBeTruthy();
  expect((trustDescription ?? '').length).toBeGreaterThan(20);
  expect(trustDescription ?? '').not.toContain('—');
  expect(errors).toEqual([]);
});

// Box 5: the page renders in light AND dark mode, contains no em-dash in any
// visible copy, and makes no defensible-claim violations (uses an already-
// published contact mailbox).
test('renders in light and dark mode with no em-dash in visible copy', async ({ page }) => {
  const errors = await gotoTrust(page);

  // Light mode: at least six sections plus the hero render.
  const lightHeadings = await page.$$eval('h1, h2', (nodes) =>
    nodes.map((n) => (n.textContent ?? '').trim()).filter((t) => t.length > 0),
  );
  expect(lightHeadings.length).toBeGreaterThanOrEqual(6);

  // Dark mode: toggle .dark on the root, the same headings still render.
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  const darkHeadings = await page.$$eval('h1, h2', (nodes) =>
    nodes.map((n) => (n.textContent ?? '').trim()).filter((t) => t.length > 0),
  );
  expect(darkHeadings).toEqual(lightHeadings);

  // No em-dash character anywhere in the visible body text (brand-voice gate).
  const bodyText = (await page.locator('body').textContent()) ?? '';
  expect(bodyText, 'visible body text must contain no em-dash character').not.toContain('—');

  // The deletion-request contact uses an already-published mailbox or an
  // existing /contact route — never a brand-new email or hostname.
  const contactEmails = await page.$$eval('a[href^="mailto:"]', (nodes) =>
    nodes.map((n) => (n.getAttribute('href') ?? '').replace(/^mailto:/, '').split('?')[0]),
  );
  for (const email of contactEmails) {
    expect(
      email,
      `contact email "${email}" must be a digitalcraftai.com mailbox already published elsewhere`,
    ).toMatch(/@digitalcraftai\.com$/);
  }

  expect(errors).toEqual([]);
});

// Box 6: no first-party /api/ call when rendering /trust, no new third-party
// hostnames invoked (the page is static copy referencing existing infra).
test('renders with no first-party /api/ call', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });

  const apiCalls: string[] = [];
  page.on('request', (req) => {
    try {
      const u = new URL(req.url());
      // Capture any same-origin /api/ call; we'll filter by appOrigin once known.
      if (u.pathname.startsWith('/api/')) apiCalls.push(req.url());
    } catch {
      /* ignore non-URL requests */
    }
  });

  const response = await page.goto('/trust', { waitUntil: 'domcontentloaded' });
  expect(response!.status()).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);

  const appOrigin = new URL(page.url()).origin;
  const sameOriginApi = apiCalls.filter((u) => new URL(u).origin === appOrigin);
  expect(
    sameOriginApi,
    `rendering /trust should make no /api/ call:\n${sameOriginApi.join('\n')}`,
  ).toEqual([]);
  expect(errors).toEqual([]);
});
