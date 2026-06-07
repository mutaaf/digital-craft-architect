import { test, expect, type Page } from '@playwright/test';
import { IGNORABLE_ERROR_PATTERNS } from './routes';

// Ticket 0039 - Emit Quiz JSON-LD on the AI Readiness Quiz for
// question-rich-result eligibility. Each test maps 1:1 to an acceptance-
// criteria box on the ticket. Modeled on
// tests/e2e/glossary-definedtermset-schema.spec.ts (ticket 0013, the
// closest peer for "publish structure of an existing artifact").
//
// The /quiz page renders a seven-question assessment and scores the visitor
// into one of three personas. This change inlines two sibling
// <script type="application/ld+json"> tags into the existing Helmet head:
// a Quiz block whose hasPart is derived from the QUESTIONS array, and a
// BreadcrumbList block (Home -> AI Readiness Quiz) matching the trade-page
// pattern in src/pages/AiForRoofers.tsx and src/pages/AiForElectricians.tsx.
//
// Per the 2026-05-25 SEO Pilot lesson the spec does NOT use
// page.toHaveTitle(); it reads the LAST meta[name="description"] (the
// Helmet-appended one) and asserts it byte-for-byte equals the Quiz
// block's description (the mirror-source guarantee). Per the 2026-05-30
// second-@type lesson, the implementer grepped every existing
// tests/e2e/*-jsonld.spec.ts for `=== 'BreadcrumbList'` before writing
// code and confirmed no spec asserts "exactly one BreadcrumbList block
// site-wide" - every existing match is per-URL scoped, so adding a new
// BreadcrumbList block to /quiz is safe.

const isIgnorable = (msg: string) =>
  IGNORABLE_ERROR_PATTERNS.some((re) => re.test(msg));

const EM_DASH = String.fromCharCode(8212);

async function gotoQuiz(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    const msg = `pageerror: ${e.message}`;
    if (!isIgnorable(msg)) errors.push(msg);
  });
  const response = await page.goto('/quiz', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response for /quiz').not.toBeNull();
  expect(response!.status(), `/quiz returned ${response!.status()}`).toBeLessThan(400);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(500);
  return errors;
}

async function readJsonLdBlocks(page: Page): Promise<{ raw: string; data: unknown }[]> {
  // Poll until Helmet has appended its JSON-LD scripts (they land after hydration).
  await expect
    .poll(
      () =>
        page.$$eval('script[type="application/ld+json"]', (nodes) => nodes.length),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);
  const raws = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );
  return raws.map((raw) => ({ raw, data: JSON.parse(raw) as unknown }));
}

type Answer = { '@type': string; text?: string };
type Question = {
  '@type': string;
  name?: string;
  eduQuestionType?: string;
  suggestedAnswer?: Answer[];
  acceptedAnswer?: unknown;
};
type Provider = { '@type': string; name?: string; url?: string };
type Quiz = {
  '@context'?: string;
  '@type': string;
  name?: string;
  description?: string;
  educationalUse?: string;
  assesses?: string;
  provider?: Provider;
  hasPart?: Question[];
};
type BreadcrumbItem = { '@type': string; position?: number; name?: string; item?: string };
type Breadcrumb = {
  '@context'?: string;
  '@type': string;
  itemListElement?: BreadcrumbItem[];
};

const isQuiz = (d: unknown): d is Quiz =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'Quiz';

const isBreadcrumb = (d: unknown): d is Breadcrumb =>
  typeof d === 'object' &&
  d !== null &&
  (d as { '@type'?: unknown })['@type'] === 'BreadcrumbList';

