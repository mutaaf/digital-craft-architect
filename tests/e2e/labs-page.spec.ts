import { test, expect } from '@playwright/test';
import { ROUTES } from './routes';
import { LABS_GAMES, LABS_PIPELINE_STEPS, PAGE_H1, PAGE_PATH } from '../../src/data/labsGames';

// /labs games launcher. Strings are imported from src/data/labsGames.ts
// (mirror-source rule) so copy edits cannot drift the assertions.

const EM_DASH = '\u2014';

test('/labs is in the ROUTES allow-list', () => {
  expect(new Set<string>(ROUTES).has(PAGE_PATH)).toBe(true);
});

test('labs copy has no em-dash', () => {
  for (const g of LABS_GAMES) {
    for (const s of [g.name, g.tagline, g.description, ...g.tags]) {
      expect(s).not.toContain(EM_DASH);
    }
  }
  for (const step of LABS_PIPELINE_STEPS) expect(step.body).not.toContain(EM_DASH);
});

test('/labs renders every launch card, each opening in a new tab', async ({ page }) => {
  await page.goto(PAGE_PATH, { waitUntil: 'domcontentloaded' });
  await page
    .locator('[role="status"][aria-label="Loading"]')
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .catch(() => {});
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(PAGE_H1, { timeout: 10_000 });

  const cards = page.locator('[data-testid="labs-game-card"]');
  await expect(cards).toHaveCount(LABS_GAMES.length);

  const plays = page.locator('[data-testid="labs-game-play"]');
  for (let i = 0; i < LABS_GAMES.length; i++) {
    await expect(plays.nth(i)).toHaveAttribute('href', LABS_GAMES[i].playUrl);
    await expect(plays.nth(i)).toHaveAttribute('target', '_blank');
    await expect(plays.nth(i)).toHaveAttribute('rel', /noopener/);
  }
  await expect(page.locator('[data-testid="labs-game-new"]')).toHaveCount(
    LABS_GAMES.filter((g) => g.isNew).length,
  );
});