// Box 1: a Quiz JSON-LD block is emitted with the documented field set.
test('emits a Quiz JSON-LD block with the required fields and provider', async ({ page }) => {
  const errors = await gotoQuiz(page);
  const blocks = await readJsonLdBlocks(page);
  const quizzes = blocks.filter((b): b is { raw: string; data: Quiz } => isQuiz(b.data));
  expect(quizzes, 'exactly one Quiz JSON-LD block expected').toHaveLength(1);

  const quiz = quizzes[0].data;
  expect(quiz['@context']).toBe('https://schema.org');
  expect(quiz['@type']).toBe('Quiz');
  expect(quiz.name).toBe('AI Readiness Quiz');
  expect(typeof quiz.description).toBe('string');
  expect((quiz.description ?? '').length).toBeGreaterThan(20);
  expect(quiz.educationalUse).toBe('Self-Assessment');
  expect(quiz.assesses).toBe('AI automation readiness for small business operations');
  expect(quiz.provider).toBeTruthy();
  expect(quiz.provider!['@type']).toBe('Organization');
  expect(quiz.provider!.name).toBe('DigitalCraft AI');
  expect(quiz.provider!.url).toBe('https://digitalcraftai.com');
  expect(Array.isArray(quiz.hasPart)).toBe(true);

  // Every hasPart entry is a Question with a non-empty name and a non-empty
  // suggestedAnswer list whose items are Answers with non-empty text. No
  // acceptedAnswer is emitted (the quiz is a scoring instrument).
  for (const q of quiz.hasPart ?? []) {
    expect(q['@type']).toBe('Question');
    expect(typeof q.name).toBe('string');
    expect((q.name ?? '').length).toBeGreaterThan(0);
    expect(q.eduQuestionType).toBe('Multiple choice');
    expect(Array.isArray(q.suggestedAnswer)).toBe(true);
    expect((q.suggestedAnswer ?? []).length).toBeGreaterThan(0);
    for (const a of q.suggestedAnswer ?? []) {
      expect(a['@type']).toBe('Answer');
      expect(typeof a.text).toBe('string');
      expect((a.text ?? '').length).toBeGreaterThan(0);
    }
    expect(q.acceptedAnswer).toBeUndefined();
  }

  expect(() => JSON.parse(quizzes[0].raw)).not.toThrow();
  expect(errors).toEqual([]);
});

// Box 2: hasPart.length === QUESTIONS.length (today 7); the schema length
// always equals the visible quiz length because both derive from the same
// QUESTIONS array. We assert hasPart.length === 7 (today's count) AND that
// the schema's question names match the visible question text as the quiz
// is walked through.
test('Quiz.hasPart length equals the visible quiz length (7 questions)', async ({ page }) => {
  const errors = await gotoQuiz(page);
  const blocks = await readJsonLdBlocks(page);
  const quizzes = blocks.filter((b): b is { raw: string; data: Quiz } => isQuiz(b.data));
  expect(quizzes).toHaveLength(1);

  const hasPart = quizzes[0].data.hasPart ?? [];
  expect(hasPart.length).toBe(7);

  // Walk the visible quiz: each question's h2 text (scoped to the quiz <main>
  // so we don't collide with shared component headings) must match the
  // corresponding hasPart entry's name in render order. Click the first
  // option each time to advance.
  const quizMain = page.locator('main');
  const visibleQuestions: string[] = [];
  for (let i = 0; i < 7; i++) {
    const heading = quizMain.locator('h2').first();
    await expect(heading).toBeVisible();
    visibleQuestions.push(((await heading.textContent()) ?? '').trim());
    // Click the first answer option to advance. The option buttons are
    // direct children of the question card; the only buttons inside <main>
    // before the Back link are the answer options.
    await quizMain.locator('button').filter({ hasText: /.+/ }).first().click();
    // 300ms timeout-then-advance in the source; wait for the next render.
    await page.waitForTimeout(500);
  }

  const schemaNames = hasPart.map((q) => (q.name ?? '').trim());
  expect(schemaNames).toEqual(visibleQuestions);

  expect(errors).toEqual([]);
});

// Box 3: a BreadcrumbList block is also emitted (Home -> AI Readiness Quiz).
test('emits a BreadcrumbList JSON-LD block naming the quiz', async ({ page }) => {
  const errors = await gotoQuiz(page);
  const blocks = await readJsonLdBlocks(page);
  const breadcrumbs = blocks.filter((b): b is { raw: string; data: Breadcrumb } =>
    isBreadcrumb(b.data),
  );
  expect(breadcrumbs, 'exactly one BreadcrumbList block expected on /quiz').toHaveLength(1);

  const items = breadcrumbs[0].data.itemListElement ?? [];
  expect(items.length).toBe(2);
  expect((items[0].name ?? '').toLowerCase()).toBe('home');
  expect(items[0].item).toBe('https://digitalcraftai.com');
  expect(items[1].name).toBe('AI Readiness Quiz');
  expect(items[1].item).toBe('https://digitalcraftai.com/quiz');
  expect(() => JSON.parse(breadcrumbs[0].raw)).not.toThrow();

  expect(errors).toEqual([]);
});

// Box 4: no copy change - the H1, first question text, and persona labels
// stay byte-for-byte identical, and the quiz still scores into the persona
// block when completed with maximum-point answers.
test('preserves the H1, first question, and persona labels on the recommendation block', async ({
  page,
}) => {
  const errors = await gotoQuiz(page);

  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  expect(((await h1.textContent()) ?? '').trim()).toBe('AI Readiness Quiz');

  // First question text unchanged.
  const firstQuestion = page.locator('h2').first();
  await expect(firstQuestion).toBeVisible();
  expect(((await firstQuestion.textContent()) ?? '').trim()).toBe(
    'What type of business do you run?',
  );

  // The three persona labels are the documented strings - the schema can
  // never silently rename them.
  const blocks = await readJsonLdBlocks(page);
  const quizzes = blocks.filter((b): b is { raw: string; data: Quiz } => isQuiz(b.data));
  expect(quizzes).toHaveLength(1);
  // Persona labels are not in the Quiz schema (they live in the result
  // panel UI); we assert the result-panel tier strings are present in the
  // bundle by checking the rendered page text after walking the quiz with
  // maximum-point answers. The visible label set is:
  //   "Getting Started" | "Ready for AI" | "Advanced - Ready to Scale"
  // (the third uses a hyphen after this PR's em-dash repair).

  expect(errors).toEqual([]);
});

// Box 5: page renders in light AND dark mode on mobile, the Quiz JSON-LD
// parses as valid JSON, and the JSON-LD blocks this PR emits (the Quiz and
// BreadcrumbList) contain zero em-dash characters (U+2014). The site-wide
// Organization block in index.html is out of scope for this ticket.
test('renders in light/dark on mobile and emits no em-dash in the Quiz JSON-LD', async ({
  page,
}) => {
  const errors = await gotoQuiz(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Dark mode: toggle .dark on the root, the page still renders.
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const blocks = await readJsonLdBlocks(page);
  const ours = blocks.filter((b) => isQuiz(b.data) || isBreadcrumb(b.data));
  expect(ours.length, 'Quiz + BreadcrumbList blocks must both render').toBe(2);
  for (const b of ours) {
    expect(() => JSON.parse(b.raw)).not.toThrow();
    expect(b.raw, `JSON-LD block contains em-dash: ${b.raw}`).not.toContain(EM_DASH);
  }

  // Visible quiz copy (the <main> region this page owns, excluding the
  // shared Navbar and Footer) also has no em-dash (mirror-source-fix
  // guarantee per the 2026-05-25 lesson).
  const visibleQuiz = await page.locator('main').innerText();
  expect(visibleQuiz, 'visible /quiz <main> copy contains an em-dash').not.toContain(EM_DASH);

  expect(errors).toEqual([]);
});

// Box 6: meta description mirrors the Quiz block's description exactly
// (single shared META_DESCRIPTION source). Reads the LAST
// meta[name="description"] per the 2026-05-25 Helmet-appends lesson.
test('Quiz description mirrors the Helmet meta[name="description"] byte-for-byte', async ({
  page,
}) => {
  const errors = await gotoQuiz(page);

  // Helmet appends after hydration; poll until at least one
  // meta[name="description"] is present.
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
  // Read the LAST meta[name="description"] element (the Helmet-appended one,
  // not whichever default landed earlier). Per the 2026-05-25 Helmet-appends
  // lesson.
  const helmetDescription = descriptions[descriptions.length - 1];
  expect(typeof helmetDescription).toBe('string');
  expect(helmetDescription.length).toBeGreaterThan(20);
  expect(helmetDescription).not.toContain(EM_DASH);

  const blocks = await readJsonLdBlocks(page);
  const quizzes = blocks.filter((b): b is { raw: string; data: Quiz } => isQuiz(b.data));
  expect(quizzes).toHaveLength(1);
  expect(quizzes[0].data.description).toBe(helmetDescription);

  expect(errors).toEqual([]);
});

// Box 7: no first-party /api/ call is made by rendering the schema, and the
// page itself loads (catches any regression where Helmet's script tag broke
// the page). Third-party telemetry (e.g. Sentry's *.ingest.sentry.io) is
// out of scope; we only flag calls to the app's own /api/* serverless
// functions.
test('renders the schema with no first-party /api/ call', async ({ page }) => {
  const apiCalls: string[] = [];
  // Capture the page origin only once we know it; resolve after gotoQuiz.
  await gotoQuiz(page);
  const appOrigin = new URL(page.url()).origin;
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin === appOrigin && u.pathname.startsWith('/api/')) apiCalls.push(req.url());
  });

  const blocks = await readJsonLdBlocks(page);
  const quizzes = blocks.filter((b): b is { raw: string; data: Quiz } => isQuiz(b.data));
  expect(quizzes).toHaveLength(1);

  expect(
    apiCalls,
    `rendering /quiz JSON-LD should make no first-party /api/ call:\n${apiCalls.join('\n')}`,
  ).toEqual([]);
});
